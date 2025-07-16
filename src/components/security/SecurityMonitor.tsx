import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced security monitoring component that tracks suspicious activities,
 * enforces security policies, and logs comprehensive security events
 */
export const SecurityMonitor: React.FC = () => {
  const { userContext } = useAuth();

  useEffect(() => {
    if (!userContext?.userId) return;

    // Log security event helper function
    const logSecurityEvent = async (eventType: string, eventCategory: string, severity: string, details: any) => {
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: eventType,
          p_event_category: eventCategory,
          p_severity: severity,
          p_event_details: details,
          p_source_ip: null,
          p_user_agent: navigator.userAgent,
          p_risk_score: severity === 'critical' ? 90 : severity === 'warning' ? 60 : 10
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    };

    // Monitor for suspicious role changes
    const monitorRoleChanges = () => {
      const channel = supabase
        .channel('security-monitor-roles')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_roles',
            filter: `user_id=eq.${userContext.userId}`
          },
          async (payload) => {
            console.log('🔒 Role change detected for current user:', payload);
            
            await logSecurityEvent(
              'role_change',
              'authorization',
              'warning',
              {
                user_id: userContext.userId,
                old_role: payload.old?.role,
                new_role: payload.new?.role,
                timestamp: new Date().toISOString()
              }
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    // Monitor for session changes and security events
    const monitorSessions = () => {
      const channel = supabase
        .channel('security-monitor-sessions')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'authentication_sessions',
            filter: `user_id=eq.${userContext.userId}`
          },
          async (payload) => {
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            if (newRecord && !newRecord.is_active && oldRecord?.is_active) {
              console.log('🔒 Session invalidated for security reasons');
              
              await logSecurityEvent(
                'session_invalidated',
                'authentication',
                'warning',
                {
                  user_id: userContext.userId,
                  session_id: newRecord.id,
                  reason: 'security_policy',
                  timestamp: new Date().toISOString()
                }
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    // Monitor for security events in real-time
    const monitorSecurityEvents = () => {
      const channel = supabase
        .channel('security-monitor-events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_events'
          },
          async (payload) => {
            const event = payload.new as any;
            
            // Handle critical security events
            if (event.severity === 'critical') {
              console.warn('🚨 Critical security event detected:', event);
              
              // Could trigger immediate notifications or actions
              // For now, we ensure it's logged appropriately
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    // Log user session activity
    const logUserActivity = async () => {
      await logSecurityEvent(
        'user_activity',
        'authentication',
        'info',
        {
          user_id: userContext.userId,
          activity_type: 'session_active',
          timestamp: new Date().toISOString()
        }
      );
    };

    // Initialize monitoring
    const cleanupRoleMonitor = monitorRoleChanges();
    const cleanupSessionMonitor = monitorSessions();
    const cleanupSecurityMonitor = monitorSecurityEvents();
    
    // Log initial activity
    logUserActivity();

    return () => {
      cleanupRoleMonitor();
      cleanupSessionMonitor();
      cleanupSecurityMonitor();
    };
  }, [userContext?.userId]);

  // This component doesn't render anything, it just provides monitoring
  return null;
};