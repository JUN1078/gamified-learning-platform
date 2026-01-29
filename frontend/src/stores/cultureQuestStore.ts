import { create } from 'zustand';
import {
  CultureScenario,
  UserCultureScore,
  RadarDataPoint,
} from '@/types/cultureQuest';

interface CultureQuestState {
  currentScenario: CultureScenario | null;
  userScores: UserCultureScore[];
  radarData: RadarDataPoint[];
  totalResponses: number;
  isLoading: boolean;
  questModalOpen: boolean;
  setCurrentScenario: (scenario: CultureScenario | null) => void;
  setUserScores: (scores: UserCultureScore[]) => void;
  setRadarData: (data: RadarDataPoint[], total: number) => void;
  setLoading: (loading: boolean) => void;
  openQuestModal: () => void;
  closeQuestModal: () => void;
}

export const useCultureQuestStore = create<CultureQuestState>((set) => ({
  currentScenario: null,
  userScores: [],
  radarData: [],
  totalResponses: 0,
  isLoading: false,
  questModalOpen: false,

  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),

  setUserScores: (userScores) => set({ userScores }),

  setRadarData: (radarData, totalResponses) => set({ radarData, totalResponses }),

  setLoading: (isLoading) => set({ isLoading }),

  openQuestModal: () => set({ questModalOpen: true }),

  closeQuestModal: () => set({ questModalOpen: false, currentScenario: null }),
}));
