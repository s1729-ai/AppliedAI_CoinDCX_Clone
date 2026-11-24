import mongoose, { Schema, Document } from 'mongoose';
import { IWallet, ICoinBalance } from '../types';

export interface WalletDocument extends Omit<IWallet, '_id'>, Document {}

const CoinBalanceSchema = new Schema<ICoinBalance>(
  {
    coin: { type: String, required: true, uppercase: true },
    free: { type: Number, default: 0 },
    locked: { type: Number, default: 0 },
    avgBuyPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const WalletSchema = new Schema<WalletDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    // Permanent demo account starts with ₹10,00,000 virtual balance
    inrBalance: { type: Number, default: 1000000 },
    coinBalances: { type: [CoinBalanceSchema], default: [] },
    totalDeposited: { type: Number, default: 1000000 },
    totalWithdrawn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema);
