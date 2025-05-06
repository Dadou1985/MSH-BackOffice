import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    task: {
    type: String,
    required: true
    },
    markup: {
    type: Number,
    required: true
    },
    status: {
    type: Boolean,
    required: true
    }
});

export const checklistSchema = new mongoose.Schema({
    matin: [itemSchema],
    nuit: [itemSchema],
    soir: [itemSchema]
});
