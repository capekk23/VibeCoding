import { useState, useEffect, useRef } from 'react';

export default function Racing({ game, user, gameMode, onExit }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready');
  const keysPressed = useRef({});
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  // Game objects
  const gameRef = useRef({
    player: {
      x: 1100,
      y: 400,
      angle: -Math.PI / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      maxSpeed: 5,
      acceleration: 0.2,
      width: 20,
      height: 30,
      color: '#FFD700'
    },
    ai: {
      x: 1100,
      y: 450,
      angle: -Math.PI / 2,
      vx: 0,
      vy: 0,
      speed: 0,
      maxSpeed: 3.5,
      acceleration: 0.15,
      width: 20,
      height: 30,
      color: '#FF8C00'
    },
    laps: { player: 0, ai: 0 },
    finished: null
  });

  // O-shaped track with outer and inner oval walls
  const generateOvalWalls = () => {
    const walls = [];
    const centerX = 600;
    const centerY = 400;
    const outerRadiusX = 500;
    const outerRadiusY = 300;
    const innerRadiusX = 300;
    const innerRadiusY = 180;
    
    // Outer oval
    const outerSegments = 120;
    for (let i = 0; i < outerSegments; i++) {
      const angle1 = (i / outerSegments) * Math.PI * 2;
      const angle2 = ((i + 1) / outerSegments) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle1) * outerRadiusX;
      const y1 = centerY + Math.sin(angle1) * outerRadiusY;
      const x2 = centerX + Math.cos(angle2) * outerRadiusX;
      const y2 = centerY + Math.sin(angle2) * outerRadiusY;
      walls.push({ x1, y1, x2, y2 });
    }
    
    // Inner oval
    const innerSegments = 120;
    for (let i = 0; i < innerSegments; i++) {
      const angle1 = (i / innerSegments) * Math.PI * 2;
      const angle2 = ((i + 1) / innerSegments) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle1) * innerRadiusX;
      const y1 = centerY + Math.sin(angle1) * innerRadiusY;
      const x2 = centerX + Math.cos(angle2) * innerRadiusX;
      const y2 = centerY + Math.sin(angle2) * innerRadiusY;
      walls.push({ x1, y1, x2, y2 });
    }
    
    return walls;
  };

  const walls = generateOvalWalls();
  const checkpointBox = { x: 1050, y: 350, w: 100, h: 100 };

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const checkCollision = (car) => {
    const carLeft = car.x - car.width / 2;
    const carRight = car.x + car.width / 2;
    const carTop = car.y - car.height / 2;
    const carBottom = car.y + car.height / 2;

    for (let wall of walls) {
      // Simple line collision - if car center crosses wall line
      const dx = wall.x2 - wall.x1;
      const dy = wall.y2 - wall.y1;
      const px = car.x - wall.x1;
      const py = car.y - wall.y1;

      const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
      const nearestX = wall.x1 + t * dx;
      const nearestY = wall.y1 + t * dy;

      const distX = car.x - nearestX;
      const distY = car.y - nearestY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < 15) {
        return true;
      }
    }
    return false;
  };

  const updateCar = (car, controls) => {
    if (controls.forward) {
      car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
    } else if (controls.backward) {
      car.speed = Math.max(car.speed - car.acceleration, -car.maxSpeed * 0.5);
    } else {
      car.speed *= 0.95;
    }

    if (controls.left) {
      car.angle -= 0.1;
    }
    if (controls.right) {
      car.angle += 0.1;
    }

    const newX = car.x + Math.cos(car.angle) * car.speed;
    const newY = car.y + Math.sin(car.angle) * car.speed;

    // Create temporary car to test collision
    const testCar = { ...car, x: newX, y: newY };
    if (!checkCollision(testCar)) {
      car.x = newX;
      car.y = newY;
    } else {
      car.speed *= -0.5;
    }

    // Check lap
    if (
      car.x > checkpointBox.x &&
      car.x < checkpointBox.x + checkpointBox.w &&
      car.y > checkpointBox.y &&
      car.y < checkpointBox.y + checkpointBox.h
    ) {
      if (!car.lastCheckpoint) {
        car.laps++;
        car.lastCheckpoint = true;
      }
    } else {
      car.lastCheckpoint = false;
    }
  };

  useEffect(() => {
    const gameLoop = () => {
      const g = gameRef.current;

      // Update player
      updateCar(g.player, {
        forward: keysPressed.current['w'] || keysPressed.current['arrowup'],
        backward: keysPressed.current['s'] || keysPressed.current['arrowdown'],
        left: keysPressed.current['a'] || keysPressed.current['arrowleft'],
        right: keysPressed.current['d'] || keysPressed.current['arrowright']
      });

      // Update AI
      if (gameMode === 'pve') {
        updateCar(g.ai, {
          forward: true,
          backward: false,
          left: Math.random() < 0.15,
          right: Math.random() < 0.15
        });
      }

      // Check if someone finished (3 laps)
      if (g.player.laps >= 3 && !g.finished) {
        g.finished = 'player';
        setGameState('finished');
      } else if (gameMode === 'pve' && g.ai.laps >= 3 && !g.finished) {
        g.finished = 'ai';
        setGameState('finished');
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(0, 0, 1200, 800);

        // Draw checkpoint
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(checkpointBox.x, checkpointBox.y, checkpointBox.w, checkpointBox.h);
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.strokeRect(checkpointBox.x, checkpointBox.y, checkpointBox.w, checkpointBox.h);

        // Draw walls
        ctx.strokeStyle = '#8B6F47';
        ctx.lineWidth = 3;
        for (let wall of walls) {
          ctx.beginPath();
          ctx.moveTo(wall.x1, wall.y1);
          ctx.lineTo(wall.x2, wall.y2);
          ctx.stroke();
        }

        // Draw cars
        const drawCar = (car) => {
          ctx.save();
          ctx.translate(car.x, car.y);
          ctx.rotate(car.angle);

          ctx.fillStyle = car.color;
          ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

          ctx.fillStyle = '#000000';
          ctx.fillRect(-car.width / 2, -car.height / 2, car.width, 8);

          ctx.restore();
        };

        drawCar(g.player);
        if (gameMode === 'pve') {
          drawCar(g.ai);
        }

        // Draw lap info
        ctx.fillStyle = '#000000';
        ctx.font = '14px IBM Plex Mono';
        ctx.fillText(`Player Laps: ${g.player.laps}`, 10, 30);
        if (gameMode === 'pve') {
          ctx.fillText(`AI Laps: ${g.ai.laps}`, 10, 50);
        }
      }

      requestAnimationFrame(gameLoop);
    };

    const rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, [gameMode]);

  const resetGame = () => {
    gameRef.current = {
      player: { ...gameRef.current.player, x: 1100, y: 400, angle: -Math.PI / 2, speed: 0, laps: 0 },
      ai: { ...gameRef.current.ai, x: 1100, y: 450, angle: -Math.PI / 2, speed: 0, laps: 0 },
      finished: null
    };
    setGameState('ready');
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="glow-text-lime">🏎️ CIRCUIT RACING {gameMode === 'pve' ? '(vs AI)' : '(Race)'}</h2>
        <button onClick={onExit} style={{ borderColor: '#8B4513', color: '#000000' }}>
          EXIT
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          style={{
            border: '2px solid #C0C0C0',
            borderRadius: '4px',
            backgroundColor: '#FFF8DC'
          }}
        />

        <div style={{ fontSize: '14px', color: '#000000', textAlign: 'center' }}>
          <div><strong>W/↑</strong> Forward | <strong>S/↓</strong> Backward | <strong>A/←</strong> Left | <strong>D/→</strong> Right</div>
          <div>First to 3 laps wins!</div>
        </div>
      </div>

      {gameState === 'finished' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 248, 220, 0.95)',
          padding: '40px',
          borderRadius: '8px',
          border: '2px solid #C0C0C0',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <h2 style={{ color: '#DAA520', marginBottom: '20px' }}>
            {gameRef.current.finished === 'player' ? '🏆 YOU WON!' : '🏁 RACE OVER!'}
          </h2>
          <button onClick={resetGame} style={{
            borderColor: '#FFD700',
            color: '#000000',
            backgroundColor: 'rgba(255, 215, 0, 0.2)'
          }}>
            RACE AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
