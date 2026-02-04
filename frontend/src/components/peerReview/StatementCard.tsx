import { motion } from 'framer-motion';
import { AriseStatement } from '@/types';
import LikertScale from './LikertScale';

interface StatementCardProps {
  statement: AriseStatement;
  rating: number | undefined;
  onRatingChange: (rating: number) => void;
}

const StatementCard = ({ statement, rating, onRatingChange }: StatementCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
    >
      <p className="text-white/90 mb-4 leading-relaxed">{statement.statementText}</p>
      <LikertScale value={rating} onChange={onRatingChange} />
    </motion.div>
  );
};

export default StatementCard;
