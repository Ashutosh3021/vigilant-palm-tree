/**
 * Bug Fix Validation for MomentumTracker PWA
 * 
 * This file outlines the validation tests for the 3 critical bugs that were fixed:
 * 1. Task Weightage Resets on PWA Restart
 * 2. 3-4 Second Page Load Delay on tasks page
 * 3. All Tasks Vanish When Completing One + Recurring Tasks Broken
 */

import { 
  getTasks, 
  saveTasks, 
  updateTask,
  getTasksByDate,
  getRecoveryTasks,
  saveRecoveryTasks,
  updateRecoveryTask,
  clearRecoveryTasks,
  isStreakBroken,
  generateRecoveryTasks
} from '../lib/storage';
import type { Task } from '../lib/types';

// Mock localStorage for testing purposes
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    getAll: () => store,
  };
};

// Test for Bug #1: Task Weightage Resets on PWA Restart
export const validateBug1Fix = (): boolean => {
  console.log('Validating Bug #1: Task Weightage Resets on PWA Restart');
  
  // Create a mock localStorage
  const mockStorage = createMockStorage();
  (global as any).localStorage = mockStorage;
  
  // Create tasks with priority weights
  const tasksWithWeights: Task[] = [
    {
      id: 'task-1',
      user_id: 'local',
      title: 'Task with weight',
      description: 'Test task',
      priority: 'High',
      completed: false,
      date: '2023-01-01',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      priority_weight: 85,
    }
  ];

  // Save tasks to "localStorage"
  saveTasks(tasksWithWeights);
  
  // Simulate app restart by creating a new storage instance
  const newStorage = createMockStorage();
  const savedData = mockStorage.getAll()['momentum_tasks'];
  newStorage.setItem('momentum_tasks', savedData);
  (global as any).localStorage = newStorage;
  
  // Retrieve tasks after "restart"
  const retrievedTasks = getTasks();
  
  // Validate that weights are preserved
  const weightPreserved = retrievedTasks[0]?.priority_weight === 85;
  
  console.log(`Bug #1 Fix Validation: ${weightPreserved ? 'PASSED' : 'FAILED'}`);
  console.log(`Priority weight preserved: ${weightPreserved}`);
  
  return weightPreserved;
};

// Test for Bug #2: 3-4 Second Page Load Delay
export const validateBug2Fix = (): boolean => {
  console.log('Validating Bug #2: Tasks Page Load Performance');
  
  // Create a mock localStorage
  const mockStorage = createMockStorage();
  (global as any).localStorage = mockStorage;
  
  // Create many tasks to test performance
  const manyTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
    id: `task-${i}`,
    user_id: 'local',
    title: `Task ${i}`,
    description: `Description for task ${i}`,
    priority: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
    completed: i % 4 === 0,
    date: '2023-01-01',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    priority_weight: Math.floor(Math.random() * 100),
  }));

  // Save tasks
  saveTasks(manyTasks);
  
  // Measure performance of getTasksByDate
  const startTime = performance.now ? performance.now() : Date.now();
  const todayTasks = getTasksByDate('2023-01-01');
  const endTime = performance.now ? performance.now() : Date.now();
  
  const loadTime = endTime - startTime;
  const performanceAcceptable = loadTime < 50; // Less than 50ms for 100 tasks
  
  console.log(`Bug #2 Fix Validation: ${performanceAcceptable ? 'PASSED' : 'FAILED'}`);
  console.log(`Load time for 100 tasks: ${loadTime.toFixed(2)}ms (acceptable: <50ms)`);
  
  return performanceAcceptable;
};

// Test for Bug #3: Tasks Vanish When Completing One
export const validateBug3Fix = (): boolean => {
  console.log('Validating Bug #3: Tasks Vanish When Completing One');
  
  // Create a mock localStorage
  const mockStorage = createMockStorage();
  (global as any).localStorage = mockStorage;
  
  // Create multiple tasks
  const initialTasks: Task[] = [
    {
      id: 'task-1',
      user_id: 'local',
      title: 'Task 1',
      description: 'First task',
      priority: 'High',
      completed: false,
      date: '2023-01-01',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      priority_weight: 80,
    },
    {
      id: 'task-2',
      user_id: 'local',
      title: 'Task 2',
      description: 'Second task',
      priority: 'Medium',
      completed: false,
      date: '2023-01-01',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      priority_weight: 60,
    },
    {
      id: 'task-3',
      user_id: 'local',
      title: 'Task 3',
      description: 'Third task',
      priority: 'Low',
      completed: false,
      date: '2023-01-01',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      priority_weight: 40,
    }
  ];

  saveTasks(initialTasks);

  // Verify all tasks exist initially
  const tasksBefore = getTasks();
  console.log(`Tasks before completion: ${tasksBefore.length}`);

  // Complete task #2 (the middle one)
  updateTask('task-2', { completed: true });

  // Get updated tasks
  const updatedTasks = getTasks();
  
  // Validate that all 3 tasks still exist but task-2 is completed
  const allTasksExist = updatedTasks.length === 3;
  const correctTaskCompleted = updatedTasks.find(t => t.id === 'task-2')?.completed === true;
  const otherTasksUnchanged = 
    updatedTasks.find(t => t.id === 'task-1')?.completed === false &&
    updatedTasks.find(t => t.id === 'task-3')?.completed === false;

  const bug3Fixed = allTasksExist && correctTaskCompleted && otherTasksUnchanged;

  console.log(`Bug #3 Fix Validation: ${bug3Fixed ? 'PASSED' : 'FAILED'}`);
  console.log(`All tasks exist: ${allTasksExist}`);
  console.log(`Correct task completed: ${correctTaskCompleted}`);
  console.log(`Other tasks unchanged: ${otherTasksUnchanged}`);

  return bug3Fixed;
};

// Test Recovery Tasks Functionality
export const validateRecoveryTasks = (): boolean => {
  console.log('Validating Recovery Tasks Functionality');
  
  // Create a mock localStorage
  const mockStorage = createMockStorage();
  (global as any).localStorage = mockStorage;
  
  // Generate recovery tasks
  const recoveryTasks = generateRecoveryTasks();
  
  // Validate recovery tasks structure
  const hasCorrectCount = recoveryTasks.length === 4;
  const allAreRecovery = recoveryTasks.every(task => task.isRecovery === true);
  const allAreIncomplete = recoveryTasks.every(task => task.completed === false);
  
  // Save recovery tasks
  saveRecoveryTasks(recoveryTasks);
  
  // Retrieve and validate
  const retrievedRecoveryTasks = getRecoveryTasks();
  const retrievalSuccessful = retrievedRecoveryTasks.length === 4;
  
  const recoveryTasksValid = hasCorrectCount && allAreRecovery && allAreIncomplete && retrievalSuccessful;
  
  console.log(`Recovery Tasks Validation: ${recoveryTasksValid ? 'PASSED' : 'FAILED'}`);
  console.log(`Correct count: ${hasCorrectCount}`);
  console.log(`All marked as recovery: ${allAreRecovery}`);
  console.log(`All incomplete initially: ${allAreIncomplete}`);
  console.log(`Retrieval successful: ${retrievalSuccessful}`);
  
  return recoveryTasksValid;
};

// Run all validations
export const runAllValidations = () => {
  console.log('=== Running Bug Fix Validations ===');
  
  const bug1Result = validateBug1Fix();
  const bug2Result = validateBug2Fix();
  const bug3Result = validateBug3Fix();
  const recoveryResult = validateRecoveryTasks();
  
  const allPassed = bug1Result && bug2Result && bug3Result && recoveryResult;
  
  console.log('=== Validation Summary ===');
  console.log(`Bug #1 (Weightage Reset): ${bug1Result ? 'FIXED' : 'NOT FIXED'}`);
  console.log(`Bug #2 (Performance): ${bug2Result ? 'FIXED' : 'NOT FIXED'}`);
  console.log(`Bug #3 (Task Deletion): ${bug3Result ? 'FIXED' : 'NOT FIXED'}`);
  console.log(`Recovery Tasks: ${recoveryResult ? 'WORKING' : 'NOT WORKING'}`);
  console.log(`Overall Status: ${allPassed ? 'ALL BUGS FIXED' : 'SOME BUGS REMAIN'}`);
  
  return allPassed;
};