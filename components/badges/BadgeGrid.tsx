import React from 'react';
import { Badge } from '@/types/badges';
import BadgeDisplay from '@/components/badges/BadgeDisplay';
import BadgeProgressBar from '@/components/badges/BadgeProgressBar';
import { Card, CardContent } from '@/components/ui/card';

interface BadgeGridProps {
  badges: Badge[];
  showProgress?: boolean;
  onClick?: (badge: Badge) => void;
  size?: '64x64' | '128x128' | '256x256';
}

const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  showProgress = false,
  onClick,
  size = '128x128'
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div 
          key={badge.level}
          className={`
            flex flex-col items-center p-4 rounded-lg border
            ${badge.unlocked 
              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
              : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'}
            transition-all duration-200 hover:shadow-md cursor-pointer
          `}
          onClick={() => onClick && onClick(badge)}
        >
          <BadgeDisplay 
            level={badge.level} 
            size={size} 
            unlocked={badge.unlocked} 
            showLabel={false}
          />
          
          <div className="mt-2 text-center">
            <h3 className={`
              font-semibold text-sm
              ${badge.unlocked 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-gray-400'}
            `}>
              {badge.name}
            </h3>
            
            {badge.unlocked && badge.unlockedDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unlocked: {new Date(badge.unlockedDate).toLocaleDateString()}
              </p>
            )}
            
            {!badge.unlocked && showProgress && badge.progress !== undefined && (
              <div className="mt-2 w-full">
                <BadgeProgressBar 
                  level={badge.level}
                  current={badge.progress} // Use progress as is (percentage)
                  target={100} // Progress is out of 100%
                  label=""
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BadgeGrid;