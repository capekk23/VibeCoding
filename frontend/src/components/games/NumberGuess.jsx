import { useState, useEffect } from 'react';

export default function NumberGuess({ game, user, onExit }) {
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
      setMessage(`TOO LOW - TRY HIGHER`);
    } else {
      setMessage(`TOO HIGH - TRY LOWER`);
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
        <h2 className="glow-text-lime">🔢 NUMBER GUESS</h2>
        <button onClick={onExit} style={{ borderColor: '#FF0000', color: '#FF0000' }}>EXIT</button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="panel panel-magenta" style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={{ fontSize: '18px', color: '#00FFFF' }}>
              I'M THINKING OF A NUMBER 1-100
            </p>
            <p style={{ fontSize: '16px', color: '#00FF00', marginTop: '10px' }}>
              Guesses: <span style={{ fontSize: '24px' }}>{guesses.length}</span>
            </p>
          </div>

          {gameWon ? (
            <div style={{ textAlign: 'center' }}>
              <div className="glow-text-lime" style={{ fontSize: '28px', marginBottom: '20px' }}>
                {message}
              </div>
              <div style={{ marginBottom: '20px', color: '#00FFFF' }}>
                Your guesses: {guesses.join(', ')}
              </div>
              <button onClick={reset} style={{
                borderColor: '#00FF00',
                color: '#00FF00'
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
                  color: message.includes('CORRECT') ? '#00FF00' : '#FFFF00',
                  textShadow: `0 0 10px ${message.includes('CORRECT') ? '#00FF00' : '#FFFF00'}`,
                  fontSize: '16px',
                  margin: '15px 0',
                  textAlign: 'center'
                }}>
                  {message}
                </div>
              )}

              <button type="submit" style={{ marginTop: '20px' }}>SUBMIT GUESS</button>
            </form>
          )}

          {guesses.length > 0 && (
            <div style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: 'var(--dark-bg)',
              borderRadius: '5px',
              color: '#00FFFF'
            }}>
              <div style={{ marginBottom: '10px', color: '#00FF00' }}>PREVIOUS GUESSES:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {guesses.map((g, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '5px 10px',
                      border: '1px solid #00FFFF',
                      borderRadius: '3px',
                      color: g < target ? '#00FF00' : g > target ? '#FF0000' : '#00FF00'
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
