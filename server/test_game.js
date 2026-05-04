const { Server } = require('socket.io');
const { createServer } = require('http');
const ioClient = require('socket.io-client');
const assert = require('assert');

const httpServer = createServer();
// Setup simple server for test
const io = new Server(httpServer);
const PORT = 3001;

// MOCK SERVER STATE
const rooms = {};

io.on('connection', (socket) => {
  socket.on('createRoom', ({ playerName }) => {
    const roomId = 'TEST';
    rooms[roomId] = {
      id: roomId,
      players: [{
        id: socket.id,
        name: playerName,
        hand: [],
        penaltyPoints: 0,
        isHost: true
      }],
      status: 'waiting',
      activeColor: null,
      pile: [],
      currentTurnIndex: 0,
      lastMove: null,
      punishmentDeck: [],
      winner: null
    };
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    io.to(roomId).emit('gameState', rooms[roomId]);
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    if(!rooms[roomId]) return;
    rooms[roomId].players.push({
      id: socket.id,
      name: playerName,
      hand: [],
      penaltyPoints: 0,
      isHost: false
    });
    socket.join(roomId);
    io.to(roomId).emit('gameState', rooms[roomId]);
  });
});

httpServer.listen(PORT, () => {
    const client1 = ioClient(`http://localhost:${PORT}`);
    let client2;

    client1.on('connect', () => {
        client1.emit('createRoom', { playerName: 'Player1' });
    });

    client1.on('gameState', (state) => {
        if(state.players.length === 1 && !client2) {
           client2 = ioClient(`http://localhost:${PORT}`);
           client2.on('connect', () => {
              client2.emit('joinRoom', { roomId: 'TEST', playerName: 'Player2' });
           });

           client2.on('gameState', (state2) => {
               if(state2.players.length === 2) {
                    console.log("Game state synchronized, both players joined.");
                    assert.equal(state2.players.length, 2);
                    assert.equal(state2.players[0].name, 'Player1');
                    assert.equal(state2.players[1].name, 'Player2');

                    console.log('Tests Passed!');
                    client1.disconnect();
                    client2.disconnect();
                    httpServer.close();
                    process.exit(0);
               }
           });
        }
    });

    setTimeout(() => {
        console.log("Test timeout!");
        process.exit(1);
    }, 2000);
});
