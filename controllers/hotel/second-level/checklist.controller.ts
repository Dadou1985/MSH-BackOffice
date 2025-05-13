import type { Request, Response } from 'express';
import Hotel from '../../../models/hotels/hotels.ts';

const getChecklistArray = (hotel: any, period: any) => {
  if (!hotel.checklist || !hotel.checklist[period]) {
    throw new Error(`Checklist period '${period}' does not exist`);
  }
  return hotel.checklist[period];
};

// CREATE
export const addChecklistItem = async (req: Request, res: Response) => {
  const { hotelId, period } = req.params;
  const { task, status } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checklistArray = getChecklistArray(hotel, period as any);
    checklistArray.push({ task, status });

    await hotel.save();
    res.status(200).json({ message: 'Checklist item added', checklist: hotel.checklist });
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
      const items = getChecklistArray(hotel, period as any);
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
  const { updates } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checklistArray = getChecklistArray(hotel, period as any);
    const item = checklistArray.id(itemId);
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });

    item.set(updates);
    await hotel.save();

    res.status(200).json({ message: 'Checklist item updated', item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
export const deleteChecklistItem = async (req: Request, res: Response) => {
  const { hotelId, itemId } = req.params;
  const { period } = req.query;

  try {
    if (!period || (period !== 'matin' && period !== 'soir' && period !== 'nuit')) {
      return res.status(400).json({ message: 'Period query parameter is required and must be one of: matin, soir, nuit' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const checklistArray = getChecklistArray(hotel, period as any);
    const item = checklistArray.id(itemId);
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });

    checklistArray.pull(itemId);
    await hotel.save();

    res.status(200).json({ message: 'Checklist item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};