import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error');
        return;
      }

      const data = await response.json();
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="flex-center" style={{ height: '100vh', width: '100vw' }}>
      <div className="panel panel-magenta" style={{ width: '400px' }}>
        <h1 style={{ textAlign: 'center' }}>⚡ VIBE AUTH ⚡</h1>

        <form onSubmit={handleSubmit} className="flex-column">
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div style={{
              color: '#FF0000',
              textShadow: '0 0 10px #FF0000',
              margin: '10px 0'
            }}>
              ERROR: {error}
            </div>
          )}

          <button type="submit" style={{ marginTop: '20px' }}>
            {isLogin ? 'LOGIN' : 'REGISTER'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'transparent',
              borderColor: '#00FF00',
              color: '#00FF00'
            }}
          >
            {isLogin ? 'CREATE ACCOUNT' : 'ALREADY HAVE ACCOUNT'}
          </button>
        </div>
      </div>
    </div>
  );
}
