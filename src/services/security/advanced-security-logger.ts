import { supabase } from '@/integrations/supabase/client';

export interface SecurityEventData {
  org_id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_source?: string;
  event_category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'session' | 'system';
  risk_score: number;
  event_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  location_data?: Record<string, any>;
  detection_rules?: string[];
  false_positive?: boolean;
}

export class AdvancedSecurityLogger {
  private static instance: AdvancedSecurityLogger;
  private eventQueue: SecurityEventData[] = [];
  private isProcessing = false;
  private batchSize = 50;
  private flushInterval = 5000; // 5 seconds

  private constructor() {
    this.startBatchProcessor();
  }

  static getInstance(): AdvancedSecurityLogger {
    if (!AdvancedSecurityLogger.instance) {
      AdvancedSecurityLogger.instance = new AdvancedSecurityLogger();
    }
    return AdvancedSecurityLogger.instance;
  }

  async logSecurityEvent(event: SecurityEventData): Promise<void> {
    // Validate and sanitize event data
    const sanitizedEvent = this.sanitizeEventData(event);
    
    // Add to queue for batch processing
    this.eventQueue.push(sanitizedEvent);
    
    // Process immediately if critical risk score
    if (sanitizedEvent.risk_score >= 80) {
      await this.processImmediately(sanitizedEvent);
    }
  }

  private sanitizeEventData(event: SecurityEventData): SecurityEventData {
    return {
      ...event,
      event_data: this.sanitizeObject(event.event_data),
      location_data: event.location_data ? this.sanitizeObject(event.location_data) : undefined,
      risk_score: Math.max(0, Math.min(100, event.risk_score)),
      detection_rules: event.detection_rules?.slice(0, 10) || [], // Limit array size
    };
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip potentially sensitive fields
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('secret') || 
          key.toLowerCase().includes('token')) {
        continue;
      }
      
      if (typeof value === 'string') {
        sanitized[key] = value.slice(0, 1000); // Limit string length
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private async processImmediately(event: SecurityEventData): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert([event]);
      
      if (error) {
        console.error('Failed to log critical security event:', error);
      }
    } catch (error) {
      console.error('Error processing immediate security event:', error);
    }
  }

  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.eventQueue.length > 0 && !this.isProcessing) {
        await this.processBatch();
      }
    }, this.flushInterval);
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      const batch = this.eventQueue.splice(0, this.batchSize);
      
      const { error } = await supabase
        .from('security_events')
        .insert(batch);
      
      if (error) {
        console.error('Failed to process security events batch:', error);
        // Re-queue failed events
        this.eventQueue.unshift(...batch);
      }
    } catch (error) {
      console.error('Error processing security events batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async flushEvents(): Promise<void> {
    await this.processBatch();
  }

  // High-level logging methods
  async logAuthenticationEvent(
    orgId: string,
    userId: string,
    eventType: 'login_success' | 'login_failure' | 'logout' | 'password_change',
    riskScore: number,
    additionalData: Record<string, any> = {}
  ): Promise<void> {
    await this.logSecurityEvent({
      org_id: orgId,
      user_id: userId,
      event_type: eventType,
      event_category: 'authentication',
      risk_score: riskScore,
      event_data: additionalData,
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
      device_fingerprint: this.getDeviceFingerprint(),
    });
  }

  async logDataAccessEvent(
    orgId: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    riskScore: number
  ): Promise<void> {
    await this.logSecurityEvent({
      org_id: orgId,
      user_id: userId,
      event_type: 'data_access',
      event_category: 'data_access',
      risk_score: riskScore,
      event_data: {
        resource_type: resourceType,
        resource_id: resourceId,
        action: action,
        timestamp: new Date().toISOString(),
      },
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
    });
  }

  async logConfigurationChange(
    orgId: string,
    userId: string,
    configType: string,
    oldValue: any,
    newValue: any,
    riskScore: number
  ): Promise<void> {
    await this.logSecurityEvent({
      org_id: orgId,
      user_id: userId,
      event_type: 'configuration_change',
      event_category: 'configuration',
      risk_score: riskScore,
      event_data: {
        config_type: configType,
        old_value: oldValue,
        new_value: newValue,
        timestamp: new Date().toISOString(),
      },
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
    });
  }

  async logSessionAnomaly(
    orgId: string,
    userId: string,
    sessionId: string,
    anomalyType: string,
    riskScore: number,
    details: Record<string, any>
  ): Promise<void> {
    await this.logSecurityEvent({
      org_id: orgId,
      user_id: userId,
      session_id: sessionId,
      event_type: 'session_anomaly',
      event_category: 'session',
      risk_score: riskScore,
      event_data: {
        anomaly_type: anomalyType,
        ...details,
        timestamp: new Date().toISOString(),
      },
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent,
    });
  }

  private getClientIP(): string {
    // This would normally be set by the server/CDN
    return 'unknown';
  }

  private getDeviceFingerprint(): string {
    // Simple device fingerprinting
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
    }));
  }
}

export const securityLogger = AdvancedSecurityLogger.getInstance();