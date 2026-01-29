import { motion } from 'framer-motion';
import { Achievement } from '@/types';
import { Trophy, Award, CreditCard, TrendingUp, Users } from 'lucide-react';
import { getRelativeTime } from '@/utils/helpers';

interface AchievementTimelineProps {
  achievements: Achievement[];
}

const iconMap = {
  badge: Award,
  checkpoint: Trophy,
  card: CreditCard,
  level: TrendingUp,
  review: Users,
};

const AchievementTimeline = ({ achievements }: AchievementTimelineProps) => {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>No achievements yet. Start your journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement, index) => {
        const Icon = iconMap[achievement.type] || Trophy;

        return (
          <motion.div
            key={achievement._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start space-x-4 glass rounded-lg p-4 hover:bg-white/15 transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent-gold" />
              </div>
              {index !== achievements.length - 1 && (
                <div className="w-0.5 h-full bg-white/10 my-2" />
              )}
            </div>

            {/* Achievement content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{achievement.title}</h4>
                  <p className="text-xs text-white/70 mt-1">{achievement.description}</p>
                </div>
                <span className="text-xs text-white/50 flex-shrink-0">
                  {getRelativeTime(achievement.timestamp)}
                </span>
              </div>

              {/* Metadata */}
              {achievement.metadata && Object.keys(achievement.metadata).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(achievement.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 text-xs rounded-full bg-white/10"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AchievementTimeline;
