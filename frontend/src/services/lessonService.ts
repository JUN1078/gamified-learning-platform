import api from './api';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  type: 'read' | 'exercise' | 'exam';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number;
  xp_reward: number;
  coin_reward: number;
  cover_image: string;
  mountain_id: string;
  order_index: number;
  is_locked: boolean;
  user_status: 'not_started' | 'in_progress' | 'completed';
  user_score: number;
  completed_at?: string;
}

export interface LessonCard {
  id: number;
  lesson_id: number;
  card_type: 'cover' | 'content' | 'collapsible' | 'transition' | 'question';
  title?: string;
  content: string;
  image_url?: string;
  order_index: number;
  metadata?: any;
}

export interface ExerciseQuestion {
  id: number;
  lesson_id: number;
  question_type: 'scrabble' | 'slider' | 'drag_drop' | 'multiple_choice' | 'checkbox' | 'essay' | 'swipe' | 'ab_image' | 'ab_option';
  question_text: string;
  question_media?: string;
  correct_answer: any[];
  options?: any;
  hints?: string[];
  explanation?: string;
  order_index: number;
  points: number;
}

export interface LessonDetail extends Lesson {
  cards?: LessonCard[];
  questions?: ExerciseQuestion[];
}

export interface SubmitAnswersResponse {
  success: boolean;
  data: {
    score: number;
    earnedPoints: number;
    totalPoints: number;
    results: any[];
    rewards: {
      xp: number;
      coins: number;
    };
  };
}

const lessonService = {
  // Get all lessons
  async getLessons(mountainId?: string, type?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (mountainId) params.append('mountain_id', mountainId);
    if (type) params.append('type', type);
    if (difficulty) params.append('difficulty', difficulty);

    const response = await api.get(`/lessons?${params.toString()}`);
    return response.data;
  },

  // Get lesson by ID
  async getLessonById(lessonId: number): Promise<{ success: boolean; data: LessonDetail }> {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  },

  // Start a lesson
  async startLesson(lessonId: number) {
    const response = await api.post('/lessons/start', { lessonId });
    return response.data;
  },

  // Update progress (for read lessons)
  async updateProgress(lessonId: number, currentCardIndex: number, timeSpent: number) {
    const response = await api.post('/lessons/progress', {
      lessonId,
      currentCardIndex,
      timeSpent
    });
    return response.data;
  },

  // Submit answers (for exercise/exam lessons)
  async submitAnswers(lessonId: number, answers: any, timeSpent: number): Promise<SubmitAnswersResponse> {
    const response = await api.post('/lessons/submit', {
      lessonId,
      answers,
      timeSpent
    });
    return response.data;
  }
};

export default lessonService;
