import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import missionService, { Mission } from '../../services/missionService';

const MissionDashboard: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const response = await missionService.getUserMissions();
      if (response.success) {
        setMissions(response.data);
      }
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (missionId: number) => {
    try {
      const response = await missionService.claimMissionReward(missionId);
      if (response.success) {
        // Reload missions to update UI
        loadMissions();
        // Show success notification
        alert(`Rewards claimed! +${response.rewards.xp} XP, +${response.rewards.coins} coins`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to claim reward');
    }
  };

  const filteredMissions = selectedType === 'all'
    ? missions
    : missions.filter(m => m.type === selectedType);

  const getMissionTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'from-orange-400 to-red-500';
      case 'weekly': return 'from-purple-400 to-pink-500';
      case 'special': return 'from-yellow-400 to-orange-500';
      case 'achievement': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading missions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Missions</h1>
          <p className="text-gray-300">Complete missions to earn extra rewards!</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {['all', 'daily', 'weekly', 'special', 'achievement'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedType === type
                  ? 'bg-white text-purple-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Missions grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMissions.map((mission) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
            >
              {/* Mission header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{mission.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                                   bg-gradient-to-r ${getMissionTypeColor(mission.type)} text-white mt-1`}>
                      {mission.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                {mission.user_status === 'completed' && (
                  <span className="text-3xl">✓</span>
                )}
              </div>

              <p className="text-gray-300 mb-4">{mission.description}</p>

              {/* Objectives */}
              <div className="space-y-3 mb-4">
                {mission.objectives.map((objective) => (
                  <div key={objective.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">{objective.description}</span>
                      <span className={`font-semibold ${
                        objective.is_completed ? 'text-green-400' : 'text-white/70'
                      }`}>
                        {objective.current_value}/{objective.target_value}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          objective.is_completed
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((objective.current_value / objective.target_value) * 100, 100)}%`
                        }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 rounded-lg">
                  <span>⭐</span>
                  <span className="text-white font-semibold">{mission.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg">
                  <span>💰</span>
                  <span className="text-white font-semibold">{mission.coin_reward} Coins</span>
                </div>
              </div>

              {/* Progress bar and action */}
              <div>
                {mission.user_status === 'completed' ? (
                  <button
                    onClick={() => handleClaimReward(mission.id)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600
                             hover:from-green-600 hover:to-emerald-700 text-white rounded-xl
                             font-semibold transition-all shadow-lg"
                  >
                    Claim Rewards 🎁
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-white/70">Overall Progress</span>
                      <span className="text-white font-semibold">{mission.progress_percentage}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                        style={{ width: `${mission.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {mission.expires_at && (
                  <p className="text-xs text-white/50 mt-2 text-center">
                    Expires: {new Date(mission.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-white/70">No missions available</p>
            <p className="text-gray-400 mt-2">Check back later for new missions!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDashboard;
