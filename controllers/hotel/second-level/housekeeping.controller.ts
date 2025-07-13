import type { Request, Response } from 'express';
import type { Server } from 'socket.io';
import Hotel from '../../../models/hotels/hotels.ts';
import { io } from '../../../app.ts';

// Helper to get the correct category (towel, pillow, etc.)
const getCategoryArray = async(hotel: any, category: string) => {
  if (!hotel.housekeeping) {
    hotel.housekeeping = {
      towel: [],
      pillow: [],
      blanket: [],
      toiletPaper: [],
      hairDryer: [],
      iron: [],
      babyBed: [],
      soap: []
    };
  } else if (!hotel.housekeeping[category]) {
    hotel.housekeeping[category] = [];
  }

  return hotel.housekeeping[category];
};

// CREATE
export const addHousekeepingItem = async (req: Request, res: Response) => {
  const { hotelId, category } = req.params;
  const item = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const categoryArray = await getCategoryArray(hotel, category);
    categoryArray.push(item);

    await hotel.save();

    io.to(hotelId).emit(`${category}Created`, item);

    res.status(200).json({ message: 'Item added', item: item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// READ
export const getHousekeepingItems = async (req: Request, res: Response) => {
  const { hotelId, category } = req.params;
//   const { category } = req.query;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    if (category) {
      const items = await getCategoryArray(hotel, category as string);
      return res.status(200).json(items);
    }

    res.status(200).json(hotel.housekeeping);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
export const updateHousekeepingItem = async (req: Request, res: Response) => {
  const { hotelId, itemId, category } = req.params;
  const updates = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const categoryArray = await getCategoryArray(hotel, category);
    const item = categoryArray.find((i: any) => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.set(updates);
    await hotel.save();

    io.to(hotelId).emit(`${category}Updated`, item);

    res.status(200).json({ message: 'Item updated', item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteHousekeepingItem = async (req: Request, res: Response) => {
  const { hotelId, category, itemId } = req.params;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const categoryArray = await getCategoryArray(hotel, category);
    const item = categoryArray.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    categoryArray.pull(itemId);
    await hotel.save();

    io.to(hotelId).emit(`${category}Deleted`, itemId);

    res.status(200).json({ message: 'Item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};