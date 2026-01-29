import { Card as CardType, UserCard } from '@/types';
import TradingCard from './TradingCard';
import { motion } from 'framer-motion';

interface CardGridProps {
  cards: CardType[];
  userCards: UserCard[];
  onCardClick?: (card: CardType) => void;
}

const CardGrid = ({ cards, userCards, onCardClick }: CardGridProps) => {
  const getCardCount = (cardId: string) => {
    const userCard = userCards.find((c) => c.cardId === cardId);
    return userCard?.count || 0;
  };

  // Group cards by rarity
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.rarity]) acc[card.rarity] = [];
    acc[card.rarity].push(card);
    return acc;
  }, {} as Record<string, CardType[]>);

  const rarityOrder: Array<'legendary' | 'epic' | 'rare' | 'common'> = ['legendary', 'epic', 'rare', 'common'];

  return (
    <div className="space-y-8">
      {rarityOrder.map((rarity) => {
        const rarityCards = groupedCards[rarity] || [];
        if (rarityCards.length === 0) return null;

        return (
          <motion.div
            key={rarity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <h3 className="font-display font-bold text-xl capitalize">{rarity}</h3>
              <div className={`w-12 h-1 rounded-full rarity-${rarity}`} />
              <span className="text-sm text-white/50">
                {rarityCards.filter((c) => getCardCount(c.id) > 0).length} / {rarityCards.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {rarityCards.map((card, index) => {
                const count = getCardCount(card.id);
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: count > 0 ? 1 : 0.4, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TradingCard
                      card={card}
                      count={count}
                      onClick={() => onCardClick?.(card)}
                      size="md"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CardGrid;
