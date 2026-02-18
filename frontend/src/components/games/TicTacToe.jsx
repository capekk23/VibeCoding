import { useState, useEffect } from 'react';

export default function TicTacToe({ game, user, gameMode, onExit }) {
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

  // AI move for PvE
  useEffect(() => {
    if (gameMode === 'pve' && !isXNext && !gameOver) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, gameMode, gameOver]);

  const makeAIMove = () => {
    const emptySquares = board
      .map((val, idx) => (val === null ? idx : null))
      .filter(val => val !== null);

    if (emptySquares.length === 0) return;

    const randomIdx = Math.floor(Math.random() * emptySquares.length);
    const newBoard = [...board];
    newBoard[emptySquares[randomIdx]] = 'O';
    setBoard(newBoard);
    setIsXNext(true);
  };

  const handleClick = (index) => {
    if (board[index] || gameOver) return;
    if (gameMode === 'pve' && !isXNext) return;

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
        <h2 className="glow-text-lime">🎯 TIC TAC TOE {gameMode === 'pve' ? '(vs AI)' : '(PvP)'}</h2>
        <button onClick={onExit} style={{ borderColor: '#8B4513', color: '#8B4513' }}>EXIT</button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #9B8B7E'
        }}>
          {board.map((value, index) => (
            <div
              key={index}
              onClick={() => handleClick(index)}
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'white',
                border: '2px solid #A39E94',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                cursor: value ? 'default' : 'pointer',
                color: value === 'X' ? '#FFD700' : '#9B8B7E',
                borderRadius: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => !value && (e.target.style.boxShadow = '0 0 12px rgba(74, 144, 226, 0.4)')}
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
            winner ? `🏆 ${winner === 'X' ? 'YOU' : gameMode === 'pve' ? 'AI' : 'OPPONENT'} WINS!` : '🤝 DRAW!'
          ) : (
            `CURRENT PLAYER: ${isXNext ? 'X (You)' : gameMode === 'pve' ? 'AI' : 'Opponent'}`
          )}
        </div>
        {gameOver && (
          <button onClick={resetGame} style={{
            borderColor: '#FFD700',
            color: '#1A2332',
            backgroundColor: 'rgba(255, 215, 0, 0.2)'
          }}>
            PLAY AGAIN
          </button>
        )}
      </div>
    </div>
  );
}
