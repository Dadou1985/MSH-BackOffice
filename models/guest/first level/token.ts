import mongoose from 'mongoose';

export const tokenSchema = new mongoose.Schema({
  endpoint: { type: String, required: true },
  expirationTime: { type: Date, default: null }, // null si non défini
  keys: {
    auth: { type: String, required: true },
    p256dh: { type: String, required: true }
  }
} , { timestamps: true });