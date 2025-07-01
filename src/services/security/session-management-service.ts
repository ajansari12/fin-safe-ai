
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface UserSession {
  id: string;
  user_id: string;
  org_id: string;
  session_token: string;
  device_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

export interface SessionPolicy {
  id: string;
  org_id: string;
  policy_name: string;
  idle_timeout_minutes: number;
  absolute_timeout_minutes: number;
  max_concurrent_sessions: number;
  require_mfa_for_sensitive_actions: boolean;
  ip_restriction_enabled: boolean;
  allowed_ip_ranges: string[];
  is_active: boolean;
}

class SessionManagementService {
  // Create new session
  async createSession(deviceFingerprint?: string): Promise<string> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours default

    const sessionData = {
      user_id: profile.id,
      org_id: profile.organization_id,
      session_token: sessionToken,
      device_fingerprint: deviceFingerprint,
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      expires_at: expiresAt.toISOString()
    };

    // Check concurrent session limits
    await this.enforceConcurrentSessionLimits(profile.id, profile.organization_id);

    const { error } = await supabase
      .from('user_sessions')
      .insert([sessionData]);

    if (error) throw error;

    return sessionToken;
  }

  // Validate session
  async validateSession(sessionToken: string): Promise<boolean> {
    const { data: isValid } = await supabase.rpc('check_session_timeout', {
      session_token: sessionToken
    });

    return isValid || false;
  }

  // Update session activity
  async updateSessionActivity(sessionToken: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('session_token', sessionToken)
      .eq('is_active', true);
  }

  // Terminate session
  async terminateSession(sessionToken: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken);
  }

  // Terminate all user sessions
  async terminateAllUserSessions(userId?: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    const targetUserId = userId || profile?.id;
    
    if (!targetUserId) throw new Error('User not found');

    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', targetUserId)
      .eq('is_active', true);
  }

  // Get user's active sessions
  async getUserSessions(): Promise<UserSession[]> {
    const profile = await getCurrentUserProfile();
    if (!profile) return [];

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get session policy for organization
  async getSessionPolicy(orgId: string): Promise<SessionPolicy | null> {
    const { data, error } = await supabase
      .from('session_policies')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  // Create or update session policy
  async upsertSessionPolicy(policy: Partial<SessionPolicy>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const policyData = {
      org_id: profile.organization_id,
      ...policy
    };

    const { error } = await supabase
      .from('session_policies')
      .upsert([policyData]);

    if (error) throw error;
  }

  // Enforce concurrent session limits
  private async enforceConcurrentSessionLimits(userId: string, orgId: string): Promise<void> {
    const policy = await this.getSessionPolicy(orgId);
    if (!policy) return;

    const { data: activeSessions } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: true });

    if (activeSessions && activeSessions.length >= policy.max_concurrent_sessions) {
      // Terminate oldest sessions to make room
      const sessionsToTerminate = activeSessions.slice(0, activeSessions.length - policy.max_concurrent_sessions + 1);
      
      for (const session of sessionsToTerminate) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', session.id);
      }
    }
  }

  // Generate secure session token
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get client IP
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Cleanup expired sessions (to be called periodically)
  async cleanupExpiredSessions(): Promise<void> {
    await supabase.rpc('cleanup_expired_sessions');
  }

  // Get session analytics
  async getSessionAnalytics(orgId: string): Promise<any> {
    const { data: totalSessions } = await supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .eq('org_id', orgId);

    const { data: activeSessions } = await supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('is_active', true);

    const { data: recentSessions } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    return {
      totalSessions: totalSessions?.length || 0,
      activeSessions: activeSessions?.length || 0,
      recentSessions: recentSessions || []
    };
  }
}

export const sessionManagementService = new SessionManagementService();
