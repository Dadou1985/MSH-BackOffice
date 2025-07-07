import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  author: {
      type: String,
      required: true
  },
  date: {
      type: Date, // Ou `Date` si vous souhaitez le parser comme un vrai objet Date
      required: true
  },
  email: {
      type: String,
      required: true
  },
  photo: {
      type: String,
      default: null
  },
  text: {
      type: String,
      required: true
  }
}, { timestamps: true });

const supportSchema = new mongoose.Schema({
  hotelName: { type: String, required: true },
  checkoutDate: {
    type: String, // Peut être vide, à valider si nécessaire
    default: ''
  },
  adminSpeak: {
    type: Boolean,
    default: false
  },
  hotelId: {
    type: String,
    default: ''
  },
  status: {
    type: Boolean,
    default: false
  },
  pricingModel: {
    type: String,
    required: true
  },
  chatRoom: [chatRoomSchema]
}, { timestamps: true });

const Support = mongoose.model('support', supportSchema, 'support');
export default Support;