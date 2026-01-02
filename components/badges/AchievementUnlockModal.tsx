import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BadgeDisplay from '@/components/badges/BadgeDisplay';
import { Badge } from '@/types/badges';

interface AchievementUnlockModalProps {
  badge: Badge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  badge,
  open,
  onOpenChange,
  onContinue
}) => {
  useEffect(() => {
    if (open && badge) {
      // Trigger celebration animation/visual effects
      const celebrationElements = document.querySelectorAll('.celebration-element');
      celebrationElements.forEach(el => {
        // Add animation classes or effects
        el.classList.add('animate-pulse');
        setTimeout(() => el.classList.remove('animate-pulse'), 1000);
      });
    }
  }, [open, badge]);

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg rounded-xl p-6">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BadgeDisplay 
              level={badge.level} 
              size="512x512" 
              unlocked={true} 
              className="transform scale-75" // Scale down for better fit
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Achievement Unlocked!
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600 dark:text-gray-300">
            {badge.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
            {badge.description}
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              Congratulations! You've reached a new milestone in your productivity journey.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onContinue} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Continue Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementUnlockModal;