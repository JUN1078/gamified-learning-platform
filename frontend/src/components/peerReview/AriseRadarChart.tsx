import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { AriseRadarData } from '@/types';

interface AriseRadarChartProps {
  data: AriseRadarData;
}

const AriseRadarChart = ({ data }: AriseRadarChartProps) => {
  const chartData = data.dimensionScores.map((score) => ({
    dimension: score.dimension,
    score: score.score,
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#FFD700"
          fill="#FFD700"
          fillOpacity={0.6}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px',
          }}
          labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
          itemStyle={{ color: '#FFD700' }}
          formatter={(value: any) => [`${value.toFixed(2)} / 5.00`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default AriseRadarChart;
