import Hotel from '../../../models/hotels/hotels.js';
import { io } from '../../../app.js';
const getChecklistArray = async (hotel, period) => {
    if (!hotel.checklist) {
        hotel.checklist = {
            morning: [],
            evening: [],
            night: []
        };
    }
    else if (!hotel.checklist[period]) {
        hotel.checklist[period] = [];
    }
    return hotel.checklist[period];
};
// CREATE
export const addChecklistItem = async (req, res) => {
    const { hotelId, period } = req.params;
    const item = req.body;
    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ message: 'Hotel not found' });
        const checklistArray = await getChecklistArray(hotel, period);
        checklistArray.push(item);
        await hotel.save();
        io.to(hotelId).emit('checklistCreated', { period, item });
        res.status(200).json({ message: 'Checklist item added', item: item });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// READ
export const getChecklistItems = async (req, res) => {
    const { hotelId, period } = req.params;
    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ message: 'Hotel not found' });
        if (period) {
            const items = await getChecklistArray(hotel, period);
            return res.status(200).json(items);
        }
        res.status(200).json(hotel.checklist);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// UPDATE
export const updateChecklistItem = async (req, res) => {
    const { hotelId, itemId, period } = req.params;
    const updates = req.body;
    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ message: 'Hotel not found' });
        const checklistArray = await getChecklistArray(hotel, period);
        const item = checklistArray.find((i) => i._id.toString() === itemId);
        if (!item)
            return res.status(404).json({ message: 'Checklist item not found' });
        item.set(updates);
        await hotel.save();
        io.to(hotelId).emit('checklistUpdated', { period, item });
        res.status(200).json({ message: 'Checklist item updated', item: item });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// DELETE
export const deleteChecklistItem = async (req, res) => {
    const { hotelId, period, itemId } = req.params;
    try {
        if (!period || (period !== 'morning' && period !== 'evening' && period !== 'night')) {
            return res.status(400).json({ message: 'Period query parameter is required and must be one of: morning, evening, night' });
        }
        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ message: 'Hotel not found' });
        const checklistArray = await getChecklistArray(hotel, period);
        const item = checklistArray.id(itemId);
        if (!item)
            return res.status(404).json({ message: 'Checklist item not found' });
        checklistArray.pull(itemId);
        await hotel.save();
        io.to(hotelId).emit('checklistDeleted', { period, itemId });
        res.status(200).json({ message: 'Checklist item deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
