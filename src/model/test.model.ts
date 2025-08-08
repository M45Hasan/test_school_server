import { Schema, model } from 'mongoose';

const TestSchema = new Schema({
  step: { 
    type: Number, 
    enum: [1, 2, 3], 
    required: true 
  },
  levelsCovered: { 
    type: [String], 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true,
    validate: {
      validator: function(this: any, levels: string[]) {
        const stepToLevels: { [key: number]: string[] } = {
          1: ['A1', 'A2'],
          2: ['B1', 'B2'],
          3: ['C1', 'C2']
        };
        return (
          Array.isArray(levels) &&
          Array.isArray(stepToLevels[this.step]) &&
          JSON.stringify(levels.slice().sort()) === JSON.stringify(stepToLevels[this.step].slice().sort())
        );
      },
      message: 'Levels must match the step: Step 1 → A1/A2, Step 2 → B1/B2, Step 3 → C1/C2'
    }
  },
  totalQuestions: { 
    type: Number, 
    default: 44,
    validate: [(v: number) => v % 2 === 0, 'Questions must be even for level balance']
  },
  passingThreshold: { 
    type: Number, 
    default: 25,
    min: 0,
    max: 100 
  },
  duration: {  
    type: Number, 
    required: true,
    min: 5,   
    max: 180   
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

const Test = model('Test', TestSchema);
export { Test };