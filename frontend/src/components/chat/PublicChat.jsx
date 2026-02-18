import { useState, useEffect, useRef } from 'react';

export default function PublicChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: user.username,
          content: input
        })
      });

      if (response.ok) {
        setInput('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex-column" style={{ width: '100%', height: '100%' }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {loading ? (
          <div className="glow-text-lime" style={{ textAlign: 'center' }}>
            INITIALIZING PUBLIC CHANNEL...
          </div>
        ) : messages.length === 0 ? (
          <div className="glow-text" style={{ textAlign: 'center' }}>
            [NO MESSAGES - BE THE FIRST TO BROADCAST]
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="panel"
              style={{
                borderColor: msg.username === user.username ? '#FFD700' : '#A39E94',
                borderWidth: msg.username === user.username ? '3px' : '2px',
                backgroundColor: 'rgba(163, 158, 148, 0.05)'
              }}
            >
              <div style={{
                color: msg.username === user.username ? '#FFD700' : '#000000',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                📡 {msg.username}
              </div>
              <div style={{ color: '#000000' }}>{msg.content}</div>
              <div style={{
                fontSize: '12px',
                color: '#9B8B7E',
                opacity: 0.6,
                marginTop: '5px'
              }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={{
        display: 'flex',
        gap: '10px',
        padding: '20px',
        borderTop: '2px solid #9B8B7E',
        backgroundColor: 'var(--dark-panel)'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="BROADCAST MESSAGE... (Shift+Enter for newline)"
          style={{
            flex: 1,
            resize: 'none',
            height: '60px'
          }}
        />
        <button onClick={handleSend} style={{ height: '60px', width: '100px' }}>
          BROADCAST
        </button>
      </form>
    </div>
  );
}
