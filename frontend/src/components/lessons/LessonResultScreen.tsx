import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LessonResultScreenProps {
  score: number;
  earnedPoints: number;
  totalPoints: number;
  rewards: {
    xp: number;
    coins: number;
  };
  results?: any[];
  showExplanations?: boolean;
}

const LessonResultScreen: React.FC<LessonResultScreenProps> = ({
  score,
  earnedPoints,
  totalPoints,
  rewards,
  results = [],
  showExplanations = false
}) => {
  const navigate = useNavigate();

  const getScoreMessage = () => {
    if (score >= 90) return { emoji: '🏆', title: 'Outstanding!', color: 'from-yellow-400 to-orange-500' };
    if (score >= 75) return { emoji: '🎉', title: 'Great Job!', color: 'from-green-400 to-cyan-500' };
    if (score >= 60) return { emoji: '👍', title: 'Good Effort!', color: 'from-blue-400 to-purple-500' };
    return { emoji: '💪', title: 'Keep Practicing!', color: 'from-gray-400 to-gray-600' };
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Main result card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-8xl mb-4"
          >
            {scoreMessage.emoji}
          </motion.div>

          <h2 className="text-4xl font-bold text-white mb-2">{scoreMessage.title}</h2>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className={`inline-block text-7xl font-bold bg-gradient-to-r ${scoreMessage.color}
                     text-transparent bg-clip-text my-6`}
          >
            {score}%
          </motion.div>

          <p className="text-xl text-gray-300 mb-8">
            You scored {earnedPoints} out of {totalPoints} points
          </p>

          {/* Rewards section */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20
                       border border-cyan-400/30 rounded-xl"
            >
              <span className="text-4xl">⭐</span>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">+{rewards.xp}</div>
                <div className="text-sm text-gray-300">XP Earned</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20
                       border border-yellow-400/30 rounded-xl"
            >
              <span className="text-4xl">💰</span>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">+{rewards.coins}</div>
                <div className="text-sm text-gray-300">Coins Earned</div>
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/lessons')}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold
                       transition-all"
            >
              Back to Lessons
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600
                       hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Question breakdown (if available) */}
        {showExplanations && results.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Question Breakdown</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    result.isCorrect
                      ? 'bg-green-500/10 border-green-400/30'
                      : 'bg-red-500/10 border-red-400/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Question {index + 1}</span>
                    <span className={`text-lg ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {result.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div className="text-sm text-gray-300">
                      <p className="mb-1">
                        Your answer: <span className="text-red-300">{JSON.stringify(result.userAnswer)}</span>
                      </p>
                      <p>
                        Correct answer: <span className="text-green-300">{JSON.stringify(result.correctAnswer)}</span>
                      </p>
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-400">
                    Points: {result.points}/{result.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LessonResultScreen;
