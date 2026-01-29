import { motion } from 'framer-motion';
import { Badge as BadgeType, UserBadge } from '@/types';
import { Award, Lock } from 'lucide-react';
import { getBadgeTierColor } from '@/utils/helpers';
import { cn } from '@/utils/helpers';
import ProgressBar from '@/components/shared/ProgressBar';
import Badge from '@/components/shared/Badge';

interface BadgeCardProps {
  badge: BadgeType;
  userBadge?: UserBadge;
  onClick?: () => void;
}

const BadgeCard = ({ badge, userBadge, onClick }: BadgeCardProps) => {
  const isUnlocked = userBadge?.unlockedAt !== null && userBadge !== undefined;
  const progress = userBadge ? (userBadge.progress / userBadge.maxProgress) * 100 : 0;
  const tierColor = getBadgeTierColor(badge.tier);

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.03, y: -5 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      className={cn(
        'card-interactive',
        !isUnlocked && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Badge icon */}
        <div className="relative">
          <motion.div
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center border-4',
              isUnlocked ? 'border-accent-gold' : 'border-white/20'
            )}
            style={{
              background: isUnlocked
                ? `radial-gradient(circle, ${tierColor}40, transparent)`
                : 'rgba(255, 255, 255, 0.1)',
            }}
            animate={isUnlocked ? {
              boxShadow: [
                `0 0 20px ${tierColor}40`,
                `0 0 30px ${tierColor}60`,
                `0 0 20px ${tierColor}40`,
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isUnlocked ? (
              <Award className="w-12 h-12" style={{ color: tierColor }} />
            ) : (
              <Lock className="w-12 h-12 text-white/30" />
            )}
          </motion.div>

          {/* Tier badge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <Badge tier={badge.tier} size="sm">
              {badge.tier}
            </Badge>
          </div>
        </div>

        {/* Badge info */}
        <div className="space-y-2 w-full">
          <h3 className="font-display font-bold text-lg">{badge.name}</h3>
          <p className="text-sm text-white/70 line-clamp-2">{badge.description}</p>

          {/* Progress (if not unlocked) */}
          {!isUnlocked && userBadge && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/50">
                <span>Progress</span>
                <span>{userBadge.progress} / {userBadge.maxProgress}</span>
              </div>
              <ProgressBar progress={progress} height="sm" />
            </div>
          )}

          {/* Category */}
          <div className="flex justify-center">
            <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70">
              {badge.category}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BadgeCard;
