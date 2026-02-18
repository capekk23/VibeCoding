import { useState, useEffect } from 'react';
import TicTacToe from './games/TicTacToe';
import RockPaperScissors from './games/RockPaperScissors';
import NumberGuess from './games/NumberGuess';

export default function GameLobby({ user }) {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameView, setGameView] = useState('lobby'); // lobby, playing

  useEffect(() => {
    if (gameView === 'lobby') {
      fetchGames();
      const interval = setInterval(fetchGames, 3000);
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

  const createGame = async (gameType) => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_type: gameType, player1_id: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedGame(data);
        setGameView('playing');
      }
    } catch (err) {
      console.error('Error creating game:', err);
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
        setSelectedGame(data);
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
      <h2 className="glow-text-lime">GAME LOBBY</h2>

      {/* Create Game Section */}
      <div className="panel panel-lime" style={{ marginBottom: '20px' }}>
        <h3>CREATE NEW GAME:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => createGame('tictactoe')}>🎯 TIC TAC TOE</button>
          <button onClick={() => createGame('rockpaperscissors')}>✂️ ROCK PAPER SCISSORS</button>
          <button onClick={() => createGame('numberguess')}>🔢 NUMBER GUESS</button>
        </div>
      </div>

      {/* Available Games Section */}
      <div className="panel panel-magenta">
        <h3>WAITING GAMES:</h3>
        {games.length === 0 ? (
          <div className="glow-text">NO GAMES AVAILABLE - CREATE ONE!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {games.map((game) => (
              <div key={game.id} className="panel" style={{ padding: '15px' }}>
                <div style={{ color: '#00FF00', fontWeight: 'bold', marginBottom: '10px' }}>
                  {game.game_type.toUpperCase()}
                </div>
                {game.player2_id ? (
                  <div style={{ color: '#FF0000' }}>IN PROGRESS</div>
                ) : (
                  <button onClick={() => joinGame(game.id)} style={{
                    borderColor: '#00FF00',
                    color: '#00FF00',
                    width: '100%'
                  }}>
                    JOIN GAME
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
