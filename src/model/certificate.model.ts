import { Document, Schema, model, Types } from 'mongoose';
import { IUser } from './user.model';
import { TestAttemptDocument } from './attem.model';


export type CertificateLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CertificateDocument extends Document {
  user: Types.ObjectId | IUser;
  testAttempt: Types.ObjectId |TestAttemptDocument ;
  level: CertificateLevel;
  issuedAt: Date;
  expiresAt?: Date;
  pdfUrl?: string;
  verificationCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<CertificateDocument>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    testAttempt: { 
      type: Schema.Types.ObjectId, 
      ref: 'TestAttempt', 
      required: true 
    },
    level: { 
      type: String, 
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 
      required: true 
    },
    issuedAt: { 
      type: Date, 
      default: Date.now 
    },
    expiresAt: { 
      type: Date 
    },
    pdfUrl: { 
      type: String 
    },
    verificationCode: { 
      type: String, 
      unique: true, 
      sparse: true 
    }
  }, 
  { timestamps: true }
);

//verification code
const generateUniqueCode = (): string => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

// code generation
CertificateSchema.pre<CertificateDocument>('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = generateUniqueCode();
  }
  next();
});

export const Certificate = model<CertificateDocument>('Certificate', CertificateSchema);