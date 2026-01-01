"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Calendar,
  CheckCircle2
} from "lucide-react";

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
  createdAt: string;
}

interface GoalsTrackerProps {
  onGoalsUpdate?: () => void;
}

export function GoalsTracker({ onGoalsUpdate }: GoalsTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'currentValue' | 'createdAt'>>({
    name: "",
    target: 1,
    unit: "days",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    category: "tasks",
    color: "bg-blue-500"
  });

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('momentum_goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const handleAddGoal = () => {
    if (!newGoal.name.trim()) return;
    
    const goal: Goal = {
      ...newGoal,
      id: `goal_${Date.now()}`,
      currentValue: 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    localStorage.setItem('momentum_goals', JSON.stringify(updatedGoals));
    
    // Reset form
    setNewGoal({
      name: "",
      target: 1,
      unit: "days",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: "tasks",
      color: "bg-blue-500"
    });
    setIsAddingGoal(false);
    
    onGoalsUpdate?.();
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    );
    setGoals(updatedGoals);
    localStorage.setItem('momentum_goals', JSON.stringify(updatedGoals));
    onGoalsUpdate?.();
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem('momentum_goals', JSON.stringify(updatedGoals));
    onGoalsUpdate?.();
  };

  const updateGoalProgress = (id: string, value: number) => {
    handleUpdateGoal(id, { currentValue: value });
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min(100, Math.round((goal.currentValue / goal.target) * 100));
  };

  const getStatus = (goal: Goal) => {
    const progress = getProgressPercentage(goal);
    if (progress >= 100) return { status: 'Achieved', color: 'bg-green-500' };
    if (progress >= 75) return { status: 'On Track', color: 'bg-blue-500' };
    if (progress >= 50) return { status: 'Behind', color: 'bg-yellow-500' };
    return { status: 'Needs Attention', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Add New Goal */}
      {!isAddingGoal ? (
        <Button onClick={() => setIsAddingGoal(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Goal
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={newGoal.name}
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                placeholder="e.g., Complete 20 tasks"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={newGoal.unit} onValueChange={(value) => setNewGoal({...newGoal, unit: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="sessions">Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newGoal.startDate}
                  onChange={(e) => setNewGoal({...newGoal, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newGoal.endDate}
                  onChange={(e) => setNewGoal({...newGoal, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tasks">Task Completion</SelectItem>
                  <SelectItem value="streak">Streak Maintenance</SelectItem>
                  <SelectItem value="score">Performance Score</SelectItem>
                  <SelectItem value="habits">Habit Tracking</SelectItem>
                  <SelectItem value="learning">Learning Goals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddGoal} className="flex-1">
                Save Goal
              </Button>
              <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            const status = getStatus(goal);
            
            return (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {goal.name}
                        <Badge variant="secondary">{goal.category}</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {goal.currentValue} / {goal.target} {goal.unit} • {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge className={status.color}>{status.status}</Badge>
                    <div className="text-sm text-muted-foreground">
                      {goal.currentValue} of {goal.target} {goal.unit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No goals set yet</p>
            <p className="text-sm mt-1">Add your first goal to start tracking progress</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}