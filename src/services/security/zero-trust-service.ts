
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface DeviceFingerprint {
  id: string;
  user_id: string;
  org_id: string;
  device_id: string;
  fingerprint_hash: string;
  device_info: any;
  risk_score: number;
  is_trusted: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface AuthenticationSession {
  id: string;
  user_id: string;
  org_id: string;
  device_fingerprint_id: string;
  session_token: string;
  risk_score: number;
  authentication_factors: string[];
  location_data?: any;
  expires_at: string;
  last_activity_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BehavioralAnalytics {
  id: string;
  user_id: string;
  org_id: string;
  session_id?: string;
  activity_type: string;
  activity_data: any;
  risk_indicators: any;
  anomaly_score: number;
  detected_at: string;
  created_at: string;
}

class ZeroTrustService {
  private deviceFingerprint: string | null = null;

  async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint(),
      timestamp: Date.now()
    };

    const fingerprintString = JSON.stringify(fingerprint);
    const hash = await this.hashString(fingerprintString);
    this.deviceFingerprint = hash;
    return hash;
  }

  private getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return 'no-webgl';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? 
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
  }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async registerDevice(): Promise<DeviceFingerprint> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const fingerprint = await this.generateDeviceFingerprint();
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const { data, error } = await supabase
      .from('device_fingerprints')
      .upsert({
        user_id: profile.id,
        org_id: profile.organization_id,
        device_id: fingerprint,
        fingerprint_hash: fingerprint,
        device_info: deviceInfo,
        risk_score: 0,
        is_trusted: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createAuthSession(deviceFingerprintId: string): Promise<AuthenticationSession> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    const locationData = await this.getLocationData();
    const riskScore = await this.calculateSessionRisk(deviceFingerprintId, locationData);

    const { data, error } = await supabase
      .from('authentication_sessions')
      .insert({
        user_id: profile.id,
        org_id: profile.organization_id,
        device_fingerprint_id: deviceFingerprintId,
        session_token: sessionToken,
        risk_score: riskScore,
        authentication_factors: ['password'],
        location_data: locationData,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async getLocationData(): Promise<any> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      return await response.json();
    } catch {
      return null;
    }
  }

  private async calculateSessionRisk(deviceFingerprintId: string, locationData: any): Promise<number> {
    const profile = await getCurrentUserProfile();
    if (!profile) return 50;

    const { data } = await supabase
      .rpc('calculate_session_risk_score', {
        user_id: profile.id,
        device_fingerprint_id: deviceFingerprintId,
        location_data: locationData
      });

    return data || 50;
  }

  async trackBehavior(activityType: string, activityData: any): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const riskIndicators = this.analyzeBehavior(activityType, activityData);
    const anomalyScore = this.calculateAnomalyScore(riskIndicators);

    await supabase
      .from('behavioral_analytics')
      .insert({
        user_id: profile.id,
        org_id: profile.organization_id,
        activity_type: activityType,
        activity_data: activityData,
        risk_indicators: riskIndicators,
        anomaly_score: anomalyScore
      });

    // Trigger alerts if anomaly score is high
    if (anomalyScore > 70) {
      await this.triggerSecurityAlert(activityType, anomalyScore);
    }
  }

  private analyzeBehavior(activityType: string, activityData: any): any {
    const indicators: any = {};
    
    // Analyze unusual access patterns
    if (activityType === 'data_access') {
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        indicators.unusual_time = true;
      }
    }

    // Analyze rapid successive actions
    if (activityData.timestamp) {
      const timeSinceLastAction = Date.now() - activityData.timestamp;
      if (timeSinceLastAction < 100) {
        indicators.rapid_actions = true;
      }
    }

    return indicators;
  }

  private calculateAnomalyScore(riskIndicators: any): number {
    let score = 0;
    
    if (riskIndicators.unusual_time) score += 20;
    if (riskIndicators.rapid_actions) score += 30;
    if (riskIndicators.new_device) score += 40;
    if (riskIndicators.unusual_location) score += 25;

    return Math.min(score, 100);
  }

  private async triggerSecurityAlert(activityType: string, anomalyScore: number): Promise<void> {
    console.log(`Security Alert: ${activityType} with anomaly score ${anomalyScore}`);
    // In production, this would trigger real security alerts
  }

  async verifySession(sessionToken: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('authentication_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (error || !data) return false;

    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    if (now > expiresAt) {
      await this.invalidateSession(sessionToken);
      return false;
    }

    // Update last activity
    await supabase
      .from('authentication_sessions')
      .update({ last_activity_at: now.toISOString() })
      .eq('session_token', sessionToken);

    return true;
  }

  async invalidateSession(sessionToken: string): Promise<void> {
    await supabase
      .from('authentication_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken);
  }
}

export const zeroTrustService = new ZeroTrustService();
