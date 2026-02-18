import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Server from '../models/Server';
import Channel from '../models/Channel';

export const createServer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    const server = new Server({
      name,
      description,
      owner: userId,
      members: [userId]
    });

    await server.save();

    // Create a default general channel
    const channel = new Channel({
      name: 'general',
      type: 'text',
      server: server._id
    });

    await channel.save();

    res.status(201).json({ server, defaultChannel: channel });
  } catch (error) {
    res.status(500).json({ message: 'Error creating server', error });
  }
};

export const getServers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const servers = await Server.find({ members: userId });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching servers', error });
  }
};

export const getChannels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const channels = await Channel.find({ server: serverId });
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching channels', error });
  }
};

export const joinServer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const userId = req.userId;

    const server = await Server.findById(serverId);
    if (!server) {
      res.status(404).json({ message: 'Server not found' });
      return;
    }

    if (server.members.includes(userId as any)) {
      res.status(400).json({ message: 'Already a member' });
      return;
    }

    server.members.push(userId as any);
    await server.save();

    res.json(server);
  } catch (error) {
    res.status(500).json({ message: 'Error joining server', error });
  }
};
