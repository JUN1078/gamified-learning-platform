import { motion } from 'framer-motion';
import { User, Calendar } from 'lucide-react';

interface Review {
  reviewId: number;
  reviewerName: string;
  submittedAt: string;
  dimensionScores: {
    dimension: string;
    score: number;
  }[];
}

interface ReviewTimelineProps {
  reviews: Review[];
}

const ReviewTimeline = ({ reviews }: ReviewTimelineProps) => {
  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.reviewId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative pl-8 pb-8 border-l-2 border-white/10 last:pb-0"
        >
          {/* Timeline dot */}
          <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent-gold border-4 border-dark-800" />

          {/* Review card */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-gold" />
                <span className="font-semibold">{review.reviewerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(review.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Dimension scores */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {review.dimensionScores.map((score) => (
                <div key={score.dimension} className="text-center">
                  <p className="text-xs text-white/70 mb-1">{score.dimension}</p>
                  <p className="text-lg font-bold text-accent-gold">{score.score.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewTimeline;
