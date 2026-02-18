import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface DashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, token }) => {
  const [servers, setServers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeServer, setActiveServer] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (activeServer) {
      fetchChannels(activeServer._id);
    }
  }, [activeServer]);

  useEffect(() => {
    if (activeChannel && socket) {
      socket.emit('join_channel', activeChannel._id);
      fetchMessages(activeChannel._id); 
    }
    return () => {
      if (activeChannel && socket) {
        socket.emit('leave_channel', activeChannel._id);
      }
    };
  }, [activeChannel, socket]);

  const fetchMessages = async (channelId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${channelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchServers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/servers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setServers(data);
      if (data.length > 0) setActiveServer(data[0]);
    } catch (err) {
      console.error('Error fetching servers:', err);
    }
  };

  const fetchChannels = async (serverId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/servers/${serverId}/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChannels(data);
      if (data.length > 0) setActiveChannel(data[0]);
    } catch (err) {
      console.error('Error fetching channels:', err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && activeChannel && socket) {
      socket.emit('send_message', {
        channelId: activeChannel._id,
        content: messageInput,
        userId: user.id
      });
      setMessageInput('');
    }
  };

  const handleCreateServer = async () => {
    const name = prompt('Enter server name:');
    if (!name) return;

    try {
      const response = await fetch('http://localhost:3001/api/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      setServers((prev) => [...prev, data.server]);
      setActiveServer(data.server);
    } catch (err) {
      console.error('Error creating server:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChannel || !socket) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      
      socket.emit('send_message', {
        channelId: activeChannel._id,
        content: `Uploaded a file: ${data.url}`,
        userId: user.id
      });
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Servers Sidebar */}
      <div className="w-20 bg-gray-950 flex flex-col items-center py-4 space-y-4">
        {servers.map((server) => (
          <button
            key={server._id}
            onClick={() => setActiveServer(server)}
            className={`w-12 h-12 rounded-3xl hover:rounded-xl transition-all duration-200 bg-gray-700 flex items-center justify-center text-xl font-bold ${activeServer?._id === server._id ? 'rounded-xl bg-blue-600' : ''}`}
          >
            {server.name[0].toUpperCase()}
          </button>
        ))}
        <button 
          onClick={handleCreateServer}
          className="w-12 h-12 rounded-3xl hover:rounded-xl transition-all duration-200 bg-green-600 flex items-center justify-center text-2xl font-bold"
        >
          +
        </button>
      </div>

      {/* Channels Sidebar */}
      <div className="w-60 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-900 shadow-sm font-bold text-lg">
          {activeServer?.name || 'OpenChat'}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {channels.map((channel) => (
            <button
              key={channel._id}
              onClick={() => setActiveChannel(channel)}
              className={`w-full text-left px-2 py-1 rounded mb-1 hover:bg-gray-700 transition-colors ${activeChannel?._id === channel._id ? 'bg-gray-700 text-white font-semibold' : 'text-gray-400'}`}
            >
              # {channel.name}
            </button>
          ))}
        </div>
        <div className="p-4 bg-gray-850 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-bold truncate">{user.username}</div>
            <div className="text-xs text-gray-400">#1234</div>
          </div>
          <button 
            onClick={onLogout}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-700">
        <div className="p-4 border-b border-gray-800 shadow-sm font-bold flex items-center">
          <span className="text-gray-400 mr-2 text-xl">#</span>
          {activeChannel?.name || 'Select a channel'}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-500"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-blue-400">{msg.author?.username || 'User'}</span>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-200">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer p-2 bg-gray-600 rounded-lg hover:bg-gray-500">
              <span className="text-xl">+</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            <form onSubmit={handleSendMessage} className="flex-1">
              <input
                type="text"
                placeholder={`Message #${activeChannel?.name || ''}`}
                className="w-full p-3 bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
