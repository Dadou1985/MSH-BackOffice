import Support from '../models/support.js';
// CREATE CHAT SUPPORT
export const createSupportDocument = async (req, res) => {
    const newSupportChat = req.body;
    try {
        const support = new Support(newSupportChat);
        await support.save();
        res.status(201).json(support);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating support document', error });
    }
};
// CREATE
export const addSupportMessage = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const messageData = req.body;
        const support = await Support.findOne({ hotelId: hotelId });
        if (!support)
            return res.status(404).json({ message: 'Support document not found' });
        support.chatRoom.push(messageData);
        await support.save();
        res.status(201).json({ message: 'Message added', data: support });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding message', error });
    }
};
// ALL SUPPORT DOCUMENTS
export const getAllSupportDocuments = async (req, res) => {
    try {
        const supportDocuments = await Support.find();
        if (!supportDocuments)
            return res.status(404).json({ message: 'No support documents found' });
        res.status(200).json(supportDocuments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving support documents', error });
    }
};
// READ
export const getSupportMessages = async (req, res) => {
    const { hotelId } = req.params;
    try {
        console.log("++++++++++++++++++++", hotelId);
        const support = await Support.findById(hotelId);
        if (!support)
            return res.status(404).json({ message: 'Support not found' });
        res.status(200).json(support.chatRoom);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving messages', error });
    }
};
// UPDATE DOCUMENT
export const updateSupportDocument = async (req, res) => {
    const { hotelId } = req.params;
    const updates = req.body;
    try {
        const support = await Support.findById(hotelId);
        if (!support)
            return res.status(404).json({ message: 'Support document not found' });
        support.set(updates);
        await support.save();
        res.status(200).json({ message: 'Support document updated', data: support });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating support document', error });
    }
};
// UPDATE
export const updateSupportMessage = async (req, res) => {
    try {
        const { hotelId, messageId } = req.params;
        const updates = req.body;
        const support = await Support.findById(hotelId);
        if (!support)
            return res.status(404).json({ message: 'Support not found' });
        const message = support.chatRoom.id(messageId);
        if (!message)
            return res.status(404).json({ message: 'Message not found' });
        message.set(updates);
        await support.save();
        res.status(200).json({ message: 'Message updated', data: message });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating message', error });
    }
};
// DELETE
export const deleteSupportMessage = async (req, res) => {
    try {
        const { hotelId, messageId } = req.params;
        const support = await Support.findById(hotelId);
        if (!support)
            return res.status(404).json({ message: 'Support not found' });
        const message = support.chatRoom.id(messageId);
        if (!message)
            return res.status(404).json({ message: 'Message not found' });
        message.deleteOne();
        await support.save();
        res.status(200).json({ message: 'Message deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting message', error });
    }
};
