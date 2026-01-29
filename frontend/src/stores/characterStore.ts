import { create } from 'zustand';
import { Character, CharacterAttribute, AttributeName, ATTRIBUTE_LABELS } from '@/types';

interface CharacterState {
  character: Character | null;
  attributes: CharacterAttribute[];
  isLoading: boolean;
  setCharacter: (character: Character) => void;
  updateAttribute: (name: AttributeName, value: number) => void;
  setLoading: (loading: boolean) => void;
  getAttributeDescriptor: (value: number) => string;
}

const getAttributeDescriptor = (value: number): string => {
  if (value >= 9) return 'Exceptional';
  if (value >= 7.5) return 'Very Strong';
  if (value >= 6) return 'Strong';
  if (value >= 4.5) return 'Developing';
  if (value >= 3) return 'Emerging';
  return 'Beginning';
};

const getAttributeLevel = (value: number): number => {
  if (value >= 9) return 5;
  if (value >= 7.5) return 4;
  if (value >= 6) return 3;
  if (value >= 4.5) return 2;
  return 1;
};

const attributeColors: Record<AttributeName, string> = {
  leadership: '#FF6B6B',
  creativity: '#FF8E53',
  communication: '#FFA07A',
  teamwork: '#FFD93D',
  problemSolving: '#6BCB77',
  innovation: '#4D96FF',
  adaptability: '#6C5CE7',
  technicalSkills: '#A29BFE',
  criticalThinking: '#FD79A8',
  empathy: '#FDCB6E',
  resilience: '#00B894',
  strategicThinking: '#0984E3',
};

export const useCharacterStore = create<CharacterState>((set, get) => ({
  character: null,
  attributes: [],
  isLoading: false,

  setCharacter: (character) => {
    const attributes: CharacterAttribute[] = Object.entries(character.attributes).map(
      ([name, value]) => ({
        name: name as AttributeName,
        displayName: ATTRIBUTE_LABELS[name as AttributeName],
        value,
        level: getAttributeLevel(value),
        descriptor: getAttributeDescriptor(value),
        color: attributeColors[name as AttributeName],
      })
    );

    set({ character, attributes });
  },

  updateAttribute: (name, value) => {
    const { character } = get();
    if (!character) return;

    const updatedCharacter = {
      ...character,
      attributes: {
        ...character.attributes,
        [name]: value,
      },
    };

    get().setCharacter(updatedCharacter);
  },

  setLoading: (isLoading) => set({ isLoading }),

  getAttributeDescriptor,
}));
