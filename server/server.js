const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Game State
const rooms = {};

const COLORS = ["sun", "leaf", "water"];
const PUNISHMENT_DECK = ["penalty", "penalty", "safe", "safe"];
const STARTING_HAND_SIZE = 5;

// Helper: Shuffle Array
function shuffle(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Helper: Draw random card color
function drawCard() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createInitialHand(size) {
  return Array.from({ length: size }, () => drawCard());
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create Room
  socket.on('createRoom', ({ playerName }) => {
    const roomId = uuidv4().substring(0, 6).toUpperCase();

    rooms[roomId] = {
      id: roomId,
      players: [{
        id: socket.id,
        name: playerName,
        hand: [],
        penaltyPoints: 0,
        isHost: true
      }],
      status: 'waiting', // waiting, playing, gameover
      activeColor: null,
      pile: [],
      currentTurnIndex: 0,
      lastMove: null, // { playerId, colorDeclared }
      punishmentDeck: [],
      winner: null
    };

    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    io.to(roomId).emit('gameState', rooms[roomId]);
  });

  // Join Room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    if (room.status !== 'waiting') {
      socket.emit('error', 'Game already started');
      return;
    }
    if (room.players.length >= 8) {
      socket.emit('error', 'Room is full');
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      hand: [],
      penaltyPoints: 0,
      isHost: false
    });

    socket.join(roomId);
    io.to(roomId).emit('gameState', room);
  });

  // Start Game
  socket.on('startGame', (roomId) => {
    const room = rooms[roomId];
    if (!room || room.players[0].id !== socket.id) return;
    if (room.players.length < 2) {
      socket.emit('error', 'Need at least 2 players');
      return;
    }

    room.status = 'playing';
    room.players.forEach(p => {
      p.hand = createInitialHand(STARTING_HAND_SIZE);
      p.penaltyPoints = 0;
    });
    room.activeColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    room.pile = [];
    room.currentTurnIndex = 0;
    room.lastMove = null;

    io.to(roomId).emit('gameState', room);
  });

  // Play Card
  socket.on('playCard', ({ roomId, cardIndex }) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'playing') return;

    const currentPlayer = room.players[room.currentTurnIndex];
    if (currentPlayer.id !== socket.id) return; // Not their turn

    const playedCard = currentPlayer.hand.splice(cardIndex, 1)[0];

    // Draw 1 card to replenish
    currentPlayer.hand.push(drawCard());

    room.pile.push({
      playerId: currentPlayer.id,
      actualColor: playedCard,
      declaredColor: room.activeColor
    });

    room.lastMove = {
      playerId: currentPlayer.id,
      colorDeclared: room.activeColor
    };

    // Move to next player
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;

    io.to(roomId).emit('gameState', room);
  });

  // Trust (pass turn basically)
  // It's the next player's turn to play a card, they don't explicitly hit 'trust', they just play.
  // Wait, the instructions say "The next player can: 1. Trust - Continue the round - Play another face-down card".
  // This just means playing a card IS trusting the previous player. No explicit action needed.

  // Challenge
  socket.on('challenge', (roomId) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'playing' || room.pile.length === 0) return;

    const currentPlayerIndex = room.currentTurnIndex;
    const currentPlayer = room.players[currentPlayerIndex];
    if (currentPlayer.id !== socket.id) return; // Not their turn to challenge

    const lastPlay = room.pile[room.pile.length - 1];
    const previousPlayer = room.players.find(p => p.id === lastPlay.playerId);

    // Resolve
    const isBluff = lastPlay.actualColor !== lastPlay.declaredColor;

    const punishedPlayerId = isBluff ? previousPlayer.id : currentPlayer.id;

    // Send challenge result before punishment so UI can show it
    io.to(roomId).emit('challengeResult', {
      challengerId: currentPlayer.id,
      challengedId: previousPlayer.id,
      isBluff,
      actualColor: lastPlay.actualColor,
      declaredColor: lastPlay.declaredColor,
      punishedPlayerId
    });

    // Setup Punishment Phase
    room.status = 'punishment';
    room.punishedPlayerId = punishedPlayerId;
    room.punishmentDeck = shuffle(PUNISHMENT_DECK);

    io.to(roomId).emit('gameState', room);
  });

  // Resolve Punishment
  socket.on('drawPunishment', ({ roomId, cardIndex }) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'punishment') return;
    if (socket.id !== room.punishedPlayerId) return;

    const drawnCard = room.punishmentDeck[cardIndex];
    const punishedPlayer = room.players.find(p => p.id === socket.id);

    if (drawnCard === 'penalty') {
      punishedPlayer.penaltyPoints += 1;
    }

    io.to(roomId).emit('punishmentResult', {
      playerId: punishedPlayer.id,
      drawnCard,
      newTotal: punishedPlayer.penaltyPoints
    });

    // Check game over
    if (punishedPlayer.penaltyPoints >= 3) {
      room.status = 'gameover';
      room.winner = room.players.filter(p => p.id !== punishedPlayer.id).map(p => p.id); // Array of winners
    } else {
      // Start new round
      room.status = 'playing';
      room.pile = [];
      room.lastMove = null;
      room.activeColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Punished player starts next round
      room.currentTurnIndex = room.players.findIndex(p => p.id === punishedPlayer.id);
    }

    // small delay before sending new state so client sees the punishment result
    setTimeout(() => {
        io.to(roomId).emit('gameState', room);
    }, 2000);
  });

  socket.on('restartGame', (roomId) => {
      const room = rooms[roomId];
      if(!room || room.players[0].id !== socket.id) return;

      room.status = 'playing';
      room.players.forEach(p => {
        p.hand = createInitialHand(STARTING_HAND_SIZE);
        p.penaltyPoints = 0;
      });
      room.activeColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      room.pile = [];
      room.currentTurnIndex = 0;
      room.lastMove = null;
      room.winner = null;

      io.to(roomId).emit('gameState', room);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up rooms if player leaves (simplified for MVP)
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          // Re-assign host if host left
          if(room.players.length > 0 && !room.players.some(p => p.isHost)) {
              room.players[0].isHost = true;
          }
          io.to(roomId).emit('gameState', room);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
