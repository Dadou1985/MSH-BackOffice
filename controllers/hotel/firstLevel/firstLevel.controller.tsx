import Hotel from "../../../models/hotels/hotels";


const handleCrete = (field, hotel, data) => {
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
    const { id } = req.params;
    const { field } = req.query;
    const data = req.body;

    try {
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        handleCrete(field, hotel, data);

        await hotel.save();
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error creating field" });
    }
}

