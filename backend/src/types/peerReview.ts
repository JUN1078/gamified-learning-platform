export interface AriseDimension {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  mountain_id: string | null;
  order_index: number;
  created_at: Date;
}

export interface AriseStatement {
  id: number;
  dimension_id: string;
  statement_text: string;
  statement_type: 'positive' | 'negative';
  order_index: number;
  is_active: boolean;
  created_at: Date;
}

export interface PeerReview {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  review_cycle: string | null;
  overall_comment: string | null;
  status: 'draft' | 'submitted' | 'acknowledged';
  submitted_at: Date;
  updated_at: Date;
}

export interface PeerReviewRating {
  id: number;
  review_id: number;
  statement_id: number;
  dimension_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: Date;
}

export interface UserAriseScore {
  id: number;
  user_id: number;
  dimension_id: string;
  average_score: number;
  total_reviews: number;
  last_review_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AriseBadge {
  id: number;
  name: string;
  description: string;
  badge_type: 'dimension_master' | 'reviewer_active' | 'team_player' | 'growth' | 'special';
  dimension_id: string | null;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: Record<string, any>;
  xp_reward: number;
  coin_reward: number;
  is_active: boolean;
  created_at: Date;
}

export interface UserAriseBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: Date;
  progress_data: Record<string, any> | null;
}

export interface AriseLearningModule {
  id: number;
  dimension_id: string;
  title: string;
  module_type: 'flashcard' | 'do_dont' | 'quiz' | 'scenario' | 'reflection';
  content: Record<string, any>;
  estimated_duration: number;
  xp_reward: number;
  order_index: number;
  is_active: boolean;
  created_at: Date;
}

export interface UserAriseLearningProgress {
  id: number;
  user_id: number;
  module_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  time_spent: number;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// DTOs for API requests/responses

export interface SubmitPeerReviewRequest {
  reviewee_id: number;
  review_cycle?: string;
  overall_comment?: string;
  ratings: Array<{
    statement_id: number;
    dimension_id: string;
    rating: number;
    comment?: string;
  }>;
}

export interface PeerReviewWithDetails extends PeerReview {
  reviewer_name: string;
  reviewer_email: string;
  reviewee_name: string;
  reviewee_email: string;
  ratings?: PeerReviewRating[];
}

export interface AriseRadarData {
  dimensions: Array<{
    dimension: string;
    score: number;
    total_reviews: number;
    color: string;
    icon: string;
  }>;
  overall_average: number;
}

export interface ReviewJourney {
  user_id: number;
  total_reviews_received: number;
  total_reviews_given: number;
  reviews: Array<{
    id: number;
    reviewer_name: string;
    submitted_at: Date;
    dimension_scores: Record<string, number>;
  }>;
  score_history: Array<{
    dimension_id: string;
    dimension_name: string;
    scores_over_time: Array<{
      review_date: Date;
      score: number;
    }>;
  }>;
}

export interface EmployeeListItem {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  level: number;
  title: string;
  has_reviewed: boolean;
  last_reviewed_at: Date | null;
  average_arise_score: number | null;
}
