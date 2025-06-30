
import React from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingWizard } from "./OnboardingWizard";

interface OnboardingGuardProps {
  children: React.ReactNode;
  bypassRoles?: string[];
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ 
  children, 
  bypassRoles = ['admin'] 
}) => {
  const { onboardingStatus, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show onboarding if user hasn't completed it
  if (onboardingStatus === 'not_started' || onboardingStatus === 'in_progress') {
    return <OnboardingWizard />;
  }

  // Show main app if onboarding is completed or skipped
  return <>{children}</>;
};
