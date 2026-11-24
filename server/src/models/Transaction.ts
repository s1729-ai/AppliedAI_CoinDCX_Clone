import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction } from '../types';

export interface TransactionDocument extends Omit<ITransaction, '_id'>, Document {}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAW', 'SPOT_BUY', 'SPOT_SELL', 'FUTURES_MARGIN', 'FUTURES_PNL', 'TRANSFER'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true },
    fee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED'],
      default: 'COMPLETED',
    },
    txHash: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
