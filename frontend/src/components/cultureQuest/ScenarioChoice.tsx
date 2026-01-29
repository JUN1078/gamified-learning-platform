import { useState } from 'react';
import { motion } from 'framer-motion';
import { CultureScenario } from '@/types/cultureQuest';
import { cultureQuestService } from '@/services/cultureQuestService';
import { useUIStore } from '@/stores/uiStore';
import { useCharacterStore } from '@/stores/characterStore';
import Button from '../shared/Button';

interface ScenarioChoiceProps {
  scenario: CultureScenario;
  onComplete: () => void;
}

const ScenarioChoice = ({ scenario, onComplete }: ScenarioChoiceProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const { character, setCharacter } = useCharacterStore();

  const handleSubmit = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    try {
      const reward = await cultureQuestService.submitResponse({
        scenarioId: scenario.id,
        optionId: selectedOption,
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
        title: '🎉 Quest Completed!',
        message: `+${reward.xpEarned} XP earned`,
      });

      setTimeout(onComplete, 1000);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Failed to submit',
        message: error.response?.data?.error || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{scenario.title}</h3>
        <p className="text-white/80">{scenario.description}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {scenario.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedOption(option.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedOption === option.id
                ? 'border-accent-gold bg-accent-gold/20'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start space-x-3">
              {option.label && (
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">
                  {option.label}
                </span>
              )}
              <p className="flex-1">{option.text}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        className="w-full"
        onClick={handleSubmit}
        disabled={!selectedOption || isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
      </Button>
    </div>
  );
};

export default ScenarioChoice;
