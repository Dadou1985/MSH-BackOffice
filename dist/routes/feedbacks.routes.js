import express from 'express';
import { createFeedbackCollection, createFeedback, getAllFeedbacks } from '../controllers/feedback.controller.js';
const router = express.Router();
// Créer une collection feedback
router.post('/', createFeedbackCollection);
// Créer une collection feedback
router.post('/:id/:category', createFeedback);
// Lire tous les feedbacks
router.get('/:id', getAllFeedbacks);
// Lire un feedback par hotelId
// router.get('/:hotelId', getFeedbackByHotelId);
// Mettre à jour un feedback par hotelId
// router.put('/:hotelId', updateFeedbackByHotelId);
// Supprimer un feedback par hotelId
// router.delete('/:hotelId', deleteFeedbackByHotelId);
export default router;
