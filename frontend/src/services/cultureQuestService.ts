import api from './api';
import {
  CultureScenario,
  CultureResponse,
  UserCultureScore,
  RadarDataPoint,
  CultureQuestReward,
  ApiResponse,
} from '@/types';

export const cultureQuestService = {
  async getScenarios(context?: string, limit = 1): Promise<CultureScenario[]> {
    const params = new URLSearchParams();
    if (context) params.append('context', context);
    params.append('limit', limit.toString());

    const { data } = await api.get<ApiResponse<CultureScenario[]>>(
      `/culture-quest/scenarios?${params.toString()}`
    );
    return data.data;
  },

  async submitResponse(response: CultureResponse): Promise<CultureQuestReward> {
    const { data } = await api.post<ApiResponse<CultureQuestReward>>(
      '/culture-quest/response',
      response
    );
    return data.data;
  },

  async getUserScores(): Promise<UserCultureScore[]> {
    const { data } = await api.get<ApiResponse<UserCultureScore[]>>(
      '/culture-quest/scores'
    );
    return data.data;
  },

  async getRadarData(): Promise<{ radarData: RadarDataPoint[]; totalResponses: number }> {
    const { data } = await api.get<
      ApiResponse<{ radarData: RadarDataPoint[]; totalResponses: number }>
    >('/culture-quest/radar');
    return data.data;
  },

  async getDimensionTrend(dimensionId: string, days = 30): Promise<any[]> {
    const { data } = await api.get<ApiResponse<any[]>>(
      `/culture-quest/analytics/trend/${dimensionId}?days=${days}`
    );
    return data.data;
  },
};
