import mongoose, { Schema, Document } from 'mongoose';
import { IPriceAlert } from '../types';

export interface PriceAlertDocument extends Omit<IPriceAlert, '_id'>, Document {}

const PriceAlertSchema = new Schema<PriceAlertDocument>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    targetPrice: { type: Number, required: true },
    condition: { type: String, enum: ['ABOVE', 'BELOW'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PriceAlertModel = mongoose.model<PriceAlertDocument>('PriceAlert', PriceAlertSchema);
