import { useState } from 'react';

export default function RockPaperScissors({ game, user, onExit }) {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ player: 0, computer: 0 });

  const choices = ['ROCK', 'PAPER', 'SCISSORS'];

  const getComputerChoice = () => {
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const determineWinner = (player, computer) => {
    if (player === computer) return 'DRAW';
    if (
      (player === 'ROCK' && computer === 'SCISSORS') ||
      (player === 'PAPER' && computer === 'ROCK') ||
      (player === 'SCISSORS' && computer === 'PAPER')
    ) {
      return 'WIN';
    }
    return 'LOSE';
  };

  const play = (choice) => {
    const computer = getComputerChoice();
    const outcome = determineWinner(choice, computer);

    setPlayerChoice(choice);
    setComputerChoice(computer);
    setResult(outcome);

    if (outcome === 'WIN') {
      setScores(s => ({ ...s, player: s.player + 1 }));
    } else if (outcome === 'LOSE') {
      setScores(s => ({ ...s, computer: s.computer + 1 }));
    }
  };

  const reset = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="glow-text-lime">✂️ ROCK PAPER SCISSORS</h2>
        <button onClick={onExit} style={{ borderColor: '#FF0000', color: '#FF0000' }}>EXIT</button>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px' }}>
        <div className="panel panel-magenta" style={{ flex: 1, margin: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#00FF00', fontSize: '24px', fontWeight: 'bold' }}>YOU</div>
            <div style={{ fontSize: '32px', marginTop: '10px', color: '#00FFFF' }}>{scores.player}</div>
          </div>
        </div>
        <div className="panel panel-cyan" style={{ flex: 1, margin: '0 10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#FF00FF', fontSize: '24px', fontWeight: 'bold' }}>COMPUTER</div>
            <div style={{ fontSize: '32px', marginTop: '10px', color: '#00FFFF' }}>{scores.computer}</div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => play(choice)}
              style={{
                padding: '20px 30px',
                fontSize: '18px',
                borderColor: playerChoice === choice ? '#00FF00' : '#00FFFF',
                color: playerChoice === choice ? '#00FF00' : '#00FFFF',
                backgroundColor: playerChoice === choice ? 'rgba(0, 255, 0, 0.2)' : 'var(--dark-panel)'
              }}
            >
              {choice === 'ROCK' && '🪨'}
              {choice === 'PAPER' && '📄'}
              {choice === 'SCISSORS' && '✂️'}
              <br />
              {choice}
            </button>
          ))}
        </div>

        {result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: result === 'WIN' ? '#00FF00' : result === 'LOSE' ? '#FF0000' : '#FFFF00',
              textShadow: `0 0 20px ${result === 'WIN' ? '#00FF00' : result === 'LOSE' ? '#FF0000' : '#FFFF00'}`
            }}>
              {result === 'WIN' && '⚡ YOU WIN ⚡'}
              {result === 'LOSE' && '💥 YOU LOSE 💥'}
              {result === 'DRAW' && '🤝 DRAW 🤝'}
            </div>
            <div style={{ fontSize: '18px', marginBottom: '20px', color: '#00FFFF' }}>
              You chose: <span style={{ color: '#00FF00', fontWeight: 'bold' }}>{playerChoice}</span>
            </div>
            <div style={{ fontSize: '18px', marginBottom: '30px', color: '#00FFFF' }}>
              Computer chose: <span style={{ color: '#FF00FF', fontWeight: 'bold' }}>{computerChoice}</span>
            </div>
            <button onClick={reset} style={{
              borderColor: '#00FF00',
              color: '#00FF00'
            }}>
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
