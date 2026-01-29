import { motion } from 'framer-motion';
import { Mountain } from '@/types';
import { Lock, CheckCircle, Mountain as MountainIcon } from 'lucide-react';
import ProgressBar from '@/components/shared/ProgressBar';
import { cn } from '@/utils/helpers';

interface MountainCardProps {
  mountain: Mountain;
  onClick?: () => void;
  index: number;
}

const MountainCard = ({ mountain, onClick, index }: MountainCardProps) => {
  const isLocked = !mountain.isUnlocked;
  const isCompleted = mountain.isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isLocked ? { scale: 1.03, y: -5 } : {}}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 transition-all duration-300',
        isLocked
          ? 'opacity-50 cursor-not-allowed border-white/20'
          : 'cursor-pointer border-white/30 hover:border-accent-gold/50'
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Background gradient based on mountain color */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${mountain.color}40, ${mountain.color}10)`,
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                isCompleted
                  ? 'bg-green-500/20 text-green-400'
                  : isLocked
                  ? 'bg-white/10 text-white/50'
                  : 'bg-accent-gold/20 text-accent-gold'
              )}
            >
              {isLocked ? (
                <Lock className="w-6 h-6" />
              ) : isCompleted ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <MountainIcon className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">{mountain.name}</h3>
              <p className="text-sm text-white/70">{mountain.description}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {!isLocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Progress</span>
              <span className="font-semibold">{Math.round(mountain.progress)}%</span>
            </div>
            <ProgressBar progress={mountain.progress} height="md" />
          </div>
        )}

        {/* Checkpoints */}
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-xs text-white/50">Checkpoints:</span>
          <div className="flex space-x-1">
            {mountain.checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                className={cn(
                  'w-2 h-2 rounded-full',
                  checkpoint.isCompleted
                    ? 'bg-green-400'
                    : isLocked
                    ? 'bg-white/20'
                    : 'bg-white/40'
                )}
                title={checkpoint.name}
              />
            ))}
          </div>
          <span className="text-xs text-white/70">
            {mountain.checkpoints.filter((c) => c.isCompleted).length}/{mountain.checkpoints.length}
          </span>
        </div>

        {/* Attributes */}
        <div className="mt-4 flex flex-wrap gap-2">
          {mountain.attributes.slice(0, 3).map((attr) => (
            <span
              key={attr}
              className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80"
            >
              {attr}
            </span>
          ))}
          {mountain.attributes.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80">
              +{mountain.attributes.length - 3}
            </span>
          )}
        </div>

        {/* Completion badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg"
          >
            Completed
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MountainCard;
