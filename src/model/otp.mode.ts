import { Schema, model } from 'mongoose';

const OTPSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  code: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['email', 'sms'], 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000) 
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  
  attemptCount: { 
    type: Number, 
    default: 0 
  },
  lastAttemptAt: { 
    type: Date 
  }
}, { timestamps: true });

// Auto-delete expired 
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });