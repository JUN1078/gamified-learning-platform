import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExerciseQuestion } from '../../services/lessonService';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import CheckboxQuestion from './questions/CheckboxQuestion';
import DragDropQuestion from './questions/DragDropQuestion';
import ScrabbleQuestion from './questions/ScrabbleQuestion';
import EssayQuestion from './questions/EssayQuestion';

interface ExerciseLessonViewerProps {
  questions: ExerciseQuestion[];
  onSubmit: (answers: Record<number, any>) => void;
  onBack: () => void;
}

const ExerciseLessonViewer: React.FC<ExerciseLessonViewerProps> = ({
  questions,
  onSubmit,
  onBack
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const totalAnswered = Object.keys(answers).length;

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit all answers
      onSubmit(answers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHint(false);
    }
  };

  const renderQuestion = () => {
    const commonProps = {
      question: currentQuestion,
      value: answers[currentQuestion.id],
      onChange: (answer: any) => handleAnswerChange(currentQuestion.id, answer)
    };

    switch (currentQuestion.question_type) {
      case 'multiple_choice':
        return <MultipleChoiceQuestion {...commonProps} />;
      case 'checkbox':
        return <CheckboxQuestion {...commonProps} />;
      case 'drag_drop':
        return <DragDropQuestion {...commonProps} />;
      case 'scrabble':
        return <ScrabbleQuestion {...commonProps} />;
      case 'essay':
        return <EssayQuestion {...commonProps} />;
      default:
        return <div className="text-white">Question type not supported yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div className="text-white/70 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 mb-6"
        >
          {/* Question header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-white flex-1">
                {currentQuestion.question_text}
              </h3>
              <div className="ml-4 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-semibold">
                {currentQuestion.points} pts
              </div>
            </div>

            {currentQuestion.question_media && (
              <img
                src={currentQuestion.question_media}
                alt="Question"
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
            )}
          </div>

          {/* Question content */}
          {renderQuestion()}

          {/* Hint section */}
          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <span>💡</span>
                <span className="font-semibold">
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </span>
              </button>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                >
                  <p className="text-cyan-200">{currentQuestion.hints[0]}</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Answer tracker */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={`w-3 h-3 rounded-full transition-all ${
                answers[q.id] !== undefined
                  ? 'bg-green-400 scale-110'
                  : index === currentQuestionIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>

          <div className="text-center">
            <div className="text-white/70 text-sm">
              {totalAnswered} of {questions.length} answered
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600
                     hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLastQuestion ? 'Submit' : 'Next'} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLessonViewer;
