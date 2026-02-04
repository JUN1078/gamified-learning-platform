import { create } from 'zustand';
import {
  EmployeeListItem,
  DimensionWithStatements,
  ArisePeerReview,
  AriseRadarData,
  ReviewJourney,
  UserAriseBadge,
} from '@/types';

interface PeerReviewState {
  // Employee List
  employees: EmployeeListItem[];
  isLoadingEmployees: boolean;

  // Review Form
  selectedEmployee: EmployeeListItem | null;
  dimensions: DimensionWithStatements[];
  currentDimensionIndex: number;
  ratings: Map<number, number>; // statementId -> rating (1-5)
  overallComment: string;
  isSubmitting: boolean;

  // My Reviews
  myReviews: ArisePeerReview[];
  reviewsAboutMe: ArisePeerReview[];
  isLoadingReviews: boolean;

  // Results & Journey
  radarData: AriseRadarData | null;
  journeyData: ReviewJourney | null;
  myBadges: UserAriseBadge[];
  isLoadingResults: boolean;

  // Actions - Employee List
  setEmployees: (employees: EmployeeListItem[]) => void;
  setLoadingEmployees: (loading: boolean) => void;

  // Actions - Review Form
  selectEmployee: (employee: EmployeeListItem | null) => void;
  setDimensions: (dimensions: DimensionWithStatements[]) => void;
  setCurrentDimension: (index: number) => void;
  nextDimension: () => void;
  prevDimension: () => void;
  setRating: (statementId: number, rating: number) => void;
  setOverallComment: (comment: string) => void;
  resetForm: () => void;
  setSubmitting: (submitting: boolean) => void;

  // Actions - Reviews
  setMyReviews: (reviews: ArisePeerReview[]) => void;
  setReviewsAboutMe: (reviews: ArisePeerReview[]) => void;
  setLoadingReviews: (loading: boolean) => void;

  // Actions - Results
  setRadarData: (data: AriseRadarData | null) => void;
  setJourneyData: (data: ReviewJourney | null) => void;
  setMyBadges: (badges: UserAriseBadge[]) => void;
  setLoadingResults: (loading: boolean) => void;
}

export const usePeerReviewStore = create<PeerReviewState>((set, get) => ({
  // Initial State
  employees: [],
  isLoadingEmployees: false,

  selectedEmployee: null,
  dimensions: [],
  currentDimensionIndex: 0,
  ratings: new Map(),
  overallComment: '',
  isSubmitting: false,

  myReviews: [],
  reviewsAboutMe: [],
  isLoadingReviews: false,

  radarData: null,
  journeyData: null,
  myBadges: [],
  isLoadingResults: false,

  // Employee List Actions
  setEmployees: (employees) => set({ employees }),
  setLoadingEmployees: (isLoadingEmployees) => set({ isLoadingEmployees }),

  // Review Form Actions
  selectEmployee: (selectedEmployee) =>
    set({ selectedEmployee, currentDimensionIndex: 0, ratings: new Map(), overallComment: '' }),

  setDimensions: (dimensions) => set({ dimensions }),

  setCurrentDimension: (currentDimensionIndex) => set({ currentDimensionIndex }),

  nextDimension: () => {
    const { currentDimensionIndex, dimensions } = get();
    if (currentDimensionIndex < dimensions.length - 1) {
      set({ currentDimensionIndex: currentDimensionIndex + 1 });
    }
  },

  prevDimension: () => {
    const { currentDimensionIndex } = get();
    if (currentDimensionIndex > 0) {
      set({ currentDimensionIndex: currentDimensionIndex - 1 });
    }
  },

  setRating: (statementId, rating) => {
    const { ratings } = get();
    const newRatings = new Map(ratings);
    newRatings.set(statementId, rating);
    set({ ratings: newRatings });
  },

  setOverallComment: (overallComment) => set({ overallComment }),

  resetForm: () =>
    set({
      selectedEmployee: null,
      currentDimensionIndex: 0,
      ratings: new Map(),
      overallComment: '',
    }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Reviews Actions
  setMyReviews: (myReviews) => set({ myReviews }),
  setReviewsAboutMe: (reviewsAboutMe) => set({ reviewsAboutMe }),
  setLoadingReviews: (isLoadingReviews) => set({ isLoadingReviews }),

  // Results Actions
  setRadarData: (radarData) => set({ radarData }),
  setJourneyData: (journeyData) => set({ journeyData }),
  setMyBadges: (myBadges) => set({ myBadges }),
  setLoadingResults: (isLoadingResults) => set({ isLoadingResults }),
}));
