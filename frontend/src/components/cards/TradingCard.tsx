import { motion } from 'framer-motion';
import { Card as CardType } from '@/types';
import { Sparkles } from 'lucide-react';
import { getRarityColor } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

interface TradingCardProps {
  card: CardType;
  count?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const TradingCard = ({ card, count, onClick, size = 'md' }: TradingCardProps) => {
  const rarityColor = getRarityColor(card.rarity);

  const sizeClasses = {
    sm: 'w-32 h-44',
    md: 'w-40 h-56',
    lg: 'w-48 h-64',
  };

  const isLegendary = card.rarity === 'legendary';

  return (
    <motion.div
      className={cn(
        'relative rounded-xl overflow-hidden cursor-pointer group',
        sizeClasses[size],
        isLegendary && 'animate-glow'
      )}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ perspective: '1000px' }}
    >
      {/* Card border/glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${rarityColor}40, ${rarityColor}10)`,
          border: `2px solid ${rarityColor}`,
        }}
      />

      {/* Card content */}
      <div className="relative h-full p-4 flex flex-col bg-gradient-to-br from-primary-800 to-primary-900">
        {/* Rarity indicator */}
        <div className="absolute top-2 right-2">
          <Sparkles
            className="w-5 h-5"
            style={{ color: rarityColor }}
          />
        </div>

        {/* Count badge */}
        {count !== undefined && count > 1 && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-accent-gold text-primary-900 flex items-center justify-center text-xs font-bold">
            ×{count}
          </div>
        )}

        {/* Card image placeholder */}
        <div className="flex-1 flex items-center justify-center mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: `radial-gradient(circle, ${rarityColor}30, transparent)`,
            }}
          >
            {/* Placeholder - would be actual card image */}
            {card.category === 'master' ? '👑' : '⭐'}
          </div>
        </div>

        {/* Card info */}
        <div className="space-y-1">
          <div
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: rarityColor }}
          >
            {card.rarity}
          </div>
          <h3 className="font-display font-bold text-sm leading-tight">
            {card.name}
          </h3>
          <p className="text-xs text-white/60 line-clamp-2">
            {card.description}
          </p>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-full group-hover:translate-x-full duration-700" />
      </div>
    </motion.div>
  );
};

export default TradingCard;
