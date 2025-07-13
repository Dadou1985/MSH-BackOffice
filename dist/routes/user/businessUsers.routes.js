import express from 'express';
import { getAllBusinessUsers, getBusinessUserById, createBusinessUser, updateBusinessUser, deleteBusinessUser } from '../../controllers/users/business/businessUsers.controller.js';
const router = express.Router();
// Lire tous les utilisateurs professionnels
router.get('/', getAllBusinessUsers);
// Lire un utilisateur professionnel par ID
router.get('/:id', getBusinessUserById);
// Créer un nouvel utilisateur professionnel
router.post('/', createBusinessUser);
// Mettre à jour un utilisateur professionnel
router.put('/:id', updateBusinessUser);
// Supprimer un utilisateur professionnel
router.delete('/:id', deleteBusinessUser);
export default router;
