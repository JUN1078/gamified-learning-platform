import React from 'react';
import { motion } from 'framer-motion';
import { ExerciseQuestion } from '../../../services/lessonService';

interface CheckboxQuestionProps {
  question: ExerciseQuestion;
  value: string[] | undefined;
  onChange: (answer: string[]) => void;
}

const CheckboxQuestion: React.FC<CheckboxQuestionProps> = ({
  question,
  value = [],
  onChange
}) => {
  const options = question.options?.options || [];

  const toggleOption = (option: string) => {
    const currentValue = value || [];
    if (currentValue.includes(option)) {
      onChange(currentValue.filter(v => v !== option));
    } else {
      onChange([...currentValue, option]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-cyan-300 text-sm mb-4">Select all that apply</p>
      {options.map((option: string, index: number) => {
        const isSelected = value?.includes(option);
        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleOption(option)}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
              isSelected
                ? 'bg-purple-500/30 border-purple-400 text-white'
                : 'bg-white/5 border-white/20 text-gray-200 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-purple-400 bg-purple-400'
                    : 'border-white/40'
                }`}
              >
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="font-semibold">{option}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CheckboxQuestion;
