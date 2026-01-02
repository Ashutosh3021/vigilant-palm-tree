import React from 'react';
import Image from 'next/image';
import { Badge } from '@/types/badges';

interface BadgeDisplayProps {
  level: number;
  size?: '64x64' | '128x128' | '256x256' | '512x512';
  showLabel?: boolean;
  unlocked?: boolean;
  onClick?: () => void;
  className?: string;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  level,
  size = '128x128',
  showLabel = false,
  unlocked = true,
  onClick,
  className = ''
}) => {
  // Determine image dimensions based on size prop
  const sizeMap = {
    '64x64': 64,
    '128x128': 128,
    '256x256': 256,
    '512x512': 512
  };

  const dimension = sizeMap[size];
  
  // Determine if badge should be grayed out (locked)
  const isLocked = !unlocked;
  
  // Badge names for labels
  const badgeNames = [
    "First Day Login",
    "7-Day Streak",
    "Fortnight Master",
    "Month Master",
    "Productive Journey",
    "Task Master",
    "High Performer",
    "Century Club"
  ];

  const badgeName = badgeNames[level] || `Level ${level} Badge`;
  const badgePath = `/assets/badges/level${level}/level${level}_${size}.png`;

  return (
    <div 
      className={`
        inline-block cursor-pointer transition-all duration-300 hover:scale-105
        ${className}
      `}
      onClick={onClick}
      aria-label={`${unlocked ? 'Unlocked' : 'Locked'} ${badgeName}`}
    >
      <div className={`
        relative rounded-full overflow-hidden
        ${isLocked ? 'opacity-50 grayscale' : 'opacity-100'}
        ${size === '64x64' ? 'p-1' : size === '128x128' ? 'p-2' : size === '256x256' ? 'p-3' : 'p-4'}
      `}>
        <Image
          src={badgePath}
          alt={unlocked ? badgeName : `Locked ${badgeName}`}
          width={dimension}
          height={dimension}
          className={`
            ${unlocked ? 'brightness-100' : 'brightness-75'}
            transition-all duration-300
          `}
        />
        {isLocked && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <span className="text-white text-xs font-bold">LOCKED</span>
          </div>
        )}
      </div>
      {showLabel && (
        <div className="text-center mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          {badgeName}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;