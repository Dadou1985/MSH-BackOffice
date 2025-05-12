

import express from 'express';
import {
  createChatRoomMessage,
  getChatRoomMessages,
  updateChatRoomMessage,
  deleteChatRoomMessage
} from '../../../controllers/hotel/second-level/chat.controller.ts';

const router = express.Router({ mergeParams: true });

// POST: Create a new message in a specific chatRoom
router.post('/:chatId/chatRoom', createChatRoomMessage);

// GET: Get all messages from a specific chatRoom
router.get('/:chatId/chatRoom', getChatRoomMessages);

// PATCH: Update a specific message in chatRoom
router.patch('/:chatId/chatRoom/:messageId', updateChatRoomMessage);

// DELETE: Delete a specific message from chatRoom
router.delete('/:chatId/chatRoom/:messageId', deleteChatRoomMessage);

export default router;