import { create } from 'zustand';
import { Mountain, MountainProgress, Checkpoint } from '@/types';

interface ExpeditionState {
  mountains: Mountain[];
  progress: Record<string, MountainProgress>;
  currentMountain: Mountain | null;
  isLoading: boolean;
  setMountains: (mountains: Mountain[]) => void;
  setProgress: (progress: Record<string, MountainProgress>) => void;
  setCurrentMountain: (mountain: Mountain | null) => void;
  completeCheckpoint: (mountainId: string, checkpointId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useExpeditionStore = create<ExpeditionState>((set, get) => ({
  mountains: [],
  progress: {},
  currentMountain: null,
  isLoading: false,

  setMountains: (mountains) => set({ mountains }),

  setProgress: (progress) => set({ progress }),

  setCurrentMountain: (mountain) => set({ currentMountain: mountain }),

  completeCheckpoint: (mountainId, checkpointId) => {
    const { mountains, progress } = get();

    // Update progress
    const mountainProgress = progress[mountainId];
    if (mountainProgress) {
      const updatedProgress = {
        ...progress,
        [mountainId]: {
          ...mountainProgress,
          completedCheckpoints: [
            ...mountainProgress.completedCheckpoints,
            checkpointId,
          ],
        },
      };
      set({ progress: updatedProgress });
    }

    // Update mountain checkpoint status
    const updatedMountains = mountains.map((mountain) => {
      if (mountain.id === mountainId) {
        const updatedCheckpoints = mountain.checkpoints.map((checkpoint) =>
          checkpoint.id === checkpointId
            ? { ...checkpoint, isCompleted: true }
            : checkpoint
        );

        const completedCount = updatedCheckpoints.filter((c) => c.isCompleted).length;
        const totalCount = updatedCheckpoints.length;
        const progress = (completedCount / totalCount) * 100;

        return {
          ...mountain,
          checkpoints: updatedCheckpoints,
          progress,
          isCompleted: completedCount === totalCount,
        };
      }
      return mountain;
    });

    set({ mountains: updatedMountains });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
