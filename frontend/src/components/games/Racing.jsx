import { useState, useEffect, useRef } from 'react';

export default function Racing({ game, user, gameMode, onExit }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready');
  const keysPressed = useRef({});

  const gameRef = useRef({
    player: {
      x: 200,
      y: 400,
      angle: 0,
      speed: 0,
      maxSpeed: 8,
      friction: 0.92,
      width: 20,
      height: 30,
      color: '#FFD700'
    },
    ai: {
      x: 260,
      y: 400,
      angle: 0,
      speed: 0,
      maxSpeed: 6,
      friction: 0.92,
      width: 20,
      height: 30,
      color: '#FF8C00'
    },
    laps: { player: 0, ai: 0 },
    finished: null
  });

  // Simple rectangular track - road is the drivable area
  const ROAD_LEFT = 150;
  const ROAD_RIGHT = 1050;
  const ROAD_TOP = 100;
  const ROAD_BOTTOM = 700;
  const WALL_THICKNESS = 30;

  // Checkpoint lines to detect lap completion
  const checkpointY = 400;

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

  const isInWall = (x, y, width, height) => {
    const left = x - width / 2;
    const right = x + width / 2;
    const top = y - height / 2;
    const bottom = y + height / 2;

    // Top wall
    if (top < ROAD_TOP + WALL_THICKNESS && y < ROAD_TOP + 100) return true;
    // Bottom wall
    if (bottom > ROAD_BOTTOM - WALL_THICKNESS && y > ROAD_BOTTOM - 100) return true;
    // Left wall
    if (left < ROAD_LEFT + WALL_THICKNESS && x < ROAD_LEFT + 150) return true;
    // Right wall
    if (right > ROAD_RIGHT - WALL_THICKNESS && x > ROAD_RIGHT - 150) return true;

    return false;
  };

  const updateCar = (car, controls) => {
    // Acceleration/braking
    if (controls.forward) {
      car.speed = Math.min(car.speed + 0.4, car.maxSpeed);
    } else if (controls.backward) {
      car.speed = Math.max(car.speed - 0.4, -car.maxSpeed * 0.4);
    } else {
      car.speed *= car.friction;
    }

    // Steering
    if (controls.left && car.speed !== 0) {
      car.angle -= 0.08;
    }
    if (controls.right && car.speed !== 0) {
      car.angle += 0.08;
    }

    // Update position
    const newX = car.x + Math.cos(car.angle) * car.speed;
    const newY = car.y + Math.sin(car.angle) * car.speed;

    // Collision detection - bounce back
    if (isInWall(newX, newY, car.width, car.height)) {
      car.speed *= -0.6;
    } else {
      car.x = newX;
      car.y = newY;
    }

    // Keep in bounds
    car.x = Math.max(ROAD_LEFT + 20, Math.min(ROAD_RIGHT - 20, car.x));
    car.y = Math.max(ROAD_TOP + 20, Math.min(ROAD_BOTTOM - 20, car.y));

    // Lap detection - crossing the middle checkpoint
    if (car.lastY !== undefined) {
      const crossedCheckpoint = 
        (car.lastY < checkpointY && car.y >= checkpointY) ||
        (car.lastY > checkpointY && car.y <= checkpointY);
      
      if (crossedCheckpoint && Math.abs(car.x - 600) < 300) {
        car.laps++;
      }
    }
    car.lastY = car.y;
  };

  useEffect(() => {
    const gameLoop = () => {
      const g = gameRef.current;

      updateCar(g.player, {
        forward: keysPressed.current['w'] || keysPressed.current['arrowup'],
        backward: keysPressed.current['s'] || keysPressed.current['arrowdown'],
        left: keysPressed.current['a'] || keysPressed.current['arrowleft'],
        right: keysPressed.current['d'] || keysPressed.current['arrowright']
      });

      if (gameMode === 'pve') {
        // Simple AI - follow a waypoint and avoid walls
        const aiTarget = 600;
        if (g.ai.x < aiTarget - 50) {
          g.ai.angle = g.ai.angle * 0.9 + 0 * 0.1;
        } else if (g.ai.x > aiTarget + 50) {
          g.ai.angle = g.ai.angle * 0.9 + Math.PI * 0.1;
        }
        g.ai.speed = 4;
        
        updateCar(g.ai, {
          forward: true,
          backward: false,
          left: false,
          right: false
        });
      }

      // Check win condition
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

        // Draw road
        ctx.fillStyle = '#E8D4A8';
        ctx.fillRect(ROAD_LEFT, ROAD_TOP, ROAD_RIGHT - ROAD_LEFT, ROAD_BOTTOM - ROAD_TOP);

        // Draw walls
        ctx.fillStyle = '#8B6F47';
        ctx.fillRect(0, 0, 1200, ROAD_TOP); // Top
        ctx.fillRect(0, ROAD_BOTTOM, 1200, 800); // Bottom
        ctx.fillRect(0, ROAD_TOP, ROAD_LEFT, ROAD_BOTTOM - ROAD_TOP); // Left
        ctx.fillRect(ROAD_RIGHT, ROAD_TOP, 1200 - ROAD_RIGHT, ROAD_BOTTOM - ROAD_TOP); // Right

        // Draw checkpoint line
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(ROAD_LEFT + 50, checkpointY);
        ctx.lineTo(ROAD_RIGHT - 50, checkpointY);
        ctx.stroke();
        ctx.setLineDash([]);

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

        // Draw HUD
        ctx.fillStyle = '#000000';
        ctx.font = '16px IBM Plex Mono';
        ctx.fillText(`You: ${g.player.laps} laps`, 20, 35);
        if (gameMode === 'pve') {
          ctx.fillText(`AI: ${g.ai.laps} laps`, 20, 60);
        }
        ctx.font = '12px IBM Plex Mono';
        ctx.fillText('Speed: First to 3 laps', 20, 800 - 10);
      }

      requestAnimationFrame(gameLoop);
    };

    const rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, [gameMode]);

  const resetGame = () => {
    gameRef.current = {
      player: { ...gameRef.current.player, x: 200, y: 400, angle: 0, speed: 0, laps: 0, lastY: undefined },
      ai: { ...gameRef.current.ai, x: 260, y: 400, angle: 0, speed: 0, laps: 0, lastY: undefined },
      finished: null
    };
    setGameState('ready');
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🏎️ CIRCUIT RACING {gameMode === 'pve' ? '(vs AI)' : '(Race)'}</h2>
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
          <div><strong>W/↑</strong> Forward | <strong>S/↓</strong> Brake | <strong>A/←</strong> Left | <strong>D/→</strong> Right</div>
          <div>Cross the dashed line to count a lap. First to 3 laps wins!</div>
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
