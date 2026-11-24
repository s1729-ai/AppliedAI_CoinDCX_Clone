import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from '../types';

export interface OrderDocument extends Omit<IOrder, '_id'>, Document {}

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: { type: String, required: true, index: true },
    pair: { type: String, required: true, uppercase: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    type: { type: String, enum: ['MARKET', 'LIMIT'], required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalInr: { type: Number, required: true },
    executedQuantity: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    status: { type: String, enum: ['OPEN', 'FILLED', 'CANCELLED'], default: 'FILLED' },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);
