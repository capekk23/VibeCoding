import { useState, useEffect, useRef } from 'react';

export default function Rooms({ user }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      const interval = setInterval(() => fetchMessages(selectedRoom.id), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName })
      });

      if (response.ok) {
        setNewRoomName('');
        setShowCreateForm(false);
        fetchRooms();
      }
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      if (response.ok) {
        const room = rooms.find(r => r.id === roomId);
        setSelectedRoom(room);
        fetchMessages(roomId);
      }
    } catch (err) {
      console.error('Error joining room:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedRoom) return;

    try {
      const response = await fetch(`/api/rooms/${selectedRoom.id}/messages`, {
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
        fetchMessages(selectedRoom.id);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Rooms list */}
      <div style={{
        width: '300px',
        borderRight: '2px solid #9B8B7E',
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: 'var(--dark-panel)'
      }}>
        <h3 className="glow-text" style={{ marginBottom: '15px' }}>ROOMS</h3>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            width: '100%',
            marginBottom: '15px',
            borderColor: '#8B7355',
            color: '#8B7355'
          }}
        >
          ➕ CREATE ROOM
        </button>

        {showCreateForm && (
          <form onSubmit={createRoom} style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              style={{ width: '100%' }}
            />
            <button type="submit" style={{
              width: '100%',
              marginTop: '10px',
              borderColor: '#8B7355',
              color: '#8B7355'
            }}>
              CREATE
            </button>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => joinRoom(room.id)}
              style={{
                textAlign: 'left',
                borderColor: selectedRoom?.id === room.id ? '#FFD700' : '#A39E94',
                color: selectedRoom?.id === room.id ? '#FFD700' : '#9B8B7E',
                backgroundColor: selectedRoom?.id === room.id ? 'rgba(255, 215, 0, 0.2)' : 'transparent'
              }}
            >
              🏠 {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-column" style={{ flex: 1 }}>
        {selectedRoom ? (
          <>
            <div style={{
              padding: '15px',
              borderBottom: '2px solid #9B8B7E',
              backgroundColor: 'var(--dark-panel)'
            }}>
              <h2 className="glow-text-magenta">🏠 {selectedRoom.name}</h2>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {messages.length === 0 ? (
                <div className="glow-text" style={{ textAlign: 'center' }}>
                  [NO MESSAGES IN ROOM - START CHATTING]
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
                      {msg.username}
                    </div>
                    <div style={{ color: '#000000' }}>{msg.content}</div>
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
                placeholder="TYPE MESSAGE... (Shift+Enter for newline)"
                style={{
                  flex: 1,
                  resize: 'none',
                  height: '60px'
                }}
              />
              <button onClick={sendMessage} style={{ height: '60px', width: '100px' }}>
                SEND
              </button>
            </form>
          </>
        ) : (
          <div className="glow-text-lime" style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            fontSize: '18px'
          }}>
            SELECT A ROOM
          </div>
        )}
      </div>
    </div>
  );
}
