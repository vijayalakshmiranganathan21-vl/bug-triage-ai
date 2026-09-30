import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import bugRoutes from './bugRoutes.js';

const router = Router();

// Health check endpoint -> /api/health
router.use('/health', healthRoutes);

// Bug management endpoints -> /api/bugs
router.use('/bugs', bugRoutes);

export default router;
