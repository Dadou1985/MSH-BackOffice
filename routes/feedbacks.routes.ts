import express from 'express';
import {
  addSupportMessage,
  getSupportMessages,
  updateSupportMessage,
  deleteSupportMessage
} from '../controllers/feedback.controller.ts';

const router = express.Router();

// Créer un message de support
router.post('/:hotelId/messages', addSupportMessage);

// Lire tous les messages de support
router.get('/:hotelId/messages', getSupportMessages);

// Mettre à jour un message de support
router.put('/:hotelId/messages/:messageId', updateSupportMessage);

// Supprimer un message de support
router.delete('/:hotelId/messages/:messageId', deleteSupportMessage);

export default router;