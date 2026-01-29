import { useEffect } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { characterService } from '@/services/characterService';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import RadarChartComponent from '@/components/character/RadarChart';
import AvatarDisplay from '@/components/character/AvatarDisplay';
import AttributeList from '@/components/character/AttributeList';
import ProgressBar from '@/components/shared/ProgressBar';
import { TrendingUp, Award } from 'lucide-react';

const Character = () => {
  const { character, attributes, isLoading, setCharacter, setLoading } = useCharacterStore();

  useEffect(() => {
    const fetchCharacter = async () => {
      setLoading(true);
      try {
        const data = await characterService.getCharacter();
        setCharacter(data);
      } catch (error) {
        console.error('Failed to fetch character:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">No character data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg">
          Character Profile
        </h1>
        <p className="text-white/70 mt-1">
          View your multi-dimensional character development
        </p>
      </div>

      {/* Character Overview */}
      <Card>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <AvatarDisplay avatar={character.avatar} size="xl" showBadges />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-display font-bold mb-2">{character.title}</h2>
            <p className="text-white/70 mb-4">Character ID: {character.userId}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="glass rounded-lg p-4">
                <TrendingUp className="w-6 h-6 text-accent-gold mb-2 mx-auto md:mx-0" />
                <p className="text-sm text-white/70">Level</p>
                <p className="text-2xl font-bold text-accent-gold">{character.level}</p>
              </div>
              <div className="glass rounded-lg p-4">
                <Award className="w-6 h-6 text-accent-gold mb-2 mx-auto md:mx-0" />
                <p className="text-sm text-white/70">Total XP</p>
                <p className="text-2xl font-bold text-accent-gold">
                  {character.xp.toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-lg p-4 col-span-2 md:col-span-1">
                <p className="text-sm text-white/70 mb-2">Next Level</p>
                <ProgressBar
                  progress={((character.xp % character.nextLevelXp) / character.nextLevelXp) * 100}
                  showLabel
                  height="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Radar Chart */}
      <Card>
        <h3 className="font-display font-bold text-2xl mb-6">
          12-Point Attribute Analysis
        </h3>
        <div className="h-[500px]">
          <RadarChartComponent attributes={attributes} />
        </div>
      </Card>

      {/* Attribute List */}
      <Card>
        <h3 className="font-display font-bold text-2xl mb-6">
          Detailed Attributes
        </h3>
        <AttributeList attributes={attributes} showProgress />
      </Card>

      {/* Avatar Customization */}
      <Card>
        <h3 className="font-display font-bold text-2xl mb-6">
          Avatar Customization
        </h3>
        <div className="space-y-4">
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">Equipped Sash</p>
            <p className="font-semibold">
              {character.avatar.sash || 'None equipped'}
            </p>
          </div>
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">Equipped Badges ({character.avatar.badges.length})</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {character.avatar.badges.map((badgeId, index) => (
                <div
                  key={badgeId}
                  className="px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-sm font-semibold"
                >
                  Badge {index + 1}
                </div>
              ))}
              {character.avatar.badges.length === 0 && (
                <p className="text-white/50">No badges equipped</p>
              )}
            </div>
          </div>
          <div className="glass rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">Accessories ({character.avatar.accessories.length})</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {character.avatar.accessories.map((accessory, index) => (
                <div
                  key={accessory}
                  className="px-3 py-1 rounded-full bg-white/10 text-sm"
                >
                  Accessory {index + 1}
                </div>
              ))}
              {character.avatar.accessories.length === 0 && (
                <p className="text-white/50">No accessories equipped</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Character;
