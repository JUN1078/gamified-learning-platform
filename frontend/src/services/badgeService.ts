import api from './api';
import { Badge, UserBadge, Achievement, ApiResponse, PaginatedResponse } from '@/types';

export const badgeService = {
  async getAllBadges(): Promise<Badge[]> {
    const { data } = await api.get<ApiResponse<Badge[]>>('/badges');
    return data.data;
  },

  async getUserBadges(): Promise<UserBadge[]> {
    const { data } = await api.get<ApiResponse<UserBadge[]>>('/badges/user');
    return data.data;
  },

  async getAchievements(page = 1, limit = 20): Promise<PaginatedResponse<Achievement>> {
    const { data} = await api.get<PaginatedResponse<Achievement>>(
      `/achievements?page=${page}&limit=${limit}`
    );
    return data;
  },

  async getAchievementTimeline(): Promise<Achievement[]> {
    const { data } = await api.get<ApiResponse<Achievement[]>>(
      '/achievements/timeline'
    );
    return data.data;
  },

  async unlockBadge(badgeId: string): Promise<UserBadge> {
    const { data } = await api.post<ApiResponse<UserBadge>>(
      '/badges/unlock',
      { badgeId }
    );
    return data.data;
  },
};
