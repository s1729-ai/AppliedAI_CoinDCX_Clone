import mongoose, { Schema, Document } from 'mongoose';
import { ICoin } from '../types';

export interface CoinDocument extends Omit<ICoin, '_id'>, Document {}

const CoinSchema = new Schema<CoinDocument>(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    baseAsset: { type: String, required: true, uppercase: true },
    quoteAsset: { type: String, default: 'INR', uppercase: true },
    lastPrice: { type: Number, required: true },
    change24h: { type: Number, default: 0 },
    high24h: { type: Number, default: 0 },
    low24h: { type: Number, default: 0 },
    volume24h: { type: Number, default: 0 },
    marketCap: { type: Number, default: 0 },
    circulatingSupply: { type: Number, default: 0 },
    description: { type: String, default: '' },
    isListed: { type: Boolean, default: true },
    sparkline: { type: [Number], default: [] },
  },
  { timestamps: true }
);

export const CoinModel = mongoose.model<CoinDocument>('Coin', CoinSchema);
