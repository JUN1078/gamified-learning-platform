import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, User } from 'lucide-react';
import { usePeerReviewStore } from '@/stores/peerReviewStore';
import { peerReviewService } from '@/services/peerReviewService';
import { useUIStore } from '@/stores/uiStore';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatementCard from '@/components/peerReview/StatementCard';
import ProgressIndicator from '@/components/peerReview/ProgressIndicator';

const ReviewForm = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const {
    selectedEmployee,
    dimensions,
    currentDimensionIndex,
    ratings,
    overallComment,
    isSubmitting,
    setDimensions,
    nextDimension,
    prevDimension,
    setRating,
    setOverallComment,
    resetForm,
    setSubmitting,
  } = usePeerReviewStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedEmployee) {
      navigate('/peer-review');
      return;
    }
    loadDimensions();
  }, [selectedEmployee]);

  const loadDimensions = async () => {
    try {
      setIsLoading(true);
      const data = await peerReviewService.getDimensions();
      setDimensions(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to load review form',
      });
      navigate('/peer-review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) return;

    // Validate all statements are rated
    const totalStatements = dimensions.reduce((sum, dim) => sum + dim.statements.length, 0);
    if (ratings.size < totalStatements) {
      addToast({
        type: 'warning',
        title: 'Incomplete Review',
        message: 'Please rate all statements before submitting',
      });
      return;
    }

    try {
      setSubmitting(true);
      const reviewData = {
        revieweeId: selectedEmployee.userId,
        ratings: Array.from(ratings.entries()).map(([statementId, rating]) => ({
          statementId,
          rating,
        })),
        overallComment: overallComment || undefined,
      };

      await peerReviewService.submitReview(reviewData);

      addToast({
        type: 'success',
        title: 'Review Submitted!',
        message: `Your review for ${selectedEmployee.username} has been submitted successfully`,
      });

      resetForm();
      navigate('/peer-review');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.error || 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedEmployee || dimensions.length === 0) {
    return null;
  }

  const currentDimension = dimensions[currentDimensionIndex];
  const isLastDimension = currentDimensionIndex === dimensions.length - 1;
  const isFirstDimension = currentDimensionIndex === 0;

  // Check if all statements in current dimension are rated
  const currentDimensionRated = currentDimension.statements.every((stmt) =>
    ratings.has(stmt.id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/peer-review')} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-shadow-lg">
            Review: {selectedEmployee.username}
          </h1>
          <p className="text-white/70 text-sm">{selectedEmployee.email}</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        dimensions={dimensions}
        currentIndex={currentDimensionIndex}
        ratings={ratings}
      />

      {/* Current Dimension */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDimensionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6" style={{ borderLeft: `4px solid ${currentDimension.color}` }}>
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${currentDimension.color}20` }}
              >
                {currentDimension.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold mb-2">{currentDimension.name}</h2>
                <p className="text-white/70">{currentDimension.description}</p>
              </div>
            </div>

            {/* Statements */}
            <div className="space-y-4">
              {currentDimension.statements.map((statement) => (
                <StatementCard
                  key={statement.id}
                  statement={statement}
                  rating={ratings.get(statement.id)}
                  onRatingChange={(rating) => setRating(statement.id, rating)}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Overall Comment (shown on last dimension) */}
      {isLastDimension && (
        <Card>
          <h3 className="text-xl font-display font-bold mb-4">Overall Comments (Optional)</h3>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="Share any additional feedback or observations..."
            className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold/50 resize-none"
          />
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevDimension}
          disabled={isFirstDimension}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        {isLastDimension ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !currentDimensionRated}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Review
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextDimension}
            disabled={!currentDimensionRated}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewForm;
