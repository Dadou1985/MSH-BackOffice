import mongoose from 'mongoose';
const cabSchema = new mongoose.Schema({
    author: { type: String, required: true }, // Ex: "effectué par le client"
    client: { type: String, required: true }, // Ex: "John Snow"
    date: { type: String, required: true }, // Format "DD/MM/YYYY"
    destination: { type: String, required: true }, // Ex: "Aéroport"
    hour: { type: String, required: true }, // Format "HH:mm"
    model: { type: String },
    modelClone: { type: String },
    pax: { type: String }, // nombre de passagers, peut être typé en Number si besoin
    room: { type: String },
    status: { type: Boolean, default: false }
}, { timestamps: true });
const clockSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Vous pouvez aussi utiliser Date si vous convertissez le format
        required: true,
    },
    day: {
        type: Number, // Timestamp (epoch time en ms)
        required: true,
    },
    hour: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    }
}, { timestamps: true });
const maintenanceSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    date: {
        type: String, // ou `Date` si vous parsez le format en objet Date
        required: true
    },
    details: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    categoryClone: {
        type: String,
        required: true
    }
}, { timestamps: true });
const roomChangeSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    date: {
        type: String, // à convertir en Date si besoin
        required: true
    },
    details: {
        type: String,
        required: true
    },
    fromRoom: {
        type: String,
        required: true
    },
    toRoom: {
        type: String // peut être vide
    },
    img: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    reasonClone: {
        type: String,
        required: true
    },
    state: {
        type: String // vide si non défini
    },
    status: {
        type: Boolean,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, { timestamps: true });
const safeSchema = new mongoose.Schema({
    amount: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    date: {
        type: String, // Vous pouvez changer en `Date` si le format est normalisé
        required: true
    },
    shift: {
        type: String,
        required: true
    },
    shiftClone: {
        type: String,
        required: true
    }
}, { timestamps: true });
const noteSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    date: {
        type: String, // vous pouvez changer pour Date si le format le permet
        required: true
    },
    hour: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: null
    },
    isChecked: {
        type: Boolean,
        required: true
    },
    state: {
        type: String,
        default: 'default'
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
        required: true
    }
}, { timestamps: true });
const stickerSchema = new mongoose.Schema({
    author: {
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
const lostAndFoundSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    date: {
        type: String, // ou `Date` si vous parsez ce champ
        required: true
    },
    description: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: false // ou `required: true` si l'image est obligatoire
    },
    place: {
        type: String,
        required: true
    },
    placeClone: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    category: {
        type: String,
        required: true
    }
}, { timestamps: true });
export { cabSchema, clockSchema, maintenanceSchema, roomChangeSchema, safeSchema, noteSchema, stickerSchema, lostAndFoundSchema };
