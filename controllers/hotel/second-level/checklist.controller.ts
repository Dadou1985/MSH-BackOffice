import type { Request, Response } from 'express';
import Hotel from '../../../models/hotels/hotels.ts';

const getChecklistArray = async(hotel: any, period: any) => {
  if (!hotel.checklist) {
    hotel.checklist = {
      morning: [],
      evening: [],
      night: []
    };
  } else if (!hotel.checklist[period]) {
    hotel.checklist[period] = [];
  }

  return hotel.checklist[period];
};

// CREATE
export const addChecklistItem = async (req: Request, res: Response) => {
  const { hotelId, period } = req.params;
  const item = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checklistArray = await getChecklistArray(hotel, period as any);
    checklistArray.push(item);

    await hotel.save();
    res.status(200).json({ message: 'Checklist item added', item: item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// READ
export const getChecklistItems = async (req: Request, res: Response) => {
  const { hotelId, period } = req.params;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    if (period) {
      const items = await getChecklistArray(hotel, period as any);
      return res.status(200).json(items);
    }

    res.status(200).json(hotel.checklist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
export const updateChecklistItem = async (req: Request, res: Response) => {
  const { hotelId, itemId, period } = req.params;
  const updates = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checklistArray = await getChecklistArray(hotel, period as any);
    const item = checklistArray.find((i: any) => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });

    item.set(updates);
    await hotel.save();

    res.status(200).json({ message: 'Checklist item updated', item: item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteChecklistItem = async (req: Request, res: Response) => {
  const { hotelId, period, itemId } = req.params;

  try {
    if (!period || (period !== 'morning' && period !== 'evening' && period !== 'night')) {
      return res.status(400).json({ message: 'Period query parameter is required and must be one of: matin, soir, nuit' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checklistArray = await getChecklistArray(hotel, period as any);
    const item = checklistArray.id(itemId);
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });

    checklistArray.pull(itemId);
    await hotel.save();

    res.status(200).json({ message: 'Checklist item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};