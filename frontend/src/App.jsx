import { useState, useEffect } from 'react';
import './styles/cyberpunk.css';
import Auth from './components/Auth';
import Chat from './components/Chat';
import GameLobby from './components/GameLobby';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('chat'); // chat, games

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="flex-column" style={{ height: '100vh', width: '100vw' }}>
      {/* Header */}
      <div className="panel panel-magenta" style={{ margin: 0, borderRadius: 0 }}>
        <div className="flex-between">
          <h1 style={{ margin: 0 }}>⚡ VIBE TERMINAL ⚡</h1>
          <div>
            <span className="glow-text" style={{ marginRight: '20px' }}>
              USER: {user.username}
            </span>
            <button onClick={handleLogout}>LOGOUT</button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px', padding: '10px 20px' }}>
        <button
          onClick={() => setView('chat')}
          style={{
            borderColor: view === 'chat' ? '#00FF00' : '#00FFFF',
            color: view === 'chat' ? '#00FF00' : '#00FFFF'
          }}
        >
          💬 CHAT
        </button>
        <button
          onClick={() => setView('games')}
          style={{
            borderColor: view === 'games' ? '#00FF00' : '#00FFFF',
            color: view === 'games' ? '#00FF00' : '#00FFFF'
          }}
        >
          🎮 GAMES
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {view === 'chat' && <Chat user={user} />}
        {view === 'games' && <GameLobby user={user} />}
      </div>
    </div>
  );
}
