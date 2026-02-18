import { Server, Socket } from 'socket.io';
import Message from '../models/Message';

export const registerMessageHandlers = (io: Server, socket: Socket) => {
  socket.on('join_channel', (channelId: string) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('leave_channel', (channelId: string) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} left channel ${channelId}`);
  });

  socket.on('send_message', async (data: { channelId: string, content: string }) => {
    try {
      const { channelId, content } = data;
      const userId = (socket as any).userId;
      
      const newMessage = new Message({
        content,
        author: userId,
        channel: channelId
      });

      await newMessage.save();
      
      // Populate author for the frontend
      const populatedMessage = await Message.findById(newMessage._id).populate('author', 'username avatar');

      io.to(channelId).emit('receive_message', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // WebRTC Signaling Stubs
  socket.on('webrtc_offer', (data: { to: string, offer: any }) => {
    socket.to(data.to).emit('webrtc_offer', { from: socket.id, offer: data.offer });
  });

  socket.on('webrtc_answer', (data: { to: string, answer: any }) => {
    socket.to(data.to).emit('webrtc_answer', { from: socket.id, answer: data.answer });
  });

  socket.on('webrtc_ice_candidate', (data: { to: string, candidate: any }) => {
    socket.to(data.to).emit('webrtc_ice_candidate', { from: socket.id, candidate: data.candidate });
  });
};
