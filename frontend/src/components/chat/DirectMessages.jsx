import { useState, useEffect, useRef } from 'react';

export default function DirectMessages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // All users for searching
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchAllUsers(); // Fetch all users for search
    const interval = setInterval(fetchConversations, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      const interval = setInterval(() => fetchMessages(selectedUser.id), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/dm/${user.id}/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchAllUsers = async () => { // Renamed from fetchUsers
    try {
      const response = await fetch('/api/dm/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.filter(u => u.id !== user.id));
      }
    } catch (err) {
      console.error('Error fetching all users:', err);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await fetch(`/api/dm/${user.id}/with/${otherUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;

    try {
      const response = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_user_id: user.id,
          to_user_id: selectedUser.id,
          from_username: user.username,
          to_username: selectedUser.username,
          content: input
        })
      });

      if (response.ok) {
        setInput('');
        await fetchMessages(selectedUser.id);
        await fetchConversations();
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

  const selectUser = (u) => {
    setSelectedUser(u);
    setSearchQuery(''); // Clear search when a user is selected
    fetchMessages(u.id);
  };

  // Filtered users for the search input
  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {/* Conversations list and User search */}
      <div style={{
        width: '300px',
        borderRight: '2px solid #A39E94',
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: 'rgba(255, 215, 0, 0.1)', // Changed to a soft yellow
        display: 'flex',
        flexDirection: 'column' // Added to control flex direction
      }}>
        <h3 className="glow-text" style={{ marginBottom: '15px' }}>MESSAGES</h3>

        {/* User Search Input */}
        <input
          type="text"
          placeholder="SEARCH USERS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '15px', padding: '8px', borderRadius: '4px', border: '1px solid #A39E94' }}
        />

        <div style={{ flex: 1, overflowY: 'auto' }}> {/* Scrollable area for lists */}
          {searchQuery ? (
            // Display filtered users when search query is active
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      borderColor: '#A39E94',
                      color: '#1A2332',
                      backgroundColor: 'white',
                      borderRadius: 0,
                      borderBottom: '1px solid #A39E94'
                    }}
                  >
                    👤 {u.username}
                  </button>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#666' }}>No users found.</div>
              )}
            </div>
          ) : (
            // Display existing conversations by default
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {conversations.map((conv) => (
                <button
                  key={conv.user_id}
                  onClick={() => selectUser(conv)}
                  style={{
                    textAlign: 'left',
                    borderColor: selectedUser?.id === conv.user_id ? '#FFD700' : '#A39E94',
                    color: '#1A2332',
                    backgroundColor: selectedUser?.id === conv.user_id ? 'rgba(255, 215, 0, 0.2)' : 'white'
                  }}
                >
                  💬 {conv.username}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* "New Message" button moved to the bottom */}
        <button
          onClick={() => {
            // Optionally, clear selection and focus search to start a new convo
            setSelectedUser(null);
            setSearchQuery(''); // Clear search to show existing convos, or could set a default
          }}
          style={{
            width: '100%',
            marginTop: '15px', // Add margin to push it down
            borderColor: '#FFD700',
            color: '#1A2332',
            backgroundColor: 'rgba(255, 215, 0, 0.2)'
          }}
        >
          ➕ NEW CONVERSATION
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-column" style={{ flex: 1 }}>
        {selectedUser ? (
          <>
            <div style={{
              padding: '15px',
              borderBottom: '2px solid #A39E94',
              backgroundColor: 'rgba(255, 255, 255, 0.85)'
            }}>
              <h2 className="glow-text-magenta">💬 {selectedUser.username}</h2>
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
                  [START A CONVERSATION]
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="panel"
                    style={{
                      borderColor: msg.from_user_id === user.id ? '#FFD700' : '#A39E94',
                      borderWidth: msg.from_user_id === user.id ? '3px' : '2px',
                      backgroundColor: 'rgba(163, 158, 148, 0.05)',
                      alignSelf: msg.from_user_id === user.id ? 'flex-end' : 'flex-start',
                      maxWidth: '70%'
                    }}
                  >
                    <div style={{
                      color: msg.from_user_id === user.id ? '#FFD700' : '#000000',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                      fontSize: '12px'
                    }}>
                      {msg.from_username}
                    </div>
                    <div style={{
                      color: '#000000'
                    }}>{msg.content}</div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(e) => e.preventDefault()} style={{
              display: 'flex',
              gap: '10px',
              padding: '20px',
              borderTop: '2px solid #A39E94',
              backgroundColor: 'rgba(255, 255, 255, 0.85)'
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
            SELECT A CONVERSATION OR START A NEW ONE
          </div>
        )}
      </div>
    </div>
  );
}
