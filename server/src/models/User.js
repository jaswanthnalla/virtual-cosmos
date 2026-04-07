import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    socketId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    color: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    activeConnections: [{ type: String }],
    isOnline: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
