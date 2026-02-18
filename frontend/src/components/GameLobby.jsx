import { useState, useEffect } from 'react';
import TicTacToe from './games/TicTacToe';
import RockPaperScissors from './games/RockPaperScissors';
import NumberGuess from './games/NumberGuess';

export default function GameLobby({ user }) {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameView, setGameView] = useState('lobby');
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (gameView === 'lobby') {
      fetchGames();
      fetchUserCount();
      const interval = setInterval(() => {
        fetchGames();
        fetchUserCount();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameView]);

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await fetch('/api/dm/users');
      if (response.ok) {
        const data = await response.json();
        setUserCount(data.length);
      }
    } catch (err) {
      console.error('Error fetching user count:', err);
    }
  };

  const startGame = async (gameType, mode) => {
    if (mode === 'pve') {
      setSelectedGame({ game_type: gameType, player1_id: user.id, mode: 'pve' });
      setGameView('playing');
    } else {
      try {
        const response = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game_type: gameType, player1_id: user.id })
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedGame({ ...data, mode: 'pvp' });
          setGameView('playing');
        }
      } catch (err) {
        console.error('Error creating game:', err);
      }
    }
  };

  const joinGame = async (gameId) => {
    try {
      await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player2_id: user.id })
      });

      const response = await fetch(`/api/games/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGame({ ...data, mode: 'pvp' });
        setGameView('playing');
      }
    } catch (err) {
      console.error('Error joining game:', err);
    }
  };

  if (gameView === 'playing' && selectedGame) {
    const GameComponent = selectedGame.game_type === 'tictactoe' ? TicTacToe
      : selectedGame.game_type === 'rockpaperscissors' ? RockPaperScissors
      : NumberGuess;

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <GameComponent
          game={selectedGame}
          user={user}
          gameMode={selectedGame.mode}
          onExit={() => {
            setGameView('lobby');
            fetchGames();
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '20px' }}>
      <h2 className="glow-text-lime">🎮 GAME LOBBY</h2>
      <div style={{
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        padding: '10px 15px',
        borderRadius: '4px',
        marginBottom: '20px',
        borderLeft: '3px solid #FFD700'
      }}>
        👥 <strong>{userCount} other players online</strong>
      </div>

      {/* Game Selection */}
      <div className="panel panel-lime" style={{ marginBottom: '20px' }}>
        <h3>SELECT GAME MODE:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          {/* Tic Tac Toe */}
          <div style={{
            border: '1.5px solid #A39E94',
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <h4 style={{ color: '#1A2332', marginBottom: '10px' }}>🎯 TIC TAC TOE</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => startGame('tictactoe', 'pvp')}
                style={{
                  flex: 1,
                  borderColor: '#FFD700',
                  color: '#1A2332',
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  fontSize: '12px',
                  padding: '8px'
                }}
              >
                PvP
              </button>
              <button
                onClick={() => startGame('tictactoe', 'pve')}
                style={{
                  flex: 1,
                  borderColor: '#9B8B7E',
                  color: '#1A2332',
                  backgroundColor: 'rgba(0, 206, 209, 0.2)',
                  fontSize: '12px',
                  padding: '8px'
                }}
              >
                PvE
              </button>
            </div>
          </div>

          {/* Rock Paper Scissors */}
          <div style={{
            border: '1.5px solid #A39E94',
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <h4 style={{ color: '#1A2332', marginBottom: '10px' }}>✂️ ROCK PAPER SCISSORS</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => startGame('rockpaperscissors', 'pvp')}
                style={{
                  flex: 1,
                  borderColor: '#FFD700',
                  color: '#1A2332',
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  fontSize: '12px',
                  padding: '8px'
                }}
              >
                PvP
              </button>
              <button
                onClick={() => startGame('rockpaperscissors', 'pve')}
                style={{
                  flex: 1,
                  borderColor: '#9B8B7E',
                  color: '#1A2332',
                  backgroundColor: 'rgba(0, 206, 209, 0.2)',
                  fontSize: '12px',
                  padding: '8px'
                }}
              >
                PvE
              </button>
            </div>
          </div>

          {/* Number Guess */}
          <div style={{
            border: '1.5px solid #A39E94',
            padding: '15px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <h4 style={{ color: '#1A2332', marginBottom: '10px' }}>🔢 NUMBER GUESS</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => startGame('numberguess', 'pvp')}
                style={{
                  flex: 1,
                  borderColor: '#FFD700',
                  color: '#1A2332',
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  fontSize: '12px',
                  padding: '8px'
                }}
              >
                PvP
              </button>
              <button
                onClick={() => startGame('numberguess', 'pve')}
                style={{
                  flex: 1,
                  borderColor: '#9B8B7E',
                  color: '#1A2332',
                  backgroundColor: 'rgba(0, 206, 209, 0.2)',
                  fontSize: '12px',
                  padding: '8px'
                }}
              >
                PvE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Waiting Games */}
      {games.length > 0 && (
        <div className="panel panel-magenta">
          <h3>⏳ WAITING FOR PLAYERS:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
            {games.map((game) => (
              <div key={game.id} className="panel" style={{ padding: '15px', backgroundColor: 'white' }}>
                <div style={{ color: '#9B8B7E', fontWeight: 'bold', marginBottom: '10px' }}>
                  {game.game_type.toUpperCase()}
                </div>
                {game.player2_id ? (
                  <div style={{ color: '#8B4513' }}>⚠️ IN PROGRESS</div>
                ) : (
                  <button
                    onClick={() => joinGame(game.id)}
                    style={{
                      borderColor: '#FFD700',
                      color: '#1A2332',
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      width: '100%'
                    }}
                  >
                    JOIN GAME
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
