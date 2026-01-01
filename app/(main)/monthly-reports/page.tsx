"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Clock, 
  Droplets, 
  Moon, 
  Monitor,
  Trophy,
  FileText,
  Download,
  BarChart3,
  Users,
  Star,
  Zap
} from "lucide-react";
import { getTasks, getDailyScores, getDailyLogs, getAnalytics, getJournalEntries } from "@/lib/storage";
import type { Task, DailyScore, JournalEntry } from "@/lib/types";
import { exportReportToPDF } from "@/lib/pdf-export";

// Define DailyLog interface locally since it's not exported from types
interface DailyLog {
  date: string;
  tasks: Array<{
    taskId: string;
    priority: number;
    isCompleted: boolean;
    timeSpent: number; // in minutes
    completedAt?: string;
  }>;
  totalScore: number;
  tasksCompleted: number;
  tasksAssigned: number;
}

interface Goal {
  id: string;
  name: string;
  target: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  category: string;
  color: string;
}

export default function MonthlyReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 7));
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [analytics, setAnalytics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalProductiveDays: 0,
    lastCalculated: "",
  });

  // Load data
  useEffect(() => {
    setTasks(getTasks());
    setScores(getDailyScores());
    setLogs(getDailyLogs());
    setJournalEntries(getJournalEntries());
    setAnalytics(getAnalytics());
    
    // Load goals from localStorage or initialize
    const savedGoals = localStorage.getItem('momentum_goals');
    setGoals(savedGoals ? JSON.parse(savedGoals) : []);
  }, [selectedMonth]);

  // Calculate data for selected month
  const monthData = useMemo(() => {
    const startDate = `${selectedMonth}-01`;
    const endDate = new Date(parseInt(selectedMonth.substring(0, 4)), parseInt(selectedMonth.substring(5, 7)), 0).toISOString().split('T')[0];
    
    const monthTasks = tasks.filter(task => task.date >= startDate && task.date <= endDate);
    const monthScores = scores.filter(score => score.date >= startDate && score.date <= endDate);
    const monthLogs = logs.filter(log => log.date >= startDate && log.date <= endDate);
    const monthJournalEntries = journalEntries.filter(entry => entry.date >= startDate && entry.date <= endDate);
    
    // Calculate monthly statistics
    const completedTasks = monthTasks.filter(task => task.completed).length;
    const avgScore = monthScores.length > 0 ? 
      Math.round(monthScores.reduce((sum, score) => sum + score.score, 0) / monthScores.length) : 0;
    const productiveDays = monthScores.filter(score => score.score >= 70).length;
    const totalHours = monthLogs.reduce((sum, log) => sum + log.totalScore, 0) / 100; // Approximate hours
    
    // Calculate habit metrics from journal entries
    const avgScreenTime = monthJournalEntries.length > 0 ? 
      monthJournalEntries.reduce((sum, entry) => sum + (parseFloat(entry.screenTime || '0') || 0), 0) / monthJournalEntries.length : 0;
    const avgSleep = monthJournalEntries.length > 0 ? 
      monthJournalEntries.reduce((sum, entry) => sum + (parseFloat(entry.sleepHours || '0') || 0), 0) / monthJournalEntries.length : 0;
    const avgWater = monthJournalEntries.length > 0 ? 
      monthJournalEntries.reduce((sum, entry) => sum + (entry.waterGlasses || 0), 0) / monthJournalEntries.length : 0;
    const avgMood = monthJournalEntries.length > 0 ? 
      Math.round(monthJournalEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / monthJournalEntries.length) : 0;
    const avgEnergy = monthJournalEntries.length > 0 ? 
      Math.round(monthJournalEntries.reduce((sum, entry) => sum + (entry.energy || 0), 0) / monthJournalEntries.length) : 0;
    
    return {
      tasks: monthTasks,
      scores: monthScores,
      logs: monthLogs,
      journalEntries: monthJournalEntries,
      completedTasks,
      avgScore,
      productiveDays,
      totalHours,
      avgScreenTime,
      avgSleep,
      avgWater,
      avgMood,
      avgEnergy
    };
  }, [tasks, scores, logs, journalEntries, selectedMonth]);

  // Calculate goal progress
  const updateGoalProgress = () => {
    const updatedGoals = goals.map(goal => {
      // Calculate progress based on goal category
      switch(goal.category) {
        case 'tasks':
          const completedTasks = tasks.filter(t => 
            t.completed && 
            t.date >= goal.startDate && 
            t.date <= goal.endDate
          ).length;
          return { ...goal, currentValue: completedTasks };
        case 'streak':
          // Streaks are tracked in analytics
          return { ...goal, currentValue: analytics.currentStreak };
        case 'score':
          const monthScores = scores.filter(s => 
            s.date >= goal.startDate && 
            s.date <= goal.endDate
          );
          const avgScore = monthScores.length > 0 ? 
            Math.round(monthScores.reduce((sum, score) => sum + score.score, 0) / monthScores.length) : 0;
          return { ...goal, currentValue: avgScore };
        case 'journal':
          // For journal metrics, we'll calculate based on the entries
          const journalEntriesForGoal = journalEntries.filter(e => 
            e.date >= goal.startDate && 
            e.date <= goal.endDate
          );
          // Calculate average for numeric metrics
          if (goal.unit === 'hours') {
            const avgValue = journalEntriesForGoal.length > 0 ?
              journalEntriesForGoal.reduce((sum, entry) => sum + (parseFloat(entry[goal.name.toLowerCase().replace(/\s+/g, '') as keyof JournalEntry] as string || '0') || 0), 0) / journalEntriesForGoal.length : 0;
            return { ...goal, currentValue: avgValue };
          }
          return goal;
        default:
          return goal;
      }
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('momentum_goals', JSON.stringify(updatedGoals));
  };

  useEffect(() => {
    updateGoalProgress();
  }, [tasks, scores, journalEntries, analytics]);

  // Get month name for display
  const getMonthName = (dateString: string) => {
    const date = new Date(`${dateString}-01`);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Generate report summary
  const generateReport = async () => {
    const report = {
      title: `Monthly Report - ${getMonthName(selectedMonth)}`,
      dateRange: selectedMonth,
      summary: {
        productiveDays: monthData.productiveDays,
        avgScore: monthData.avgScore,
        completedTasks: monthData.completedTasks,
        totalHours: monthData.totalHours
      },
      goals: goals.map(goal => ({
        name: goal.name,
        progress: `${goal.currentValue} / ${goal.target} ${goal.unit}`,
        status: goal.currentValue >= goal.target ? 'Achieved' : 'In Progress'
      })),
      habits: {
        avgScreenTime: monthData.avgScreenTime,
        avgSleep: monthData.avgSleep,
        avgWater: monthData.avgWater,
        avgMood: monthData.avgMood,
        avgEnergy: monthData.avgEnergy
      },
      achievements: analytics.currentStreak >= 7 ? ["7-Day Streak Achieved"] : []
    };
    
    // Generate PDF report
    const success = await exportReportToPDF(report);
    if (success) {
      console.log("Monthly Report generated successfully:", report);
    } else {
      alert("Error generating PDF report. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Monthly Reports</h1>
          <p className="text-muted-foreground">Track your progress and analyze your performance</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = date.toISOString().substring(0, 7);
              return (
                <option key={monthStr} value={monthStr}>
                  {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              );
            })}
          </select>
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Executive Summary - {getMonthName(selectedMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Avg Score</span>
              </div>
              <p className="text-2xl font-bold">{monthData.avgScore}%</p>
              <p className="text-xs text-muted-foreground">Monthly average</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Tasks Completed</span>
              </div>
              <p className="text-2xl font-bold">{monthData.completedTasks}</p>
              <p className="text-xs text-muted-foreground">Out of {monthData.tasks.length}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Productive Days</span>
              </div>
              <p className="text-2xl font-bold">{monthData.productiveDays}</p>
              <p className="text-xs text-muted-foreground">70%+ score days</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Estimated Hours</span>
              </div>
              <p className="text-2xl font-bold">{monthData.totalHours.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Based on scores</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = goal.target > 0 ? Math.min(100, (goal.currentValue / goal.target) * 100) : 0;
                const status = goal.currentValue >= goal.target ? 'success' : 'in-progress';
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{goal.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {goal.currentValue} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress value={progress} className={`h-2 ${goal.color}`} />
                    <div className="flex justify-between text-sm">
                      <span>{status === 'success' ? '✓ Achieved' : 'In Progress'}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No goals set for this month</p>
              <p className="text-sm mt-1">Set goals in the goals section to track progress</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habit Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Habit Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 border rounded-lg bg-card text-center">
              <Monitor className="h-6 w-6 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{monthData.avgScreenTime.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Avg Screen Time</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Moon className="h-6 w-6 mx-auto text-indigo-500 mb-2" />
              <p className="text-2xl font-bold">{monthData.avgSleep.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Avg Sleep</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Droplets className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-2xl font-bold">{monthData.avgWater.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Avg Water Glasses</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{monthData.avgMood}</p>
              <p className="text-xs text-muted-foreground">Avg Mood (1-10)</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Zap className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{monthData.avgEnergy}</p>
              <p className="text-xs text-muted-foreground">Avg Energy (1-10)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Weekly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, weekIndex) => {
              // Calculate week start and end dates
              const startDate = new Date(selectedMonth + '-01');
              startDate.setDate(startDate.getDate() + (weekIndex * 7));
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + 6);
              
              const weekScores = scores.filter(score => 
                score.date >= startDate.toISOString().split('T')[0] && 
                score.date <= endDate.toISOString().split('T')[0]
              );
              
              const weekAvg = weekScores.length > 0 ? 
                Math.round(weekScores.reduce((sum, score) => sum + score.score, 0) / weekScores.length) : 0;
              
              const weekProductiveDays = weekScores.filter(score => score.score >= 70).length;
              
              return (
                <div key={weekIndex} className="p-4 border rounded-lg bg-card">
                  <h3 className="font-medium mb-2">Week {weekIndex + 1}</h3>
                  <p className="text-2xl font-bold mb-1">{weekAvg}%</p>
                  <p className="text-sm text-muted-foreground mb-2">{weekProductiveDays} productive days</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${weekAvg}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthData.avgScore >= 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Great Performance!</span>
                </div>
                <p className="text-sm mt-1">Your monthly average of {monthData.avgScore}% is excellent!</p>
              </div>
            )}
            
            {analytics.currentStreak >= 7 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Streak Maintained</span>
                </div>
                <p className="text-sm mt-1">You've maintained a {analytics.currentStreak}-day streak!</p>
              </div>
            )}
            
            {monthData.productiveDays > 20 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Consistent Performance</span>
                </div>
                <p className="text-sm mt-1">With {monthData.productiveDays} productive days, you've been very consistent!</p>
              </div>
            )}
            
            {monthData.avgSleep < 6 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Sleep Opportunity</span>
                </div>
                <p className="text-sm mt-1">Your average sleep of {monthData.avgSleep.toFixed(1)} hours is below recommended levels.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}