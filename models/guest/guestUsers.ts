import mongoose from 'mongoose';
import { journeySchema } from './first-level/journey.ts';
import { tokenSchema } from './first-level/token.ts';

const guestUserSchema = new mongoose.Schema({
  notificationStatus: { type: String, default: 'default' },
  gender: { type: String },
  photo: { type: String, default: null },
  guestCategory: { type: String },
  language: { type: String },
  password: { type: String },
  lastTimeConnected: { type: Date }, // converti depuis timestamp
  localLanguage: { type: String },
  email: { type: String },
  username: { type: String },
  website: { type: String },
  phone: { type: String },
  babyBed: { type: Boolean, default: false },
  towel: { type: Boolean, default: false },
  pillow: { type: Boolean, default: false },
  iron: { type: Boolean, default: false },
  toiletPaper: { type: Boolean, default: false },
  blanket: { type: Boolean, default: false },
  soap: { type: Boolean, default: false },
  hairDryer: { type: Boolean, default: false },
  newConnection: { type: Boolean, default: false },
  checkoutDate: { type: String },
  room: { type: String },
  hotelRegion: { type: String },
  hotelPhone: { type: String },
  hotelName: { type: String },
  hotelId: { type: String },
  hotelDept: { type: String },
  classement: { type: String },
  city: { type: String },
  logo: { type: String },
  hotelVisitedArray: [{ type: String }],
  journeyId: { type: String },
  journey: [journeySchema], // Attention : corrige si c’est une faute
  token: [tokenSchema], // Attention : corrige si c’est une faute
}, { timestamps: true });

const GuestUser = mongoose.model('guestUser', guestUserSchema, 'guestUsers');
export default GuestUser;