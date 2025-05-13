import type { Request, Response } from 'express';
import Hotel from '../../../models/hotels/hotels.ts';

// Helper to get the correct category (towel, pillow, etc.)
const getCategoryArray = (hotel: any, category: string) => {
  if (!hotel.housekeeping || !hotel.housekeeping[category]) {
    throw new Error(`Category '${category}' does not exist in housekeeping`);
  }
  return hotel.housekeeping[category];
};

// CREATE
export const addHousekeepingItem = async (req: Request, res: Response) => {
  const { hotelId, category } = req.params;
  const { item } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const categoryArray = getCategoryArray(hotel, category);
    categoryArray.push(item);

    await hotel.save();
    res.status(200).json({ message: 'Item added', housekeeping: hotel.housekeeping });
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
      const items = getCategoryArray(hotel, category as string);
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
  const { updates } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const categoryArray = getCategoryArray(hotel, category);
    const item = categoryArray.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.set(updates);
    await hotel.save();

    res.status(200).json({ message: 'Item updated', item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteHousekeepingItem = async (req: Request, res: Response) => {
  const { hotelId, itemId } = req.params;
  const { category } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const categoryArray = getCategoryArray(hotel, category);
    const item = categoryArray.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    categoryArray.pull(itemId);
    await hotel.save();

    res.status(200).json({ message: 'Item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};