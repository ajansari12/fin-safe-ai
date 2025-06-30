
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface DataClassification {
  id: string;
  org_id: string;
  classification_name: string;
  classification_level: string;
  data_patterns: string[];
  protection_rules: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DataAccessLog {
  id: string;
  org_id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  access_type: string;
  data_classification?: string;
  risk_score: number;
  access_granted: boolean;
  denial_reason?: string;
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
  created_at: string;
}

export interface DLPViolation {
  id: string;
  org_id: string;
  user_id: string;
  violation_type: string;
  severity: string;
  detected_data: any;
  context_data?: any;
  action_taken: string;
  investigation_status: string;
  resolved_at?: string;
  resolved_by?: string;
  detected_at: string;
  created_at: string;
  updated_at: string;
}

class DLPService {
  private sensitivePatterns = [
    { name: 'credit_card', pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, level: 'high' },
    { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, level: 'high' },
    { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, level: 'medium' },
    { name: 'phone', pattern: /\b\d{3}-\d{3}-\d{4}\b/g, level: 'medium' },
    { name: 'api_key', pattern: /\b[A-Za-z0-9]{32,}\b/g, level: 'high' },
    { name: 'password', pattern: /password\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, level: 'critical' }
  ];

  private transformDataClassification(data: any): DataClassification {
    return {
      ...data,
      data_patterns: Array.isArray(data.data_patterns) 
        ? data.data_patterns 
        : JSON.parse(data.data_patterns || '[]'),
      protection_rules: typeof data.protection_rules === 'string' 
        ? JSON.parse(data.protection_rules) 
        : data.protection_rules
    };
  }

  private transformDataAccessLog(data: any): DataAccessLog {
    return {
      ...data,
      ip_address: data.ip_address ? String(data.ip_address) : undefined
    };
  }

  async scanContent(content: string, context: any = {}): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return { violations: [], classifications: [] };

    const violations = [];
    const classifications = [];

    // Scan for built-in patterns
    for (const pattern of this.sensitivePatterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        violations.push({
          type: pattern.name,
          level: pattern.level,
          matches: matches.length,
          content: matches
        });
        
        classifications.push({
          classification: pattern.name,
          confidence: 0.9,
          level: pattern.level
        });
      }
    }

    // Scan for custom organizational patterns
    const customClassifications = await this.getCustomClassifications(profile.organization_id);
    for (const classification of customClassifications) {
      const patterns = classification.data_patterns;
      for (const pattern of patterns) {
        try {
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            violations.push({
              type: classification.classification_name,
              level: classification.classification_level,
              matches: matches.length,
              content: matches
            });
          }
        } catch (error) {
          console.error('Invalid regex pattern:', pattern);
        }
      }
    }

    // Log violations if found
    if (violations.length > 0) {
      await this.logDLPViolation(violations, context);
    }

    return { violations, classifications };
  }

  private async getCustomClassifications(orgId: string): Promise<DataClassification[]> {
    const { data, error } = await supabase
      .from('data_classifications')
      .select('*')
      .eq('org_id', orgId);

    if (error) {
      console.error('Error fetching data classifications:', error);
      return [];
    }

    return data?.map(this.transformDataClassification) || [];
  }

  private async logDLPViolation(violations: any[], context: any): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const severity = this.calculateSeverity(violations);
    const actionTaken = this.determineAction(severity);

    await supabase
      .from('dlp_violations')
      .insert({
        org_id: profile.organization_id,
        user_id: profile.id,
        violation_type: violations.map(v => v.type).join(', '),
        severity,
        detected_data: violations,
        context_data: context,
        action_taken: actionTaken,
        investigation_status: severity === 'critical' ? 'urgent' : 'pending'
      });
  }

  private calculateSeverity(violations: any[]): string {
    const levels = violations.map(v => v.level);
    if (levels.includes('critical')) return 'critical';
    if (levels.includes('high')) return 'high';
    if (levels.includes('medium')) return 'medium';
    return 'low';
  }

  private determineAction(severity: string): string {
    switch (severity) {
      case 'critical': return 'blocked_and_escalated';
      case 'high': return 'blocked_and_logged';
      case 'medium': return 'logged_and_warned';
      default: return 'logged';
    }
  }

  async logDataAccess(
    resourceType: string,
    resourceId: string,
    accessType: string,
    dataClassification?: string
  ): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const riskScore = this.calculateAccessRisk(accessType, dataClassification);
    const accessGranted = riskScore < 80; // Block high-risk access

    await supabase
      .from('data_access_logs')
      .insert({
        org_id: profile.organization_id,
        user_id: profile.id,
        resource_type: resourceType,
        resource_id: resourceId,
        access_type: accessType,
        data_classification: dataClassification,
        risk_score: riskScore,
        access_granted: accessGranted,
        denial_reason: !accessGranted ? 'High risk access detected' : null,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });

    if (!accessGranted) {
      throw new Error('Access denied due to security policy');
    }
  }

  private calculateAccessRisk(accessType: string, dataClassification?: string): number {
    let risk = 0;
    
    if (accessType === 'export') risk += 30;
    if (accessType === 'download') risk += 20;
    if (accessType === 'share') risk += 25;
    
    if (dataClassification === 'critical') risk += 40;
    if (dataClassification === 'high') risk += 30;
    if (dataClassification === 'medium') risk += 20;

    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) risk += 15;

    return Math.min(risk, 100);
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  async createDataClassification(
    name: string,
    level: string,
    patterns: string[],
    protectionRules: any
  ): Promise<DataClassification> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('data_classifications')
      .insert({
        org_id: profile.organization_id,
        classification_name: name,
        classification_level: level,
        data_patterns: patterns,
        protection_rules: protectionRules,
        created_by: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformDataClassification(data);
  }

  async getDataAccessLogs(limit: number = 100): Promise<DataAccessLog[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('data_access_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('accessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching data access logs:', error);
      return [];
    }

    return data?.map(this.transformDataAccessLog) || [];
  }

  async getDLPViolations(limit: number = 100): Promise<DLPViolation[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('dlp_violations')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching DLP violations:', error);
      return [];
    }

    return data || [];
  }

  async resolveViolation(violationId: string, resolution: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    await supabase
      .from('dlp_violations')
      .update({
        investigation_status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: profile.id
      })
      .eq('id', violationId);
  }
}

export const dlpService = new DLPService();
