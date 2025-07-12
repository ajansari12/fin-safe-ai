import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ErrorLogData {
  route: string;
  error_message: string;
  error_stack?: string;
  severity?: 'error' | 'warning' | 'critical';
  module_name?: string;
  component_name?: string;
  error_boundary_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

class ErrorLoggingService {
  private sessionId: string;

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  async logError(errorData: ErrorLogData): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return;

      const logEntry = {
        org_id: profile.organization_id,
        user_id: profile.id,
        route: errorData.route,
        error_message: errorData.error_message,
        error_stack: errorData.error_stack,
        user_agent: navigator.userAgent,
        severity: errorData.severity || 'error',
        module_name: errorData.module_name,
        component_name: errorData.component_name,
        error_boundary_id: errorData.error_boundary_id,
        session_id: errorData.session_id || this.sessionId,
        metadata: {
          ...errorData.metadata,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }
      };

      const { error } = await supabase
        .from('error_logs')
        .insert(logEntry);

      if (error) {
        // TODO: LOGGER_MIGRATION - Replace with logger.critical
        console.error('Failed to log error to database:', error);
      }
    } catch (err) {
      // TODO: LOGGER_MIGRATION - Replace with logger.critical  
      console.error('Error logging service failed:', err);
    }
  }

  async logComponentError(
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName: string,
    route: string
  ): Promise<void> {
    await this.logError({
      route,
      error_message: error.message,
      error_stack: error.stack,
      severity: 'error',
      component_name: componentName,
      error_boundary_id: `boundary-${componentName}`,
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      }
    });
  }

  async getErrorLogs(limit: number = 50) {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      // TODO: LOGGER_MIGRATION - Replace with logger.error
      console.error('Failed to fetch error logs:', error);
      return [];
    }
  }
}

export const errorLoggingService = new ErrorLoggingService();