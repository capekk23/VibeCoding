import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Message from '../models/Message';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const messages = await Message.find({ channel: channelId })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};
