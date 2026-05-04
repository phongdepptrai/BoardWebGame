import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { PlusCircle, LogIn, Users, Play, AlertCircle, RefreshCw } from 'lucide-react'

// Initialize socket connection
const socket = io('/', { transports: ['websocket'] })

export default function App() {
  const [gameState, setGameState] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [error, setError] = useState(null)
  const [challengeResult, setChallengeResult] = useState(null)
  const [punishmentResult, setPunishmentResult] = useState(null)

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state)
      setError(null)
    })

    socket.on('error', (msg) => {
      setError(msg)
    })

    socket.on('challengeResult', (result) => {
      setChallengeResult(result)
      setTimeout(() => setChallengeResult(null), 4000)
    })

    socket.on('punishmentResult', (result) => {
      setPunishmentResult(result)
      setTimeout(() => setPunishmentResult(null), 3000)
    })

    return () => {
      socket.off('gameState')
      socket.off('error')
      socket.off('challengeResult')
      socket.off('punishmentResult')
    }
  }, [])

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (!playerName.trim()) return
    socket.emit('createRoom', { playerName })
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (!playerName.trim() || !joinRoomId.trim()) return
    socket.emit('joinRoom', { roomId: joinRoomId, playerName })
  }

  const handleStartGame = () => {
    socket.emit('startGame', gameState.id)
  }

  const handleRestartGame = () => {
      socket.emit('restartGame', gameState.id)
  }

  const handlePlayCard = (cardIndex) => {
    socket.emit('playCard', { roomId: gameState.id, cardIndex })
  }

  const handleChallenge = () => {
    socket.emit('challenge', gameState.id)
  }

  const handleDrawPunishment = (cardIndex) => {
    socket.emit('drawPunishment', { roomId: gameState.id, cardIndex })
  }

  // Views
  if (!gameState) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
        <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-neutral-700">
          <h1 className="text-4xl font-bold text-center mb-8 text-amber-500 tracking-tight">BLUFF</h1>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Enter your alias"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-700">
              <button
                onClick={handleCreateRoom}
                className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <PlusCircle size={20} /> Create
              </button>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 text-center uppercase"
                  placeholder="ROOM ID"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  className="flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <LogIn size={20} /> Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const me = gameState.players.find(p => p.id === socket.id)
  const isMyTurn = gameState.status === 'playing' && gameState.players[gameState.currentTurnIndex]?.id === socket.id
  const canChallenge = isMyTurn && gameState.pile.length > 0
  const isPunishmentPhase = gameState.status === 'punishment'
  const amIPunished = isPunishmentPhase && gameState.punishedPlayerId === socket.id

  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
        <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-neutral-700 text-center">
          <h2 className="text-2xl font-bold mb-2">Room Code: <span className="text-amber-500 tracking-widest">{gameState.id}</span></h2>
          <p className="text-neutral-400 mb-8">Share this code with your friends</p>

          <div className="bg-neutral-950 rounded-xl p-4 mb-8">
            <h3 className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-500 mb-4 uppercase tracking-wider">
              <Users size={16} /> Players ({gameState.players.length}/8)
            </h3>
            <ul className="space-y-2">
              {gameState.players.map(p => (
                <li key={p.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg">
                  <span>{p.name}</span>
                  {p.id === socket.id && <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">You</span>}
                  {p.isHost && <span className="text-xs bg-neutral-700 text-neutral-300 px-2 py-1 rounded">Host</span>}
                </li>
              ))}
            </ul>
          </div>

          {me?.isHost ? (
            <button
              onClick={handleStartGame}
              disabled={gameState.players.length < 2}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Play size={20} /> Start Game
            </button>
          ) : (
            <p className="text-neutral-500 animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      </div>
    )
  }

  if (gameState.status === 'gameover') {
    const isWinner = gameState.winner.includes(socket.id)
    const losingPlayer = gameState.players.find(p => !gameState.winner.includes(p.id))

    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
        <div className="bg-neutral-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-neutral-700 text-center">
          <h2 className={`text-4xl font-bold mb-4 ${isWinner ? 'text-green-500' : 'text-red-500'}`}>
            {isWinner ? 'Victory!' : 'Defeat!'}
          </h2>
          <p className="text-lg text-neutral-300 mb-8">
            {losingPlayer?.name} hit 3 penalty points and lost the game.
          </p>

          <div className="space-y-2 mb-8 text-left bg-neutral-950 p-4 rounded-xl">
             <h3 className="text-sm text-neutral-500 font-bold uppercase mb-2">Final Scores</h3>
             {gameState.players.map(p => (
                 <div key={p.id} className="flex justify-between items-center">
                     <span>{p.name}</span>
                     <span className="text-red-400">{p.penaltyPoints} points</span>
                 </div>
             ))}
          </div>

          {me?.isHost && (
              <button
                onClick={handleRestartGame}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <RefreshCw size={20} /> Play Again
              </button>
          )}
        </div>
      </div>
    )
  }

  // COLOR THEMES
  const getColorClasses = (color) => {
    switch (color) {
      case 'sun': return 'bg-yellow-500 border-yellow-600 shadow-yellow-500/20'
      case 'leaf': return 'bg-green-500 border-green-600 shadow-green-500/20'
      case 'water': return 'bg-blue-500 border-blue-600 shadow-blue-500/20'
      default: return 'bg-neutral-700 border-neutral-600'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col font-sans relative overflow-hidden">

      {/* HUD Header */}
      <header className="p-4 flex justify-between items-center border-b border-neutral-800 bg-neutral-950/50 backdrop-blur">
        <div>
          <span className="text-xs text-neutral-500 font-bold tracking-widest uppercase">Room</span>
          <div className="font-mono text-lg">{gameState.id}</div>
        </div>
        <div className="flex gap-4">
          {gameState.players.map(p => (
            <div key={p.id} className={`flex flex-col items-center p-2 rounded-lg border ${p.id === gameState.players[gameState.currentTurnIndex]?.id ? 'border-amber-500 bg-amber-500/10' : 'border-transparent'}`}>
              <span className="text-sm truncate max-w-[80px]">{p.name}</span>
              <div className="flex gap-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < p.penaltyPoints ? 'bg-red-500' : 'bg-neutral-700'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">

        {/* Active Color Indicator */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">Active Color</span>
          <div className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center shadow-2xl ${getColorClasses(gameState.activeColor)}`}>
            {gameState.activeColor === 'sun' && '☀️'}
            {gameState.activeColor === 'leaf' && '🍃'}
            {gameState.activeColor === 'water' && '💧'}
          </div>
        </div>

        {/* Center Pile */}
        <div className="relative w-48 h-64 mb-12">
          {gameState.pile.length === 0 ? (
            <div className="w-full h-full border-2 border-dashed border-neutral-700 rounded-xl flex items-center justify-center text-neutral-600 font-medium">
              Empty Pile
            </div>
          ) : (
            <div className="relative w-full h-full">
              {gameState.pile.map((card, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 bg-neutral-200 border-2 border-white rounded-xl shadow-xl flex items-center justify-center transition-transform"
                  style={{
                    transform: `rotate(${(idx * 5) % 15 - 7}deg) translateY(${idx * -2}px)`,
                    zIndex: idx
                  }}
                >
                  <div className="w-4/5 h-4/5 border border-neutral-300 rounded-lg bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-100 to-neutral-300 flex items-center justify-center">
                    <span className="text-neutral-400 opacity-50 text-4xl">?</span>
                  </div>
                </div>
              ))}

              {/* Challenge Button Overlay */}
              {canChallenge && (
                <button
                  onClick={handleChallenge}
                  className="absolute -right-16 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-red-500/30 transform transition hover:scale-105 active:scale-95 animate-bounce z-50"
                >
                  Challenge!
                </button>
              )}
            </div>
          )}

          {/* Last Move Info */}
          {gameState.lastMove && gameState.pile.length > 0 && (
             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-800 px-4 py-2 rounded-full border border-neutral-700 text-sm flex items-center gap-2">
                 <span className="text-neutral-400">Last play:</span>
                 <span className="font-bold">{gameState.players.find(p=>p.id === gameState.lastMove.playerId)?.name}</span>
                 <span className="text-neutral-500">declared</span>
                 <span className={`w-3 h-3 rounded-full ${getColorClasses(gameState.lastMove.colorDeclared)}`}></span>
             </div>
          )}
        </div>

        {/* Status Message */}
        <div className="h-8 mb-8 text-center">
          {isMyTurn ? (
             <span className="text-amber-400 font-medium text-lg animate-pulse">It's your turn! Play a card {gameState.pile.length > 0 && 'or challenge'}.</span>
          ) : (
             <span className="text-neutral-500 font-medium text-lg">Waiting for {gameState.players[gameState.currentTurnIndex]?.name}'s move...</span>
          )}
        </div>

        {/* Player Hand */}
        <div className="w-full max-w-3xl">
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            {me?.hand.map((color, idx) => (
              <button
                key={idx}
                onClick={() => handlePlayCard(idx)}
                disabled={!isMyTurn}
                className={`group relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 shadow-lg transition-all duration-200
                  ${getColorClasses(color)}
                  ${isMyTurn ? 'hover:-translate-y-4 hover:shadow-2xl cursor-pointer' : 'opacity-80 cursor-not-allowed'}
                `}
              >
                <div className="absolute inset-1 rounded-lg border border-white/20 bg-black/10 flex items-center justify-center text-3xl">
                   {color === 'sun' && '☀️'}
                   {color === 'leaf' && '🍃'}
                   {color === 'water' && '💧'}
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Overlays */}

      {/* Challenge Result Modal */}
      {challengeResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform animate-in zoom-in duration-200">
             <h2 className="text-3xl font-bold mb-6">Challenge!</h2>
             <div className="flex justify-center items-center gap-8 mb-8">
                 <div className="text-center">
                     <p className="text-sm text-neutral-400 mb-2">Declared</p>
                     <div className={`w-16 h-16 rounded-xl border-4 mx-auto flex items-center justify-center ${getColorClasses(challengeResult.declaredColor)}`}>
                         {challengeResult.declaredColor === 'sun' && '☀️'}
                         {challengeResult.declaredColor === 'leaf' && '🍃'}
                         {challengeResult.declaredColor === 'water' && '💧'}
                     </div>
                 </div>
                 <div className="text-2xl font-bold text-neutral-500">VS</div>
                 <div className="text-center">
                     <p className="text-sm text-neutral-400 mb-2">Actual</p>
                     <div className={`w-16 h-16 rounded-xl border-4 mx-auto flex items-center justify-center ${getColorClasses(challengeResult.actualColor)}`}>
                         {challengeResult.actualColor === 'sun' && '☀️'}
                         {challengeResult.actualColor === 'leaf' && '🍃'}
                         {challengeResult.actualColor === 'water' && '💧'}
                     </div>
                 </div>
             </div>

             <div className={`text-xl font-bold py-3 rounded-lg ${challengeResult.isBluff ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {challengeResult.isBluff ? 'IT WAS A BLUFF!' : 'IT WAS TRUE!'}
             </div>
             <p className="mt-4 text-neutral-300">
                {gameState.players.find(p=>p.id === challengeResult.punishedPlayerId)?.name} will be punished.
             </p>
          </div>
        </div>
      )}

      {/* Punishment Phase Modal */}
      {isPunishmentPhase && !challengeResult && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="text-center max-w-2xl w-full">
            <h2 className="text-3xl font-bold text-red-500 mb-2">Punishment Phase</h2>
            <p className="text-xl text-neutral-300 mb-12">
              {amIPunished ? 'You must draw a card!' : `${gameState.players.find(p=>p.id === gameState.punishedPlayerId)?.name} is drawing a card...`}
            </p>

            <div className="flex justify-center gap-4">
              {gameState.punishmentDeck.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => amIPunished && handleDrawPunishment(idx)}
                  disabled={!amIPunished}
                  className={`relative w-24 h-36 rounded-xl border-2 border-red-900 bg-neutral-800 transition-all duration-300
                    ${amIPunished ? 'hover:-translate-y-2 hover:border-red-500 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'opacity-80 cursor-not-allowed'}
                  `}
                >
                   <div className="absolute inset-2 border border-red-900/50 rounded-lg flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-900">
                      <span className="text-red-900/30 text-4xl font-serif">P</span>
                   </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Punishment Result overlay */}
      {punishmentResult && (
         <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
             <div className="bg-neutral-900 border border-neutral-700 p-8 rounded-2xl shadow-2xl text-center transform animate-in zoom-in duration-300">
                 <div className={`text-6xl mb-4 ${punishmentResult.drawnCard === 'penalty' ? 'text-red-500' : 'text-green-500'}`}>
                     {punishmentResult.drawnCard === 'penalty' ? '☠️' : '🛡️'}
                 </div>
                 <h3 className="text-2xl font-bold mb-2">
                     {punishmentResult.drawnCard === 'penalty' ? '+1 Penalty Point' : 'Safe!'}
                 </h3>
                 <p className="text-neutral-400">
                     Total points: {punishmentResult.newTotal} / 3
                 </p>
             </div>
         </div>
      )}

    </div>
  )
}
