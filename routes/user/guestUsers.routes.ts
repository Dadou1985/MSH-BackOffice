import express from 'express';
import {
  getAllGuestUsers,
  getGuestUserById,
  createGuestUser,
  updateGuestUser,
  deleteGuestUser
} from '../../controllers/users/guest/guestUsers.controller.ts';

const router = express.Router();

/**
 * Routes pour la gestion des utilisateurs invités (Guest Users)
 */

// Récupérer tous les utilisateurs invités
router.get('/', getAllGuestUsers);

// Récupérer un utilisateur invité par ID
router.get('/:id', getGuestUserById);

// Créer un utilisateur invité
router.post('/', createGuestUser);

// Mettre à jour un utilisateur invité par ID
router.put('/:id', updateGuestUser);

// Supprimer un utilisateur invité par ID
router.delete('/:id', deleteGuestUser);

export default router;