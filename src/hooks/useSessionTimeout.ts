import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

/**
 * Hook for managing session timeout with activity tracking
 */
export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning
}: UseSessionTimeoutOptions = {}) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const handleTimeout = useCallback(async () => {
    logger.warn('Session timeout triggered', {
      component: 'useSessionTimeout',
      module: 'authentication',
      metadata: { timeoutMinutes }
    });

    try {
      await supabase.auth.signOut();
      toast.error('Session expired due to inactivity');
      onTimeout?.();
    } catch (error) {
      logger.error('Error signing out on timeout', {
        component: 'useSessionTimeout',
        module: 'authentication'
      }, error);
    }
  }, [timeoutMinutes, onTimeout]);

  const handleWarning = useCallback(() => {
    logger.info('Session timeout warning triggered', {
      component: 'useSessionTimeout',
      module: 'authentication',
      metadata: { warningMinutes }
    });

    toast.warning(`Session will expire in ${warningMinutes} minutes due to inactivity`);
    onWarning?.();
  }, [warningMinutes, onWarning]);

  const resetTimeout = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timeout
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningMs > 0) {
      warningRef.current = setTimeout(handleWarning, warningMs);
    }

    // Set session timeout
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [timeoutMinutes, warningMinutes, handleTimeout, handleWarning]);

  const handleActivity = useCallback(() => {
    // Throttle activity tracking to avoid excessive resets
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if more than 1 minute has passed since last activity
    if (timeSinceLastActivity > 60000) {
      resetTimeout();
    }
  }, [resetTimeout]);

  useEffect(() => {
    // Start timeout on mount
    resetTimeout();

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimeout, handleActivity]);

  return {
    resetTimeout,
    getLastActivity: () => lastActivityRef.current,
    isActive: () => Date.now() - lastActivityRef.current < timeoutMinutes * 60 * 1000
  };
};