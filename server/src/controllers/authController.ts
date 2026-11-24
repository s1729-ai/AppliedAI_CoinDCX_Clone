import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../dbStore';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'coindcx_demo_jwt_secret_key_2026';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const existing = await dbStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await dbStore.createUser({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        isKycVerified: true,
        demoNoticeAcknowledged: true,
      });

      // Automatically initialize demo wallet with ₹10,00,000 (10 Lakhs)
      const wallet = await dbStore.createWallet(user._id);

      // Create initial deposit transaction record
      await dbStore.createTransaction({
        userId: user._id,
        type: 'DEPOSIT',
        amount: 1000000,
        currency: 'INR',
        fee: 0,
        status: 'COMPLETED',
        metadata: { note: 'Initial Demo Virtual Fund Allocation' },
      });

      // Create welcome notification
      await dbStore.addNotification({
        userId: user._id,
        title: 'Welcome to CoinDCX Demo!',
        message: 'Your virtual demo account has been credited with ₹10,00,000 virtual INR. Start exploring Spot & Futures trading risk-free.',
        type: 'SUCCESS',
      });

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Virtual demo account activated.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isKycVerified: user.isKycVerified,
        },
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await dbStore.findUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      let wallet = await dbStore.getWalletByUserId(user._id);
      if (!wallet) {
        wallet = await dbStore.createWallet(user._id);
      }

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isKycVerified: user.isKycVerified,
        },
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async demoLogin(req: Request, res: Response) {
    try {
      const demoEmail = 'demo@coindcx.edu';
      let user = await dbStore.findUserByEmail(demoEmail);

      if (!user) {
        const hashedPassword = await bcrypt.hash('coindcx123', 10);
        user = await dbStore.createUser({
          name: 'Demo Trader',
          email: demoEmail,
          password: hashedPassword,
          role: 'user',
          isKycVerified: true,
          demoNoticeAcknowledged: true,
        });

        await dbStore.createWallet(user._id);
        await dbStore.createTransaction({
          userId: user._id,
          type: 'DEPOSIT',
          amount: 1000000,
          currency: 'INR',
          fee: 0,
          status: 'COMPLETED',
          metadata: { note: 'Initial Demo Virtual Fund Allocation' },
        });

        await dbStore.addNotification({
          userId: user._id,
          title: 'Welcome Demo Trader!',
          message: 'Your virtual wallet has ₹10,00,000 for simulated spot and futures trading.',
          type: 'SUCCESS',
        });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      const wallet = await dbStore.getWalletByUserId(user._id);

      return res.json({
        success: true,
        message: 'Demo account connected',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isKycVerified: user.isKycVerified,
        },
        wallet: {
          inrBalance: wallet?.inrBalance || 1000000,
          coinBalances: wallet?.coinBalances || [],
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await dbStore.findUserById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      let wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) {
        wallet = await dbStore.createWallet(userId);
      }

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isKycVerified: user.isKycVerified,
          demoNoticeAcknowledged: user.demoNoticeAcknowledged,
          createdAt: user.createdAt,
        },
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
