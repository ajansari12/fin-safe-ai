import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PublicPageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Public page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-orange-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Something went wrong
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                We're sorry, but there was an error loading the page. Please try again.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                size="lg"
                className="text-base rounded-xl"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}