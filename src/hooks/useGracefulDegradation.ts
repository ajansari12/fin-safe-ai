import { useState, useEffect } from 'react';

interface GracefulDegradationOptions {
  fallbackDelay?: number;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export const useGracefulDegradation = (options: GracefulDegradationOptions = {}) => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);
  
  const {
    fallbackDelay = 5000,
    enablePolling = true,
    pollingInterval = 30000
  } = options;

  useEffect(() => {
    // Check for persistent errors that indicate we should enter emergency mode
    const errorCount = parseInt(localStorage.getItem('app_error_count') || '0');
    const lastErrorTime = parseInt(localStorage.getItem('last_error_time') || '0');
    const now = Date.now();
    
    // If we've had multiple errors in the last 5 minutes, enable emergency mode
    if (errorCount > 3 && (now - lastErrorTime) < 300000) {
      setIsEmergencyMode(true);
      setFallbackActive(true);
    }

    // Auto-recovery check
    const recoveryTimer = setTimeout(() => {
      if (isEmergencyMode) {
        // Try to exit emergency mode after delay
        setIsEmergencyMode(false);
        localStorage.removeItem('app_error_count');
        localStorage.removeItem('last_error_time');
      }
    }, fallbackDelay * 3);

    return () => clearTimeout(recoveryTimer);
  }, [fallbackDelay, isEmergencyMode]);

  const reportError = () => {
    const currentCount = parseInt(localStorage.getItem('app_error_count') || '0');
    localStorage.setItem('app_error_count', (currentCount + 1).toString());
    localStorage.setItem('last_error_time', Date.now().toString());
    
    if (currentCount >= 2) {
      setIsEmergencyMode(true);
      setFallbackActive(true);
    }
  };

  const clearEmergencyMode = () => {
    setIsEmergencyMode(false);
    setFallbackActive(false);
    localStorage.removeItem('app_error_count');
    localStorage.removeItem('last_error_time');
  };

  return {
    isEmergencyMode,
    fallbackActive,
    reportError,
    clearEmergencyMode,
    shouldUsePolling: enablePolling && isEmergencyMode
  };
};