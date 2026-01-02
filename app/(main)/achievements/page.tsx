'use client';

import React, { useState } from 'react';
import { useBadges } from '@/lib/hooks/useBadges';
import BadgeGrid from '@/components/badges/BadgeGrid';
import AchievementUnlockModal from '@/components/badges/AchievementUnlockModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge as BadgeIcon, Trophy, Lock, Star } from 'lucide-react';

const AchievementsPage = () => {
  const {
    badges,
    unlockedBadges,
    lockedBadges,
    newlyUnlocked,
    unlockedCount,
    totalCount,
    loading,
    checkForNewBadges,
    dismissNewUnlock
  } = useBadges();
  
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const handleBadgeClick = (badge: any) => {
    setSelectedBadge(badge);
  };

  const handleContinue = () => {
    dismissNewUnlock();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress and celebrate your milestones
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {unlockedCount}/{totalCount} Badges Unlocked
              </span>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              {unlockedCount} of {totalCount} badges unlocked
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Badges</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <BadgeGrid 
              badges={badges} 
              showProgress={true} 
              onClick={handleBadgeClick}
              size="128x128"
            />
          </TabsContent>
          
          <TabsContent value="unlocked" className="space-y-6">
            {unlockedBadges.length > 0 ? (
              <BadgeGrid 
                badges={unlockedBadges} 
                onClick={handleBadgeClick}
                size="128x128"
              />
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Badges Unlocked Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start completing tasks to earn your first badge!
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locked" className="space-y-6">
            {lockedBadges.length > 0 ? (
              <BadgeGrid 
                badges={lockedBadges} 
                showProgress={true} 
                onClick={handleBadgeClick}
                size="128x128"
              />
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  All Badges Unlocked!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Congratulations! You've earned all available badges.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AchievementUnlockModal
        badge={newlyUnlocked}
        open={!!newlyUnlocked}
        onOpenChange={() => dismissNewUnlock()}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default AchievementsPage;