import React from 'react';
import { motion } from 'framer-motion';
import { ExerciseQuestion } from '../../../services/lessonService';

interface MultipleChoiceQuestionProps {
  question: ExerciseQuestion;
  value: string | undefined;
  onChange: (answer: string) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const options = question.options?.options || [];

  return (
    <div className="space-y-3">
      {options.map((option: string, index: number) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option)}
          className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
            value === option
              ? 'bg-cyan-500/30 border-cyan-400 text-white'
              : 'bg-white/5 border-white/20 text-gray-200 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                value === option
                  ? 'border-cyan-400 bg-cyan-400'
                  : 'border-white/40'
              }`}
            >
              {value === option && (
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
      ))}
    </div>
  );
};

export default MultipleChoiceQuestion;
