import { useState, useEffect } from 'react';

export default function NumberGuess({ game, user, gameMode, onExit }) {
  const [target, setTarget] = useState(Math.floor(Math.random() * 100) + 1);
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);

  const handleGuess = (e) => {
    e.preventDefault();
    const guess = parseInt(input);

    if (isNaN(guess) || guess < 1 || guess > 100) {
      setMessage('ENTER NUMBER BETWEEN 1-100');
      return;
    }

    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);

    if (guess === target) {
      setMessage(`🎉 CORRECT! THE NUMBER WAS ${target}!`);
      setGameWon(true);
    } else if (guess < target) {
      setMessage(`📈 TOO LOW - TRY HIGHER`);
    } else {
      setMessage(`📉 TOO HIGH - TRY LOWER`);
    }

    setInput('');
  };

  const reset = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setInput('');
    setGuesses([]);
    setMessage('');
    setGameWon(false);
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="glow-text-lime">🔢 NUMBER GUESS {gameMode === 'pve' ? '(vs AI)' : '(PvP Race)'}</h2>
        <button onClick={onExit} style={{ borderColor: '#8B4513', color: '#8B4513' }}>EXIT</button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="panel panel-magenta" style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={{ fontSize: '18px', color: '#1A2332' }}>
              I'M THINKING OF A NUMBER 1-100
            </p>
            <p style={{ fontSize: '16px', color: '#FFD700', marginTop: '10px', fontWeight: 'bold' }}>
              Attempts: <span style={{ fontSize: '24px' }}>{guesses.length}</span>
            </p>
          </div>

          {gameWon ? (
            <div style={{ textAlign: 'center' }}>
              <div className="glow-text-lime" style={{ fontSize: '28px', marginBottom: '20px', fontWeight: 'bold' }}>
                {message}
              </div>
              <div style={{ marginBottom: '20px', color: '#1A2332', fontWeight: 600 }}>
                Your guesses: {guesses.join(', ')}
              </div>
              <button onClick={reset} style={{
                borderColor: '#FFD700',
                color: '#1A2332',
                backgroundColor: 'rgba(255, 215, 0, 0.2)'
              }}>
                PLAY AGAIN
              </button>
            </div>
          ) : (
            <form onSubmit={handleGuess} className="flex-column">
              <input
                type="number"
                min="1"
                max="100"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="GUESS A NUMBER"
                autoFocus
              />

              {message && (
                <div style={{
                  color: message.includes('CORRECT') ? '#FFD700' : message.includes('TOO LOW') ? '#9B8B7E' : '#8B4513',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  margin: '15px 0',
                  textAlign: 'center'
                }}>
                  {message}
                </div>
              )}

              <button type="submit" style={{
                marginTop: '20px',
                borderColor: '#FFD700',
                color: '#1A2332',
                backgroundColor: 'rgba(255, 215, 0, 0.2)'
              }}>
                SUBMIT GUESS
              </button>
            </form>
          )}

          {guesses.length > 0 && (
            <div style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              borderRadius: '4px',
              color: '#1A2332'
            }}>
              <div style={{ marginBottom: '10px', color: '#008B8B', fontWeight: 'bold' }}>PREVIOUS GUESSES:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {guesses.map((g, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      border: '1.5px solid #A39E94',
                      borderRadius: '4px',
                      color: g < target ? '#FFD700' : g > target ? '#8B4513' : '#9B8B7E',
                      fontWeight: 'bold',
                      backgroundColor: 'white'
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
