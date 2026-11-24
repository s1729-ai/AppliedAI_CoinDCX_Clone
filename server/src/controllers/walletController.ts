import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../dbStore';
import { marketDataService } from '../services/marketDataService';

export const walletController = {
  async getWallet(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      let wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) {
        wallet = await dbStore.createWallet(userId);
      }

      // Calculate portfolio values
      const coins = marketDataService.getAllCoins();
      const priceMap = new Map<string, number>();
      coins.forEach((c) => priceMap.set(c.symbol.toUpperCase(), c.lastPrice));

      let cryptoValueInr = 0;
      const enrichedBalances = wallet.coinBalances.map((b) => {
        const currentPrice = priceMap.get(b.coin.toUpperCase()) || 0;
        const total = b.free + b.locked;
        const currentValue = total * currentPrice;
        const investedValue = total * (b.avgBuyPrice || currentPrice);
        const pnl = currentValue - investedValue;
        const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
        cryptoValueInr += currentValue;

        return {
          ...b,
          currentPrice,
          currentValue: Number(currentValue.toFixed(2)),
          investedValue: Number(investedValue.toFixed(2)),
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
        };
      });

      const totalPortfolioValue = wallet.inrBalance + cryptoValueInr;

      return res.json({
        success: true,
        data: {
          inrBalance: Number(wallet.inrBalance.toFixed(2)),
          cryptoValueInr: Number(cryptoValueInr.toFixed(2)),
          totalPortfolioValue: Number(totalPortfolioValue.toFixed(2)),
          coinBalances: enrichedBalances,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async depositDemoFunds(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { amount } = req.body;
      const depositAmount = Number(amount) || 100000;
      if (depositAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Deposit amount must be greater than zero' });
      }

      let wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) wallet = await dbStore.createWallet(userId);

      wallet.inrBalance += depositAmount;
      wallet.totalDeposited += depositAmount;
      await dbStore.updateWallet(wallet);

      await dbStore.createTransaction({
        userId,
        type: 'DEPOSIT',
        amount: depositAmount,
        currency: 'INR',
        fee: 0,
        status: 'COMPLETED',
        metadata: { method: 'Instant Demo Virtual Deposit' },
      });

      await dbStore.addNotification({
        userId,
        title: 'Virtual Demo Deposit Successful',
        message: `₹${depositAmount.toLocaleString('en-IN')} added to your demo wallet!`,
        type: 'SUCCESS',
      });

      return res.json({
        success: true,
        message: `₹${depositAmount.toLocaleString('en-IN')} virtual funds deposited successfully`,
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async withdrawDemoFunds(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { amount, bankName, accountNumber } = req.body;
      const withdrawAmount = Number(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
      }

      const wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet || wallet.inrBalance < withdrawAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient INR balance for withdrawal' });
      }

      wallet.inrBalance -= withdrawAmount;
      wallet.totalWithdrawn += withdrawAmount;
      await dbStore.updateWallet(wallet);

      await dbStore.createTransaction({
        userId,
        type: 'WITHDRAW',
        amount: withdrawAmount,
        currency: 'INR',
        fee: 0,
        status: 'COMPLETED',
        metadata: {
          bank: bankName || 'Simulated Bank Account',
          account: accountNumber || 'XXXX1234',
        },
      });

      await dbStore.addNotification({
        userId,
        title: 'Demo Withdrawal Processed',
        message: `Simulated withdrawal of ₹${withdrawAmount.toLocaleString('en-IN')} completed.`,
        type: 'INFO',
      });

      return res.json({
        success: true,
        message: `Simulated withdrawal of ₹${withdrawAmount.toLocaleString('en-IN')} processed.`,
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async transferDemoCrypto(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { coin, quantity, recipientAddress } = req.body;
      const transferQty = Number(quantity);
      if (!coin || transferQty <= 0 || !recipientAddress) {
        return res.status(400).json({ success: false, message: 'Invalid transfer details' });
      }

      const wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

      const coinIndex = wallet.coinBalances.findIndex((c) => c.coin.toUpperCase() === coin.toUpperCase());
      if (coinIndex === -1 || wallet.coinBalances[coinIndex].free < transferQty) {
        return res.status(400).json({ success: false, message: `Insufficient ${coin} balance` });
      }

      wallet.coinBalances[coinIndex].free = Number((wallet.coinBalances[coinIndex].free - transferQty).toFixed(6));
      await dbStore.updateWallet(wallet);

      await dbStore.createTransaction({
        userId,
        type: 'TRANSFER',
        amount: transferQty,
        currency: coin.toUpperCase(),
        fee: 0,
        status: 'COMPLETED',
        metadata: { recipient: recipientAddress },
      });

      await dbStore.addNotification({
        userId,
        title: `Transferred ${transferQty} ${coin.toUpperCase()}`,
        message: `Sent to simulated address: ${recipientAddress.slice(0, 10)}...`,
        type: 'INFO',
      });

      return res.json({
        success: true,
        message: `Transferred ${transferQty} ${coin.toUpperCase()} successfully (simulated)`,
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const transactions = await dbStore.getTransactionsByUserId(userId);
      return res.json({ success: true, data: transactions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
