import { motion } from 'framer-motion';
import { Avatar } from '@/types';
import { User } from 'lucide-react';

interface AvatarDisplayProps {
  avatar: Avatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadges?: boolean;
}

const AvatarDisplay = ({ avatar, size = 'md', showBadges = true }: AvatarDisplayProps) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <div className="relative inline-block">
      {/* Avatar Circle */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-accent-gold/30 to-accent-gold/10 border-4 border-accent-gold flex items-center justify-center overflow-hidden`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Placeholder for avatar image */}
        <User className="w-1/2 h-1/2 text-accent-gold" />
      </motion.div>

      {/* Sash/Banner (if equipped) */}
      {avatar.sash && showBadges && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
          {avatar.sash}
        </div>
      )}

      {/* Badge indicators */}
      {showBadges && avatar.badges.length > 0 && size !== 'sm' && (
        <div className="absolute -top-2 -right-2 flex space-x-1">
          {avatar.badges.slice(0, 3).map((badge, index) => (
            <motion.div
              key={badge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="w-6 h-6 rounded-full bg-accent-gold flex items-center justify-center text-xs font-bold text-primary-900 border-2 border-white"
            >
              {index + 1}
            </motion.div>
          ))}
          {avatar.badges.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border-2 border-white">
              +{avatar.badges.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Accessories */}
      {avatar.accessories.length > 0 && (
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3">
          {/* Placeholder for accessories - would render actual accessories */}
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;
