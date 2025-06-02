// routes/hotel/second-level/checklist.routes.ts

import express from 'express';
import {
  addChecklistItem,
  getChecklistItems,
  updateChecklistItem,
  deleteChecklistItem
} from '../../../controllers/hotel/second-level/checklist.controller.ts';

const router = express.Router({ mergeParams: true });

// CREATE
router.post('/:hotelId/:period', addChecklistItem);

// READ
router.get('/:hotelId/:period', getChecklistItems);

// UPDATE
router.put('/:hotelId/:period/:itemId', updateChecklistItem);

// DELETE
router.delete('/:hotelId/:itemId/:period', deleteChecklistItem);

export default router;
