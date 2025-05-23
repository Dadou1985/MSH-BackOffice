import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    checkoutDate: {
        type: String, // Format : "DD/MM/YYYY"
        required: true
      },
      client: {
        type: String,
        required: true
      },
      createdAt: {
        type: String, // À convertir en `Date` si vous parsez ce champ à l'enregistrement
        required: true
      },
      room: {
        type: String,
        required: true
      }
}, { timestamps: true });

export const housekeepingSchema = new mongoose.Schema({
  towel: [itemSchema],
  pillow: [itemSchema],
  iron: [itemSchema],
  toiletPaper: [itemSchema],
  blanket: [itemSchema],
  soap: [itemSchema],
  hairDryer: [itemSchema],
  babyBed: [itemSchema],
}, { timestamps: true });
