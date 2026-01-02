import React from 'react';

interface BadgeProgressBarProps {
  level: number;
  current: number;
  target: number;
  label?: string;
  className?: string;
}

const BadgeProgressBar: React.FC<BadgeProgressBarProps> = ({
  level,
  current,
  target,
  label,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  
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

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label || badgeName}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {current}/{target} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BadgeProgressBar;