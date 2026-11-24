import mongoose, { Schema, Document } from 'mongoose';
import { IWatchlist } from '../types';

export interface WatchlistDocument extends Omit<IWatchlist, '_id'>, Document {}

const WatchlistSchema = new Schema<WatchlistDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    symbols: { type: [String], default: ['BTC', 'ETH', 'SOL'] },
  },
  { timestamps: true }
);

export const WatchlistModel = mongoose.model<WatchlistDocument>('Watchlist', WatchlistSchema);
