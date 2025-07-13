// routes/hotel/second-level/checklist.routes.js
import express from 'express';
import { addChecklistItem, getChecklistItems, updateChecklistItem, deleteChecklistItem } from '../../../controllers/hotel/second-level/checklist.controller.js';
const router = express.Router({ mergeParams: true });
// CREATE
router.post('/:hotelId/:period', addChecklistItem);
// READ
router.get('/:hotelId/:period', getChecklistItems);
// UPDATE
router.put('/:hotelId/:period/:itemId', updateChecklistItem);
// DELETE
router.delete('/:hotelId/:period/:itemId', deleteChecklistItem);
export default router;
