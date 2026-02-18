import { useState, useEffect, useRef } from 'react';

export default function Racing({ game, user, gameMode, onExit }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [carAvoided, setCarAvoided] = useState(0);
  const [opponents, setOpponents] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const keysPressed = useRef({});

  const gameRef = useRef({
    myCarX: 0,
    myLane: 5,
    bgY1: 0,
    bgY2: 0,
    baseSpeed: 2,
    score: 0,
    carAvoided: 0,
    seed: 0,
    running: true
  });

  // Canvas dimensions - much smaller
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 500;
  const LANE_WIDTH = 60;
  const NUM_LANES = 10;
  const ROAD_WIDTH = LANE_WIDTH * NUM_LANES;
  const ROAD_LEFT = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
  const CAR_WIDTH = 50;
  const CAR_HEIGHT = 35;
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AED6F1'];

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateObstacles = (seed, score) => {
    const obstacles = [];
    const baseSpeed = 2 + Math.min(score * 0.001, 15); // Exponential-like growth with cap at 17
    
    for (let i = 0; i < 8; i++) {
      const lane = Math.floor(seededRandom(seed + i * 111.111) * NUM_LANES);
      const color = COLORS[Math.floor(seededRandom(seed + i * 222.222) * COLORS.length)];
      obstacles.push({
        lane,
        y: -100 * i - 200,
        color,
        id: seed + i
      });
    }
    return obstacles;
  };

  const drawRoad = (ctx, offsetY) => {
    // Road background
    ctx.fillStyle = '#E8D4A8';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

    // Lane dividers
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 15]);
    for (let lane = 1; lane < NUM_LANES; lane++) {
      const x = ROAD_LEFT + lane * LANE_WIDTH;
      for (let i = -CANVAS_HEIGHT; i < CANVAS_HEIGHT * 2; i += 40) {
        ctx.beginPath();
        ctx.moveTo(x, i + offsetY);
        ctx.lineTo(x, i + 20 + offsetY);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  };

  const drawCar = (ctx, lane, y, color, opacity = 1) => {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    const laneX = ROAD_LEFT + lane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2;
    ctx.fillRect(laneX, y, CAR_WIDTH, CAR_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(laneX + 5, y + 3, CAR_WIDTH - 10, 12);
    ctx.globalAlpha = 1;
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
    const initGame = async () => {
      const g = gameRef.current;
      g.myLane = Math.floor(NUM_LANES / 2);
      g.seed = Math.floor(Math.random() * 10000);

      if (gameMode === 'pvp') {
        try {
          const createRes = await fetch('/api/games/race/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
          const { sessionId: sid } = await createRes.json();
          setSessionId(sid);
          g.sessionId = sid;
        } catch (err) {
          console.error('Failed to create race session', err);
        }
      }
    };
    initGame();
  }, [gameMode, user]);

  useEffect(() => {
    if (!sessionId && gameMode === 'pvp') return;

    const g = gameRef.current;

    const gameLoop = () => {
      if (!g.running) return;

      const canvas = canvasRef.current;
      if (!canvas) {
        requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');

      // Handle input - change lanes
      if (keysPressed.current[37] || keysPressed.current[65]) {
        // Left
        g.myLane = Math.max(0, g.myLane - 1);
        keysPressed.current[37] = false;
        keysPressed.current[65] = false;
      }
      if (keysPressed.current[39] || keysPressed.current[68]) {
        // Right
        g.myLane = Math.min(NUM_LANES - 1, g.myLane + 1);
        keysPressed.current[39] = false;
        keysPressed.current[68] = false;
      }

      // Update road
      g.bgY1 += g.baseSpeed;
      g.bgY2 += g.baseSpeed;

      if (g.bgY1 >= CANVAS_HEIGHT) {
        g.bgY1 = -CANVAS_HEIGHT;
      }
      if (g.bgY2 >= CANVAS_HEIGHT) {
        g.bgY2 = -CANVAS_HEIGHT;
      }

      // Exponential speed growth with cap at 17
      g.score += 0.1;
      g.baseSpeed = 2 + Math.min(g.score * 0.0015, 15);

      // Generate obstacles
      const obstacles = generateObstacles(g.seed, g.score);

      // Draw
      ctx.fillStyle = '#8B6F47';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawRoad(ctx, g.bgY1);
      drawRoad(ctx, g.bgY2);

      // Update and draw obstacles
      let hitObstacle = false;
      obstacles.forEach((obs) => {
        obs.y += g.baseSpeed;

        if (obs.y > CANVAS_HEIGHT) {
          g.carAvoided++;
        }

        drawCar(ctx, obs.lane, obs.y, obs.color);

        // Collision detection
        if (
          obs.lane === g.myLane &&
          obs.y > CANVAS_HEIGHT - CAR_HEIGHT - 50 &&
          obs.y < CANVAS_HEIGHT
        ) {
          hitObstacle = true;
        }
      });

      // Draw player car (full opacity)
      const playerLaneX = ROAD_LEFT + g.myLane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2;
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(playerLaneX, CANVAS_HEIGHT - CAR_HEIGHT - 10, CAR_WIDTH, CAR_HEIGHT);
      ctx.fillStyle = '#000000';
      ctx.fillRect(playerLaneX + 5, CANVAS_HEIGHT - CAR_HEIGHT - 10 + 3, CAR_WIDTH - 10, 12);

      // Draw opponent ghosts if PvP
      if (gameMode === 'pvp' && opponents.length > 0) {
        opponents.forEach((opp, idx) => {
          const oppLane = Math.floor((opp.x - ROAD_LEFT) / LANE_WIDTH);
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = COLORS[(idx * 3) % COLORS.length];
          ctx.fillRect(playerLaneX, CANVAS_HEIGHT - CAR_HEIGHT - 10, CAR_WIDTH, CAR_HEIGHT);
          ctx.globalAlpha = 1;
        });
      }

      // Draw HUD
      ctx.fillStyle = '#000000';
      ctx.font = '14px IBM Plex Mono';
      ctx.fillText(`Distance: ${Math.floor(g.score)}`, 10, 20);
      ctx.fillText(`Avoided: ${g.carAvoided}`, 10, 40);
      ctx.fillText(`Speed: ${g.baseSpeed.toFixed(1)}`, 10, 60);

      setScore(Math.floor(g.score));
      setCarAvoided(g.carAvoided);

      if (hitObstacle) {
        g.running = false;
        setGameState('finished');
        return;
      }

      // Send update to server if PvP
      if (gameMode === 'pvp' && g.sessionId) {
        fetch('/api/games/race/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: g.sessionId,
            userId: user.id,
            x: playerLaneX,
            score: g.score,
            avoided: g.carAvoided
          })
        }).then(r => r.json()).then(data => {
          if (data.players) {
            const opps = data.players.filter(p => p.userId !== user.id);
            setOpponents(opps);
          }
        }).catch(() => {});
      }

      requestAnimationFrame(gameLoop);
    };

    const rafId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafId);
  }, [gameMode, user, opponents]);

  const resetGame = () => {
    gameRef.current = {
      myCarX: 0,
      myLane: Math.floor(NUM_LANES / 2),
      bgY1: 0,
      bgY2: -CANVAS_HEIGHT,
      baseSpeed: 2,
      score: 0,
      carAvoided: 0,
      seed: Math.floor(Math.random() * 10000),
      running: true
    };

    setScore(0);
    setCarAvoided(0);
    setOpponents([]);
    setGameState('playing');
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🏎️ HIGHWAY RACER {gameMode === 'pvp' ? '(PvP)' : '(PvE)'}</h2>
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
            backgroundColor: '#FFF8DC',
            imageRendering: 'pixelated'
          }}
        />

        <div style={{ fontSize: '12px', color: '#000000', textAlign: 'center' }}>
          <div><strong>A/←</strong> Left Lane | <strong>D/→</strong> Right Lane</div>
          <div>Dodge traffic on a 10-lane highway! Speed increases exponentially.</div>
          {gameMode === 'pvp' && <div>Opponents shown as semi-transparent ghosts.</div>}
        </div>
      </div>

      {gameState === 'finished' && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 248, 220, 0.98)',
          padding: '40px',
          borderRadius: '8px',
          border: '2px solid #C0C0C0',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <h2 style={{ color: '#FF8C00', marginBottom: '15px' }}>GAME OVER!</h2>
          <div style={{ fontSize: '16px', color: '#000000', marginBottom: '20px' }}>
            <div>Distance: {score}</div>
            <div>Cars Avoided: {carAvoided}</div>
            <div>Max Speed: {(2 + Math.min(score * 0.0015, 15)).toFixed(1)}</div>
          </div>
          <button onClick={resetGame} style={{
            borderColor: '#FFD700',
            color: '#000000',
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            padding: '8px 20px',
            fontSize: '14px'
          }}>
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
