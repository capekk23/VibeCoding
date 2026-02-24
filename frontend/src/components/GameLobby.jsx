import { useState, useEffect } from 'react';
import TicTacToe from './games/TicTacToe';
import RockPaperScissors from './games/RockPaperScissors';
import NumberGuess from './games/NumberGuess';
import Racing from './games/Racing';
import GameOfLife from './games/GameOfLife';

export default function GameLobby({ user }) {
  const [view, setView] = useState('games'); // 'games', 'modeselect', 'playing', 'lobby'
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [activeGames, setActiveGames] = useState([]);

  const gameList = [
    { id: 'tictactoe', name: 'Tic Tac Toe', emoji: '🎯', color: '#FF6B6B' },
    { id: 'rockpaperscissors', name: 'Rock Paper Scissors', emoji: '✂️', color: '#4ECDC4' },
    { id: 'numberguess', name: 'Number Guess', emoji: '🔢', color: '#45B7D1' },
    { id: 'racing', name: 'Highway Racer', emoji: '🏎️', color: '#FFA07A' },
    { id: 'gameoflife', name: 'Game of Life', emoji: '🧬', color: '#98D8C8' }
  ];

  useEffect(() => {
    if (view === 'lobby') {
      fetchActiveGames();
      const interval = setInterval(fetchActiveGames, 3000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const fetchActiveGames = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      setActiveGames(data);
    } catch (err) {
      console.error('Failed to fetch active games', err);
    }
  };

  const selectGame = (gameId) => {
    if (gameId === 'gameoflife') {
      setSelectedGame({ game_type: 'gameoflife', player1_id: user.id, mode: 'simulation' });
      setView('playing');
    } else {
      setSelectedGameType(gameId);
      setView('modeselect');
    }
  };

  const startGame = (mode) => {
    if (mode === 'pve') {
      setSelectedGame({ game_type: selectedGameType, player1_id: user.id, mode: 'pve' });
      setView('playing');
    } else {
      setView('lobby');
    }
  };

  const createGame = async () => {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_type: selectedGameType, player1_id: user.id })
      });
      const newGame = await res.json();
      setSelectedGame({ ...newGame, mode: 'pvp' });
      setView('playing');
    } catch (err) {
      console.error('Failed to create game', err);
    }
  };

  const joinGame = async (game) => {
    setSelectedGame({ ...game, mode: 'pvp' });
    setView('playing');
  };

  const backToGames = () => {
    setView('games');
    setSelectedGameType(null);
    setSelectedGame(null);
  };

  const exitGame = () => {
    setView('games');
    setSelectedGame(null);
    setSelectedGameType(null);
  };

  if (view === 'playing' && selectedGame) {
    const GameComponent = selectedGame.game_type === 'tictactoe' ? TicTacToe
      : selectedGame.game_type === 'rockpaperscissors' ? RockPaperScissors
      : selectedGame.game_type === 'numberguess' ? NumberGuess
      : selectedGame.game_type === 'racing' ? Racing
      : GameOfLife;

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <GameComponent
          game={selectedGame}
          user={user}
          gameMode={selectedGame.mode}
          onExit={exitGame}
        />
      </div>
    );
  }

  if (view === 'lobby') {
    const gameInfo = gameList.find(g => g.id === selectedGameType);
    return (
      <div style={{ width: '100%', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setView('modeselect')} style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          ← BACK
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{gameInfo?.emoji} {gameInfo?.name} LOBBY</h2>
        
        <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
          <div style={{ flex: 1, border: '2px solid #C0C0C0', padding: '20px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <h3>ACTIVE GAMES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {activeGames.filter(g => g.game_type === selectedGameType).length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>No active games found. Create one!</div>
              ) : (
                activeGames.filter(g => g.game_type === selectedGameType).map(g => (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #C0C0C0', borderRadius: '4px', backgroundColor: 'white' }}>
                    <span>Game #{g.id} (Host ID: {g.player1_id})</span>
                    <button onClick={() => joinGame(g)} style={{ backgroundColor: '#98D8C8', borderColor: '#8B4513' }}>JOIN</button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <p style={{ textAlign: 'center' }}>Don't see a game? Create a new session and wait for someone to join.</p>
            <button onClick={createGame} style={{ padding: '20px 40px', fontSize: '18px', backgroundColor: '#FFD700', borderColor: '#8B4513' }}>
              ➕ CREATE NEW GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'modeselect') {
    const game = gameList.find(g => g.id === selectedGameType);
    return (
      <div style={{ width: '100%', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={backToGames}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            borderColor: '#8B4513',
            color: '#000000',
            padding: '8px 16px'
          }}
        >
          ← BACK
        </button>

        <h2 style={{ marginBottom: '60px' }}>
          <span style={{ fontSize: '48px' }}>{game?.emoji}</span> {game?.name}
        </h2>

        <div style={{ display: 'flex', gap: '40px' }}>
          <button
            onClick={() => startGame('pve')}
            style={{
              borderColor: '#8B4513',
              color: '#000000',
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              padding: '30px 50px',
              fontSize: '18px',
              borderRadius: '8px'
            }}
          >
            🤖 PLAY vs AI
          </button>

          <button
            onClick={() => startGame('pvp')}
            style={{
              borderColor: '#8B4513',
              color: '#000000',
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              padding: '30px 50px',
              fontSize: '18px',
              borderRadius: '8px'
            }}
          >
            👥 PLAY vs PLAYER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '40px', textAlign: 'center' }}>🎮 SELECT A GAME</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {gameList.map((game) => (
          <button
            key={game.id}
            onClick={() => selectGame(game.id)}
            style={{
              border: '2px solid #C0C0C0',
              borderRadius: '8px',
              backgroundColor: `${game.color}22`,
              padding: '40px 20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              transition: 'all 0.2s',
              minHeight: '180px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${game.color}44`;
              e.currentTarget.style.borderColor = game.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${game.color}22`;
              e.currentTarget.style.borderColor = '#C0C0C0';
            }}
          >
            <span style={{ fontSize: '48px' }}>{game.emoji}</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#000000' }}>
              {game.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
