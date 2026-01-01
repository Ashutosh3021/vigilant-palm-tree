"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  Droplets, 
  Moon, 
  Monitor,
  Zap,
  Heart,
  Brain,
  Activity,
  Flame
} from "lucide-react";
import { getTasks, getDailyScores, getDailyLogs, getAnalytics, getJournalEntries } from "@/lib/storage";
import type { Task, DailyScore, JournalEntry } from "@/lib/types";

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

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'pattern' | 'alert' | 'suggestion' | 'synergy' | 'streak';
  priority: 'low' | 'medium' | 'high';
  date: string;
  action?: string;
}

export default function CoachInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
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
    
    // Generate insights based on loaded data
    const generatedInsights = generateInsights(tasks, scores, logs, journalEntries, analytics);
    setInsights(generatedInsights);
  }, []);

  const generateInsights = (
    tasks: Task[], 
    scores: DailyScore[], 
    logs: DailyLog[], 
    journalEntries: JournalEntry[], 
    analytics: any
  ): Insight[] => {
    const insights: Insight[] = [];
    
    // Pattern Detection: Time of day performance
    if (scores.length > 7) {
      // Group scores by time of day (morning, afternoon, evening)
      const morningScores = scores.filter(s => {
        const hour = new Date(s.date).getHours();
        return hour >= 5 && hour < 12;
      }).map(s => s.score);
      
      const eveningScores = scores.filter(s => {
        const hour = new Date(s.date).getHours();
        return hour >= 17 && hour < 22;
      }).map(s => s.score);
      
      if (morningScores.length > 0 && eveningScores.length > 0) {
        const avgMorning = morningScores.reduce((a, b) => a + b, 0) / morningScores.length;
        const avgEvening = eveningScores.reduce((a, b) => a + b, 0) / eveningScores.length;
        
        if (avgEvening > avgMorning + 10) { // 10% higher performance
          insights.push({
            id: 'time-of-day-pattern',
            title: 'Evening Performance Peak',
            description: `Your productivity peaks in the evening (avg ${Math.round(avgEvening)}%) compared to morning (avg ${Math.round(avgMorning)}%). Consider scheduling your most important tasks for the evening.`,
            category: 'pattern',
            priority: 'medium',
            date: new Date().toISOString().split('T')[0]
          });
        }
      }
    }
    
    // Burnout Alert: Consistent high scores followed by decline
    if (scores.length > 10) {
      // Check if there's been a consistent high performance followed by decline
      const recentScores = scores.slice(-7).map(s => s.score);
      const previousScores = scores.slice(-14, -7).map(s => s.score);
      
      if (recentScores.length === 7 && previousScores.length === 7) {
        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const avgPrevious = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
        
        if (avgPrevious > 80 && avgRecent < avgPrevious - 15) { // Significant drop after high performance
          insights.push({
            id: 'burnout-risk',
            title: 'Potential Burnout Risk',
            description: `Your performance has dropped significantly from ${Math.round(avgPrevious)}% to ${Math.round(avgRecent)}%. Consider taking a rest day to preserve your streak.`,
            category: 'alert',
            priority: 'high',
            date: new Date().toISOString().split('T')[0]
          });
        }
      }
    }
    
    // Synergy Detection: Correlation between habits
    if (journalEntries.length > 10) {
      // Check if gym + dsa correlation exists
      const gymDays = journalEntries.filter(entry => entry.customMetrics?.some(m => 
        m.name.toLowerCase().includes('gym') && m.value === 'done'
      ));
      
      const dsaDays = journalEntries.filter(entry => entry.customMetrics?.some(m => 
        m.name.toLowerCase().includes('dsa') && m.value !== '0'
      ));
      
      if (gymDays.length > 3 && dsaDays.length > 3) {
        const gymAndDsaDays = gymDays.filter(gymDay => 
          dsaDays.some(dsaDay => dsaDay.date === gymDay.date)
        );
        
        if (gymAndDsaDays.length / gymDays.length > 0.7) { // 70% of gym days also have DSA
          // Check if these combined days have higher scores
          const combinedDaysScores = scores.filter(s => 
            gymAndDsaDays.some(gymDay => gymDay.date === s.date)
          ).map(s => s.score);
          
          if (combinedDaysScores.length > 3) {
            const avgCombined = combinedDaysScores.reduce((a, b) => a + b, 0) / combinedDaysScores.length;
            const avgAll = scores.reduce((a, b) => a + b.score, 0) / scores.length;
            
            if (avgCombined > avgAll + 10) {
              insights.push({
                id: 'habit-synergy',
                title: 'Gym + DSA Synergy',
                description: `When you do both Gym and DSA on the same day, your performance is ${Math.round(avgCombined)}% compared to your average of ${Math.round(avgAll)}%. Consider pairing these activities.`,
                category: 'synergy',
                priority: 'medium',
                date: new Date().toISOString().split('T')[0]
              });
            }
          }
        }
      }
    }
    
    // Streak Protection: Current streak at risk
    if (analytics.currentStreak > 5) {
      // Check if today's score is low and streak is at risk
      const today = new Date().toISOString().split('T')[0];
      const todayScore = scores.find(s => s.date === today)?.score || 0;
      
      if (todayScore < 40) { // If today's score is very low
        insights.push({
          id: 'streak-protection',
          title: 'Streak at Risk',
          description: `Your current ${analytics.currentStreak}-day streak is at risk! Today's score is only ${todayScore}%. Complete a few high-priority tasks to protect your streak.`,
          category: 'streak',
          priority: 'high',
          date: new Date().toISOString().split('T')[0],
          action: 'Complete high-priority tasks'
        });
      }
    }
    
    // Suggestion: Task optimization
    if (tasks.length > 5) {
      // Find tasks that are frequently incomplete
      const incompleteTasks = tasks.filter(t => !t.completed && new Date(t.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days
      
      if (incompleteTasks.length > 0) {
        insights.push({
          id: 'task-optimization',
          title: 'Task Optimization',
          description: `You have ${incompleteTasks.length} tasks from the last 7 days that remain incomplete. Consider adjusting priorities or breaking them into smaller steps.`,
          category: 'suggestion',
          priority: 'medium',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    // Pattern: Best performing days
    if (scores.length > 14) {
      const dayScores: Record<string, number[]> = {};
      
      scores.forEach(score => {
        const dayOfWeek = new Date(score.date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayScores[dayOfWeek]) {
          dayScores[dayOfWeek] = [];
        }
        dayScores[dayOfWeek].push(score.score);
      });
      
      // Calculate average for each day
      const dayAverages = Object.entries(dayScores).map(([day, dayScoresArray]) => ({
        day,
        avg: dayScoresArray.reduce((a, b) => a + b, 0) / dayScoresArray.length
      }));
      
      const bestDay = dayAverages.reduce((best, current) => current.avg > best.avg ? current : best);
      const worstDay = dayAverages.reduce((worst, current) => current.avg < worst.avg ? current : worst);
      
      if (bestDay.avg > worstDay.avg + 15) { // 15% difference
        insights.push({
          id: 'best-worst-days',
          title: 'Performance Pattern',
          description: `Your best performing day is ${bestDay.day} (avg ${Math.round(bestDay.avg)}%) while your worst is ${worstDay.day} (avg ${Math.round(worstDay.avg)}%). Schedule important tasks on ${bestDay.day}.`,
          category: 'pattern',
          priority: 'medium',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
    
    // Sort insights by priority and date
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'pattern': return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'suggestion': return <Target className="h-5 w-5 text-green-500" />;
      case 'synergy': return <Activity className="h-5 w-5 text-purple-500" />;
      case 'streak': return <Flame className="h-5 w-5 text-orange-500" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Coach Insights</h1>
        <p className="text-muted-foreground">Smart insights to optimize your productivity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Your Personal Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Based on your activity patterns, here are personalized insights to help you optimize your productivity.
          </p>
          
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No insights yet. Complete more tasks and track metrics to receive personalized recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(insight.category)}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {insight.description}
                        </p>
                        {insight.action && (
                          <div className="mt-3">
                            <Badge variant="secondary" className="text-xs">
                              Recommended: {insight.action}
                            </Badge>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(insight.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Pattern Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Detecting your peak performance times</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Identifying habit synergies</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Recognizing your best performing days</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Risk Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Burnout risk detection</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Streak protection alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Performance decline warnings</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}