// routes/support.routes.ts
import express from 'express';
import {
  addSupportMessage,
  getSupportMessages,
  updateSupportMessage,
  deleteSupportMessage
} from '../controllers/support.controller.ts';

const router = express.Router();

// Ajouter un message
router.post('/:hotelId/messages', addSupportMessage);

// Obtenir tous les messages
router.get('/:hotelId/messages', getSupportMessages);

// Mettre à jour un message
router.put('/:hotelId/messages/:messageId', updateSupportMessage);

// Supprimer un message
router.delete('/:hotelId/messages/:messageId', deleteSupportMessage);

export default router;