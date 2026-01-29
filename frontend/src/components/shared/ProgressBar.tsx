import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: string;
  height?: 'sm' | 'md' | 'lg';
}

const ProgressBar = ({
  progress,
  className,
  showLabel = false,
  color = 'from-accent-gold to-yellow-500',
  height = 'md',
}: ProgressBarProps) => {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-white/70">Progress</span>
          <span className="text-sm font-semibold">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn('progress-bar', heightClasses[height])}>
        <motion.div
          className={cn('progress-fill', `bg-gradient-to-r ${color}`)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
