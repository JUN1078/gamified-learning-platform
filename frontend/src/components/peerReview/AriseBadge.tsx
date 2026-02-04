import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { AriseBadge as AriseBadgeType } from '@/types';
import Card from '@/components/shared/Card';

interface AriseBadgeProps {
  badge: AriseBadgeType;
  earnedAt: string;
}

const AriseBadge = ({ badge, earnedAt }: AriseBadgeProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reviewer':
        return 'from-blue-500 to-blue-600';
      case 'dimension_master':
        return 'from-purple-500 to-purple-600';
      case 'special':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="text-center h-full group cursor-pointer">
        <div className="p-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${getCategoryColor(
              badge.category
            )} flex items-center justify-center text-3xl shadow-lg group-hover:shadow-xl transition-shadow`}
          >
            {badge.icon || <Award className="w-8 h-8 text-white" />}
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-sm mb-2">{badge.name}</h3>

          {/* Description */}
          <p className="text-xs text-white/70 mb-3 line-clamp-2">{badge.description}</p>

          {/* Earned Date */}
          <p className="text-xs text-accent-gold">
            {new Date(earnedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default AriseBadge;
