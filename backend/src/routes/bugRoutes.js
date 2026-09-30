import { Router } from 'express';
import {
  getAllBugs,
  getBugById,
  createBug,
  updateBugStatus,
} from '../controllers/bugController.js';

const router = Router();

router.get('/', getAllBugs);
router.post('/', createBug);
router.get('/:id', getBugById);
router.patch('/:id/status', updateBugStatus);

export default router;
