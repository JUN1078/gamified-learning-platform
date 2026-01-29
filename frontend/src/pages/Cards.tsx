import { useEffect, useState } from 'react';
import { useCardStore } from '@/stores/cardStore';
import { cardService } from '@/services/cardService';
import { Card as CardType } from '@/types';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import CardGrid from '@/components/cards/CardGrid';
import TradingCard from '@/components/cards/TradingCard';
import { CreditCard, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cards = () => {
  const { allCards, userCards, isLoading, setAllCards, setUserCards, setLoading, getCardCount } = useCardStore();
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const [cards, userCardsData] = await Promise.all([
          cardService.getAllCards(),
          cardService.getUserCards(),
        ]);
        setAllCards(cards);
        setUserCards(userCardsData);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const filteredCards = allCards.filter((card) => {
    const matchesRarity = filterRarity === 'all' || card.rarity === filterRarity;
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRarity && matchesSearch;
  });

  const collectionStats = {
    total: allCards.length,
    collected: userCards.length,
    percentage: allCards.length > 0 ? Math.round((userCards.length / allCards.length) * 100) : 0,
    byRarity: {
      common: allCards.filter((c) => c.rarity === 'common' && getCardCount(c.id) > 0).length,
      rare: allCards.filter((c) => c.rarity === 'rare' && getCardCount(c.id) > 0).length,
      epic: allCards.filter((c) => c.rarity === 'epic' && getCardCount(c.id) > 0).length,
      legendary: allCards.filter((c) => c.rarity === 'legendary' && getCardCount(c.id) > 0).length,
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg flex items-center">
          <CreditCard className="w-10 h-10 mr-3 text-accent-gold" />
          Card Collection
        </h1>
        <p className="text-white/70 mt-1">
          Collect and trade digital cards representing your achievements
        </p>
      </div>

      {/* Collection Stats */}
      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Collection Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass rounded-lg p-4 text-center col-span-2 md:col-span-1">
            <p className="text-4xl font-bold text-accent-gold">{collectionStats.percentage}%</p>
            <p className="text-sm text-white/70 mt-1">Complete</p>
            <p className="text-xs text-white/50 mt-1">
              {collectionStats.collected} / {collectionStats.total}
            </p>
          </div>
          <div className="glass rounded-lg p-4 text-center rarity-common">
            <p className="text-2xl font-bold">{collectionStats.byRarity.common}</p>
            <p className="text-sm text-white/70 mt-1">Common</p>
          </div>
          <div className="glass rounded-lg p-4 text-center rarity-rare">
            <p className="text-2xl font-bold">{collectionStats.byRarity.rare}</p>
            <p className="text-sm text-white/70 mt-1">Rare</p>
          </div>
          <div className="glass rounded-lg p-4 text-center rarity-epic">
            <p className="text-2xl font-bold">{collectionStats.byRarity.epic}</p>
            <p className="text-sm text-white/70 mt-1">Epic</p>
          </div>
          <div className="glass rounded-lg p-4 text-center rarity-legendary">
            <p className="text-2xl font-bold">{collectionStats.byRarity.legendary}</p>
            <p className="text-sm text-white/70 mt-1">Legendary</p>
          </div>
        </div>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-white/70" />
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/50 outline-none transition-all"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* Card Grid */}
      <CardGrid
        cards={filteredCards}
        userCards={userCards}
        onCardClick={setSelectedCard}
      />

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative glass-strong rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <TradingCard
                    card={selectedCard}
                    count={getCardCount(selectedCard.id)}
                    size="lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-2">{selectedCard.name}</h2>
                    <p className="text-white/70">{selectedCard.description}</p>
                  </div>
                  <div className="glass rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="text-white/70">Rarity:</span> <span className="capitalize font-semibold">{selectedCard.rarity}</span></p>
                    <p className="text-sm"><span className="text-white/70">Category:</span> <span className="capitalize">{selectedCard.category}</span></p>
                    <p className="text-sm"><span className="text-white/70">Owned:</span> <span className="font-semibold">{getCardCount(selectedCard.id)}</span></p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-white/70 mb-1">Unlock Criteria</p>
                    <p className="text-sm">{selectedCard.unlockCriteria}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="btn-primary w-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cards;
