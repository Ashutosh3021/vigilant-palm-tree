import type { Task } from "./types";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if a task should appear in today's view
 */
export function isTaskForToday(task: Task, todayStr: string = getTodayStr()): boolean {
  const today = new Date(todayStr);
  const taskDate = new Date(task.date);
  
  // If task is recurring, check if it occurs today
  if (task.isRecurring && task.recurrenceDays) {
    return isRecurringOnDay(task, today);
  }
  
  // For non-recurring tasks, check if due date is today or overdue
  if (task.completed) {
    // For completed tasks, only show if completed today
    return task.updated_at?.split("T")[0] === todayStr || task.created_at?.split("T")[0] === todayStr;
  } else {
    // For incomplete tasks, show if due today or overdue
    return taskDate <= today;
  }
}

/**
 * Check if a recurring task occurs on a specific day
 */
function isRecurringOnDay(task: Task, targetDate: Date): boolean {
  if (!task.recurrenceDays) return false;
  
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return !!task.recurrenceDays[dayOfWeek as keyof typeof task.recurrenceDays];
}

/**
 * Get all tasks for today
 */
export function getTodaysTasks(tasks: Task[]): Task[] {
  const todayStr = getTodayStr();
  return tasks.filter(task => isTaskForToday(task, todayStr));
}

/**
 * Get only active tasks (not completed, not overdue)
 */
export function getActiveTodaysTasks(tasks: Task[]): Task[] {
  const todayStr = getTodayStr();
  const today = new Date(todayStr);
  
  return tasks.filter(task => {
    if (task.completed) return false; // Exclude completed tasks
    
    // If recurring, check if it occurs today
    if (task.isRecurring && task.recurrenceDays) {
      return isRecurringOnDay(task, today);
    }
    
    // For non-recurring, check if due today
    const taskDate = new Date(task.date);
    return taskDate.toDateString() === today.toDateString();
  });
}

/**
 * Get overdue tasks (due before today, not completed)
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const todayStr = getTodayStr();
  const today = new Date(todayStr);
  
  return tasks.filter(task => {
    if (task.completed) return false; // Exclude completed tasks
    
    // If recurring, it can't be overdue since it reappears each day it's scheduled
    if (task.isRecurring && task.recurrenceDays) {
      // Check if it should occur today but was due before today
      const taskDate = new Date(task.date);
      return taskDate < today && isRecurringOnDay(task, today);
    }
    
    // For non-recurring, check if due date is before today
    const taskDate = new Date(task.date);
    return taskDate < today;
  });
}

/**
 * Get completed tasks for today only
 */
export function getCompletedTodaysTasks(tasks: Task[]): Task[] {
  const todayStr = getTodayStr();
  
  return tasks.filter(task => {
    if (!task.completed) return false; // Only completed tasks
    
    // Check if task was completed today
    // We'll check both updated_at and a potential completed_date field if available
    const completedDate = task.updated_at ? task.updated_at.split("T")[0] : 
                         task.created_at ? task.created_at.split("T")[0] : 
                         todayStr;
    
    return completedDate === todayStr;
  });
}

/**
 * Get scheduled tasks (due after today)
 */
export function getScheduledTasks(tasks: Task[]): Task[] {
  const todayStr = getTodayStr();
  const today = new Date(todayStr);
  
  return tasks.filter(task => {
    if (task.completed) return false; // Exclude completed tasks
    
    // For recurring tasks, we don't show them as scheduled since they appear daily
    if (task.isRecurring && task.recurrenceDays) {
      return false;
    }
    
    // For non-recurring, check if due date is after today
    const taskDate = new Date(task.date);
    return taskDate > today;
  });
}