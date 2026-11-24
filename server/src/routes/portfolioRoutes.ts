import { Router } from 'express';
import { portfolioController } from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken as any, portfolioController.getPortfolio as any);

export default router;
