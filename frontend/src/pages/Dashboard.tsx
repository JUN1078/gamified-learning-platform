import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCharacterStore } from '@/stores/characterStore';
import { useExpeditionStore } from '@/stores/expeditionStore';
import { useBadgeStore } from '@/stores/badgeStore';
import { useCardStore } from '@/stores/cardStore';
import { User, Mountain, CreditCard, Award, TrendingUp, Target } from 'lucide-react';
import Card from '@/components/shared/Card';
import ProgressBar from '@/components/shared/ProgressBar';
import AvatarDisplay from '@/components/character/AvatarDisplay';

const Dashboard = () => {
  const { character } = useCharacterStore();
  const { mountains } = useExpeditionStore();
  const { userBadges, achievements } = useBadgeStore();
  const { userCards } = useCardStore();

  // Stats calculations
  const completedMountains = mountains.filter((m) => m.isCompleted).length;
  const unlockedBadges = userBadges.filter((b) => b.unlockedAt !== null).length;
  const collectedCards = userCards.length;
  const recentAchievements = achievements.slice(0, 5);

  const stats = [
    {
      label: 'Character Level',
      value: character?.level || 0,
      icon: User,
      color: 'from-blue-500 to-blue-600',
      link: '/character',
    },
    {
      label: 'Mountains Completed',
      value: `${completedMountains}/${mountains.length}`,
      icon: Mountain,
      color: 'from-green-500 to-green-600',
      link: '/expedition',
    },
    {
      label: 'Cards Collected',
      value: collectedCards,
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600',
      link: '/cards',
    },
    {
      label: 'Badges Unlocked',
      value: unlockedBadges,
      icon: Award,
      color: 'from-yellow-500 to-yellow-600',
      link: '/badges',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg">
            Dashboard
          </h1>
          <p className="text-white/70 mt-1">Track your learning journey</p>
        </div>
      </div>

      {/* Character Overview */}
      {character && (
        <Card>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <AvatarDisplay avatar={character.avatar} size="xl" />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-display font-bold mb-2">{character.title}</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div>
                  <span className="text-sm text-white/70">Level</span>
                  <p className="text-3xl font-bold text-accent-gold">{character.level}</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">XP Progress</span>
                    <span className="font-semibold">
                      {character.xp.toLocaleString()} / {character.nextLevelXp.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    progress={((character.xp % character.nextLevelXp) / character.nextLevelXp) * 100}
                    showLabel={false}
                  />
                </div>
              </div>
              <Link to="/character">
                <button className="btn-primary">View Character</button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card interactive>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Mountains */}
        <Card>
          <h3 className="font-display font-bold text-xl mb-4 flex items-center">
            <Mountain className="w-5 h-5 mr-2 text-accent-gold" />
            Active Expeditions
          </h3>
          <div className="space-y-3">
            {mountains
              .filter((m) => m.isUnlocked && !m.isCompleted)
              .slice(0, 3)
              .map((mountain) => (
                <Link key={mountain.id} to="/expedition">
                  <div className="glass rounded-lg p-3 hover:bg-white/15 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">{mountain.name}</span>
                      <span className="text-xs text-white/70">
                        {Math.round(mountain.progress)}%
                      </span>
                    </div>
                    <ProgressBar progress={mountain.progress} height="sm" />
                  </div>
                </Link>
              ))}
            {mountains.filter((m) => m.isUnlocked && !m.isCompleted).length === 0 && (
              <p className="text-center text-white/50 py-4">
                No active expeditions
              </p>
            )}
          </div>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <h3 className="font-display font-bold text-xl mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-accent-gold" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement._id}
                className="glass rounded-lg p-3"
              >
                <p className="font-semibold text-sm">{achievement.title}</p>
                <p className="text-xs text-white/70">{achievement.description}</p>
              </div>
            ))}
            {recentAchievements.length === 0 && (
              <p className="text-center text-white/50 py-4">
                No achievements yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="font-display font-bold text-xl mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-accent-gold" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/character">
            <button className="btn-secondary w-full">View Character Stats</button>
          </Link>
          <Link to="/expedition">
            <button className="btn-secondary w-full">Continue Expedition</button>
          </Link>
          <Link to="/cards">
            <button className="btn-secondary w-full">Browse Cards</button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
