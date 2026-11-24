import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../dbStore';
import { marketDataService } from '../services/marketDataService';

export const spotTradingController = {
  async placeOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { pair, side, type, price, quantity, totalInr } = req.body;
      if (!pair || !side || !type) {
        return res.status(400).json({ success: false, message: 'Invalid order parameters' });
      }

      const symbol = pair.replace('/INR', '').replace('INR', '').toUpperCase();
      const coin = marketDataService.getCoinBySymbol(symbol);
      if (!coin) {
        return res.status(404).json({ success: false, message: 'Unsupported trading pair' });
      }

      // Determine execution price
      const executionPrice = type === 'MARKET' ? coin.lastPrice : Number(price);
      if (executionPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid price' });
      }

      const wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
      }

      const tradingFeeRate = 0.001; // 0.1% simulated fee

      if (side === 'BUY') {
        // Required INR amount
        let inrToSpend = totalInr ? Number(totalInr) : Number(quantity) * executionPrice;
        const fee = inrToSpend * tradingFeeRate;
        const totalDebit = inrToSpend + fee;

        if (wallet.inrBalance < totalDebit) {
          return res.status(400).json({
            success: false,
            message: `Insufficient INR balance. Available: ₹${wallet.inrBalance.toLocaleString('en-IN')}, Required: ₹${totalDebit.toFixed(2)}`,
          });
        }

        const coinAmount = inrToSpend / executionPrice;

        // Deduct INR
        wallet.inrBalance -= totalDebit;

        // Add coin balance
        const coinBalIndex = wallet.coinBalances.findIndex((b) => b.coin === symbol);
        if (coinBalIndex !== -1) {
          const currentBal = wallet.coinBalances[coinBalIndex];
          const totalExistingValue = currentBal.free * (currentBal.avgBuyPrice || executionPrice);
          const newTotalQuantity = currentBal.free + coinAmount;
          const newAvgPrice = (totalExistingValue + inrToSpend) / newTotalQuantity;

          wallet.coinBalances[coinBalIndex].free = Number(newTotalQuantity.toFixed(6));
          wallet.coinBalances[coinBalIndex].avgBuyPrice = Number(newAvgPrice.toFixed(2));
        } else {
          wallet.coinBalances.push({
            coin: symbol,
            free: Number(coinAmount.toFixed(6)),
            locked: 0,
            avgBuyPrice: executionPrice,
          });
        }

        await dbStore.updateWallet(wallet);

        // Record Order
        const order = await dbStore.createOrder({
          userId,
          pair: `${symbol}/INR`,
          side: 'BUY',
          type,
          price: executionPrice,
          quantity: Number(coinAmount.toFixed(6)),
          totalInr: inrToSpend,
          executedQuantity: Number(coinAmount.toFixed(6)),
          fee,
          status: 'FILLED',
        });

        // Record Transaction
        await dbStore.createTransaction({
          userId,
          type: 'SPOT_BUY',
          amount: inrToSpend,
          currency: 'INR',
          fee,
          status: 'COMPLETED',
          metadata: {
            pair: `${symbol}/INR`,
            coinBought: Number(coinAmount.toFixed(6)),
            price: executionPrice,
          },
        });

        // Add Notification
        await dbStore.addNotification({
          userId,
          title: `Spot Buy Executed: ${symbol}`,
          message: `Purchased ${Number(coinAmount.toFixed(6))} ${symbol} at ₹${executionPrice.toLocaleString('en-IN')} (Fee: ₹${fee.toFixed(2)})`,
          type: 'TRADE',
        });

        return res.json({
          success: true,
          message: `Bought ${Number(coinAmount.toFixed(6))} ${symbol} successfully!`,
          order,
          wallet: {
            inrBalance: wallet.inrBalance,
            coinBalances: wallet.coinBalances,
          },
        });
      } else {
        // SELL
        const coinAmountToSell = Number(quantity);
        if (coinAmountToSell <= 0) {
          return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
        }

        const coinBalIndex = wallet.coinBalances.findIndex((b) => b.coin === symbol);
        if (coinBalIndex === -1 || wallet.coinBalances[coinBalIndex].free < coinAmountToSell) {
          const available = coinBalIndex !== -1 ? wallet.coinBalances[coinBalIndex].free : 0;
          return res.status(400).json({
            success: false,
            message: `Insufficient ${symbol} balance. Available: ${available} ${symbol}`,
          });
        }

        const grossInr = coinAmountToSell * executionPrice;
        const fee = grossInr * tradingFeeRate;
        const netInrCredit = grossInr - fee;

        // Deduct Coin
        wallet.coinBalances[coinBalIndex].free = Number(
          (wallet.coinBalances[coinBalIndex].free - coinAmountToSell).toFixed(6)
        );

        // Add Net INR to wallet
        wallet.inrBalance += netInrCredit;

        await dbStore.updateWallet(wallet);

        // Record Order
        const order = await dbStore.createOrder({
          userId,
          pair: `${symbol}/INR`,
          side: 'SELL',
          type,
          price: executionPrice,
          quantity: coinAmountToSell,
          totalInr: grossInr,
          executedQuantity: coinAmountToSell,
          fee,
          status: 'FILLED',
        });

        // Record Transaction
        await dbStore.createTransaction({
          userId,
          type: 'SPOT_SELL',
          amount: netInrCredit,
          currency: 'INR',
          fee,
          status: 'COMPLETED',
          metadata: {
            pair: `${symbol}/INR`,
            coinSold: coinAmountToSell,
            price: executionPrice,
          },
        });

        // Add Notification
        await dbStore.addNotification({
          userId,
          title: `Spot Sell Executed: ${symbol}`,
          message: `Sold ${coinAmountToSell} ${symbol} for ₹${netInrCredit.toLocaleString('en-IN')} (Fee: ₹${fee.toFixed(2)})`,
          type: 'TRADE',
        });

        return res.json({
          success: true,
          message: `Sold ${coinAmountToSell} ${symbol} for ₹${netInrCredit.toLocaleString('en-IN')}`,
          order,
          wallet: {
            inrBalance: wallet.inrBalance,
            coinBalances: wallet.coinBalances,
          },
        });
      }
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const orders = await dbStore.getOrdersByUserId(userId);
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
