import React from 'react';
import { ExerciseQuestion } from '../../../services/lessonService';

interface EssayQuestionProps {
  question: ExerciseQuestion;
  value: string | undefined;
  onChange: (answer: string) => void;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({
  question,
  value = '',
  onChange
}) => {
  const minWords = question.options?.minWords || 50;
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full h-48 p-4 bg-white/5 border-2 border-white/20 rounded-xl text-white
                 placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
      />

      <div className="flex items-center justify-between text-sm">
        <span className={`${wordCount >= minWords ? 'text-green-400' : 'text-white/50'}`}>
          {wordCount} / {minWords} words minimum
        </span>
        {wordCount >= minWords && (
          <span className="text-green-400">✓ Minimum reached</span>
        )}
      </div>
    </div>
  );
};

export default EssayQuestion;
