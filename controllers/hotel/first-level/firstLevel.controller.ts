import Hotel from "../../../models/hotels/hotels.ts";
import { io } from '../../../app.js'; // Import your socket.io instance

const handleCreteField = (field, hotel, data) => {
    switch (field) {
        case 'cab':
            hotel.cab.push(data);
            break;
        case 'clock':
            hotel.clock.push(data);
            break;
        case 'maintenance':
            hotel.maintenance.push(data);
            break;
        case 'roomChange':
            hotel.roomChange.push(data);
            break;
        case 'safe':
            hotel.safe.push(data);
            break;
        case 'note':
            hotel.note.push(data);
            break;
        case 'sticker':
            hotel.sticker.push(data);
            break;
        case 'lostAndFound':
            hotel.lostAndFound.push(data);
            break;
        case 'chat':
            hotel.chat.push(data);
            break;

        default:
            break;
    }
}

const createField = async (req, res) => {
    const { hotelId, field } = req.params;
    const data = req.body;
    // const io = req.app.get('io'); // ⬅️ Récupération de l'instance Socket.IO
    if (!io) {
        return res.status(500).json({ message: "Socket.IO instance not found" });
    }

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleCreteField(field, hotel, data);

        await hotel.save();
        // Émission en temps réel
        io.to(hotelId).emit(`${field}Created`, data);

        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error creating field" });
    }
}

const handleGetAllFields = async (field, hotel) => {
    switch (field) {
        case 'cab':
            return hotel.cab;
        case 'clock':
            return hotel.clock;
        case 'maintenance':
            return hotel.maintenance;
        case 'roomChange':
            return hotel.roomChange;
        case 'safe':
            return hotel.safe;
        case 'note':
            return hotel.note;
        case 'sticker':
            return hotel.sticker;
        case 'lostAndFound':
            return hotel.lostAndFound;
        case 'chat':
            return hotel.chat;
    
        default:
            break;
    }
}

const getAllFields = async (req, res) => {
    const { hotelId, field } = req.params;

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const hotelFeature = await handleGetAllFields(field, hotel);
        if (!hotelFeature) {
            return res.status(404).json({ message: "Field not found" });
        }

        res.status(201).json(hotelFeature);
    } catch (error) {
        res.status(500).json({ message: "Error getting all fields" });
    }
}

const handleGetFieldById = async (field, hotel, id) => {
    switch (field) {
        case 'cab':
            return hotel.cab.id(id);
        case 'clock':
            return hotel.clock.id(id);
        case 'maintenance':
            return hotel.maintenance.id(id);
        case 'roomChange':
            return hotel.roomChange.id(id);
        case 'safe':
            return hotel.safe.id(id);
        case 'note':
            return hotel.note.id(id);
        case 'sticker':
            return hotel.sticker.id(id);
        case 'lostAndFound':
            return hotel.lostAndFound.id(id);
        case 'chat':
            return hotel.chat.id(id);
        case 'housekeeping':
            return hotel.housekeeping.id(id);
        case 'checklist':
            return hotel.checklist.id(id);
         
        default:
            break;
    }
}

const getFieldById = async (req, res) => {
    const { hotelId, field, id } = req.params;

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        const hotelFeatureById = await handleGetFieldById(field, hotel, id);

        res.status(201).json(hotelFeatureById);
    } catch (error) {
        res.status(500).json({ message: "Error getting field by id" });
    }
}

const handleUpdateField = (field, hotel, id, data) => {
    switch (field) {
        case 'cab':
            return hotel.cab.id(id).set(data);
        case 'clock':
            return hotel.clock.id(id).set(data);
        case 'maintenance':
            return hotel.maintenance.id(id).set(data);
        case 'roomChange':
            return hotel.roomChange.id(id).set(data);
        case 'safe':
            return hotel.safe.id(id).set(data);
        case 'note':
            return hotel.note.id(id).set(data);
        case 'sticker':
            return hotel.sticker.id(id).set(data);
        case 'lostAndFound':
            return hotel.lostAndFound.id(id).set(data);
        case 'chat':
            return hotel.chat.id(id).set(data);
    
        default:
            break;
    }
}

const updateField = async (req, res) => {
    const { hotelId, field, id } = req.params;
    const data = req.body;
    // const io = req.app.get('io'); // ⬅️ Récupération de l'instance Socket.IO
    
    if (!io) {
        return res.status(500).json({ message: "Socket.IO instance not found" });
    }

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleUpdateField(field, hotel, id, data);

        await hotel.save();
        io.to(hotelId).emit(`${field}Updated`, data);
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error updating field" });
    }
}

const handleDeleteField = (field, hotel, id) => {
    switch (field) {
        case 'cab':
            return hotel?.cab?.id(id)?.deleteOne();
        case 'clock':
            return hotel?.clock?.id(id)?.deleteOne();
        case 'maintenance':
            return hotel?.maintenance?.id(id)?.deleteOne();
        case 'roomChange':
            return hotel?.roomChange?.id(id)?.deleteOne();
        case 'safe':
            return hotel?.safe?.id(id)?.deleteOne();
        case 'note':
            return hotel?.note?.id(id)?.deleteOne();
        case 'sticker':
            return hotel?.sticker?.id(id)?.deleteOne();
        case 'lostAndFound':
            return hotel?.lostAndFound?.id(id)?.deleteOne();
        case 'chat':
            return hotel?.chat?.id(id)?.deleteOne();
    
        default:
            break;
    }
}

const deleteField = async (req, res) => {
    const { hotelId, field, id } = req.params;
    // const io = req.app.get('io'); // ⬅️ Récupération de l'instance Socket.IO
    
    if (!io) {
        return res.status(500).json({ message: "Socket.IO instance not found" });
    }

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleDeleteField(field, hotel, id);

        await hotel.save();
        io.to(hotelId).emit(`${field}Deleted`, id);
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error deleting field" });
    }
}

export {
    createField,
    getAllFields,
    getFieldById,
    updateField,
    deleteField
}