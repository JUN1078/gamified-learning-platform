import api from './api';

export interface SocialPost {
  id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  user_title?: string;
  user_level?: number;
  post_type: 'achievement' | 'question' | 'discussion' | 'tip';
  content: string;
  media_url?: string;
  related_lesson_id?: number;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  user_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  user_title?: string;
  user_level?: number;
  content: string;
  is_answer: boolean;
  likes_count: number;
  user_liked: boolean;
  created_at: string;
}

const socialService = {
  // Get social feed
  async getFeed(type?: string, limit = 20, offset = 0): Promise<{ success: boolean; data: SocialPost[] }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (type) params.append('type', type);

    const response = await api.get(`/social/feed?${params.toString()}`);
    return response.data;
  },

  // Create a post
  async createPost(postType: string, content: string, mediaUrl?: string, relatedLessonId?: number) {
    const response = await api.post('/social/posts', {
      postType,
      content,
      mediaUrl,
      relatedLessonId
    });
    return response.data;
  },

  // Get comments
  async getComments(postId: number): Promise<{ success: boolean; data: PostComment[] }> {
    const response = await api.get(`/social/posts/${postId}/comments`);
    return response.data;
  },

  // Add comment
  async addComment(postId: number, content: string, isAnswer = false) {
    const response = await api.post('/social/comments', {
      postId,
      content,
      isAnswer
    });
    return response.data;
  },

  // Toggle like
  async toggleLike(targetType: 'post' | 'comment', targetId: number) {
    const response = await api.post('/social/like', {
      targetType,
      targetId
    });
    return response.data;
  }
};

export default socialService;
