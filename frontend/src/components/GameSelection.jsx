import { useState } from 'react';

export default function GameSelection({ onSelectGame }) {
  const games = [
    { id: 'tictactoe', name: 'Tic Tac Toe', emoji: '🎯' },
    { id: 'rockpaperscissors', name: 'Rock Paper Scissors', emoji: '✂️' },
    { id: 'numberguess', name: 'Number Guess', emoji: '🔢' }
  ];

  return (
    <div style={{ width: '100%', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
      <h2 className="glow-text-lime" style={{ marginBottom: '40px' }}>🎮 SELECT A GAME</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
        {games.map((game) => (
          <div
            key={game.id}
            className="panel panel-lime"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '32px' }}>{game.emoji}</span>
              <h3 style={{ margin: 0 }}>{game.name}</h3>
            </div>
            <button
              onClick={() => onSelectGame(game.id)}
              style={{
                borderColor: '#8B6F47',
                color: '#3D2817',
                backgroundColor: 'rgba(218, 165, 32, 0.2)',
                padding: '8px 16px',
                fontSize: '14px'
              }}
            >
              PLAY
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
