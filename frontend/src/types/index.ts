// ============================================================================
// Core Types
// ============================================================================

export interface User {
  _id: string;
  email: string;
  username: string;
  character: Character;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Character System
// ============================================================================

export type AttributeName =
  | 'leadership'
  | 'creativity'
  | 'communication'
  | 'teamwork'
  | 'problemSolving'
  | 'innovation'
  | 'adaptability'
  | 'technicalSkills'
  | 'criticalThinking'
  | 'empathy'
  | 'resilience'
  | 'strategicThinking';

export interface CharacterAttribute {
  name: AttributeName;
  displayName: string;
  value: number; // 0-10
  level: number; // 1-5
  descriptor: string; // e.g., "Very Strong", "Developing"
  color: string;
}

export interface Character {
  userId: string;
  attributes: Record<AttributeName, number>;
  avatar: Avatar;
  title: string;
  level: number;
  xp: number;
  nextLevelXp: number;
}

export interface Avatar {
  baseCharacter: string; // Character image ID
  sash: string | null;
  badges: string[]; // Badge IDs displayed on avatar
  accessories: string[];
}

// ============================================================================
// Expedition/Mountain System
// ============================================================================

export type MountainId = 'aggressive' | 'respect' | 'innovative' | 'swift' | 'empowered';

export interface Mountain {
  id: MountainId;
  name: string;
  description: string;
  color: string;
  attributes: AttributeName[];
  checkpoints: Checkpoint[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface Checkpoint {
  id: string;
  mountainId: MountainId;
  name: string;
  description: string;
  order: number;
  requiredAttributes: {
    attribute: AttributeName;
    minValue: number;
  }[];
  rewards: Reward[];
  isCompleted: boolean;
}

export interface MountainProgress {
  userId: string;
  mountainId: MountainId;
  currentCheckpoint: number;
  completedCheckpoints: string[];
  completedAt: string | null;
}

// ============================================================================
// Card Collection System
// ============================================================================

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  category: 'attribute' | 'value' | 'achievement' | 'master';
  imageUrl: string;
  relatedAttribute?: AttributeName;
  relatedMountain?: MountainId;
  unlockCriteria: string;
}

export interface UserCard {
  userId: string;
  cardId: string;
  unlockedAt: string;
  count: number; // How many times earned
}

export interface CardAssignment {
  _id: string;
  fromUserId: string;
  toUserId: string;
  cardId: string;
  note?: string;
  createdAt: string;
}

// ============================================================================
// Badge & Achievement System
// ============================================================================

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export interface Badge {
  id: string;
  name: string;
  description: string;
  story: string;
  tier: BadgeTier;
  iconUrl: string;
  category: string;
  unlockCriteria: {
    type: 'attribute' | 'checkpoint' | 'review' | 'card' | 'custom';
    requirement: string;
    count: number;
  };
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  progress: number;
  maxProgress: number;
  tier: BadgeTier;
  unlockedAt: string | null;
}

export interface Achievement {
  _id: string;
  userId: string;
  type: 'badge' | 'checkpoint' | 'card' | 'level' | 'review';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Peer Review System (Phase 2)
// ============================================================================

export interface PeerReview {
  _id: string;
  reviewerId: string;
  revieweeId: string;
  attributes: Record<AttributeName, number>;
  qualitativeFeedback: string;
  assignedCards: string[];
  createdAt: string;
}

export interface ReviewRequest {
  _id: string;
  requesterId: string;
  reviewerId: string;
  status: 'pending' | 'completed' | 'declined';
  dueDate: string;
  createdAt: string;
}

// ============================================================================
// Learning Module System
// ============================================================================

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  type: 'video' | 'quiz' | 'reflection' | 'flashcard' | 'do-dont';
  content: any; // Varies by type
  relatedAttributes: AttributeName[];
  relatedMountain?: MountainId;
  xpReward: number;
}

export interface UserModuleProgress {
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0-100
  completedAt: string | null;
  score?: number;
}

// ============================================================================
// Rewards
// ============================================================================

export interface Reward {
  type: 'xp' | 'card' | 'badge' | 'attribute';
  value: number | string;
  description: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'card-detail' | 'badge-detail' | 'achievement' | 'review' | null;
  data?: any;
}

// ============================================================================
// Constants
// ============================================================================

export const ATTRIBUTE_LABELS: Record<AttributeName, string> = {
  leadership: 'Leadership',
  creativity: 'Creativity',
  communication: 'Communication',
  teamwork: 'Teamwork',
  problemSolving: 'Problem Solving',
  innovation: 'Innovation',
  adaptability: 'Adaptability',
  technicalSkills: 'Technical Skills',
  criticalThinking: 'Critical Thinking',
  empathy: 'Empathy',
  resilience: 'Resilience',
  strategicThinking: 'Strategic Thinking',
};

export const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FFD700',
};

export const BADGE_TIER_REQUIREMENTS = {
  bronze: { min: 1, max: 3 },
  silver: { min: 4, max: 7 },
  gold: { min: 8, max: Infinity },
};
