import mongoose, { Schema, Document } from 'mongoose';

interface ICharacterAttributes {
  leadership: number;
  creativity: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  innovation: number;
  adaptability: number;
  technicalSkills: number;
  criticalThinking: number;
  empathy: number;
  resilience: number;
  strategicThinking: number;
}

interface IAvatar {
  baseCharacter: string;
  sash: string | null;
  badges: string[];
  accessories: string[];
}

export interface ICharacter extends Document {
  userId: mongoose.Types.ObjectId;
  attributes: ICharacterAttributes;
  avatar: IAvatar;
  title: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    attributes: {
      leadership: { type: Number, default: 5, min: 0, max: 10 },
      creativity: { type: Number, default: 5, min: 0, max: 10 },
      communication: { type: Number, default: 5, min: 0, max: 10 },
      teamwork: { type: Number, default: 5, min: 0, max: 10 },
      problemSolving: { type: Number, default: 5, min: 0, max: 10 },
      innovation: { type: Number, default: 5, min: 0, max: 10 },
      adaptability: { type: Number, default: 5, min: 0, max: 10 },
      technicalSkills: { type: Number, default: 5, min: 0, max: 10 },
      criticalThinking: { type: Number, default: 5, min: 0, max: 10 },
      empathy: { type: Number, default: 5, min: 0, max: 10 },
      resilience: { type: Number, default: 5, min: 0, max: 10 },
      strategicThinking: { type: Number, default: 5, min: 0, max: 10 },
    },
    avatar: {
      baseCharacter: { type: String, default: 'default' },
      sash: { type: String, default: null },
      badges: [{ type: String }],
      accessories: [{ type: String }],
    },
    title: { type: String, default: 'Novice Explorer' },
    level: { type: Number, default: 1, min: 1 },
    xp: { type: Number, default: 0, min: 0 },
    nextLevelXp: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  }
);

// Calculate level based on XP
CharacterSchema.methods.calculateLevel = function () {
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  this.nextLevelXp = Math.pow(this.level, 2) * 100;
};

// Update title based on level
CharacterSchema.methods.updateTitle = function () {
  if (this.level >= 50) this.title = 'ARISE Legend';
  else if (this.level >= 40) this.title = 'Master Explorer';
  else if (this.level >= 30) this.title = 'Expert Trailblazer';
  else if (this.level >= 20) this.title = 'Advanced Pathfinder';
  else if (this.level >= 10) this.title = 'Skilled Adventurer';
  else if (this.level >= 5) this.title = 'Aspiring Explorer';
  else this.title = 'Novice Explorer';
};

export default mongoose.model<ICharacter>('Character', CharacterSchema);
