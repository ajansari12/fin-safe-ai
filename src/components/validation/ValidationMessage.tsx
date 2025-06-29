
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface ValidationMessageProps {
  type: 'error' | 'warning' | 'success';
  message: string;
  className?: string;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ type, message, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return '';
    }
  };

  return (
    <Alert className={`${getAlertClass()} ${className}`}>
      {getIcon()}
      <AlertDescription className="ml-2">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default ValidationMessage;
