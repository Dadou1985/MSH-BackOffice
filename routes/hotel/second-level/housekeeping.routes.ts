import express from 'express';
import {
  addHousekeepingItem,
  getHousekeepingItems,
  updateHousekeepingItem,
  deleteHousekeepingItem,
} from '../../../controllers/hotel/second-level/housekeeping.controller.ts';

const router = express.Router();

// Add a new housekeeping item
router.post('/:hotelId/:category', addHousekeepingItem);

// Get housekeeping items
router.get('/:hotelId/:category', getHousekeepingItems);

// Update a housekeeping item
router.put('/:hotelId/:category/:itemId', updateHousekeepingItem);

// Delete a housekeeping item
router.delete('/:hotelId/:category/:itemId', deleteHousekeepingItem);

export default router;
