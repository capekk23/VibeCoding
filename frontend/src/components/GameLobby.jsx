import { useState, useEffect } from 'react';
import TicTacToe from './games/TicTacToe';
import RockPaperScissors from './games/RockPaperScissors';
import NumberGuess from './games/NumberGuess';
import Racing from './games/Racing';

export default function GameLobby({ user }) {
  const [view, setView] = useState('games'); // 'games', 'modeselect', 'playing'
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameType, setSelectedGameType] = useState(null);

  const gameList = [
    { id: 'tictactoe', name: 'Tic Tac Toe', emoji: '🎯', color: '#FF6B6B' },
    { id: 'rockpaperscissors', name: 'Rock Paper Scissors', emoji: '✂️', color: '#4ECDC4' },
    { id: 'numberguess', name: 'Number Guess', emoji: '🔢', color: '#45B7D1' },
    { id: 'racing', name: 'Highway Racer', emoji: '🏎️', color: '#FFA07A' }
  ];

  const selectGame = (gameId) => {
    setSelectedGameType(gameId);
    setView('modeselect');
  };

  const startGame = (mode) => {
    if (mode === 'pve') {
      setSelectedGame({ game_type: selectedGameType, player1_id: user.id, mode: 'pve' });
      setView('playing');
    } else {
      setSelectedGame({ game_type: selectedGameType, player1_id: user.id, mode: 'pvp' });
      setView('playing');
    }
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
      : Racing;

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
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '30px',
        maxWidth: '800px',
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
