import React from "react";
import { CheckCircle, Shield, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuccessAnimationProps {
  title: string;
  message: string;
  details?: string[];
  onComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  title,
  message,
  details = [],
  onComplete
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      <CardContent className="p-8 text-center">
        <div className="relative mb-6">
          {/* Animated success circle */}
          <div className="mx-auto w-20 h-20 relative">
            <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 animate-bounce" />
            </div>
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute -top-2 -right-2 animate-ping">
            <Sparkles className="h-4 w-4 text-green-500" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-ping delay-75">
            <Sparkles className="h-3 w-3 text-green-400" />
          </div>
          <div className="absolute top-1 -left-3 animate-ping delay-150">
            <Shield className="h-3 w-3 text-green-600" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
          {title}
        </h3>
        
        <p className="text-green-700 dark:text-green-300 mb-4">
          {message}
        </p>

        {details.length > 0 && (
          <div className="space-y-2 mb-4">
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-200">
                  {detail}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Redirecting to dashboard...</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessAnimation;