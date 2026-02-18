import { useState, useEffect, useRef } from 'react';

export default function Racing({ game, user, gameMode, onExit }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [carAvoided, setCarAvoided] = useState(0);
  const keysPressed = useRef({});

  const gameRef = useRef({
    myCarX: 0,
    bgY1: 0,
    bgY2: 0,
    roadSpeed: 3,
    score: 0,
    carAvoided: 0,
    obstacles: [],
    running: true
  });

  // Canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  const CAR_WIDTH = 80;
  const CAR_HEIGHT = 150;
  const OBSTACLE_WIDTH = 80;
  const OBSTACLE_HEIGHT = 150;
  const ROAD_LEFT = 200;
  const ROAD_RIGHT = 1000;

  // Create simple gradient as "road"
  const drawRoad = (ctx, offsetY) => {
    ctx.fillStyle = '#E8D4A8';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, CANVAS_HEIGHT);
    
    // Road stripes
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 3;
    for (let i = -CANVAS_HEIGHT; i < CANVAS_HEIGHT * 2; i += 100) {
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, i + offsetY);
      ctx.lineTo(CANVAS_WIDTH / 2, i + 50 + offsetY);
      ctx.stroke();
    }
  };

  const drawCar = (ctx, x, y, color) => {
    // Car body
    ctx.fillStyle = color;
    ctx.fillRect(x, y, CAR_WIDTH, CAR_HEIGHT);
    
    // Windshield
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 10, y + 10, CAR_WIDTH - 20, 30);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.keyCode] = true;
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.keyCode] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const g = gameRef.current;
    g.myCarX = CANVAS_WIDTH / 2 - CAR_WIDTH / 2;
    g.bgY1 = 0;
    g.bgY2 = -CANVAS_HEIGHT;

    // Initialize obstacles
    for (let i = 0; i < 4; i++) {
      g.obstacles.push({
        x: Math.random() * (ROAD_RIGHT - ROAD_LEFT - OBSTACLE_WIDTH) + ROAD_LEFT,
        y: -200 * i - 300,
        order: i
      });
    }

    const gameLoop = () => {
      if (!g.running) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');

      // Handle input
      if (keysPressed.current[37] || keysPressed.current[65]) {
        // Left arrow or A
        g.myCarX = Math.max(ROAD_LEFT, g.myCarX - 6);
      }
      if (keysPressed.current[39] || keysPressed.current[68]) {
        // Right arrow or D
        g.myCarX = Math.min(ROAD_RIGHT - CAR_WIDTH, g.myCarX + 6);
      }

      // Update road
      g.bgY1 += g.roadSpeed;
      g.bgY2 += g.roadSpeed;

      if (g.bgY1 >= CANVAS_HEIGHT) {
        g.bgY1 = -CANVAS_HEIGHT;
      }
      if (g.bgY2 >= CANVAS_HEIGHT) {
        g.bgY2 = -CANVAS_HEIGHT;
      }

      // Update score
      g.score += 0.15;
      if (g.score > 500) {
        g.roadSpeed += 0.02;
      }

      // Draw
      ctx.fillStyle = '#8B6F47';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawRoad(ctx, g.bgY1);
      drawRoad(ctx, g.bgY2);

      // Update and draw obstacles
      let hitObstacle = false;
      g.obstacles.forEach((obs) => {
        obs.y += g.roadSpeed;

        if (obs.y > CANVAS_HEIGHT) {
          obs.y = -OBSTACLE_HEIGHT - 100;
          obs.x = Math.random() * (ROAD_RIGHT - ROAD_LEFT - OBSTACLE_WIDTH) + ROAD_LEFT;
          g.carAvoided++;
        }

        drawCar(ctx, obs.x, obs.y, '#FF8C00');

        // Collision detection
        if (
          g.myCarX < obs.x + OBSTACLE_WIDTH &&
          g.myCarX + CAR_WIDTH > obs.x &&
          CANVAS_HEIGHT - CAR_HEIGHT < obs.y + OBSTACLE_HEIGHT &&
          CANVAS_HEIGHT > obs.y
        ) {
          hitObstacle = true;
        }
      });

      // Draw player car
      drawCar(ctx, g.myCarX, CANVAS_HEIGHT - CAR_HEIGHT - 20, '#FFD700');

      // Draw HUD
      ctx.fillStyle = '#000000';
      ctx.font = '18px IBM Plex Mono';
      ctx.fillText(`Distance: ${Math.floor(g.score)}`, 20, 40);
      ctx.fillText(`Avoided: ${g.carAvoided}`, 20, 70);

      setScore(Math.floor(g.score));
      setCarAvoided(g.carAvoided);

      if (hitObstacle) {
        g.running = false;
        setGameState('finished');
        return;
      }

      requestAnimationFrame(gameLoop);
    };

    const rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const resetGame = () => {
    gameRef.current = {
      myCarX: CANVAS_WIDTH / 2 - CAR_WIDTH / 2,
      bgY1: 0,
      bgY2: -CANVAS_HEIGHT,
      roadSpeed: 3,
      score: 0,
      carAvoided: 0,
      obstacles: [],
      running: true
    };

    // Reinitialize obstacles
    for (let i = 0; i < 4; i++) {
      gameRef.current.obstacles.push({
        x: Math.random() * (ROAD_RIGHT - ROAD_LEFT - OBSTACLE_WIDTH) + ROAD_LEFT,
        y: -200 * i - 300,
        order: i
      });
    }

    setScore(0);
    setCarAvoided(0);
    setGameState('playing');
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🏎️ HIGHWAY RACER</h2>
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
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            border: '2px solid #C0C0C0',
            borderRadius: '4px',
            backgroundColor: '#FFF8DC'
          }}
        />

        <div style={{ fontSize: '14px', color: '#000000', textAlign: 'center' }}>
          <div><strong>A/←</strong> Move Left | <strong>D/→</strong> Move Right</div>
          <div>Dodge incoming traffic! Avoid cars and survive as long as you can.</div>
        </div>
      </div>

      {gameState === 'finished' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 248, 220, 0.98)',
          padding: '50px',
          borderRadius: '8px',
          border: '2px solid #C0C0C0',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <h2 style={{ color: '#FF8C00', marginBottom: '20px' }}>GAME OVER!</h2>
          <div style={{ fontSize: '18px', color: '#000000', marginBottom: '30px' }}>
            <div>Distance: {score}</div>
            <div>Cars Avoided: {carAvoided}</div>
          </div>
          <button onClick={resetGame} style={{
            borderColor: '#FFD700',
            color: '#000000',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            padding: '10px 30px',
            fontSize: '16px'
          }}>
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
