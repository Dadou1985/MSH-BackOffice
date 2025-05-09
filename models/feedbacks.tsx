import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  author: { type: String, required: true },
  hotelDept: { type: String, required: true },
  hotelName: { type: String, required: true },
  hotelRegion: { type: String, required: true },
  markup: { type: Number, required: true }, // Timestamp
  text: { type: String, required: true }
}, { timestamps: true });

const feedbacksSchema = new mongoose.Schema({
  satisfaction: [categorySchema], // Attention : corrige si c’est une faute
  improvement: [categorySchema], // Attention : corrige si c’est une faute
}, { timestamps: true });

const Feedbacks = mongoose.model('feedbacks', feedbacksSchema);
export default Feedbacks;