/**
 * Hook to track user's bike viewing behavior
 * Call this when a user views a bike detail page
 */

'use client';

import { useEffect } from 'react';
import { trackBikeView } from '@/actions/user-preferences';

export function useBikeViewTracking(bikeId) {
  useEffect(() => {
    if (!bikeId) return;

    // Track when user lands on the page
    const startTime = Date.now();

    // Track view immediately
    trackBikeView(bikeId, 0);

    // Track time spent on page when leaving
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      // Use keepalive to ensure the request is sent
      navigator.sendBeacon('/api/track-bike-view', JSON.stringify({ 
        bikeId, 
        timeSpent 
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [bikeId]);
}
