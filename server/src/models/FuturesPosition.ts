import mongoose, { Schema, Document } from 'mongoose';
import { IFuturesPosition } from '../types';

export interface FuturesPositionDocument extends Omit<IFuturesPosition, '_id'>, Document {}

const FuturesPositionSchema = new Schema<FuturesPositionDocument>(
  {
    userId: { type: String, required: true, index: true },
    pair: { type: String, required: true, uppercase: true },
    side: { type: String, enum: ['LONG', 'SHORT'], required: true },
    entryPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    leverage: { type: Number, required: true },
    margin: { type: Number, required: true },
    marginType: { type: String, enum: ['CROSS', 'ISOLATED'], default: 'ISOLATED' },
    liquidationPrice: { type: Number, required: true },
    takeProfit: { type: Number },
    stopLoss: { type: Number },
    unrealizedPnl: { type: Number, default: 0 },
    realizedPnl: { type: Number, default: 0 },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    closedPrice: { type: Number },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const FuturesPositionModel = mongoose.model<FuturesPositionDocument>('FuturesPosition', FuturesPositionSchema);
