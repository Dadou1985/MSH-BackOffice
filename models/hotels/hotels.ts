import mongoose from 'mongoose';
import { 
  cabSchema, 
  clockSchema, 
  maintenanceSchema, 
  roomChangeSchema, 
  safeSchema, 
  noteSchema, 
  stickerSchema, 
  lostAndFoundSchema
} from './first-level/firstLevel.ts';
import { chatSchema } from './first-level/chat.ts';
import { checklistSchema } from './first-level/checklist.ts';
import { housekeepingSchema } from './first-level/housekeeping.ts';

const hotelSchema = new mongoose.Schema({
    country: { type: String, required: true },
    code_postal: { type: String, required: true },
    partnership: { type: Boolean, required: true },
    departement: { type: String, required: true },
    mail: { type: String, required: true },
    city: { type: String, required: true },
    classement: { type: String, required: true }, // Ex: "2 étoiles"
    hotelName: { type: String, required: true },
    room: { type: String, required: true },
    phone: { type: String, required: true },
    adresse: { type: String, required: true },
    region: { type: String, required: true },
    website: { type: String },
    pricingModel: { type: String },
    base64Url: { type: String }, // Logo encodé en base64
    appLink: { type: String },   // Lien avec paramètres
    logo: { type: String },       // Lien direct vers le logo
    cab: [cabSchema],
    clock: [clockSchema],
    maintenance: [maintenanceSchema],
    roomChangeSchema: [roomChangeSchema],
    safe: [safeSchema],
    note: [noteSchema],
    sticker: [stickerSchema],
    lostAndFound: [lostAndFoundSchema],
    chat: [chatSchema],
    housekeeping: [housekeepingSchema],
    checklist: [checklistSchema]       // Lien vers le cab
}, { timestamps: true });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;