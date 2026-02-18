import { useState, useEffect, useRef } from 'react';

export default function Chat({ user }) {
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

  const handleSend = async (e) => {
    e.preventDefault();
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
      {/* Messages area */}
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
            INITIALIZING CHAT PROTOCOL...
          </div>
        ) : messages.length === 0 ? (
          <div className="glow-text" style={{ textAlign: 'center' }}>
            [NO MESSAGES YET - START TRANSMISSION]
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="panel"
              style={{
                borderColor: msg.username === user.username ? '#00FF00' : '#00FFFF'
              }}
            >
              <div style={{
                color: msg.username === user.username ? '#00FF00' : '#FF00FF',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {msg.username}
              </div>
              <div>{msg.content}</div>
              <div style={{
                fontSize: '12px',
                color: '#00FFFF',
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

      {/* Input area */}
      <form onSubmit={handleSend} style={{
        display: 'flex',
        gap: '10px',
        padding: '20px',
        borderTop: '2px solid #00FFFF',
        backgroundColor: 'var(--dark-panel)'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE MESSAGE..."
          style={{
            flex: 1,
            resize: 'none',
            height: '60px'
          }}
        />
        <button type="submit" style={{ height: '60px', width: '100px' }}>
          SEND
        </button>
      </form>
    </div>
  );
}
