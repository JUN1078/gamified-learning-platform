import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, TrendingUp, Users } from 'lucide-react';
import { usePeerReviewStore } from '@/stores/peerReviewStore';
import { peerReviewService } from '@/services/peerReviewService';
import { useUIStore } from '@/stores/uiStore';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AriseRadarChart from '@/components/peerReview/AriseRadarChart';
import DimensionCard from '@/components/peerReview/DimensionCard';
import AriseBadge from '@/components/peerReview/AriseBadge';

const ReviewResults = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const {
    radarData,
    myBadges,
    isLoadingResults,
    setRadarData,
    setMyBadges,
    setLoadingResults,
  } = usePeerReviewStore();

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoadingResults(true);
      const [radar, badges] = await Promise.all([
        peerReviewService.getAriseRadar(),
        peerReviewService.getMyBadges(),
      ]);
      setRadarData(radar);
      setMyBadges(badges);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to load results',
      });
    } finally {
      setLoadingResults(false);
    }
  };

  if (isLoadingResults) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/peer-review')} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg">
            My ARISE Results
          </h1>
          <p className="text-white/70 mt-1">Your peer feedback at a glance</p>
        </div>
        <button onClick={() => navigate('/peer-review/journey')} className="btn-secondary">
          <TrendingUp className="w-5 h-5 mr-2" />
          View Journey
        </button>
      </div>

      {/* Stats Overview */}
      {radarData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <Users className="w-8 h-8 text-accent-gold mx-auto mb-2" />
            <p className="text-3xl font-bold">{radarData.totalReviews}</p>
            <p className="text-sm text-white/70">Total Reviews</p>
          </Card>
          <Card className="text-center">
            <Award className="w-8 h-8 text-accent-gold mx-auto mb-2" />
            <p className="text-3xl font-bold">{myBadges.length}</p>
            <p className="text-sm text-white/70">Badges Earned</p>
          </Card>
          <Card className="text-center">
            <TrendingUp className="w-8 h-8 text-accent-gold mx-auto mb-2" />
            <p className="text-3xl font-bold">
              {radarData.dimensionScores.length > 0
                ? (
                    radarData.dimensionScores.reduce((sum, d) => sum + d.score, 0) /
                    radarData.dimensionScores.length
                  ).toFixed(1)
                : '0.0'}
            </p>
            <p className="text-sm text-white/70">Average Score</p>
          </Card>
        </div>
      )}

      {/* Radar Chart */}
      {radarData && radarData.totalReviews > 0 ? (
        <>
          <Card>
            <h2 className="text-2xl font-display font-bold mb-6">ARISE Radar Chart</h2>
            <AriseRadarChart data={radarData} />
          </Card>

          {/* Dimension Breakdown */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-4">Dimension Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radarData.dimensionScores.map((dimension, index) => (
                <motion.div
                  key={dimension.dimension}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DimensionCard dimension={dimension} />
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Reviews Yet</h3>
            <p className="text-white/70 mb-6">
              You haven't received any peer reviews yet. Reviews will appear here once your peers
              submit feedback about you.
            </p>
            <button onClick={() => navigate('/peer-review')} className="btn-primary">
              Start Reviewing Others
            </button>
          </div>
        </Card>
      )}

      {/* Badges */}
      {myBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent-gold" />
            ARISE Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {myBadges.map((userBadge, index) => (
              <motion.div
                key={userBadge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <AriseBadge badge={userBadge.badge!} earnedAt={userBadge.earnedAt} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewResults;
