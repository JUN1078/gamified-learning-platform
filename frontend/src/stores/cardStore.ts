import { create } from 'zustand';
import { Card, UserCard, CardAssignment } from '@/types';

interface CardState {
  allCards: Card[];
  userCards: UserCard[];
  recentAssignments: CardAssignment[];
  isLoading: boolean;
  setAllCards: (cards: Card[]) => void;
  setUserCards: (cards: UserCard[]) => void;
  setRecentAssignments: (assignments: CardAssignment[]) => void;
  addCard: (userCard: UserCard) => void;
  assignCard: (assignment: CardAssignment) => void;
  setLoading: (loading: boolean) => void;
  hasCard: (cardId: string) => boolean;
  getCardCount: (cardId: string) => number;
}

export const useCardStore = create<CardState>((set, get) => ({
  allCards: [],
  userCards: [],
  recentAssignments: [],
  isLoading: false,

  setAllCards: (allCards) => set({ allCards }),

  setUserCards: (userCards) => set({ userCards }),

  setRecentAssignments: (recentAssignments) => set({ recentAssignments }),

  addCard: (userCard) => {
    const { userCards } = get();
    const existingIndex = userCards.findIndex((c) => c.cardId === userCard.cardId);

    if (existingIndex >= 0) {
      const updated = [...userCards];
      updated[existingIndex] = {
        ...updated[existingIndex],
        count: updated[existingIndex].count + 1,
      };
      set({ userCards: updated });
    } else {
      set({ userCards: [...userCards, userCard] });
    }
  },

  assignCard: (assignment) => {
    const { recentAssignments } = get();
    set({ recentAssignments: [assignment, ...recentAssignments].slice(0, 10) });
  },

  setLoading: (isLoading) => set({ isLoading }),

  hasCard: (cardId) => {
    const { userCards } = get();
    return userCards.some((c) => c.cardId === cardId);
  },

  getCardCount: (cardId) => {
    const { userCards } = get();
    const card = userCards.find((c) => c.cardId === cardId);
    return card?.count || 0;
  },
}));
