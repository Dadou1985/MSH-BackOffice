import type { Request, Response } from 'express';
import Support from '../models/support.ts';

// CREATE
export const addSupportMessage = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const messageData = req.body;

    const support = await Support.findById(hotelId);
    if (!support) return res.status(404).json({ message: 'Support document not found' });

    support.chatRoom.push(messageData);
    await support.save();
    res.status(201).json({ message: 'Message added', data: support });
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error });
  }
};

// READ
export const getSupportMessages = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;

    const support = await Support.findById(hotelId);
    if (!support) return res.status(404).json({ message: 'Support not found' });

    res.status(200).json(support.chatRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error });
  }
};

// UPDATE
export const updateSupportMessage = async (req: Request, res: Response) => {
  try {
    const { hotelId, messageId } = req.params;
    const updates = req.body;

    const support = await Support.findById(hotelId);
    if (!support) return res.status(404).json({ message: 'Support not found' });

    const message = support.chatRoom.id(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.set(updates);
    await support.save();

    res.status(200).json({ message: 'Message updated', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error });
  }
};

// DELETE
export const deleteSupportMessage = async (req: Request, res: Response) => {
  try {
    const { hotelId, messageId } = req.params;

    const support = await Support.findById(hotelId);
    if (!support) return res.status(404).json({ message: 'Support not found' });

    const message = support.chatRoom.id(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.deleteOne();
    await support.save();

    res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};