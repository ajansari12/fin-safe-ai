import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdaptiveLoading } from '@/hooks/useAdaptiveLoading';

interface GlobalLoadingBarProps {
  className?: string;
}

const GlobalLoadingBar: React.FC<GlobalLoadingBarProps> = ({ className }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { isLoading, progress: adaptiveProgress } = useAdaptiveLoading(
    async () => {
      // Simulate route loading time
      await new Promise(resolve => setTimeout(resolve, 200));
    },
    {
      initialTimeout: 3000,
      progressUpdateInterval: 50,
      enableProgressTracking: true,
      adaptiveTimeout: true
    }
  );

  useEffect(() => {
    // Show loading bar on route change
    setIsVisible(true);
    setProgress(0);
    
    // Simulate progressive loading
    const timer = setTimeout(() => {
      setProgress(100);
      
      // Hide after animation completes
      setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20 ${className}`}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ 
          width: `${Math.max(progress, adaptiveProgress)}%`,
          boxShadow: '0 0 10px hsl(var(--primary) / 0.6)'
        }}
      />
    </div>
  );
};

export default GlobalLoadingBar;