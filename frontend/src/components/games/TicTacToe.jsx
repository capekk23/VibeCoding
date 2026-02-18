import { useState, useEffect } from 'react';

export default function TicTacToe({ game, user, onExit }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  useEffect(() => {
    const w = calculateWinner(board);
    if (w) {
      setWinner(w);
      setGameOver(true);
    } else if (board.every(s => s)) {
      setGameOver(true);
    }
  }, [board]);

  const handleClick = (index) => {
    if (board[index] || gameOver) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="glow-text-lime">🎯 TIC TAC TOE</h2>
        <button onClick={onExit} style={{ borderColor: '#FF0000', color: '#FF0000' }}>EXIT</button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '15px',
          backgroundColor: 'var(--dark-panel)',
          padding: '20px',
          borderRadius: '10px',
          border: '3px solid #00FF00'
        }}>
          {board.map((value, index) => (
            <div
              key={index}
              onClick={() => handleClick(index)}
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'var(--dark-bg)',
                border: '2px solid #00FFFF',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: value === 'X' ? '#FF00FF' : '#00FF00',
                textShadow: '0 0 10px currentColor',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = '0 0 20px #00FFFF'}
              onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div className="glow-text-magenta" style={{ fontSize: '18px', marginBottom: '15px' }}>
          {gameOver ? (
            winner ? `WINNER: ${winner}` : 'DRAW!'
          ) : (
            `CURRENT PLAYER: ${isXNext ? 'X' : 'O'}`
          )}
        </div>
        {gameOver && (
          <button onClick={resetGame} style={{
            borderColor: '#00FF00',
            color: '#00FF00'
          }}>
            PLAY AGAIN
          </button>
        )}
      </div>
    </div>
  );
}
