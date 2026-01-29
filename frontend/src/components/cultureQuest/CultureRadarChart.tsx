import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCultureQuestStore } from '@/stores/cultureQuestStore';
import { cultureQuestService } from '@/services/cultureQuestService';
import Card from '../shared/Card';
import LoadingSpinner from '../shared/LoadingSpinner';
import { TrendingUp } from 'lucide-react';

const CultureRadarChart = () => {
  const { radarData, totalResponses, isLoading, setRadarData, setLoading } =
    useCultureQuestStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await cultureQuestService.getRadarData();
        setRadarData(data.radarData, data.totalResponses);
      } catch (error) {
        console.error('Failed to fetch radar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (radarData.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold text-lg mb-2">No Culture Data Yet</h3>
          <p className="text-white/70">
            Complete Culture Quests to unlock your culture profile!
          </p>
        </div>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = radarData.map((d) => ({
    dimension: `${d.icon} ${d.dimension}`,
    'Your Score': d.userScore,
    'Cohort Avg': d.cohortAvg,
    fullMark: 5,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = radarData.find((d) => `${d.icon} ${d.dimension}` === payload[0].payload.dimension);
      return (
        <div className="glass-strong rounded-lg p-3 border border-white/30">
          <p className="font-semibold mb-1">{dataPoint?.dimension}</p>
          <div className="space-y-1 text-sm">
            <p className="text-accent-gold">Your Score: {dataPoint?.userScore.toFixed(1)}</p>
            <p className="text-blue-400">Cohort Avg: {dataPoint?.cohortAvg.toFixed(1)}</p>
            <p className="text-white/50">{dataPoint?.responseCount} responses</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-2xl">Your Culture Profile</h3>
            <p className="text-white/70 mt-1">
              Based on {totalResponses} responses
            </p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadar data={chartData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: 'rgba(255, 255, 255, 0.9)', fontSize: 11 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Your Score"
                dataKey="Your Score"
                stroke="#C9A961"
                fill="#C9A961"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Radar
                name="Cohort Average"
                dataKey="Cohort Avg"
                stroke="#2196F3"
                fill="#2196F3"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RechartsRadar>
          </ResponsiveContainer>
        </div>

        {/* Dimension Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {radarData.map((item, index) => (
            <motion.div
              key={item.dimensionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{item.dimension}</p>
                    <p className="text-xs text-white/50">{item.responseCount} responses</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent-gold">
                    {item.userScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-white/50">
                    vs {item.cohortAvg.toFixed(1)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insight */}
        <div className="glass rounded-lg p-4 border-l-4 border-accent-gold">
          <p className="text-sm">
            <span className="font-semibold">💡 Insight:</span>{' '}
            <span className="text-white/80">
              Your culture profile is unique to you. Keep engaging with Culture Quests to build a more complete picture!
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CultureRadarChart;
