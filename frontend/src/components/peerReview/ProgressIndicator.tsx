import { DimensionWithStatements } from '@/types';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  dimensions: DimensionWithStatements[];
  currentIndex: number;
  ratings: Map<number, number>;
}

const ProgressIndicator = ({ dimensions, currentIndex, ratings }: ProgressIndicatorProps) => {
  const getDimensionProgress = (dimension: DimensionWithStatements) => {
    const totalStatements = dimension.statements.length;
    const ratedStatements = dimension.statements.filter((stmt) => ratings.has(stmt.id)).length;
    return { total: totalStatements, rated: ratedStatements };
  };

  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {dimensions.map((dimension, index) => {
          const { total, rated } = getDimensionProgress(dimension);
          const isComplete = rated === total;
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <div key={dimension.id} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`
                  relative flex flex-col items-center min-w-[80px]
                  ${isCurrent ? 'scale-110' : 'scale-100'}
                  transition-transform duration-200
                `}
              >
                {/* Icon/Check */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2
                    transition-all duration-200
                    ${
                      isComplete
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-br from-accent-gold to-accent-gold/80 text-dark-900 shadow-lg shadow-accent-gold/30'
                        : 'bg-white/10 text-white/50'
                    }
                  `}
                  style={{
                    ...(isCurrent && !isComplete
                      ? { backgroundColor: `${dimension.color}50`, borderColor: dimension.color, borderWidth: '2px' }
                      : {}),
                  }}
                >
                  {isComplete ? <Check className="w-5 h-5" /> : dimension.icon}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      isCurrent ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    {dimension.code.toUpperCase()}
                  </p>
                  <p className="text-xs text-white/50">
                    {rated}/{total}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < dimensions.length - 1 && (
                <div
                  className={`w-8 h-0.5 mb-8 ${
                    isPast || isComplete ? 'bg-green-500' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
