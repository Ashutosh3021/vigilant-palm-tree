import { Task, DailyScore } from '@/lib/types';

export interface Badge {
  level: number;
  name: string;
  description: string;
  imageFolder: string; // "level0", "level1", etc.
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number; // For incomplete badges (0-100)
  requirement?: string; // What's needed to unlock
}

export interface BadgeProgress {
  level: number;
  current: number;
  target: number;
  percentage: number;
}

export enum BadgeLevel {
  LEVEL_0 = 0,
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
  LEVEL_7 = 7
}