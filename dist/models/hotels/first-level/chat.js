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
    },
    userId: {
        type: String,
        required: false
    }
}, { timestamps: true });
// dans chat.ts
const tokenSchema = new mongoose.Schema({
    endpoint: { type: String, required: true },
    expirationTime: { type: Number, default: null },
    keys: {
        auth: { type: String, required: true },
        p256dh: { type: String, required: true },
    }
}, { _id: false }); // pas besoin d’_id ici si imbriqué
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
    token: {
        type: tokenSchema,
        default: null
    },
    userId: {
        type: String,
        required: true
    },
    chatRoom: [chatRoomSchema]
}, { timestamps: true });
