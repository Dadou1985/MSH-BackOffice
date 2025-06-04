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
    roomChange: [roomChangeSchema],
    safe: [safeSchema],
    note: [noteSchema],
    sticker: [stickerSchema],
    lostAndFound: [lostAndFoundSchema],
    chat: [chatSchema],
    housekeeping: housekeepingSchema,
    checklist: checklistSchema      
}, { timestamps: true });

// hotelSchema.set('toJSON', {
//   virtuals: true,         // Inclut les champs virtuels (comme id si tu en as)
//   versionKey: false,      // Supprime __v du JSON renvoyé
//   transform: (doc, ret) => {
//     ret.id = ret._id;     // Ajoute une propriété "id" plus pratique à consommer côté client
//     delete ret._id;       // (Optionnel) Supprime _id si tu veux ne renvoyer que "id"
//     return ret;
//   }
// });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;