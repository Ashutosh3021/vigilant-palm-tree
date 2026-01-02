import { useState, useEffect } from 'react';
import { Badge } from '@/types/badges';
import { checkAllBadges, getAllBadges, getUnlockedBadges } from '@/lib/badges';

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize badges
  useEffect(() => {
    const initializeBadges = () => {
      try {
        const allBadges = getAllBadges();
        setBadges(allBadges);
        
        // Check for newly unlocked badges
        const newUnlocks = checkAllBadges();
        if (newUnlocks.length > 0) {
          setNewlyUnlocked(newUnlocks[0]); // Show the first new unlock
          // Update badges state after unlock check
          setBadges(getAllBadges());
        }
      } catch (error) {
        console.error('Error initializing badges:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeBadges();

    // Listen for badge unlock events
    const handleBadgeUnlock = (event: Event) => {
      const customEvent = event as CustomEvent<Badge>;
      setNewlyUnlocked(customEvent.detail);
      setBadges(getAllBadges());
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlock as EventListener);

    return () => {
      window.removeEventListener('badgeUnlocked', handleBadgeUnlock as EventListener);
    };
  }, []);

  // Function to manually check for new badges
  const checkForNewBadges = () => {
    const newUnlocks = checkAllBadges();
    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks[0]);
      setBadges(getAllBadges());
    }
    return newUnlocks;
  };

  // Get unlocked badges count
  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const totalCount = badges.length;

  return {
    badges,
    unlockedBadges: badges.filter(badge => badge.unlocked),
    lockedBadges: badges.filter(badge => !badge.unlocked),
    newlyUnlocked,
    unlockedCount,
    totalCount,
    loading,
    checkForNewBadges,
    dismissNewUnlock: () => setNewlyUnlocked(null),
  };
}