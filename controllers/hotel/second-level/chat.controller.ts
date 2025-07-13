import Hotel from '../../../models/hotels/hotels.js'; // Adjust path as needed
import { io } from '../../../app.js'; // Import your socket.io instance

import type { Request, Response } from 'express';
// Create a new chatRoom message in a specific chat thread
export const createChatRoomMessage = async (req: Request, res: Response) => {
  const { hotelId, chatId } = req.params;
  const messageData = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const chat = hotel.chat.id(chatId);
    if (!chat || !Array.isArray(chat.chatRoom)) {
      return res.status(404).json({ message: 'Chat not found or chatRoom missing' });
    }

    chat.chatRoom.push(messageData);
    await hotel.save();

    // Debug log (utile en développement)
    console.log(`📨 Message ajouté dans chat_${chatId}`, messageData);

    // Emission à tous les clients dans le salon
    io.to(`chat_${chatId}`).emit('newChatRoomMessage', {
      chatId,
      message: messageData,
    });

    res.status(201).json(chat.chatRoom[chat.chatRoom.length - 1]);
  } catch (err) {
    console.error('Erreur création chatRoom:', err);
    res.status(500).json({ message: 'Erreur lors de la création du message', error: err });
  }
};

// Get all chatRoom messages for a specific chat
export const getChatRoomMessages = async (req: Request, res: Response) => {
  const { hotelId, chatId } = req.params;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const chat = hotel.chat.id(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.status(200).json(chat.chatRoom);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving chatRoom messages', error: err });
  }
};

// Update a specific chatRoom message
export const updateChatRoomMessage = async (req: Request, res: Response) => {
  const { hotelId, chatId, messageId } = req.params;
  const updateData = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const chat = hotel.chat.id(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = chat.chatRoom.find((i: any) => i._id.toString() === messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.set(updateData);
    await hotel.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Error updating message', error: err });
  }
};

// Delete a specific chatRoom message
export const deleteChatRoomMessage = async (req: Request, res: Response) => {
  const { hotelId, chatId, messageId } = req.params;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    const chat = hotel.chat.id(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.chatRoom.pull(messageId);

    await hotel.save();
    io.to(`chat_${chatId}`).emit('chatRoomMessageDeleted', { chatId, messageId });
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting message', error: err });
  }
};