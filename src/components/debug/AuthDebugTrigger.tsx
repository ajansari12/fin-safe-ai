import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { AuthDebugPanel } from './AuthDebugPanel';

export const AuthDebugTrigger: React.FC = () => {
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  // SECURITY: Only show in development and localhost - Remove in production
  if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDebugOpen(true)}
        className="fixed bottom-4 right-4 z-40"
        title="Open Auth Debug Panel"
      >
        <Bug className="h-4 w-4" />
      </Button>
      
      <AuthDebugPanel 
        isOpen={isDebugOpen} 
        onClose={() => setIsDebugOpen(false)} 
      />
    </>
  );
};