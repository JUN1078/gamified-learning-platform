import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePeerReviewStore } from '@/stores/peerReviewStore';
import { peerReviewService } from '@/services/peerReviewService';
import { useUIStore } from '@/stores/uiStore';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReviewTimeline from '@/components/peerReview/ReviewTimeline';

const ReviewJourney = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { journeyData, isLoadingResults, setJourneyData, setLoadingResults } = usePeerReviewStore();

  useEffect(() => {
    loadJourney();
  }, []);

  const loadJourney = async () => {
    try {
      setLoadingResults(true);
      const data = await peerReviewService.getReviewJourney();
      setJourneyData(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to load journey data',
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

  const dimensionColors = {
    aggressive: '#EF4444',
    respect: '#3B82F6',
    innovative: '#8B5CF6',
    empowered: '#10B981',
    swift: '#F59E0B',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/peer-review')} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg">
            My ARISE Journey
          </h1>
          <p className="text-white/70 mt-1">Track your growth over time</p>
        </div>
      </div>

      {journeyData && journeyData.reviews.length > 0 ? (
        <>
          {/* Score Trend Chart */}
          {journeyData.scoreHistory.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-accent-gold" />
                <h2 className="text-2xl font-display font-bold">Score Trends</h2>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={journeyData.scoreHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    }
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line
                    type="monotone"
                    dataKey="aggressive"
                    stroke={dimensionColors.aggressive}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Aggressive"
                  />
                  <Line
                    type="monotone"
                    dataKey="respect"
                    stroke={dimensionColors.respect}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Respect"
                  />
                  <Line
                    type="monotone"
                    dataKey="innovative"
                    stroke={dimensionColors.innovative}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Innovative"
                  />
                  <Line
                    type="monotone"
                    dataKey="empowered"
                    stroke={dimensionColors.empowered}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Empowered"
                  />
                  <Line
                    type="monotone"
                    dataKey="swift"
                    stroke={dimensionColors.swift}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Swift"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Review Timeline */}
          <Card>
            <h2 className="text-2xl font-display font-bold mb-6">Review History</h2>
            <ReviewTimeline reviews={journeyData.reviews} />
          </Card>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Journey Data Yet</h3>
            <p className="text-white/70 mb-6">
              Your review journey will appear here once you receive feedback from your peers.
            </p>
            <button onClick={() => navigate('/peer-review')} className="btn-primary">
              Back to Peer Review
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReviewJourney;
