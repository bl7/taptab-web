'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { checkTokenAndLogout } from './token-utils';

export const useTokenExpiration = () => {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check token expiration immediately
    const isExpired = checkTokenAndLogout();
    if (isExpired) {
      router.push('/login');
      return;
    }

    // Set up periodic checks
    intervalRef.current = setInterval(() => {
      const expired = checkTokenAndLogout();
      if (expired) {
        router.push('/login');
      }
    }, 60 * 1000); // Check every minute

    // Check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const expired = checkTokenAndLogout();
        if (expired) {
          router.push('/login');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return {
    checkExpiration: checkTokenAndLogout,
  };
}; 