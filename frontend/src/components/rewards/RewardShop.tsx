import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import rewardService, { Reward, UserReward } from '../../services/rewardService';

const RewardShop: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shop' | 'my-rewards'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userCoins, setUserCoins] = useState(0); // This should come from auth context

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory]);

  const loadData = async () => {
    try {
      if (activeTab === 'shop') {
        const category = selectedCategory === 'all' ? undefined : selectedCategory;
        const response = await rewardService.getRewards(category);
        if (response.success) {
          setRewards(response.data);
        }
      } else {
        const response = await rewardService.getUserRewards();
        if (response.success) {
          setMyRewards(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: number, cost: number) => {
    if (userCoins < cost) {
      alert('Insufficient coins!');
      return;
    }

    if (!confirm('Are you sure you want to redeem this reward?')) {
      return;
    }

    try {
      const response = await rewardService.redeemReward(rewardId);
      if (response.success) {
        alert(`Reward redeemed! Your code: ${response.data.redemptionCode}`);
        setUserCoins(prev => prev - cost);
        loadData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to redeem reward');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voucher': return '🎟️';
      case 'physical': return '📦';
      case 'digital': return '💎';
      case 'premium_feature': return '⭐';
      default: return '🎁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'approved': return 'bg-blue-500/20 text-blue-300';
      case 'delivered': return 'bg-green-500/20 text-green-300';
      case 'used': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎁 Reward Shop</h1>
            <p className="text-gray-300">Redeem your coins for amazing rewards!</p>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{userCoins}</div>
              <div className="text-sm text-white/90">💰 Coins</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'shop'
                ? 'bg-white text-orange-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🏪 Shop
          </button>
          <button
            onClick={() => setActiveTab('my-rewards')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'my-rewards'
                ? 'bg-white text-orange-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🎫 My Rewards
          </button>
        </div>

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <>
            {/* Category filter */}
            <div className="flex gap-3 mb-8 overflow-x-auto">
              {['all', 'gift_cards', 'cosmetics', 'subscriptions', 'merchandise'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-white text-orange-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {/* Rewards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl border border-white/20"
                >
                  {/* Reward image */}
                  <div className="h-48 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                    <span className="text-8xl">{getTypeIcon(reward.type)}</span>
                  </div>

                  {/* Reward details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{reward.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="px-3 py-1 bg-yellow-500/20 rounded-full">
                        <span className="text-yellow-300 font-bold">{reward.cost_coins} 💰</span>
                      </div>
                      {reward.stock !== -1 && (
                        <div className="text-sm text-white/70">
                          Stock: {reward.stock}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRedeem(reward.id, reward.cost_coins)}
                      disabled={userCoins < reward.cost_coins || (reward.stock !== -1 && reward.stock <= 0)}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600
                               hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {userCoins < reward.cost_coins ? 'Not Enough Coins' : 'Redeem Now'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {rewards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-2xl text-white/70">No rewards available</p>
                <p className="text-gray-400 mt-2">Check back later for new rewards!</p>
              </div>
            )}
          </>
        )}

        {/* My Rewards Tab */}
        {activeTab === 'my-rewards' && (
          <div className="space-y-6">
            {myRewards.map((userReward) => (
              <motion.div
                key={userReward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
              >
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl
                               flex items-center justify-center text-5xl flex-shrink-0">
                    {getTypeIcon(userReward.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{userReward.name}</h3>
                        <p className="text-gray-300">{userReward.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(userReward.status)}`}>
                        {userReward.status.charAt(0).toUpperCase() + userReward.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Redemption Code:</span>
                        <span className="text-xl font-mono font-bold text-white">{userReward.redemption_code}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-4 text-sm text-white/70">
                      <div>Redeemed: {new Date(userReward.redeemed_at).toLocaleDateString()}</div>
                      {userReward.expires_at && (
                        <div>Expires: {new Date(userReward.expires_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {myRewards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-2xl text-white/70">No rewards yet</p>
                <p className="text-gray-400 mt-2">Start redeeming rewards from the shop!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardShop;
