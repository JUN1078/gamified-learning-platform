import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonCard } from '../../services/lessonService';

interface ReadLessonViewerProps {
  cards: LessonCard[];
  currentCardIndex: number;
  onCardChange: (index: number) => void;
  onComplete: () => void;
}

const ReadLessonViewer: React.FC<ReadLessonViewerProps> = ({
  cards,
  currentCardIndex,
  onCardChange,
  onComplete
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const currentCard = cards[currentCardIndex];
  const isLastCard = currentCardIndex === cards.length - 1;

  const handleNext = () => {
    if (isLastCard) {
      onComplete();
    } else {
      onCardChange(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      onCardChange(currentCardIndex - 1);
    }
  };

  const toggleCollapsible = (cardId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const renderCardContent = () => {
    switch (currentCard.card_type) {
      case 'cover':
        return (
          <div className="text-center py-12">
            {currentCard.image_url && (
              <img
                src={currentCard.image_url}
                alt={currentCard.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-white mb-4">
              {currentCard.title}
            </h1>
            <p className="text-xl text-gray-300 mb-8">{currentCard.content}</p>
            {currentCard.metadata?.duration && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <span className="text-2xl">⏱️</span>
                <span className="text-white">{currentCard.metadata.duration}</span>
              </div>
            )}
          </div>
        );

      case 'content':
        return (
          <div className="py-8">
            {currentCard.title && (
              <h2 className="text-3xl font-bold text-white mb-6">
                {currentCard.title}
              </h2>
            )}
            {currentCard.image_url && (
              <img
                src={currentCard.image_url}
                alt={currentCard.title}
                className="w-full h-56 object-cover rounded-xl mb-6"
              />
            )}
            <div className="text-lg text-gray-200 leading-relaxed whitespace-pre-line">
              {currentCard.content}
            </div>
          </div>
        );

      case 'collapsible':
        const isExpanded = expandedCards.has(currentCard.id);
        return (
          <div className="py-8">
            <button
              onClick={() => toggleCollapsible(currentCard.id)}
              className="w-full flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <h3 className="text-xl font-bold text-white">{currentCard.title}</h3>
              <span className="text-2xl text-white transform transition-transform"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-white/5 rounded-xl mt-4">
                    <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-line">
                      {currentCard.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'transition':
        return (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">
              {currentCard.metadata?.emoji || '🎉'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {currentCard.title}
            </h2>
            <p className="text-xl text-gray-300">{currentCard.content}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">
              Card {currentCardIndex + 1} of {cards.length}
            </span>
            <span className="text-white/70 text-sm">
              {Math.round(((currentCardIndex + 1) / cards.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Card content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCardIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
          >
            {renderCardContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {cards.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentCardIndex
                    ? 'bg-white w-8'
                    : index < currentCardIndex
                    ? 'bg-cyan-400'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600
                     hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            {isLastCard ? 'Complete' : 'Next'} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadLessonViewer;
