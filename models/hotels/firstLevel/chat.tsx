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
    room: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const chatSchema = new mongoose.Schema({
    clientFullName: { type: String, required: true },
    checkoutDate: {
        type: String, // Peut être vide, à valider si nécessaire
        default: ''
      },
      guestLanguage: {
        type: String,
        required: true
      },
      hotelResponding: {
        type: Boolean,
        default: false
      },
      isChatting: {
        type: Boolean,
        default: false
      },
      room: {
        type: String,
        default: ''
      },
      status: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        required: true
      },
      token: {
        type: String,
        default: null
      },
      userId: {
        type: String,
        required: true
      },
      chatRoom: [chatRoomSchema]
}, { timestamps: true });