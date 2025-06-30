
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
  data?: any;
}

interface OnboardingSession {
  id: string;
  status: 'active' | 'completed' | 'abandoned';
  currentStep?: string;
  totalSteps: number;
  completionPercentage: number;
  data?: any;
}

interface OnboardingContextType {
  onboardingStatus: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  currentSession: OnboardingSession | null;
  steps: OnboardingStep[];
  isLoading: boolean;
  startOnboarding: () => Promise<void>;
  completeStep: (stepId: string, stepName: string, data?: any) => Promise<void>;
  skipOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  getCurrentStepIndex: () => number;
  canSkip: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS = [
  { id: 'welcome', name: 'Welcome & Assessment' },
  { id: 'profile', name: 'Complete Profile' },
  { id: 'features', name: 'Feature Discovery' },
  { id: 'personalization', name: 'Personalization' },
  { id: 'goals', name: 'Goal Setting' }
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'skipped'>('not_started');
  const [currentSession, setCurrentSession] = useState<OnboardingSession | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canSkip] = useState(true); // Allow skipping for experienced users

  // Initialize onboarding state
  useEffect(() => {
    if (!user || !profile) {
      setIsLoading(false);
      return;
    }

    initializeOnboardingState();
  }, [user, profile]);

  const initializeOnboardingState = async () => {
    try {
      setIsLoading(true);
      
      // Get current onboarding status from profile - use type assertion for new fields
      const currentStatus = (profile as any)?.onboarding_status || 'not_started';
      setOnboardingStatus(currentStatus);

      // Get user's progress
      const { data: progressData } = await supabase
        .from('user_onboarding_progress')
        .select('*')
        .eq('user_id', user?.id);

      // Get active session
      const { data: sessionData } = await supabase
        .from('onboarding_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      // Initialize steps with progress
      const initializedSteps = ONBOARDING_STEPS.map(step => {
        const progress = progressData?.find(p => p.step_id === step.id);
        return {
          ...step,
          completed: progress?.completed || false,
          completedAt: progress?.completed_at,
          data: progress?.data || {}
        };
      });

      setSteps(initializedSteps);
      
      // Transform session data to match our interface
      if (sessionData?.[0]) {
        const session = sessionData[0];
        setCurrentSession({
          id: session.id,
          status: session.status as 'active' | 'completed' | 'abandoned',
          currentStep: session.current_step || undefined,
          totalSteps: session.total_steps,
          completionPercentage: session.completion_percentage,
          data: session.data
        });
      }
    } catch (error) {
      console.error('Error initializing onboarding state:', error);
      toast.error('Failed to load onboarding state');
    } finally {
      setIsLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      // Create new onboarding session
      const { data: sessionData, error: sessionError } = await supabase
        .from('onboarding_sessions')
        .insert({
          user_id: user?.id,
          current_step: ONBOARDING_STEPS[0].id,
          total_steps: ONBOARDING_STEPS.length,
          completion_percentage: 0,
          status: 'active'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_status: 'in_progress' })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Transform session data to match our interface
      setCurrentSession({
        id: sessionData.id,
        status: sessionData.status as 'active' | 'completed' | 'abandoned',
        currentStep: sessionData.current_step || undefined,
        totalSteps: sessionData.total_steps,
        completionPercentage: sessionData.completion_percentage,
        data: sessionData.data
      });
      
      setOnboardingStatus('in_progress');
      toast.success('Onboarding started! Let\'s get you set up.');
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast.error('Failed to start onboarding');
    }
  };

  const completeStep = async (stepId: string, stepName: string, data: any = {}) => {
    try {
      // Update step progress
      await supabase.rpc('update_onboarding_step', {
        p_user_id: user?.id,
        p_step_id: stepId,
        p_step_name: stepName,
        p_completed: true,
        p_data: data
      });

      // Update local state
      setSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: true, completedAt: new Date().toISOString(), data }
          : step
      ));

      // Calculate completion percentage
      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      );
      const completedCount = updatedSteps.filter(s => s.completed).length;
      const completionPercentage = Math.round((completedCount / ONBOARDING_STEPS.length) * 100);

      // Update session
      if (currentSession) {
        const nextStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId) + 1;
        const nextStep = nextStepIndex < ONBOARDING_STEPS.length ? ONBOARDING_STEPS[nextStepIndex].id : null;

        await supabase
          .from('onboarding_sessions')
          .update({
            current_step: nextStep,
            completion_percentage: completionPercentage
          })
          .eq('id', currentSession.id);

        setCurrentSession(prev => prev ? {
          ...prev,
          currentStep: nextStep || undefined,
          completionPercentage
        } : null);
      }

      toast.success(`${stepName} completed!`);
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to save progress');
    }
  };

  const skipOnboarding = async () => {
    try {
      // Update profile status
      await supabase
        .from('profiles')
        .update({ 
          onboarding_status: 'skipped',
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      // Close current session
      if (currentSession) {
        await supabase
          .from('onboarding_sessions')
          .update({ status: 'abandoned', session_end: new Date().toISOString() })
          .eq('id', currentSession.id);
      }

      setOnboardingStatus('skipped');
      setCurrentSession(null);
      toast.success('Onboarding skipped. You can restart it anytime from settings.');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast.error('Failed to skip onboarding');
    }
  };

  const completeOnboarding = async () => {
    try {
      // Update profile status
      await supabase
        .from('profiles')
        .update({ 
          onboarding_status: 'completed',
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      // Close current session
      if (currentSession) {
        await supabase
          .from('onboarding_sessions')
          .update({ 
            status: 'completed', 
            session_end: new Date().toISOString(),
            completion_percentage: 100
          })
          .eq('id', currentSession.id);
      }

      setOnboardingStatus('completed');
      setCurrentSession(null);
      toast.success('Congratulations! Onboarding completed successfully.');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  const getCurrentStepIndex = () => {
    if (!currentSession?.currentStep) return 0;
    return ONBOARDING_STEPS.findIndex(step => step.id === currentSession.currentStep);
  };

  const value: OnboardingContextType = {
    onboardingStatus,
    currentSession,
    steps,
    isLoading,
    startOnboarding,
    completeStep,
    skipOnboarding,
    completeOnboarding,
    getCurrentStepIndex,
    canSkip
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
