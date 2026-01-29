import { create } from 'zustand';
import { Badge, UserBadge, Achievement } from '@/types';

interface BadgeState {
  allBadges: Badge[];
  userBadges: UserBadge[];
  achievements: Achievement[];
  isLoading: boolean;
  setAllBadges: (badges: Badge[]) => void;
  setUserBadges: (badges: UserBadge[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  unlockBadge: (badgeId: string) => void;
  addAchievement: (achievement: Achievement) => void;
  setLoading: (loading: boolean) => void;
}

export const useBadgeStore = create<BadgeState>((set, get) => ({
  allBadges: [],
  userBadges: [],
  achievements: [],
  isLoading: false,

  setAllBadges: (allBadges) => set({ allBadges }),

  setUserBadges: (userBadges) => set({ userBadges }),

  setAchievements: (achievements) => set({ achievements }),

  updateBadgeProgress: (badgeId, progress) => {
    const { userBadges } = get();
    const updatedBadges = userBadges.map((badge) =>
      badge.badgeId === badgeId
        ? { ...badge, progress }
        : badge
    );
    set({ userBadges: updatedBadges });
  },

  unlockBadge: (badgeId) => {
    const { userBadges } = get();
    const updatedBadges = userBadges.map((badge) =>
      badge.badgeId === badgeId
        ? { ...badge, unlockedAt: new Date().toISOString() }
        : badge
    );
    set({ userBadges: updatedBadges });
  },

  addAchievement: (achievement) => {
    const { achievements } = get();
    set({ achievements: [achievement, ...achievements] });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
