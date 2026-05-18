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
      <div className="min-h-screen text-primary flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

        {/* Floating background decorative cards */}
        <div className="absolute top-20 left-20 w-32 h-48 border border-gold/20 rounded-xl bg-deep-purple/20 backdrop-blur-sm -rotate-12 animate-float opacity-50" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-20 right-20 w-32 h-48 border border-gold/20 rounded-xl bg-deep-purple/20 backdrop-blur-sm rotate-12 animate-float opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-40 w-24 h-36 border border-gold/20 rounded-xl bg-deep-purple/20 backdrop-blur-sm rotate-6 animate-float opacity-30" style={{ animationDelay: '2s' }}></div>


        <div className="glass-panel p-10 rounded-2xl max-w-md w-full text-center relative z-10 animate-in zoom-in">
          <h1 className="font-serif text-5xl font-bold mb-2 text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">Arcane Parlor</h1>
          <p className="text-primary/70 mb-8 font-sans text-sm tracking-widest uppercase">A game of hidden truths</p>

          {error && (
            <div className="bg-red-900/40 text-red-300 p-3 rounded-lg flex items-center justify-center gap-2 mb-6 text-sm border border-red-900/50">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-8 text-left">
            <div>
              <label htmlFor="playerName" className="block text-xs font-bold text-gold/70 uppercase tracking-widest mb-2">Alias</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full glass-input text-white rounded-t-lg px-4 py-3 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div className="pt-6 border-t border-deep-purple/50">
              <button
                onClick={handleCreateRoom}
                className="w-full btn-magic py-4 rounded-lg flex items-center justify-center gap-2 text-lg mb-6 hover:animate-pulse-glow"
              >
                <PlusCircle size={22} /> Create New Room
              </button>

              <div className="relative flex items-center gap-4">
                <div className="flex-1 border-t border-deep-purple/50"></div>
                <span className="text-gold/50 text-xs uppercase font-bold tracking-widest">OR</span>
                <div className="flex-1 border-t border-deep-purple/50"></div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <input
                  aria-label="Room Code"
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="w-full glass-input text-white rounded-t-lg px-4 py-3 text-center uppercase tracking-widest focus:outline-none"
                  placeholder="ROOM CODE"
                  maxLength={6}
                />
                <button
                  onClick={handleJoinRoom}
                  className="w-full btn-ghost py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <LogIn size={20} /> Join Room
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
      <div className="min-h-screen text-primary flex items-center justify-center p-4">
        <div className="glass-panel p-10 rounded-2xl max-w-md w-full text-center">
          <h2 className="font-serif text-3xl font-bold mb-2 text-gold">The Parlor</h2>
          <div className="my-6 bg-obsidian/60 border border-gold/30 rounded-xl p-6 shadow-inner">
             <p className="text-sm text-gold/70 uppercase tracking-widest mb-2 font-bold">Invitation Code</p>
             <h3 className="font-mono text-4xl tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{gameState.id}</h3>
          </div>

          <div className="mb-8 text-left">
            <h3 className="flex items-center gap-2 text-xs font-bold text-gold/70 uppercase tracking-widest mb-4 border-b border-deep-purple/50 pb-2">
              <Users size={16} /> Guests ({gameState.players.length}/8)
            </h3>
            <ul className="space-y-3">
              {gameState.players.map(p => (
                <li key={p.id} className="flex items-center justify-between bg-deep-purple/30 border border-deep-purple/50 p-3 rounded-lg">
                  <span className="font-medium text-white">{p.name}</span>
                  <div className="flex gap-2">
                     {p.id === socket.id && <span className="text-xs bg-amber/20 text-amber border border-amber/30 px-2 py-1 rounded">You</span>}
                     {p.isHost && <span className="text-xs bg-gold/20 text-gold border border-gold/30 px-2 py-1 rounded">Host</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {me?.isHost ? (
            <button
              onClick={handleStartGame}
              disabled={gameState.players.length < 2}
              className="w-full btn-magic py-4 rounded-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Play size={20} /> Begin Game
            </button>
          ) : (
            <p className="text-gold/50 animate-pulse font-serif italic text-lg">Waiting for host to break the seal...</p>
          )}
        </div>
      </div>
    )
  }

  if (gameState.status === 'gameover') {
    const isWinner = gameState.winner.includes(socket.id)
    const losingPlayer = gameState.players.find(p => !gameState.winner.includes(p.id))

    return (
      <div className="min-h-screen text-primary flex items-center justify-center p-4">
        <div className="glass-panel p-10 rounded-2xl max-w-md w-full text-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 ${isWinner ? 'bg-green-500' : 'bg-red-500'}`}></div>

          <h2 className={`font-serif text-5xl font-bold mb-4 relative z-10 drop-shadow-[0_0_10px_currentColor] ${isWinner ? 'text-amber' : 'text-red-500'}`}>
            {isWinner ? 'Victory' : 'Defeat'}
          </h2>
          <p className="text-lg text-primary/80 mb-8 relative z-10 font-serif italic">
            {losingPlayer?.name} has succumbed to the abyss.
          </p>

          <div className="space-y-2 mb-8 text-left bg-obsidian/60 border border-deep-purple/50 p-6 rounded-xl relative z-10">
             <h3 className="text-xs text-gold/70 font-bold uppercase mb-4 tracking-widest border-b border-deep-purple/50 pb-2">Final Tally</h3>
             {gameState.players.map(p => (
                 <div key={p.id} className="flex justify-between items-center py-1">
                     <span className="text-white">{p.name}</span>
                     <span className={`font-mono ${p.penaltyPoints >= 3 ? 'text-red-400 font-bold' : 'text-primary/70'}`}>
                        {p.penaltyPoints} / 3 points
                     </span>
                 </div>
             ))}
          </div>

          {me?.isHost && (
              <button
                onClick={handleRestartGame}
                className="w-full btn-magic py-4 rounded-lg flex items-center justify-center gap-2 text-lg relative z-10"
              >
                <RefreshCw size={20} /> Play Again
              </button>
          )}
        </div>
      </div>
    )
  }

  // COLOR THEMES for magical elements
  const getColorClasses = (color) => {
    switch (color) {
      case 'sun': return 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.5)] text-yellow-900'
      case 'leaf': return 'bg-gradient-to-br from-green-400 to-emerald-700 border-green-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] text-green-900'
      case 'water': return 'bg-gradient-to-br from-blue-400 to-indigo-700 border-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.5)] text-blue-900'
      default: return 'bg-neutral-700 border-neutral-600'
    }
  }

  const opponents = gameState.players.filter(p => p.id !== socket.id)

  return (
    <div className="min-h-screen text-primary flex flex-col relative overflow-hidden">

      {/* HUD Header */}
      <header className="p-6 flex justify-between items-start z-20 absolute top-0 left-0 right-0 pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-xl text-center pointer-events-auto">
          <span className="text-[10px] text-gold/70 font-bold tracking-widest uppercase">Room</span>
          <div className="font-mono text-lg text-white">{gameState.id}</div>
        </div>
      </header>

      {/* Main Play Area (Center Table) */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 mb-32 h-full w-full">

        {/* Play Table Surface */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[800px] h-[600px] rounded-[50%] bg-deep-purple/10 border border-gold/10 shadow-[inset_0_0_100px_rgba(15,10,26,1)] flex items-center justify-center relative">
               {/* Inner Table Ring */}
               <div className="w-[600px] h-[400px] rounded-[50%] border border-gold/5"></div>
            </div>
        </div>

        {/* Opponents Area (Arranged around the table) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {opponents.map((p, index) => {
              // Calculate positions in an ellipse
              const totalOpponents = opponents.length;
              // Start angle at top (-90 degrees / -PI/2) and spread out.
              // If 1 opponent, put at top. If more, spread along the top half of the table.
              let angle;
              if (totalOpponents === 1) {
                  angle = -Math.PI / 2;
              } else {
                  // Distribute from -PI + PI/4 to -PI/4
                  const startAngle = Math.PI + (Math.PI / 6);
                  const sweep = Math.PI - (Math.PI / 3);
                  angle = startAngle + (sweep * (index / (totalOpponents - 1)));
              }

              // Ellipse dimensions roughly matching the table UI
              const rx = 350; // X radius
              const ry = 200; // Y radius

              const x = Math.cos(angle) * rx;
              const y = Math.sin(angle) * ry - 50; // shift slightly up to leave room for bottom player

              return (
                <div
                    key={p.id}
                    className="absolute pointer-events-auto"
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                    <div className={`glass-panel flex flex-col items-center px-6 py-3 rounded-2xl transition-all duration-300 w-32 ${p.id === gameState.players[gameState.currentTurnIndex]?.id ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)] bg-deep-purple/40 scale-105' : 'border-deep-purple/50 opacity-80'}`}>
                        <div className="w-10 h-10 rounded-full bg-obsidian border-2 border-gold/50 flex items-center justify-center mb-2 shadow-inner">
                            <span className="text-xs font-bold text-gold">{p.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-white truncate max-w-full mb-2">{p.name}</span>
                        <div className="flex gap-1.5 mt-auto">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full border ${i < p.penaltyPoints ? 'bg-red-500 border-red-400 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-transparent border-gold/30'}`} />
                        ))}
                        </div>
                        {p.id === gameState.players[gameState.currentTurnIndex]?.id && (
                           <div className="absolute -bottom-2 w-12 h-1 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
                        )}
                    </div>
                </div>
              );
          })}
        </div>


        <div className="flex flex-col items-center justify-center gap-8 relative z-20 top-[-20px]">
            {/* Center Pile */}
            <div className="relative w-48 h-64 flex flex-col items-center">
            {gameState.pile.length === 0 ? (
                <div className="w-full h-full border-2 border-dashed border-gold/20 rounded-2xl flex items-center justify-center text-gold/40 font-serif italic text-lg bg-obsidian/30 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                Place your truth...
                </div>
            ) : (
                <div className="relative w-full h-full flex justify-center">
                {gameState.pile.map((card, idx) => (
                    <div
                    key={idx}
                    className="absolute inset-0 bg-[#2D1B4D] border-2 border-gold/40 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform mx-auto"
                    style={{
                        transform: `rotate(${(idx * 5) % 15 - 7}deg) translateY(${idx * -2}px)`,
                        zIndex: idx
                    }}
                    >
                    <div className="w-[85%] h-[85%] border border-gold/20 rounded-xl bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wLDBMMjAsMjBMMTAsMjBMMSwwWiIgZmlsbD0icmdiYSgyMTIsIDE3NSwgNTUsIDAuMDUpIi8+Cjwvc3ZnPg==')] flex items-center justify-center opacity-80">
                        <div className="w-12 h-12 rounded-full border-2 border-gold/30 flex items-center justify-center">
                            <span className="text-gold/50 font-serif text-3xl">?</span>
                        </div>
                    </div>
                    </div>
                ))}

                {/* Challenge Button Overlay */}
                {canChallenge && (
                    <button
                    onClick={handleChallenge}
                    className="absolute -right-16 top-[60%] bg-gradient-to-r from-red-600 to-red-800 border-2 border-red-400 text-white font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] transform transition hover:scale-105 active:scale-95 animate-bounce z-50 uppercase tracking-wider text-sm whitespace-nowrap"
                    >
                    Challenge!
                    </button>
                )}
                </div>
            )}

            {/* Last Move Info */}
            {gameState.lastMove && gameState.pile.length > 0 && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap glass-panel px-5 py-3 rounded-full text-sm flex items-center gap-3 shadow-lg w-max z-20">
                    <span className="text-primary/70">Last claim:</span>
                    <span className="font-bold text-white">{gameState.players.find(p=>p.id === gameState.lastMove.playerId)?.name}</span>
                    <span className="text-primary/70">declared</span>
                    <span className={`w-4 h-4 rounded-full border border-white/50 ${getColorClasses(gameState.lastMove.colorDeclared).split(' ')[0]}`}></span>
                </div>
            )}
            </div>

            {/* Active Element Box */}
            <div className="flex flex-col items-center relative z-10 glass-panel px-4 py-2 rounded-2xl scale-75 mt-4">
                <span className="text-[10px] text-gold/70 font-bold uppercase tracking-widest mb-2 drop-shadow-md relative z-10">Active Element</span>
                <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center relative z-10 shadow-lg ${getColorClasses(gameState.activeColor)}`}>
                    {gameState.activeColor === 'sun' && <span className="text-2xl">☀️</span>}
                    {gameState.activeColor === 'leaf' && <span className="text-2xl">🍃</span>}
                    {gameState.activeColor === 'water' && <span className="text-2xl">💧</span>}
                </div>
            </div>
        </div>

        {/* Status Message */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 h-10 text-center flex items-center justify-center z-20 whitespace-nowrap w-full">
          {isMyTurn ? (
             <span className="text-amber font-serif italic text-2xl drop-shadow-[0_0_10px_rgba(255,191,0,0.8)]">
                The floor is yours. Make a claim {gameState.pile.length > 0 && 'or challenge the lie'}.
             </span>
          ) : (
             <span className="text-primary/60 font-serif italic text-xl">
                Waiting for {gameState.players[gameState.currentTurnIndex]?.name} to act...
             </span>
          )}
        </div>
      </main>

      {/* Player Hand (Anchored Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          {/* Subtle gradient behind hand for contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent pointer-events-none"></div>

          <div className="w-full flex justify-center pb-4 sm:pb-8 pt-10 pointer-events-auto">
            {me?.hand.map((color, idx) => {
              // Calculate fan effect
              const offsetFromCenter = idx - (me.hand.length - 1) / 2;
              const rotation = offsetFromCenter * 6; // slightly more fan
              const translateY = Math.abs(offsetFromCenter) * 12; // slightly more arc

              return (
              <button
                aria-label={`Play ${color} card`}
                key={idx}
                onClick={() => handlePlayCard(idx)}
                disabled={!isMyTurn}
                className={`group relative w-24 h-36 sm:w-32 sm:h-48 rounded-2xl border-2 transition-all duration-300 transform-gpu
                  ${getColorClasses(color)}
                  ${isMyTurn ? 'hover:-translate-y-12 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:z-50 cursor-pointer' : 'opacity-70 cursor-not-allowed saturate-50'}
                `}
                style={{
                   transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                   zIndex: 10 + idx,
                   marginLeft: idx === 0 ? '0' : '-1.5rem', // overlap cards
                }}
              >
                <div className="absolute inset-1.5 rounded-xl border border-white/30 bg-black/20 flex flex-col items-center justify-center">
                   <div className="text-4xl sm:text-6xl drop-shadow-md mb-2">
                     {color === 'sun' && '☀️'}
                     {color === 'leaf' && '🍃'}
                     {color === 'water' && '💧'}
                   </div>
                   <div className="absolute top-3 left-3 text-xs sm:text-sm font-bold opacity-80 text-white drop-shadow">
                       {color.substring(0,1).toUpperCase()}
                   </div>
                   <div className="absolute bottom-3 right-3 text-xs sm:text-sm font-bold opacity-80 rotate-180 text-white drop-shadow">
                       {color.substring(0,1).toUpperCase()}
                   </div>
                </div>
              </button>
            )})}
          </div>

          {/* Player stats docked to bottom center/left */}
          <div className="absolute bottom-8 left-1/2 -translate-x-[250px] glass-panel px-6 py-3 rounded-full flex items-center gap-4 pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)] border-gold/40 bg-obsidian/90 z-40">
                <div className="w-10 h-10 rounded-full bg-deep-purple border-2 border-gold flex items-center justify-center shadow-inner">
                    <span className="text-sm font-bold text-gold">{me?.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex flex-col justify-center">
                   <div className="font-serif font-bold text-white text-base leading-none">{me?.name}</div>
                   <div className="flex gap-1.5 mt-2">
                      {[...Array(3)].map((_, i) => (
                         <div key={i} className={`w-2.5 h-2.5 rounded-full border ${i < me?.penaltyPoints ? 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-transparent border-gold/30'}`} />
                      ))}
                   </div>
                </div>
                {me?.id === gameState.players[gameState.currentTurnIndex]?.id && (
                    <div className="absolute -top-1 right-4 w-4 h-4 bg-amber rounded-full shadow-[0_0_10px_rgba(255,191,0,1)] animate-pulse"></div>
                )}
          </div>
      </div>

      {/* Overlays */}

      {/* Challenge Result Modal */}
      {challengeResult && (
        <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="glass-panel p-10 rounded-2xl max-w-lg w-full text-center transform animate-in zoom-in duration-300">
             <h2 className="font-serif text-4xl font-bold mb-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">Challenge Revealed!</h2>

             <div className="flex justify-center items-center gap-6 mb-10">
                 <div className="flex-1 flex flex-col items-center">
                     <p className="text-xs text-gold/70 font-bold uppercase tracking-widest mb-3">Claimed</p>
                     <div className={`w-20 h-28 rounded-xl border-2 flex items-center justify-center ${getColorClasses(challengeResult.declaredColor)}`}>
                         <span className="text-4xl">
                           {challengeResult.declaredColor === 'sun' && '☀️'}
                           {challengeResult.declaredColor === 'leaf' && '🍃'}
                           {challengeResult.declaredColor === 'water' && '💧'}
                         </span>
                     </div>
                 </div>
                 <div className="text-3xl font-serif font-bold text-primary/50 italic">VS</div>
                 <div className="flex-1 flex flex-col items-center">
                     <p className="text-xs text-gold/70 font-bold uppercase tracking-widest mb-3">Truth</p>
                     <div className={`w-20 h-28 rounded-xl border-2 flex items-center justify-center ${getColorClasses(challengeResult.actualColor)}`}>
                         <span className="text-4xl">
                           {challengeResult.actualColor === 'sun' && '☀️'}
                           {challengeResult.actualColor === 'leaf' && '🍃'}
                           {challengeResult.actualColor === 'water' && '💧'}
                         </span>
                     </div>
                 </div>
             </div>

             <div className={`text-3xl font-serif italic py-4 rounded-xl border mb-6
                ${challengeResult.isBluff
                    ? 'bg-green-900/40 text-green-400 border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                    : 'bg-red-900/40 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(248,113,113,0.3)]'}`}>
                {challengeResult.isBluff ? 'A Deception Uncovered!' : 'An Honest Play!'}
             </div>

             <p className="text-lg text-primary/80">
                <strong className="text-white">{gameState.players.find(p=>p.id === challengeResult.punishedPlayerId)?.name}</strong> faces judgment.
             </p>
          </div>
        </div>
      )}

      {/* Punishment Phase Modal */}
      {isPunishmentPhase && !challengeResult && (
        <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="text-center max-w-3xl w-full">
            <h2 className="font-serif text-5xl font-bold text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">Judgment Phase</h2>
            <p className="text-2xl text-primary mb-16 font-serif italic">
              {amIPunished ? 'Select your fate...' : `${gameState.players.find(p=>p.id === gameState.punishedPlayerId)?.name} is drawing from the abyss...`}
            </p>

            <div className="flex justify-center gap-6 flex-wrap">
              {gameState.punishmentDeck.map((_, idx) => (
                <button
                  aria-label="Draw punishment card"
                  key={idx}
                  onClick={() => amIPunished && handleDrawPunishment(idx)}
                  disabled={!amIPunished}
                  className={`group relative w-32 h-48 rounded-2xl bg-gradient-to-br from-[#2D1B4D] to-[#0F0A1A] border border-red-900/50 transition-all duration-300
                    ${amIPunished ? 'hover:-translate-y-4 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] cursor-pointer' : 'opacity-80 cursor-not-allowed'}
                  `}
                >
                   <div className="absolute inset-2 border border-red-900/30 rounded-xl flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wLDBMMjAsMjBMMTAsMjBMMSwwWiIgZmlsbD0icmdiYSgyMzksIDY4LCA2OCwgMC4wNSkiLz4KPC9zdmc+')]">
                      <span className={`text-red-900/40 font-serif text-5xl transition-colors ${amIPunished ? 'group-hover:text-red-500/60' : ''}`}>☠️</span>
                   </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Punishment Result overlay */}
      {punishmentResult && (
         <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none bg-obsidian/50 backdrop-blur-sm">
             <div className="glass-panel p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center transform animate-in zoom-in duration-300 border-2">
                 <div className={`text-8xl mb-6 drop-shadow-2xl ${punishmentResult.drawnCard === 'penalty' ? 'text-red-500' : 'text-green-500'}`}>
                     {punishmentResult.drawnCard === 'penalty' ? '☠️' : '🛡️'}
                 </div>
                 <h3 className={`font-serif text-4xl font-bold mb-4 ${punishmentResult.drawnCard === 'penalty' ? 'text-red-400' : 'text-green-400'}`}>
                     {punishmentResult.drawnCard === 'penalty' ? 'Damnation!' : 'Salvation!'}
                 </h3>
                 <p className="text-primary text-xl">
                     Total points: <strong className="text-white">{punishmentResult.newTotal} / 3</strong>
                 </p>
             </div>
         </div>
      )}

    </div>
  )
}
