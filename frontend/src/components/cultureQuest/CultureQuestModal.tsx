import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useCultureQuestStore } from '@/stores/cultureQuestStore';
import { use CultureQuestService } from '@/services/cultureQuestService';
import { useUIStore } from '@/stores/uiStore';
import ScenarioChoice from './ScenarioChoice';
import EmotionCheckIn from './EmotionCheckIn';
import ValueTradeOff from './ValueTradeOff';
import LoadingSpinner from '../shared/LoadingSpinner';

const CultureQuestModal = () => {
  const { questModalOpen, currentScenario, closeQuestModal, isLoading } =
    useCultureQuestStore();
  const addToast = useUIStore((state) => state.addToast);

  if (!questModalOpen) return null;

  const handleClose = () => {
    closeQuestModal();
  };

  const handleSkip = () => {
    addToast({
      type: 'info',
      title: 'Quest Skipped',
      message: 'You can answer this later to earn XP!',
    });
    closeQuestModal();
  };

  const renderQuestContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!currentScenario) {
      return (
        <div className="text-center py-8">
          <p className="text-white/70">No quest available at the moment</p>
          <p className="text-sm text-white/50 mt-2">Check back soon!</p>
        </div>
      );
    }

    switch (currentScenario.type) {
      case 'scenario':
        return <ScenarioChoice scenario={currentScenario} onComplete={handleClose} />;
      case 'emotion':
        return <EmotionCheckIn scenario={currentScenario} onComplete={handleClose} />;
      case 'value_tradeoff':
        return <ValueTradeOff scenario={currentScenario} onComplete={handleClose} />;
      default:
        return <div>Unknown quest type</div>;
    }
  };

  return (
    <AnimatePresence>
      {questModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-accent-gold/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold">Culture Quest</h2>
                  <p className="text-sm text-white/70">Share your thoughts, earn +10 XP</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quest Content */}
            <div>{renderQuestContent()}</div>

            {/* Footer hint */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                💡 Your responses help improve your learning experience
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CultureQuestModal;
