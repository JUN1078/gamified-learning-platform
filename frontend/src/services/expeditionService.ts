import api from './api';
import { Mountain, MountainProgress, Checkpoint, ApiResponse } from '@/types';

export const expeditionService = {
  async getAllMountains(): Promise<Mountain[]> {
    const { data } = await api.get<ApiResponse<Mountain[]>>('/mountains');
    return data.data;
  },

  async getMountainProgress(): Promise<Record<string, MountainProgress>> {
    const { data } = await api.get<ApiResponse<Record<string, MountainProgress>>>(
      '/mountains/progress'
    );
    return data.data;
  },

  async getMountain(id: string): Promise<Mountain> {
    const { data } = await api.get<ApiResponse<Mountain>>(`/mountains/${id}`);
    return data.data;
  },

  async completeCheckpoint(
    mountainId: string,
    checkpointId: string
  ): Promise<{ checkpoint: Checkpoint; rewards: any[] }> {
    const { data } = await api.post<
      ApiResponse<{ checkpoint: Checkpoint; rewards: any[] }>
    >('/mountains/checkpoint', {
      mountainId,
      checkpointId,
    });
    return data.data;
  },

  async unlockMountain(mountainId: string): Promise<Mountain> {
    const { data } = await api.post<ApiResponse<Mountain>>(
      `/mountains/${mountainId}/unlock`
    );
    return data.data;
  },
};
