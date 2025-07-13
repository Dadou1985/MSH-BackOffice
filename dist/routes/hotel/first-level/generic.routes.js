import express from 'express';
import { createField, getAllFields, getFieldById, updateField, deleteField } from '../../../controllers/hotel/first-level/firstLevel.controller.js';
const router = express.Router();
// Routes dynamiques pour chaque sous-ressource du modèle Hotel
router.post('/:hotelId/:field', createField); // Créer un élément dans une sous-collection
router.get('/:hotelId/:field', getAllFields); // Lire tous les éléments d’une sous-collection
router.get('/:hotelId/:field/:id', getFieldById); // Lire un élément spécifique
router.put('/:hotelId/:field/:id', updateField); // Mettre à jour un élément spécifique
router.delete('/:hotelId/:field/:id', deleteField); // Supprimer un élément spécifique
export default router;
