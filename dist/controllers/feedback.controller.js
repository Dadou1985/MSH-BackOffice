import Feedbacks from '../models/feedbacks.js';
const getCategoryArray = (fbCollection, category) => {
    if (!fbCollection || !fbCollection[category]) {
        throw new Error(`Category '${category}' does not exist in housekeeping`);
    }
    return fbCollection[category];
};
// CREATE feedback document
export const createFeedbackCollection = async (req, res) => {
    try {
        const newFeedback = new Feedbacks(req.body);
        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating feedback', error });
    }
};
// READ single feedback document by hotelId
export const createFeedback = async (req, res) => {
    const { id, category } = req.params;
    const newFeedback = req.body;
    try {
        const feedback = await Feedbacks.findOne({ hotelId: id });
        if (!feedback)
            return res.status(404).json({ message: 'Feedback not found' });
        const categoryArray = getCategoryArray(feedback, category);
        categoryArray.push(newFeedback);
        await feedback.save();
        res.status(201).json({ message: 'New feedback added', feedback: newFeedback });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating feedback', error });
    }
};
// READ all feedback documents
export const getAllFeedbacks = async (req, res) => {
    try {
        const { id } = req.params;
        const feedbacks = await Feedbacks.findOne({ hotelId: id });
        res.status(200).json(feedbacks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching feedbacks', error });
    }
};
// UPDATE feedback by hotelId
export const updateFeedbackByHotelId = async (req, res) => {
    try {
        const updatedFeedback = await Feedbacks.findOneAndUpdate({ hotelId: req.params.hotelId }, { $set: req.body }, { new: true, runValidators: true });
        if (!updatedFeedback)
            return res.status(404).json({ message: 'Feedback not found' });
        res.status(200).json(updatedFeedback);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating feedback', error });
    }
};
// DELETE feedback by hotelId
export const deleteFeedbackByHotelId = async (req, res) => {
    try {
        const deletedFeedback = await Feedbacks.findOneAndDelete({ hotelId: req.params.hotelId });
        if (!deletedFeedback)
            return res.status(404).json({ message: 'Feedback not found' });
        res.status(200).json({ message: 'Feedback deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting feedback', error });
    }
};
