import { Task, DailyScore } from '@/lib/types';
import { getTasks, getDailyLogs, getAnalytics } from '@/lib/storage';
import { Badge, BadgeProgress, BadgeLevel } from '@/types/badges';

// Badge names and descriptions
const BADGE_INFO = [
  {
    name: "First Day Login",
    description: "Welcome to MomentumTracker",
    requirement: "Login for the first time"
  },
  {
    name: "7-Day Streak",
    description: "Maintained momentum for a full week!",
    requirement: "Complete tasks for 7 consecutive days with score > 50% each day"
  },
  {
    name: "Fortnight Master",
    description: "Two weeks of consistent effort!",
    requirement: "Maintain tasks for 14 consecutive days"
  },
  {
    name: "Month Master",
    description: "A full month of dedication!",
    requirement: "30 consecutive days OR 30 days at 80%+ score total"
  },
  {
    name: "Productive Journey",
    description: "50 days of productive momentum!",
    requirement: "Log in and complete tasks for 50 total days (not consecutive)"
  },
  {
    name: "Task Master",
    description: "100 tasks conquered!",
    requirement: "Complete 100 total tasks"
  },
  {
    name: "High Performer",
    description: "Exceptional performance!",
    requirement: "Achieve 90%+ score on 10 different days"
  },
  {
    name: "Century Club",
    description: "100 days of consistent achievement!",
    requirement: "Log in and complete tasks for 100 total days (not consecutive)"
  }
];

/**
 * Get all badge information
 */
export function getAllBadges(): Badge[] {
  const unlockedBadges = getUnlockedBadges();
  const allBadges: Badge[] = [];
  
  for (let level = 0; level <= 7; level++) {
    const badgeInfo = BADGE_INFO[level];
    const unlockedBadge = unlockedBadges.find(b => b.level === level);
    
    const badge: Badge = {
      level,
      name: badgeInfo.name,
      description: badgeInfo.description,
      imageFolder: `level${level}`,
      unlocked: !!unlockedBadge,
      unlockedDate: unlockedBadge?.unlockedDate,
      requirement: badgeInfo.requirement
    };
    
    // Calculate progress for locked badges
    if (!badge.unlocked) {
      const progress = calculateBadgeProgress(level);
      if (progress) {
        badge.progress = progress.percentage;
      }
    }
    
    allBadges.push(badge);
  }
  
  return allBadges;
}

/**
 * Get only unlocked badges
 */
export function getUnlockedBadges(): Badge[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem('momentum_badges');
  if (!data) return [];
  
  try {
    const badges: Badge[] = JSON.parse(data);
    return badges.filter(b => b.unlocked);
  } catch (error) {
    console.error('Error parsing badges from localStorage:', error);
    return [];
  }
}

/**
 * Save unlocked badge to localStorage
 */
export function saveUnlockedBadge(badge: Badge): void {
  if (typeof window === 'undefined') return;
  
  const unlockedBadges = getUnlockedBadges();
  const existingIndex = unlockedBadges.findIndex(b => b.level === badge.level);
  
  if (existingIndex >= 0) {
    // Update existing badge
    unlockedBadges[existingIndex] = badge;
  } else {
    // Add new badge
    unlockedBadges.push(badge);
  }
  
  localStorage.setItem('momentum_badges', JSON.stringify(unlockedBadges));
  
  // Dispatch event to notify other parts of the app
  window.dispatchEvent(new CustomEvent('badgeUnlocked', { detail: badge }));
}

/**
 * Calculate progress for a specific badge level
 */
export function calculateBadgeProgress(level: number): BadgeProgress | null {
  switch (level) {
    case BadgeLevel.LEVEL_0:
      return checkLevel0Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_1:
      return checkLevel1Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_2:
      return checkLevel2Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_3:
      return checkLevel3Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_4:
      return checkLevel4Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_5:
      return checkLevel5Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_6:
      return checkLevel6Badge(true) as BadgeProgress;
    case BadgeLevel.LEVEL_7:
      return checkLevel7Badge(true) as BadgeProgress;
    default:
      return null;
  }
}

/**
 * Check if Level 0 badge is earned (First Day Login)
 */
export function checkLevel0Badge(withProgress: boolean = false): boolean | BadgeProgress {
  // Level 0 is earned when the user has any tasks or logs
  const tasks = getTasks();
  const dailyLogs = getDailyLogs();
  
  const hasTasks = tasks.length > 0;
  const hasLogs = Object.keys(dailyLogs).length > 0;
  
  const earned = hasTasks || hasLogs;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_0,
      current: earned ? 1 : 0,
      target: 1,
      percentage: earned ? 100 : 0
    };
  }
  
  return earned;
}

// Helper function to convert daily logs array to an object with date keys
function getDailyLogsAsObject() {
  const dailyLogs = getDailyLogs();
  const logsObject: { [date: string]: any } = {};
  
  dailyLogs.forEach(log => {
    logsObject[log.date] = log;
  });
  
  return logsObject;
}

/**
 * Check if Level 1 badge is earned (7-Day Streak)
 */
export function checkLevel1Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const dailyLogs = getDailyLogs();
  const sortedLogs = dailyLogs.sort((a, b) => b.date.localeCompare(a.date));
  
  let streakCount = 0;
  let currentStreak = 0;
  
  for (const log of sortedLogs) {
    // Check if score is > 50%
    if (log.totalScore > 50) {
      currentStreak++;
      streakCount = Math.max(streakCount, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  const earned = streakCount >= 7;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_1,
      current: Math.min(currentStreak, 7),
      target: 7,
      percentage: Math.min(Math.round((Math.min(currentStreak, 7) / 7) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check if Level 2 badge is earned (14-Day Streak)
 */
export function checkLevel2Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const dailyLogs = getDailyLogs();
  const sortedLogs = dailyLogs.sort((a, b) => b.date.localeCompare(a.date));
  
  let streakCount = 0;
  let currentStreak = 0;
  
  for (const log of sortedLogs) {
    // Check if there was activity that day (any tasks completed)
    if (log.tasksCompleted > 0) {
      currentStreak++;
      streakCount = Math.max(streakCount, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  const earned = streakCount >= 14;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_2,
      current: Math.min(currentStreak, 14),
      target: 14,
      percentage: Math.min(Math.round((Math.min(currentStreak, 14) / 14) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check if Level 3 badge is earned (30-Day Streak or 30 days at 80%+)
 */
export function checkLevel3Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const dailyLogs = getDailyLogs();
  const sortedLogs = dailyLogs.sort((a, b) => b.date.localeCompare(a.date));
  
  // Check for 30-day streak
  let streakCount = 0;
  let currentStreak = 0;
  
  for (const log of sortedLogs) {
    // Check if there was activity that day (any tasks completed)
    if (log.tasksCompleted > 0) {
      currentStreak++;
      streakCount = Math.max(streakCount, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  // Check for 30 days at 80+
  let highScoreDays = 0;
  for (const log of dailyLogs) {
    if (log.totalScore >= 80) {
      highScoreDays++;
    }
  }
  
  const earned = streakCount >= 30 || highScoreDays >= 30;
  
  if (withProgress) {
    // Use the streak for progress calculation
    const progress = Math.min(currentStreak, 30);
    return {
      level: BadgeLevel.LEVEL_3,
      current: progress,
      target: 30,
      percentage: Math.min(Math.round((progress / 30) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check if Level 4 badge is earned (50 Total Days)
 */
export function checkLevel4Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const dailyLogs = getDailyLogs();
  const totalActiveDays = Object.keys(dailyLogs).length;
  
  const earned = totalActiveDays >= 50;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_4,
      current: totalActiveDays,
      target: 50,
      percentage: Math.min(Math.round((totalActiveDays / 50) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check if Level 5 badge is earned (100 Total Tasks Completed)
 */
export function checkLevel5Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const tasks = getTasks();
  const completedTasks = tasks.filter(task => task.completed).length;
  
  const earned = completedTasks >= 100;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_5,
      current: completedTasks,
      target: 100,
      percentage: Math.min(Math.round((completedTasks / 100) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check if Level 6 badge is earned (10 Days at 90%+)
 */
export function checkLevel6Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const dailyLogs = getDailyLogs();
  let highScoreDays = 0;
  
  for (const log of dailyLogs) {
    if (log.totalScore >= 90) {
      highScoreDays++;
    }
  }
  
  const earned = highScoreDays >= 10;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_6,
      current: highScoreDays,
      target: 10,
      percentage: Math.min(Math.round((highScoreDays / 10) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check if Level 7 badge is earned (100 Total Days)
 */
export function checkLevel7Badge(withProgress: boolean = false): boolean | BadgeProgress {
  const dailyLogs = getDailyLogs();
  const totalActiveDays = Object.keys(dailyLogs).length;
  
  const earned = totalActiveDays >= 100;
  
  if (withProgress) {
    return {
      level: BadgeLevel.LEVEL_7,
      current: totalActiveDays,
      target: 100,
      percentage: Math.min(Math.round((totalActiveDays / 100) * 100), 100)
    };
  }
  
  return earned;
}

/**
 * Check all badges and unlock any that have been earned
 */
export function checkAllBadges(): Badge[] {
  const allBadges = getAllBadges();
  const unlockedBadges = getUnlockedBadges();
  
  const newUnlocks: Badge[] = [];
  
  for (let level = 0; level <= 7; level++) {
    const existingUnlocked = unlockedBadges.find(b => b.level === level);
    if (existingUnlocked) continue; // Already unlocked
    
    let earned = false;
    switch (level) {
      case BadgeLevel.LEVEL_0:
        earned = checkLevel0Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_1:
        earned = checkLevel1Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_2:
        earned = checkLevel2Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_3:
        earned = checkLevel3Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_4:
        earned = checkLevel4Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_5:
        earned = checkLevel5Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_6:
        earned = checkLevel6Badge() as boolean;
        break;
      case BadgeLevel.LEVEL_7:
        earned = checkLevel7Badge() as boolean;
        break;
    }
    
    if (earned) {
      const badgeInfo = allBadges.find(b => b.level === level);
      if (badgeInfo) {
        const newBadge: Badge = {
          ...badgeInfo,
          unlocked: true,
          unlockedDate: new Date().toISOString()
        };
        
        saveUnlockedBadge(newBadge);
        newUnlocks.push(newBadge);
      }
    }
  }
  
  return newUnlocks;
}