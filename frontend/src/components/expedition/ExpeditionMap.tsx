import { motion } from 'framer-motion';
import { Mountain, MountainId } from '@/types';
import { Flag, MapPin } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface ExpeditionMapProps {
  mountains: Mountain[];
  onMountainClick: (mountainId: MountainId) => void;
}

// Simple 2D map visualization (can be enhanced to 3D isometric later)
const ExpeditionMap = ({ mountains, onMountainClick }: ExpeditionMapProps) => {
  // Mountain positions in a winding path (percentage positions)
  const mountainPositions: Record<MountainId, { x: number; y: number }> = {
    aggressive: { x: 10, y: 80 },
    respect: { x: 30, y: 50 },
    innovative: { x: 50, y: 30 },
    swift: { x: 70, y: 50 },
    empowered: { x: 90, y: 20 },
  };

  // Draw path connections
  const renderPath = () => {
    const pathPoints = [
      mountainPositions.aggressive,
      mountainPositions.respect,
      mountainPositions.innovative,
      mountainPositions.swift,
      mountainPositions.empowered,
    ];

    const pathD = pathPoints
      .map((point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        const prevPoint = pathPoints[index - 1];
        // Create a curved path
        const midX = (prevPoint.x + point.x) / 2;
        const midY = (prevPoint.y + point.y) / 2;
        return `Q ${midX} ${midY - 10}, ${point.x} ${point.y}`;
      })
      .join(' ');

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#C9A961', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          stroke="url(#pathGradient)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          fill="none"
        />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-96 md:h-[600px] glass-strong rounded-2xl overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-800/50 to-primary-900/80" />

      {/* Path */}
      {renderPath()}

      {/* Mountains */}
      {mountains.map((mountain) => {
        const position = mountainPositions[mountain.id];
        const isLocked = !mountain.isUnlocked;
        const isCompleted = mountain.isCompleted;

        return (
          <motion.div
            key={mountain.id}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Mountain representation */}
            <motion.button
              onClick={() => !isLocked && onMountainClick(mountain.id)}
              disabled={isLocked}
              className={cn(
                'relative group',
                !isLocked && 'cursor-pointer'
              )}
              whileHover={!isLocked ? { scale: 1.1 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
            >
              {/* Mountain icon/visual */}
              <div
                className={cn(
                  'w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300',
                  isLocked
                    ? 'bg-white/10 opacity-50'
                    : isCompleted
                    ? 'bg-green-500/30 border-4 border-green-400'
                    : 'bg-accent-gold/30 border-4 border-accent-gold animate-glow'
                )}
                style={{
                  borderColor: isLocked ? 'rgba(255,255,255,0.2)' : mountain.color,
                  backgroundColor: isLocked ? 'rgba(255,255,255,0.1)' : `${mountain.color}30`,
                }}
              >
                {isCompleted ? (
                  <Flag className="w-8 h-8 md:w-12 md:h-12 text-green-400" />
                ) : (
                  <MapPin className={cn(
                    'w-8 h-8 md:w-12 md:h-12',
                    isLocked ? 'text-white/50' : 'text-accent-gold'
                  )} />
                )}
              </div>

              {/* Mountain name tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <div className="glass-strong px-3 py-1 rounded-lg">
                  <p className="text-xs font-semibold">{mountain.name}</p>
                  {!isLocked && (
                    <p className="text-xs text-white/70">{Math.round(mountain.progress)}%</p>
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              {!isLocked && !isCompleted && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke={mountain.color}
                    strokeWidth="2"
                    strokeDasharray={`${mountain.progress * 3.14} ${314 - mountain.progress * 3.14}`}
                    className="transition-all duration-500"
                  />
                </svg>
              )}
            </motion.button>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
        <div className="glass-strong rounded-lg px-4 py-2 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <span className="text-xs">Locked</span>
        </div>
        <div className="glass-strong rounded-lg px-4 py-2 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-accent-gold" />
          <span className="text-xs">In Progress</span>
        </div>
        <div className="glass-strong rounded-lg px-4 py-2 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-xs">Completed</span>
        </div>
      </div>
    </div>
  );
};

export default ExpeditionMap;
