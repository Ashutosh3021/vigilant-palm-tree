"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Calendar, 
  CheckCircle2, 
  TrendingUp,
  Award,
  Heart,
  Dumbbell,
  BookOpen,
  Code,
  GraduationCap
} from "lucide-react";
import { getAnalytics, saveAnalytics, getTasks, getDailyScores } from "@/lib/storage";
import type { Task } from "@/lib/types";

// Define achievement types
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  achieved: boolean;
  achievedDate?: string;
  progress?: number;
  target?: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalProductiveDays: 0,
    lastCalculated: "",
  });

  // Load analytics and calculate achievements
  useEffect(() => {
    const analyticsData = getAnalytics();
    setAnalytics(analyticsData);
    
    // Get tasks and scores to calculate achievements
    const tasks = getTasks();
    const scores = getDailyScores();
    
    // Calculate achievements based on current data
    const newAchievements = calculateAchievements(tasks, scores, analyticsData);
    setAchievements(newAchievements);
  }, []);

  const calculateAchievements = (tasks: Task[], scores: any[], analytics: any): Achievement[] => {
    const achievements: Achievement[] = [];
    
    // 7-Day Streak Achievement
    achievements.push({
      id: "7-day-streak",
      name: "7-Day Streak",
      description: "Maintained 7 days of 70%+ scores",
      icon: Trophy,
      iconColor: "text-yellow-500",
      achieved: analytics.currentStreak >= 7,
      achievedDate: analytics.currentStreak >= 7 ? new Date().toISOString().split('T')[0] : undefined,
      progress: analytics.currentStreak,
      target: 7
    });
    
    // 14-Day Streak Achievement
    achievements.push({
      id: "14-day-streak",
      name: "Fortnight Master",
      description: "Maintained 14 days of 70%+ scores",
      icon: Trophy,
      iconColor: "text-orange-500",
      achieved: analytics.currentStreak >= 14,
      achievedDate: analytics.currentStreak >= 14 ? new Date().toISOString().split('T')[0] : undefined,
      progress: analytics.currentStreak,
      target: 14
    });
    
    // 30-Day Streak Achievement
    achievements.push({
      id: "30-day-streak",
      name: "Month Master",
      description: "Maintained 30 days of 70%+ scores",
      icon: Trophy,
      iconColor: "text-red-500",
      achieved: analytics.currentStreak >= 30,
      achievedDate: analytics.currentStreak >= 30 ? new Date().toISOString().split('T')[0] : undefined,
      progress: analytics.currentStreak,
      target: 30
    });
    
    // 100-Day Streak Achievement
    achievements.push({
      id: "100-day-streak",
      name: "Century Club",
      description: "Maintained 100 days of 70%+ scores",
      icon: Trophy,
      iconColor: "text-purple-500",
      achieved: analytics.currentStreak >= 100,
      achievedDate: analytics.currentStreak >= 100 ? new Date().toISOString().split('T')[0] : undefined,
      progress: analytics.currentStreak,
      target: 100
    });
    
    // Productive Days Achievement
    achievements.push({
      id: "productive-days",
      name: "Productive Journey",
      description: "Completed 50 productive days",
      icon: TrendingUp,
      iconColor: "text-green-500",
      achieved: analytics.totalProductiveDays >= 50,
      achievedDate: analytics.totalProductiveDays >= 50 ? new Date().toISOString().split('T')[0] : undefined,
      progress: analytics.totalProductiveDays,
      target: 50
    });
    
    // Task Completion Achievement
    const completedTasks = tasks.filter(t => t.completed).length;
    achievements.push({
      id: "task-completion",
      name: "Task Master",
      description: "Completed 100 tasks",
      icon: CheckCircle2,
      iconColor: "text-blue-500",
      achieved: completedTasks >= 100,
      achievedDate: completedTasks >= 100 ? new Date().toISOString().split('T')[0] : undefined,
      progress: completedTasks,
      target: 100
    });
    
    // High Performance Achievement
    const highScoreDays = scores.filter((s: any) => s.score >= 90).length;
    achievements.push({
      id: "high-performance",
      name: "High Performer",
      description: "Achieved 90%+ score on 10 days",
      icon: Star,
      iconColor: "text-yellow-400",
      achieved: highScoreDays >= 10,
      achievedDate: highScoreDays >= 10 ? new Date().toISOString().split('T')[0] : undefined,
      progress: highScoreDays,
      target: 10
    });
    
    // Consistency Achievement
    const consistentDays = scores.filter((s: any) => s.score >= 70).length;
    achievements.push({
      id: "consistency",
      name: "Consistency King",
      description: "Maintained 70%+ score for 30 days",
      icon: Zap,
      iconColor: "text-blue-400",
      achieved: consistentDays >= 30,
      achievedDate: consistentDays >= 30 ? new Date().toISOString().split('T')[0] : undefined,
      progress: consistentDays,
      target: 30
    });
    
    return achievements;
  };

  const getAchievementIcon = (icon: any, achieved: boolean) => {
    const IconComponent = icon;
    return (
      <div className={`p-3 rounded-full ${achieved ? 'bg-primary/10' : 'bg-muted'}`}>
        <IconComponent className={`h-6 w-6 ${achieved ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
    );
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Celebrate your wins and track your progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-card text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <h3 className="font-semibold">Current Streak</h3>
              <p className="text-2xl font-bold">{analytics.currentStreak} days</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Trophy className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <h3 className="font-semibold">Longest Streak</h3>
              <p className="text-2xl font-bold">{analytics.longestStreak} days</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-semibold">Productive Days</h3>
              <p className="text-2xl font-bold">{analytics.totalProductiveDays}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card text-center">
              <Calendar className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <h3 className="font-semibold">Account Age</h3>
              <p className="text-2xl font-bold">New</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`${achievement.achieved ? 'border-primary border-2' : 'opacity-70'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getAchievementIcon(achievement.icon, achievement.achieved)}
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {achievement.name}
                        {achievement.achieved && (
                          <Badge className="ml-2">Achieved</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      
                      {!achievement.achieved && achievement.target && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress} / {achievement.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(achievement.progress || 0, achievement.target || 1)}`}
                              style={{ width: `${Math.min(100, (achievement.progress || 0) / (achievement.target || 1) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {achievement.achieved && achievement.achievedDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Achieved on {new Date(achievement.achievedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {achievements.filter(a => a.achieved).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No achievements yet. Complete tasks to earn badges!</p>
              <p className="text-sm mt-1">Start by completing your first task</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.filter(a => a.achieved).length > 0 ? (
            <div className="space-y-3">
              {achievements
                .filter(a => a.achieved)
                .sort((a, b) => new Date(b.achievedDate || '').getTime() - new Date(a.achievedDate || '').getTime())
                .slice(0, 5)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getAchievementIcon(achievement.icon, true)}
                    <div>
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Achieved {new Date(achievement.achievedDate!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent achievements yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}