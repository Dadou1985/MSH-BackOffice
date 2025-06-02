// routes/support.routes.ts
import express from 'express';
import {
  createSupportDocument,
  addSupportMessage,
  getSupportMessages,
  updateSupportMessage,
  deleteSupportMessage,
  updateSupportDocument,
  getAllSupportDocuments
} from '../controllers/support.controller.ts';

const router = express.Router();

// Créer un document de support
router.post('/', createSupportDocument);

// Ajouter un message
router.post('/:hotelId/messages', addSupportMessage);

// Obtenir tous les documents de support
router.get('/', getAllSupportDocuments);

// Obtenir tous les messages
router.get('/:hotelId/messages', getSupportMessages);

// Mettre à jour un document de support
router.put('/:hotelId', updateSupportDocument);

// Mettre à jour un message
router.put('/:hotelId/messages/:messageId', updateSupportMessage);

// Supprimer un message
router.delete('/:hotelId/messages/:messageId', deleteSupportMessage);

export default router;