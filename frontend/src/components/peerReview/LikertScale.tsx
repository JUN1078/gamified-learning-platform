import { motion } from 'framer-motion';

interface LikertScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

const labels = [
  { value: 1, label: 'Strongly Disagree', color: 'from-red-500 to-red-600' },
  { value: 2, label: 'Disagree', color: 'from-orange-500 to-orange-600' },
  { value: 3, label: 'Neutral', color: 'from-yellow-500 to-yellow-600' },
  { value: 4, label: 'Agree', color: 'from-lime-500 to-lime-600' },
  { value: 5, label: 'Strongly Agree', color: 'from-green-500 to-green-600' },
];

const LikertScale = ({ value, onChange }: LikertScaleProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-2">
        {labels.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 group relative ${
              value === option.value ? 'scale-105' : 'opacity-70 hover:opacity-100'
            } transition-all duration-200`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                h-12 rounded-lg flex items-center justify-center font-bold
                ${
                  value === option.value
                    ? `bg-gradient-to-br ${option.color} shadow-lg`
                    : 'bg-white/5 border border-white/20'
                }
              `}
            >
              <span className="text-sm md:text-base">{option.value}</span>
            </motion.div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-dark-900 border border-white/20 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {option.label}
            </div>
          </button>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-white/50">
        <span>Strongly Disagree</span>
        <span>Neutral</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  );
};

export default LikertScale;
