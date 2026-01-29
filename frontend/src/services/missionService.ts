import api from './api';

export interface Mission {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'achievement';
  icon: string;
  xp_reward: number;
  coin_reward: number;
  badge_reward?: string;
  start_date?: string;
  end_date?: string;
  user_status: 'active' | 'completed' | 'expired';
  progress?: any;
  objectives: MissionObjective[];
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
}

export interface MissionObjective {
  id: number;
  mission_id: number;
  description: string;
  target_type: string;
  target_value: number;
  current_value: number;
  is_completed: boolean;
  order_index: number;
}

const missionService = {
  // Get all user missions
  async getUserMissions(): Promise<{ success: boolean; data: Mission[] }> {
    const response = await api.get('/missions');
    return response.data;
  },

  // Claim mission reward
  async claimMissionReward(missionId: number) {
    const response = await api.post('/missions/claim', { missionId });
    return response.data;
  }
};

export default missionService;
