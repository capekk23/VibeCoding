import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  channel: mongoose.Types.ObjectId;
  attachments: string[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
