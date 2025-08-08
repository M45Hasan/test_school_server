import { Schema, model } from 'mongoose';

const CertificateSchema = new Schema({
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
    type: Date, 
    required: false 
  },
  pdfUrl: { 
    type: String, 
    required: false 
  },
  verificationCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  }
}, { timestamps: true });


//  code generator
function generateUniqueCode(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

CertificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = generateUniqueCode(); 
  }
  next();
});

const Certificate = model('Certificate', CertificateSchema);
export { Certificate };