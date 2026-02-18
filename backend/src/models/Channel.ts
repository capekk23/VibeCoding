import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  type: 'text' | 'voice';
  server: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ChannelSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'voice'], default: 'text' },
  server: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IChannel>('Channel', ChannelSchema);
