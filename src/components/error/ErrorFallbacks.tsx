import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  RefreshCw, 
  BarChart3, 
  Users, 
  FileText,
  Home,
  TrendingUp,
  Shield
} from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const GenericErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onGoHome,
  title = "Something went wrong",
  description,
  icon = <AlertTriangle className="h-5 w-5" />
}) => (
  <Card className="w-full max-w-md mx-auto">
    <CardHeader>
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {description || error?.message || 'An unexpected error occurred'}
        </AlertDescription>
      </Alert>
      <div className="flex gap-2">
        <Button onClick={onRetry} size="sm" className="flex-1">
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline" size="sm" className="flex-1">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <GenericErrorFallback
    {...props}
    title="Analytics Error"
    description="Unable to load analytics dashboard. This might be due to a data processing issue or chart rendering problem."
    icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
  />
);

export const ThirdPartyErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <GenericErrorFallback
    {...props}
    title="Third-Party Risk Error"
    description="Unable to load vendor risk data. This might be related to data synchronization or API connectivity issues."
    icon={<Users className="h-5 w-5 text-orange-500" />}
  />
);

export const DocumentErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <GenericErrorFallback
    {...props}
    title="Document Management Error"
    description="Unable to load documents. This might be related to file processing or storage issues."
    icon={<FileText className="h-5 w-5 text-green-500" />}
  />
);

export const RiskManagementErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <GenericErrorFallback
    {...props}
    title="Risk Management Error"
    description="Unable to load risk management data. This might be related to risk calculations or data processing."
    icon={<Shield className="h-5 w-5 text-red-500" />}
  />
);

// Loading skeleton for when components are recovering
export const ErrorRecoveryFallback: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2 mt-6">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-20" />
    </div>
  </div>
);

// Inline error component for smaller errors
export const InlineError: React.FC<{
  message: string;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ message, onRetry, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4 text-lg'
  };

  return (
    <Alert className={sizeClasses[size]}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-1">
        {message}
        {onRetry && (
          <Button
            variant="link"
            size="sm"
            onClick={onRetry}
            className="mt-2 p-0 h-auto"
          >
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};