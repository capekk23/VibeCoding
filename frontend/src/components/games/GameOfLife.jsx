import { useState, useEffect, useRef } from 'react';

export default function GameOfLife({ game, user, gameMode, onExit }) {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(100);

  const CELL_SIZE = 8;
  const GRID_WIDTH = Math.floor(1200 / CELL_SIZE);
  const GRID_HEIGHT = Math.floor(600 / CELL_SIZE);

  const gameRef = useRef({
    grid: [],
    generation: 0
  });

  // Initialize random grid
  const initializeGrid = () => {
    const grid = Array(GRID_HEIGHT).fill(null).map(() =>
      Array(GRID_WIDTH).fill(null).map(() => Math.random() > 0.8 ? 1 : 0)
    );
    gameRef.current.grid = grid;
    gameRef.current.generation = 0;
    setGeneration(0);
  };

  // Count live neighbors
  const countNeighbors = (x, y) => {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + GRID_WIDTH) % GRID_WIDTH;
        const ny = (y + dy + GRID_HEIGHT) % GRID_HEIGHT;
        count += gameRef.current.grid[ny][nx];
      }
    }
    return count;
  };

  // Next generation
  const nextGeneration = () => {
    const grid = gameRef.current.grid;
    const newGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));

    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const neighbors = countNeighbors(x, y);
        const alive = grid[y][x];

        if (alive && (neighbors === 2 || neighbors === 3)) {
          newGrid[y][x] = 1;
        } else if (!alive && neighbors === 3) {
          newGrid[y][x] = 1;
        } else {
          newGrid[y][x] = 0;
        }
      }
    }

    gameRef.current.grid = newGrid;
    gameRef.current.generation++;
    setGeneration(gameRef.current.generation);
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      nextGeneration();
    }, 101 - speed);

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(0, 0, 1200, 600);

    const grid = gameRef.current.grid;
    ctx.fillStyle = '#FFD700';
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (grid[y][x]) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(163, 158, 148, 0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, 600);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(1200, y * CELL_SIZE);
      ctx.stroke();
    }
  });

  const reset = () => {
    setIsRunning(false);
    initializeGrid();
  };

  const randomize = () => {
    initializeGrid();
  };

  const step = () => {
    nextGeneration();
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🧬 CONWAY'S GAME OF LIFE</h2>
        <button onClick={onExit} style={{ borderColor: '#8B4513', color: '#000000' }}>
          EXIT
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            borderColor: isRunning ? '#FF8C00' : '#FFD700',
            color: '#000000',
            backgroundColor: isRunning ? 'rgba(255, 140, 0, 0.2)' : 'rgba(255, 215, 0, 0.2)',
            padding: '8px 20px'
          }}
        >
          {isRunning ? '⏸ PAUSE' : '▶ START'}
        </button>
        <button onClick={step} style={{ borderColor: '#8B4513', color: '#000000', padding: '8px 20px' }}>
          ⏭ STEP
        </button>
        <button onClick={randomize} style={{ borderColor: '#8B4513', color: '#000000', padding: '8px 20px' }}>
          🔀 RANDOMIZE
        </button>
        <button onClick={reset} style={{ borderColor: '#8B4513', color: '#000000', padding: '8px 20px' }}>
          ↻ RESET
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: '#000000' }}>Speed:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: '150px' }}
          />
          <span style={{ color: '#000000', minWidth: '50px' }}>Gen: {generation}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        style={{
          border: '2px solid #C0C0C0',
          borderRadius: '4px',
          backgroundColor: '#FFF8DC',
          flex: 1
        }}
      />

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#000000' }}>
        <p><strong>Conway's Game of Life:</strong> A zero-player game where cells live or die based on neighbor count. Click START to watch evolution, or STEP through manually. RANDOMIZE to generate new patterns!</p>
      </div>
    </div>
  );
}
