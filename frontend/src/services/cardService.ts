import api from './api';
import { Card, UserCard, CardAssignment, ApiResponse, PaginatedResponse } from '@/types';

export const cardService = {
  async getAllCards(): Promise<Card[]> {
    const { data } = await api.get<ApiResponse<Card[]>>('/cards');
    return data.data;
  },

  async getUserCards(): Promise<UserCard[]> {
    const { data } = await api.get<ApiResponse<UserCard[]>>('/cards/collection');
    return data.data;
  },

  async getAvailableCards(): Promise<Card[]> {
    const { data } = await api.get<ApiResponse<Card[]>>('/cards/available');
    return data.data;
  },

  async assignCard(
    toUserId: string,
    cardId: string,
    note?: string
  ): Promise<CardAssignment> {
    const { data } = await api.post<ApiResponse<CardAssignment>>(
      '/cards/assign',
      { toUserId, cardId, note }
    );
    return data.data;
  },

  async getCardAssignments(page = 1, limit = 10): Promise<PaginatedResponse<CardAssignment>> {
    const { data } = await api.get<PaginatedResponse<CardAssignment>>(
      `/cards/assignments?page=${page}&limit=${limit}`
    );
    return data;
  },

  async unlockCard(cardId: string): Promise<UserCard> {
    const { data } = await api.post<ApiResponse<UserCard>>(
      '/cards/unlock',
      { cardId }
    );
    return data.data;
  },
};
