import { motion } from 'framer-motion';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CharacterAttribute } from '@/types';
import { useState } from 'react';

interface RadarChartProps {
  attributes: CharacterAttribute[];
}

const RadarChartComponent = ({ attributes }: RadarChartProps) => {
  const [hoveredAttribute, setHoveredAttribute] = useState<CharacterAttribute | null>(null);

  // Transform data for recharts
  const chartData = attributes.map((attr) => ({
    attribute: attr.displayName,
    value: attr.value,
    fullMark: 10,
    color: attr.color,
    descriptor: attr.descriptor,
    level: attr.level,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-strong rounded-lg p-3 border border-white/30">
          <p className="font-semibold">{data.attribute}</p>
          <p className="text-accent-gold text-lg font-bold">{data.value.toFixed(1)}</p>
          <p className="text-sm text-white/70">{data.descriptor}</p>
          <p className="text-xs text-white/50">Level {data.level}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={chartData}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
          <PolarAngleAxis
            dataKey="attribute"
            tick={{ fill: 'rgba(255, 255, 255, 0.9)', fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Attributes"
            dataKey="value"
            stroke="#C9A961"
            fill="#C9A961"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>

      {/* Attribute Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-6">
        {attributes.map((attr, index) => (
          <motion.div
            key={attr.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredAttribute(attr)}
            onMouseLeave={() => setHoveredAttribute(null)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: attr.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{attr.displayName}</p>
              <p className="text-xs text-white/50">{attr.value.toFixed(1)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hovered Attribute Detail */}
      {hoveredAttribute && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 glass rounded-lg border border-accent-gold/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{hoveredAttribute.displayName}</h4>
              <p className="text-sm text-white/70">{hoveredAttribute.descriptor}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent-gold">
                {hoveredAttribute.value.toFixed(1)}
              </p>
              <p className="text-xs text-white/50">Level {hoveredAttribute.level}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RadarChartComponent;
