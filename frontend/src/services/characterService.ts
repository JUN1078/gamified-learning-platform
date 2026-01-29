import api from './api';
import { Character, Avatar, ApiResponse, AttributeName } from '@/types';

export const characterService = {
  async getCharacter(): Promise<Character> {
    const { data } = await api.get<ApiResponse<Character>>('/character/attributes');
    return data.data;
  },

  async updateAttributes(
    attributes: Partial<Record<AttributeName, number>>
  ): Promise<Character> {
    const { data } = await api.put<ApiResponse<Character>>(
      '/character/attributes',
      { attributes }
    );
    return data.data;
  },

  async getAvatar(): Promise<Avatar> {
    const { data } = await api.get<ApiResponse<Avatar>>('/character/avatar');
    return data.data;
  },

  async updateAvatar(avatar: Partial<Avatar>): Promise<Avatar> {
    const { data } = await api.put<ApiResponse<Avatar>>(
      '/character/avatar',
      avatar
    );
    return data.data;
  },

  async addXP(amount: number): Promise<Character> {
    const { data } = await api.post<ApiResponse<Character>>(
      '/character/xp',
      { amount }
    );
    return data.data;
  },
};
