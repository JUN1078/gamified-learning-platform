import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExerciseQuestion } from '../../../services/lessonService';

interface ScrabbleQuestionProps {
  question: ExerciseQuestion;
  value: string | undefined;
  onChange: (answer: string) => void;
}

const ScrabbleQuestion: React.FC<ScrabbleQuestionProps> = ({
  question,
  value = '',
  onChange
}) => {
  const letters = question.options?.letters || [];
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);

  useEffect(() => {
    const word = selectedLetters.map(index => letters[index]).join('');
    onChange(word);
  }, [selectedLetters]);

  const selectLetter = (index: number) => {
    if (!selectedLetters.includes(index)) {
      setSelectedLetters([...selectedLetters, index]);
    }
  };

  const removeLetter = (position: number) => {
    const newSelected = [...selectedLetters];
    newSelected.splice(position, 1);
    setSelectedLetters(newSelected);
  };

  const reset = () => {
    setSelectedLetters([]);
    onChange('');
  };

  return (
    <div className="space-y-6">
      {/* Answer area */}
      <div className="min-h-[80px] p-4 bg-white/5 border-2 border-white/20 rounded-xl">
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedLetters.length === 0 ? (
            <span className="text-white/50 text-lg">Tap letters below to form the word</span>
          ) : (
            selectedLetters.map((letterIndex, position) => (
              <motion.button
                key={`selected-${position}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeLetter(position)}
                className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg
                         text-white text-2xl font-bold shadow-lg"
              >
                {letters[letterIndex]}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Available letters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {letters.map((letter: string, index: number) => (
          <motion.button
            key={index}
            whileHover={{ scale: selectedLetters.includes(index) ? 1 : 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => selectLetter(index)}
            disabled={selectedLetters.includes(index)}
            className={`w-14 h-14 rounded-lg text-2xl font-bold shadow-lg transition-all ${
              selectedLetters.includes(index)
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Reset button */}
      {selectedLetters.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                     font-semibold transition-all"
          >
            Reset
          </button>
        </div>
      )}

      {/* Scrambled word hint */}
      <div className="text-center">
        <p className="text-white/50 text-sm">
          Scrambled: <span className="font-mono text-white/70">{question.options?.scrambled}</span>
        </p>
      </div>
    </div>
  );
};

export default ScrabbleQuestion;
