import { motion } from 'framer-motion';
import { CharacterAttribute } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ProgressBar from '@/components/shared/ProgressBar';

interface AttributeListProps {
  attributes: CharacterAttribute[];
  showProgress?: boolean;
}

const AttributeList = ({ attributes, showProgress = true }: AttributeListProps) => {
  const getTrendIcon = (value: number) => {
    if (value >= 7.5) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (value >= 5) return <Minus className="w-4 h-4 text-yellow-400" />;
    return <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-3">
      {attributes.map((attr, index) => (
        <motion.div
          key={attr.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass rounded-lg p-4 hover:bg-white/15 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: attr.color }}
              />
              <div>
                <h4 className="font-semibold text-sm">{attr.displayName}</h4>
                <p className="text-xs text-white/50">Level {attr.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(attr.value)}
              <span className="font-bold text-lg text-accent-gold">
                {attr.value.toFixed(1)}
              </span>
            </div>
          </div>

          {showProgress && (
            <div>
              <ProgressBar
                progress={(attr.value / 10) * 100}
                height="sm"
                color={`from-[${attr.color}] to-[${attr.color}]/50`}
              />
              <p className="text-xs text-white/70 mt-1">{attr.descriptor}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AttributeList;
