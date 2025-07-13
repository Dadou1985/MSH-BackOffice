import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
    author: { type: String, required: true },
    hotelDept: { type: String, required: true },
    hotelName: { type: String, required: true },
    hotelRegion: { type: String, required: true },
    text: { type: String, required: true }
}, { timestamps: true });
const feedbacksSchema = new mongoose.Schema({
    hotelId: { type: String, required: true },
    satisfaction: [categorySchema], // Attention : corrige si c’est une faute
    improvement: [categorySchema], // Attention : corrige si c’est une faute
}, { timestamps: true });
const Feedbacks = mongoose.model('Feedbacks', feedbacksSchema);
export default Feedbacks;
