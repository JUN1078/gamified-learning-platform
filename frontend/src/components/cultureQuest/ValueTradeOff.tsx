import { useState } from 'react';
import { motion } from 'framer-motion';
import { CultureScenario } from '@/types/cultureQuest';
import { cultureQuestService } from '@/services/cultureQuestService';
import { useUIStore } from '@/stores/uiStore';
import { useCharacterStore } from '@/stores/characterStore';

interface ValueTradeOffProps {
  scenario: CultureScenario;
  onComplete: () => void;
}

const ValueTradeOff = ({ scenario, onComplete }: ValueTradeOffProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const { character, setCharacter } = useCharacterStore();

  const handleSelect = async (optionId: number) => {
    setSelectedOption(optionId);
    setIsSubmitting(true);

    try {
      const reward = await cultureQuestService.submitResponse({
        scenarioId: scenario.id,
        optionId,
        contextData: {
          scenarioType: scenario.type,
          timestamp: new Date().toISOString(),
        },
      });

      // Update character XP
      if (character) {
        const updatedCharacter = {
          ...character,
          xp: character.xp + reward.xpEarned,
        };
        setCharacter(updatedCharacter);
      }

      addToast({
        type: 'success',
        title: '✨ Great choice!',
        message: `+${reward.xpEarned} XP earned`,
      });

      setTimeout(onComplete, 1000);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to submit',
        message: error.response?.data?.error || 'Something went wrong',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{scenario.title}</h3>
        <p className="text-white/80">{scenario.description}</p>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-2 gap-4">
        {scenario.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !isSubmitting && handleSelect(option.id)}
            disabled={isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedOption === option.id
                ? 'border-accent-gold bg-accent-gold/20 shadow-lg'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <div className="text-center space-y-3">
              <div className="text-5xl">{option.emoji}</div>
              <div>
                <h4 className="font-semibold text-lg">{option.text}</h4>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {isSubmitting && (
        <p className="text-center text-sm text-white/70">Recording your choice...</p>
      )}

      <p className="text-center text-xs text-white/50">
        Select the value that resonates most with you
      </p>
    </div>
  );
};

export default ValueTradeOff;
