import api from './api';

export interface Reward {
  id: number;
  name: string;
  description: string;
  type: 'voucher' | 'physical' | 'digital' | 'premium_feature';
  image_url?: string;
  cost_coins: number;
  stock: number;
  is_active: boolean;
  category?: string;
  created_at: string;
}

export interface UserReward {
  id: number;
  user_id: number;
  reward_id: number;
  name: string;
  description: string;
  type: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'delivered' | 'used';
  redemption_code: string;
  redeemed_at: string;
  delivered_at?: string;
  expires_at?: string;
}

const rewardService = {
  // Get all rewards
  async getRewards(category?: string, type?: string): Promise<{ success: boolean; data: Reward[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (type) params.append('type', type);

    const response = await api.get(`/rewards?${params.toString()}`);
    return response.data;
  },

  // Get user's redeemed rewards
  async getUserRewards(status?: string): Promise<{ success: boolean; data: UserReward[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await api.get(`/rewards/my-rewards?${params.toString()}`);
    return response.data;
  },

  // Redeem a reward
  async redeemReward(rewardId: number) {
    const response = await api.post('/rewards/redeem', { rewardId });
    return response.data;
  }
};

export default rewardService;
