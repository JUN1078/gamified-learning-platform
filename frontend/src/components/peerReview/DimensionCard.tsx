import { motion } from 'framer-motion';
import Card from '@/components/shared/Card';

interface DimensionCardProps {
  dimension: {
    dimension: string;
    score: number;
    color: string;
  };
}

const DimensionCard = ({ dimension }: DimensionCardProps) => {
  const percentage = (dimension.score / 5) * 100;

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Very Good';
    if (score >= 3.5) return 'Good';
    if (score >= 3.0) return 'Satisfactory';
    if (score >= 2.0) return 'Needs Improvement';
    return 'Developing';
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: dimension.color }}
      />

      <div className="p-6">
        <h3 className="text-lg font-display font-bold mb-2">{dimension.dimension}</h3>

        {/* Score */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold" style={{ color: dimension.color }}>
            {dimension.score.toFixed(2)}
          </span>
          <span className="text-white/50">/ 5.00</span>
        </div>

        {/* Label */}
        <p className="text-sm text-white/70 mb-4">{getScoreLabel(dimension.score)}</p>

        {/* Progress Bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ backgroundColor: dimension.color }}
          />
        </div>
      </div>
    </Card>
  );
};

export default DimensionCard;
