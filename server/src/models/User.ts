import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isKycVerified: { type: Boolean, default: true }, // Verified Demo Account
    demoNoticeAcknowledged: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
