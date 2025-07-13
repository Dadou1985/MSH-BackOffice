import express from 'express';
import { createChatRoomMessage, getChatRoomMessages, updateChatRoomMessage, deleteChatRoomMessage } from '../../../controllers/hotel/second-level/chat.controller.js';
const router = express.Router({ mergeParams: true });
// POST: Create a new message in a specific chatRoom
router.post('/:hotelId/:chatId/chatRoom', createChatRoomMessage);
// GET: Get all messages from a specific chatRoom
router.get('/:hotelId/:chatId/chatRoom', getChatRoomMessages);
// PATCH: Update a specific message in chatRoom
router.patch('/:hotelId/:chatId/chatRoom/:messageId', updateChatRoomMessage);
// DELETE: Delete a specific message from chatRoom
router.delete('/:hotelId/:chatId/chatRoom/:messageId', deleteChatRoomMessage);
export default router;
