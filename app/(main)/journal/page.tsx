"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  Droplets, 
  Moon, 
  Monitor, 
  Smile, 
  Plus, 
  TrendingUp, 
  Target 
} from "lucide-react";
import { getJournalEntries, saveJournalEntry } from "@/lib/storage";
import type { JournalEntry } from "@/lib/types";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [screenTime, setScreenTime] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const [waterGlasses, setWaterGlasses] = useState<string>("");
  const [mood, setMood] = useState<string>("5");
  const [energy, setEnergy] = useState<string>("5");
  const [customMetrics, setCustomMetrics] = useState<{name: string, value: string}[]>([]);

  // Load existing entries
  useEffect(() => {
    const savedEntries = getJournalEntries();
    setEntries(savedEntries);
    
    // Load today's entry if it exists
    const todayEntry = savedEntries.find((entry: JournalEntry) => entry.date === currentDate);
    if (todayEntry) {
      setScreenTime(todayEntry.screenTime?.toString() || "");
      setSleepHours(todayEntry.sleepHours?.toString() || "");
      setWaterGlasses(todayEntry.waterGlasses?.toString() || "");
      setMood(todayEntry.mood?.toString() || "5");
      setEnergy(todayEntry.energy?.toString() || "5");
      setCustomMetrics(todayEntry.customMetrics || []);
    }
  }, [currentDate]);

  const handleSave = () => {
    const newEntry: JournalEntry = {
      date: currentDate,
      screenTime: screenTime || undefined,
      sleepHours: sleepHours || undefined,
      waterGlasses: waterGlasses ? parseInt(waterGlasses) : undefined,
      mood: mood ? parseInt(mood) : undefined,
      energy: energy ? parseInt(energy) : undefined,
      customMetrics: customMetrics.length > 0 ? customMetrics : undefined,
    };

    saveJournalEntry(newEntry);
    
    // Update entries list
    const updatedEntries = entries.filter(entry => entry.date !== currentDate);
    updatedEntries.push(newEntry);
    setEntries(updatedEntries);
  };

  const addCustomMetric = () => {
    setCustomMetrics([...customMetrics, { name: "", value: "" }]);
  };

  const updateCustomMetric = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...customMetrics];
    updated[index][field] = value;
    setCustomMetrics(updated);
  };

  const removeCustomMetric = (index: number) => {
    const updated = [...customMetrics];
    updated.splice(index, 1);
    setCustomMetrics(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Journal</h1>
        <p className="text-muted-foreground">Track your daily metrics and habits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Metrics for {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selector */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Screen Time */}
            <div>
              <Label htmlFor="screenTime">
                <Monitor className="h-4 w-4 inline mr-1" />
                Screen Time (hours)
              </Label>
              <Input
                id="screenTime"
                type="number"
                placeholder="e.g., 4.5"
                value={screenTime}
                onChange={(e) => setScreenTime(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Sleep Hours */}
            <div>
              <Label htmlFor="sleepHours">
                <Moon className="h-4 w-4 inline mr-1" />
                Sleep Hours
              </Label>
              <Input
                id="sleepHours"
                type="number"
                placeholder="e.g., 7.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Water Glasses */}
            <div>
              <Label htmlFor="waterGlasses">
                <Droplets className="h-4 w-4 inline mr-1" />
                Water Glasses
              </Label>
              <Input
                id="waterGlasses"
                type="number"
                placeholder="e.g., 8"
                value={waterGlasses}
                onChange={(e) => setWaterGlasses(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Mood */}
            <div>
              <Label htmlFor="mood">
                <Smile className="h-4 w-4 inline mr-1" />
                Mood (1-10)
              </Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Energy */}
            <div>
              <Label htmlFor="energy">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Energy (1-10)
              </Label>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger id="energy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Metrics */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <Label>
                <Target className="h-4 w-4 inline mr-1" />
                Custom Metrics
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addCustomMetric}>
                <Plus className="h-4 w-4 mr-1" />
                Add Metric
              </Button>
            </div>
            
            {customMetrics.map((metric, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Metric name (e.g., Steps)"
                  value={metric.name}
                  onChange={(e) => updateCustomMetric(index, 'name', e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Value"
                    value={metric.value}
                    onChange={(e) => updateCustomMetric(index, 'value', e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeCustomMetric(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} className="w-full mt-4">
            Save Today's Metrics
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries Preview */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {entries.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex justify-between p-2 border rounded">
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span>
                    {entry.screenTime ? `${entry.screenTime}h screen` : ''}
                    {entry.sleepHours ? `, ${entry.sleepHours}h sleep` : ''}
                    {entry.waterGlasses ? `, ${entry.waterGlasses} glasses` : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}