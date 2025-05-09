import mongoose from 'mongoose';

const cabSchema = new mongoose.Schema({
  carType: { type: String, required: true },
  destination: { type: String, required: true },
  hour: { type: String, required: true },
  markup: { type: Number, required: true },
  pax: { type: String, required: true }
});

const clockSchema = new mongoose.Schema({
  hour: { type: String, required: true },
  markup: { type: Number, required: true },
  date: { type: String, required: true },
  hotelId: { type: String, required: true }
});

const maintenanceItemSchema = new mongoose.Schema({
  details: { type: String, required: true },
  markup: { type: Number, required: true },
  reason: { type: String, required: true }
});

const roomChangeSchema = new mongoose.Schema({
  details: { type: String, required: true },
  markup: { type: Number, required: true },
  reason: { type: String, required: true }
});

export const journeySchema = new mongoose.Schema({
  cab: [cabSchema],
  clock: [clockSchema],
  housekeeping: [{ type: String }],
  maintenace: [maintenanceItemSchema], // Attention : corrige si c’est une faute
  roomChange: [roomChangeSchema]
}, { timestamps: true });