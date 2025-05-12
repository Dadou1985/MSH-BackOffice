import Hotel from "../../../models/hotels/hotels";


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
        case 'housekeeping':
            hotel.housekeeping.push(data);
            break;
        case 'checklist':
            hotel.checklist.push(data);
            break;

        default:
            break;
    }
}

const createField = async (req, res) => {
    const { id, field } = req.params;
    const data = req.body;

    try {
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleCreteField(field, hotel, data);

        await hotel.save();
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error creating field" });
    }
}

const handleGetAllFields = (field, hotel) => {
    switch (field) {
        case 'cab':
            hotel.cab.find();
            break;
        case 'clock':
            hotel.clock.find();
            break;
        case 'maintenance':
            hotel.maintenance.find();
            break;
        case 'roomChange':
            hotel.roomChange.find();
            break;
        case 'safe':
            hotel.safe.find();
            break;
        case 'note':
            hotel.note.find();
            break;
        case 'sticker':
            hotel.sticker.find();
            break;
        case 'lostAndFound':
            hotel.lostAndFound.find();
            break;
        case 'chat':
            hotel.chat.find();
            break;
        case 'housekeeping':
            hotel.housekeeping.find();
            break;
        case 'checklist':
            hotel.checklist.find();
            break;
    
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

        handleGetAllFields(field, hotel);

        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error getting all fields" });
    }
}

const handleGetFieldById = (field, hotel, id) => {
    switch (field) {
        case 'cab':
            hotel.cab.id(id);
            break;
        case 'clock':
            hotel.clock.id(id);
            break;
        case 'maintenance':
            hotel.maintenance.id(id);
            break;
        case 'roomChange':
            hotel.roomChange.id(id);
            break;
        case 'safe':
            hotel.safe.id(id);
            break;
        case 'note':
            hotel.note.id(id);
            break;
        case 'sticker':
            hotel.sticker.id(id);
            break;
        case 'lostAndFound':
            hotel.lostAndFound.id(id);
            break;
        case 'chat':
            hotel.chat.id(id);
            break;
        case 'housekeeping':
            hotel.housekeeping.id(id);
            break;
        case 'checklist':
            hotel.checklist.id(id);
            break;
    
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

        handleGetFieldById(field, hotel, id);

        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error getting field by id" });
    }
}

const handleUpdateField = (field, hotel, id, data) => {
    switch (field) {
        case 'cab':
            hotel.cab.id(id).set(data);
            break;
        case 'clock':
            hotel.clock.id(id).set(data);
            break;
        case 'maintenance':
            hotel.maintenance.id(id).set(data);
            break;
        case 'roomChange':
            hotel.roomChange.id(id).set(data);
            break;
        case 'safe':
            hotel.safe.id(id).set(data);
            break;
        case 'note':
            hotel.note.id(id).set(data);
            break;
        case 'sticker':
            hotel.sticker.id(id).set(data);
            break;
        case 'lostAndFound':
            hotel.lostAndFound.id(id).set(data);
            break;
        case 'chat':
            hotel.chat.id(id).set(data);
            break;
    
        default:
            break;
    }
}

const updateField = async (req, res) => {
    const { hotelId, field, id } = req.params;
    const data = req.body;

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleUpdateField(field, hotel, id, data);

        await hotel.save();
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error updating field" });
    }
}

const handleDeleteField = (field, hotel, id) => {
    switch (field) {
        case 'cab':
            hotel.cab.id(id).remove();
            break;
        case 'clock':
            hotel.clock.id(id).remove();
            break;
        case 'maintenance':
            hotel.maintenance.id(id).remove();
            break;
        case 'roomChange':
            hotel.roomChange.id(id).remove();
            break;
        case 'safe':
            hotel.safe.id(id).remove();
            break;
        case 'note':
            hotel.note.id(id).remove();
            break;
        case 'sticker':
            hotel.sticker.id(id).remove();
            break;
        case 'lostAndFound':
            hotel.lostAndFound.id(id).remove();
            break;
        case 'chat':
            hotel.chat.id(id).remove();
            break;
    
        default:
            break;
    }
}

const deleteField = async (req, res) => {
    const { hotelId, field, id } = req.params;

    try {
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleDeleteField(field, hotel, id);

        await hotel.save();
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error deleting field" });
    }
}

export {
    createField,
    getAllFields,
    getFieldById,
    updateField,
    deleteField
}