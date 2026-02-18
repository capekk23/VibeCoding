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
    myCarY: 0,
    aiCarX: 0,
    bgY1: 0,
    bgY2: 0,
    baseSpeed: 2,
    score: 0,
    carAvoided: 0,
    seed: 0,
    running: true,
    obstacles: []
  });

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 500;
  const ROAD_WIDTH = 500;
  const ROAD_LEFT = (CANVAS_WIDTH - ROAD_WIDTH) / 2;
  const ROAD_RIGHT = ROAD_LEFT + ROAD_WIDTH;
  const NUM_LANES = 10;
  const LANE_WIDTH = ROAD_WIDTH / NUM_LANES;
  const CAR_WIDTH = 40;
  const CAR_HEIGHT = 30;
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AED6F1'];

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateObstacles = (seed, score) => {
    const obstacles = [];
    
    for (let i = 0; i < 6; i++) {
      const lane = Math.floor(seededRandom(seed + i * 111.111) * NUM_LANES);
      const laneX = ROAD_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2;
      const color = COLORS[Math.floor(seededRandom(seed + i * 222.222) * COLORS.length)];
      obstacles.push({
        x: laneX,
        y: -150 * (i + 1) - 100,
        color,
        id: seed + i
      });
    }
    return obstacles;
  };

  const drawRoad = (ctx, offsetY) => {
    ctx.fillStyle = '#E8D4A8';
    ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

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

  const drawCar = (ctx, x, y, color, opacity = 1) => {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(x - CAR_WIDTH / 2, y - CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - CAR_WIDTH / 2 + 3, y - CAR_HEIGHT / 2 + 3, CAR_WIDTH - 6, 10);
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
      g.myCarX = CANVAS_WIDTH / 2;
      g.myCarY = CANVAS_HEIGHT - 50;
      g.aiCarX = CANVAS_WIDTH / 2 + 50;
      g.bgY1 = 0;
      g.bgY2 = -CANVAS_HEIGHT;
      g.seed = Math.floor(Math.random() * 10000);
      g.obstacles = generateObstacles(g.seed, 0);

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

      // Handle input - smooth movement
      if (keysPressed.current[37] || keysPressed.current[65]) {
        g.myCarX = Math.max(ROAD_LEFT + CAR_WIDTH / 2, g.myCarX - 5);
      }
      if (keysPressed.current[39] || keysPressed.current[68]) {
        g.myCarX = Math.min(ROAD_RIGHT - CAR_WIDTH / 2, g.myCarX + 5);
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

      // Exponential speed growth with cap
      g.score += 0.1;
      g.baseSpeed = 2 + Math.min(g.score * 0.0015, 15);

      // Regenerate obstacles if needed
      if (g.obstacles.length === 0) {
        g.obstacles = generateObstacles(g.seed, g.score);
      }

      // Update obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        g.obstacles[i].y += g.baseSpeed;
        if (g.obstacles[i].y > CANVAS_HEIGHT + 50) {
          g.obstacles.splice(i, 1);
          g.carAvoided++;
        }
      }

      // Add new obstacles periodically
      if (Math.random() < 0.02 && g.obstacles.length < 10) {
        const lane = Math.floor(Math.random() * NUM_LANES);
        const laneX = ROAD_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        g.obstacles.push({
          x: laneX,
          y: -100,
          color,
          id: Math.random()
        });
      }

      // AI logic - simple dodging
      if (gameMode === 'pve') {
        // Find nearest obstacle
        let nearestObs = null;
        let nearestDist = Infinity;
        for (let obs of g.obstacles) {
          if (obs.y > g.myCarY - 150 && obs.y < g.myCarY + 150) {
            const dist = Math.abs(obs.x - g.aiCarX);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestObs = obs;
            }
          }
        }

        // Dodge if obstacle is too close
        if (nearestObs && nearestDist < 80) {
          if (nearestObs.x > g.aiCarX) {
            g.aiCarX = Math.min(ROAD_RIGHT - CAR_WIDTH / 2, g.aiCarX + 4);
          } else {
            g.aiCarX = Math.max(ROAD_LEFT + CAR_WIDTH / 2, g.aiCarX - 4);
          }
        } else {
          // Move toward center
          if (g.aiCarX < CANVAS_WIDTH / 2 - 5) {
            g.aiCarX += 2;
          } else if (g.aiCarX > CANVAS_WIDTH / 2 + 5) {
            g.aiCarX -= 2;
          }
        }
      }

      // Draw
      ctx.fillStyle = '#8B6F47';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawRoad(ctx, g.bgY1);
      drawRoad(ctx, g.bgY2);

      // Draw obstacles
      let hitObstacle = false;
      for (let obs of g.obstacles) {
        drawCar(ctx, obs.x, obs.y, obs.color);

        // Collision detection
        if (
          Math.abs(obs.x - g.myCarX) < 35 &&
          Math.abs(obs.y - g.myCarY) < 40
        ) {
          hitObstacle = true;
        }
      }

      // Draw player car (full opacity)
      drawCar(ctx, g.myCarX, g.myCarY, '#FFD700', 1);

      // Draw AI car if PvE
      if (gameMode === 'pve') {
        drawCar(ctx, g.aiCarX, g.myCarY, '#FF1493', 0.5);
      }

      // Draw opponent ghosts if PvP
      if (gameMode === 'pvp' && opponents.length > 0) {
        opponents.forEach((opp, idx) => {
          drawCar(ctx, opp.x, g.myCarY, COLORS[idx % COLORS.length], 0.3);
        });
      }

      // Draw HUD
      ctx.fillStyle = '#000000';
      ctx.font = '13px IBM Plex Mono';
      ctx.fillText(`Distance: ${Math.floor(g.score)}`, 10, 20);
      ctx.fillText(`Avoided: ${g.carAvoided}`, 10, 38);
      ctx.fillText(`Speed: ${g.baseSpeed.toFixed(1)}`, 10, 56);

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
            x: g.myCarX,
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
      myCarX: CANVAS_WIDTH / 2,
      myCarY: CANVAS_HEIGHT - 50,
      aiCarX: CANVAS_WIDTH / 2 + 50,
      bgY1: 0,
      bgY2: -CANVAS_HEIGHT,
      baseSpeed: 2,
      score: 0,
      carAvoided: 0,
      seed: Math.floor(Math.random() * 10000),
      running: true,
      obstacles: []
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
            backgroundColor: '#FFF8DC'
          }}
        />

        <div style={{ fontSize: '12px', color: '#000000', textAlign: 'center' }}>
          <div><strong>A/←</strong> Left | <strong>D/→</strong> Right</div>
          <div>Dodge traffic on a 10-lane highway! Speed increases exponentially.</div>
          {gameMode === 'pve' && <div>Play against AI that dodges cars too!</div>}
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
