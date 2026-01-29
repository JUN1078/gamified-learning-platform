import { useEffect } from 'react';
import { useBadgeStore } from '@/stores/badgeStore';
import { badgeService } from '@/services/badgeService';
import Card from '@/components/shared/Card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import BadgeCard from '@/components/badges/BadgeCard';
import AchievementTimeline from '@/components/badges/AchievementTimeline';
import { Award, Trophy } from 'lucide-react';

const Badges = () => {
  const { allBadges, userBadges, achievements, isLoading, setAllBadges, setUserBadges, setAchievements, setLoading } = useBadgeStore();

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      try {
        const [badgesData, userBadgesData, achievementsData] = await Promise.all([
          badgeService.getAllBadges(),
          badgeService.getUserBadges(),
          badgeService.getAchievementTimeline(),
        ]);
        setAllBadges(badgesData);
        setUserBadges(userBadgesData);
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const badgeStats = {
    total: allBadges.length,
    unlocked: userBadges.filter((b) => b.unlockedAt !== null).length,
    bronze: userBadges.filter((b) => b.tier === 'bronze' && b.unlockedAt !== null).length,
    silver: userBadges.filter((b) => b.tier === 'silver' && b.unlockedAt !== null).length,
    gold: userBadges.filter((b) => b.tier === 'gold' && b.unlockedAt !== null).length,
  };

  // Group badges by tier
  const bronzeBadges = allBadges.filter((b) => b.tier === 'bronze');
  const silverBadges = allBadges.filter((b) => b.tier === 'silver');
  const goldBadges = allBadges.filter((b) => b.tier === 'gold');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-shadow-lg flex items-center">
          <Award className="w-10 h-10 mr-3 text-accent-gold" />
          Badges & Achievements
        </h1>
        <p className="text-white/70 mt-1">
          Unlock badges by demonstrating excellence in key attributes
        </p>
      </div>

      {/* Badge Stats */}
      <Card>
        <h3 className="font-display font-bold text-xl mb-4">Your Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-accent-gold">{badgeStats.unlocked}</p>
            <p className="text-sm text-white/70 mt-1">Total Badges</p>
            <p className="text-xs text-white/50">of {badgeStats.total}</p>
          </div>
          <div className="glass rounded-lg p-4 text-center badge-bronze">
            <p className="text-3xl font-bold">{badgeStats.bronze}</p>
            <p className="text-sm mt-1">Bronze</p>
          </div>
          <div className="glass rounded-lg p-4 text-center badge-silver">
            <p className="text-3xl font-bold">{badgeStats.silver}</p>
            <p className="text-sm mt-1">Silver</p>
          </div>
          <div className="glass rounded-lg p-4 text-center badge-gold">
            <p className="text-3xl font-bold">{badgeStats.gold}</p>
            <p className="text-sm mt-1">Gold</p>
          </div>
        </div>
      </Card>

      {/* Gold Badges */}
      {goldBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-2xl flex items-center">
            <span className="w-12 h-1 rounded-full badge-gold mr-3" />
            Gold Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {goldBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                userBadge={userBadges.find((ub) => ub.badgeId === badge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Silver Badges */}
      {silverBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-2xl flex items-center">
            <span className="w-12 h-1 rounded-full badge-silver mr-3" />
            Silver Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {silverBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                userBadge={userBadges.find((ub) => ub.badgeId === badge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bronze Badges */}
      {bronzeBadges.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-2xl flex items-center">
            <span className="w-12 h-1 rounded-full badge-bronze mr-3" />
            Bronze Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bronzeBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                userBadge={userBadges.find((ub) => ub.badgeId === badge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Achievement Timeline */}
      <Card>
        <h3 className="font-display font-bold text-2xl mb-6 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-accent-gold" />
          Achievement History
        </h3>
        <AchievementTimeline achievements={achievements} />
      </Card>
    </div>
  );
};

export default Badges;
