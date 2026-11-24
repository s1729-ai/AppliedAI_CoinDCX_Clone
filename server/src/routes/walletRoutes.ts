import { Router } from 'express';
import { walletController } from '../controllers/walletController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken as any, walletController.getWallet as any);
router.post('/deposit', authenticateToken as any, walletController.depositDemoFunds as any);
router.post('/withdraw', authenticateToken as any, walletController.withdrawDemoFunds as any);
router.post('/transfer', authenticateToken as any, walletController.transferDemoCrypto as any);
router.get('/transactions', authenticateToken as any, walletController.getTransactions as any);

export default router;
