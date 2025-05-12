import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    task: {
    type: String,
    required: true
    },
    status: {
    type: Boolean,
    required: true
    }
}, { timestamps: true });   

export const checklistSchema = new mongoose.Schema({
    matin: [itemSchema],
    nuit: [itemSchema],
    soir: [itemSchema]
});
