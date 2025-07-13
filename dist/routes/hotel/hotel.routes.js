import express from 'express';
import { getHotels, getHotelById, createHotel, updateHotel, deleteHotel } from '../../controllers/hotel/hotel.controller.js';
const router = express.Router();
// GET all hotels
router.get('/', getHotels);
// GET a hotel by ID
router.get('/:id', getHotelById);
// POST a new hotel
router.post('/', createHotel);
// PUT update a hotel by ID
router.put('/:id', updateHotel);
// DELETE a hotel by ID
router.delete('/:id', deleteHotel);
export default router;
