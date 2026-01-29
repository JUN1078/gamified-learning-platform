import { useState } from 'react';
import { motion } from 'framer-motion';
import { CultureScenario } from '@/types/cultureQuest';
import { cultureQuestService } from '@/services/cultureQuestService';
import { useUIStore } from '@/stores/uiStore';
import { useCharacterStore } from '@/stores/characterStore';

interface EmotionCheckInProps {
  scenario: CultureScenario;
  onComplete: () => void;
}

const EmotionCheckIn = ({ scenario, onComplete }: EmotionCheckInProps) => {
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
        title: '🎉 Thanks for sharing!',
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

      {/* Emoji Options */}
      <div className="flex justify-center items-center space-x-4">
        {scenario.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isSubmitting && handleSelect(option.id)}
            disabled={isSubmitting}
            className={`relative group ${
              selectedOption === option.id ? 'selected' : ''
            }`}
          >
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-4xl transition-all ${
                selectedOption === option.id
                  ? 'bg-accent-gold/30 ring-4 ring-accent-gold'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {option.emoji}
            </div>
            <p className="mt-2 text-xs text-center text-white/70 group-hover:text-white transition-colors">
              {option.text}
            </p>
          </motion.button>
        ))}
      </div>

      {isSubmitting && (
        <p className="text-center text-sm text-white/70">Saving your response...</p>
      )}
    </div>
  );
};

export default EmotionCheckIn;
