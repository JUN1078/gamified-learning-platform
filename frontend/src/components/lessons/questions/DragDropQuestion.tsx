import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExerciseQuestion } from '../../../services/lessonService';

interface DragDropQuestionProps {
  question: ExerciseQuestion;
  value: any[] | undefined;
  onChange: (answer: any[]) => void;
}

const DragDropQuestion: React.FC<DragDropQuestionProps> = ({
  question,
  value = [],
  onChange
}) => {
  const items = question.options?.items || [];
  const targets = question.options?.targets || [];
  const [matches, setMatches] = useState<Record<string, string>>(
    value.reduce((acc, match) => ({ ...acc, [match.item]: match.target }), {})
  );

  const handleMatch = (item: string, target: string) => {
    const newMatches = { ...matches };

    // Remove item from its previous target if any
    if (newMatches[item]) {
      delete newMatches[item];
    }

    // Check if target is already occupied
    const itemInTarget = Object.keys(newMatches).find(key => newMatches[key] === target);
    if (itemInTarget) {
      delete newMatches[itemInTarget];
    }

    // Set new match
    newMatches[item] = target;
    setMatches(newMatches);

    // Convert to array format for answer
    const answerArray = Object.entries(newMatches).map(([item, target]) => ({
      item,
      target
    }));
    onChange(answerArray);
  };

  const unmatchItem = (item: string) => {
    const newMatches = { ...matches };
    delete newMatches[item];
    setMatches(newMatches);

    const answerArray = Object.entries(newMatches).map(([item, target]) => ({
      item,
      target
    }));
    onChange(answerArray);
  };

  const getItemInTarget = (target: string) => {
    return Object.keys(matches).find(item => matches[item] === target);
  };

  return (
    <div className="space-y-6">
      <p className="text-cyan-300 text-sm">Drag items to match them with the correct targets</p>

      {/* Targets (drop zones) */}
      <div className="space-y-3">
        {targets.map((target: string, index: number) => {
          const matchedItem = getItemInTarget(target);

          return (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-white/5 border-2 border-dashed border-white/30 rounded-xl"
            >
              <div className="flex-1 text-white font-semibold">
                {target}
              </div>

              <div className="flex-1">
                {matchedItem ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white
                             font-semibold shadow-lg flex items-center justify-between"
                  >
                    <span>{matchedItem}</span>
                    <button
                      onClick={() => unmatchItem(matchedItem)}
                      className="ml-2 text-white/70 hover:text-white"
                    >
                      ✕
                    </button>
                  </motion.div>
                ) : (
                  <div className="p-3 border-2 border-dashed border-white/20 rounded-lg text-white/50 text-center">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Available items */}
      <div className="border-t-2 border-white/10 pt-6">
        <p className="text-white/70 text-sm mb-3">Available items:</p>
        <div className="flex flex-wrap gap-3">
          {items.map((item: string, index: number) => {
            const isMatched = matches[item] !== undefined;

            if (isMatched) return null;

            return (
              <div key={index} className="relative">
                <div className="p-3 bg-white/10 rounded-lg text-white font-semibold">
                  {item}
                </div>
                <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-bold">
                  ⋮
                </div>

                {/* Quick match buttons */}
                <div className="mt-2 flex flex-col gap-1">
                  {targets.map((target: string, targetIndex: number) => (
                    <button
                      key={targetIndex}
                      onClick={() => handleMatch(item, target)}
                      className="text-xs px-2 py-1 bg-purple-500/20 hover:bg-purple-500/40
                               text-purple-300 rounded transition-colors"
                    >
                      → {target}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {items.every((item: string) => matches[item]) && (
          <p className="text-green-400 text-sm mt-4">✓ All items matched!</p>
        )}
      </div>
    </div>
  );
};

export default DragDropQuestion;
