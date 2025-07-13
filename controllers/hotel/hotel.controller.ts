import Hotel from "../../models/hotels/hotels.ts";
import type { Request, Response } from 'express';


const getHotels = async (req: Request, res: Response) => {
    try {
        const hotels = await Hotel.find();
        if (!hotels || hotels.length === 0) {
            return res.status(404).json({ message: "No hotels found" });
        }
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving hotels" });
    }
}

const getHotelById = async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("Hotel ID:::::::::::::::", id);
    try {
        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving hotel" });
    }
}

const createHotel = async (req: Request, res: Response) => {
    const hotelData = req.body;
    try {
        const newHotel = new Hotel(hotelData);
        await newHotel.save();
        res.status(201).json(newHotel);
    } catch (error) {
        res.status(500).json({ message: "Error creating hotel" });
    }
}

const updateHotel = async (req: Request, res: Response) => {
    const { id } = req.params;
    const hotelData = req.body;
    try {
        const updatedHotel = await Hotel.findByIdAndUpdate(id, hotelData, { new: true });
        if (!updatedHotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.status(200).json(updatedHotel);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating hotel" });
    }
}

const deleteHotel = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedHotel = await Hotel.findByIdAndDelete(id);
        if (!deletedHotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting hotel" });
    }
}

export {
    getHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
}