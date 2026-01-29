import { format, formatDistance, formatRelative } from 'date-fns';
import { CardRarity, BadgeTier } from '@/types';

/**
 * Format a date string to a readable format
 */
export const formatDate = (date: string | Date, formatStr = 'MMM d, yyyy'): string => {
  return format(new Date(date), formatStr);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

/**
 * Get relative date (e.g., "today at 3:00 PM")
 */
export const getRelativeDate = (date: string | Date): string => {
  return formatRelative(new Date(date), new Date());
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: CardRarity): string => {
  const colors: Record<CardRarity, string> = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FFD700',
  };
  return colors[rarity];
};

/**
 * Get badge tier color
 */
export const getBadgeTierColor = (tier: BadgeTier): string => {
  const colors: Record<BadgeTier, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
  };
  return colors[tier];
};

/**
 * Calculate level from XP
 */
export const calculateLevel = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100));
};

/**
 * Calculate XP needed for next level
 */
export const calculateNextLevelXP = (currentLevel: number): number => {
  // XP for level n = (n + 1)^2 * 100
  return Math.pow(currentLevel + 1, 2) * 100;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Class name utility (simple clsx alternative)
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
