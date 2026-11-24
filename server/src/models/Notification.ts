import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../types';

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'TRADE', 'PRICE_ALERT'],
      default: 'INFO',
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<NotificationDocument>('Notification', NotificationSchema);
