import { supabase } from '@/integrations/supabase/client';
import { securityLogger } from './advanced-security-logger';

export interface ThreatRule {
  id: string;
  rule_name: string;
  rule_type: 'anomaly' | 'pattern' | 'threshold' | 'ml';
  rule_config: Record<string, any>;
  detection_logic: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  false_positive_rate: number;
  accuracy_score: number;
}

export interface ThreatDetectionResult {
  isThreat: boolean;
  riskScore: number;
  triggeredRules: string[];
  recommendations: string[];
  confidence: number;
}

export class ThreatDetectionEngine {
  private static instance: ThreatDetectionEngine;
  private rules: ThreatRule[] = [];
  private lastRuleUpdate: Date = new Date(0);
  private ruleUpdateInterval = 300000; // 5 minutes

  private constructor() {
    this.loadRules();
    this.startRuleUpdater();
  }

  static getInstance(): ThreatDetectionEngine {
    if (!ThreatDetectionEngine.instance) {
      ThreatDetectionEngine.instance = new ThreatDetectionEngine();
    }
    return ThreatDetectionEngine.instance;
  }

  async analyzeSecurityEvent(event: any): Promise<ThreatDetectionResult> {
    const result: ThreatDetectionResult = {
      isThreat: false,
      riskScore: 0,
      triggeredRules: [],
      recommendations: [],
      confidence: 0,
    };

    await this.ensureRulesLoaded();

    for (const rule of this.rules.filter(r => r.is_active)) {
      const ruleResult = await this.evaluateRule(rule, event);
      
      if (ruleResult.triggered) {
        result.isThreat = true;
        result.riskScore = Math.max(result.riskScore, ruleResult.riskScore);
        result.triggeredRules.push(rule.rule_name);
        result.recommendations.push(...ruleResult.recommendations);
        result.confidence = Math.max(result.confidence, rule.accuracy_score);
      }
    }

    return result;
  }

  private async evaluateRule(rule: ThreatRule, event: any): Promise<{
    triggered: boolean;
    riskScore: number;
    recommendations: string[];
  }> {
    const result = {
      triggered: false,
      riskScore: 0,
      recommendations: [] as string[],
    };

    try {
      switch (rule.rule_type) {
        case 'threshold':
          return this.evaluateThresholdRule(rule, event);
        case 'pattern':
          return this.evaluatePatternRule(rule, event);
        case 'anomaly':
          return this.evaluateAnomalyRule(rule, event);
        case 'ml':
          return this.evaluateMLRule(rule, event);
        default:
          return result;
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.rule_name}:`, error);
      return result;
    }
  }

  private async evaluateThresholdRule(rule: ThreatRule, event: any): Promise<{
    triggered: boolean;
    riskScore: number;
    recommendations: string[];
  }> {
    const config = rule.rule_config;
    const threshold = config.threshold || 0;
    const timeWindow = config.time_window_minutes || 60;
    const eventType = config.event_type;

    // Count recent events of the same type
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('*')
      .eq('org_id', event.org_id)
      .eq('event_type', eventType)
      .gte('created_at', new Date(Date.now() - timeWindow * 60 * 1000).toISOString());

    const eventCount = recentEvents?.length || 0;

    if (eventCount >= threshold) {
      return {
        triggered: true,
        riskScore: Math.min(100, (eventCount / threshold) * 50),
        recommendations: [
          `High frequency of ${eventType} events detected (${eventCount} in ${timeWindow} minutes)`,
          'Consider implementing rate limiting or investigating potential attack',
        ],
      };
    }

    return { triggered: false, riskScore: 0, recommendations: [] };
  }

  private async evaluatePatternRule(rule: ThreatRule, event: any): Promise<{
    triggered: boolean;
    riskScore: number;
    recommendations: string[];
  }> {
    const config = rule.rule_config;
    const pattern = config.pattern;
    const field = config.field || 'event_data';

    let value = event[field];
    if (field === 'event_data' && typeof value === 'object') {
      value = JSON.stringify(value);
    }

    const regex = new RegExp(pattern, 'i');
    const matches = regex.test(value);

    if (matches) {
      return {
        triggered: true,
        riskScore: config.risk_score || 60,
        recommendations: [
          `Suspicious pattern detected in ${field}`,
          'Review event details and consider blocking similar patterns',
        ],
      };
    }

    return { triggered: false, riskScore: 0, recommendations: [] };
  }

  private async evaluateAnomalyRule(rule: ThreatRule, event: any): Promise<{
    triggered: boolean;
    riskScore: number;
    recommendations: string[];
  }> {
    const config = rule.rule_config;
    const metric = config.metric || 'risk_score';
    const deviationThreshold = config.deviation_threshold || 2;

    // Get historical data for baseline
    const { data: historicalEvents } = await supabase
      .from('security_events')
      .select(metric)
      .eq('org_id', event.org_id)
      .eq('event_type', event.event_type)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (!historicalEvents || historicalEvents.length < 10) {
      return { triggered: false, riskScore: 0, recommendations: [] };
    }

    const values = historicalEvents.map(e => e[metric]).filter(v => v !== null && typeof v === 'number');
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const currentValue = event[metric];
    const zScore = Math.abs((currentValue - mean) / stdDev);

    if (zScore > deviationThreshold) {
      return {
        triggered: true,
        riskScore: Math.min(100, zScore * 20),
        recommendations: [
          `Anomalous ${metric} value detected (${zScore.toFixed(2)} standard deviations from mean)`,
          'Investigate unusual behavior patterns',
        ],
      };
    }

    return { triggered: false, riskScore: 0, recommendations: [] };
  }

  private async evaluateMLRule(rule: ThreatRule, event: any): Promise<{
    triggered: boolean;
    riskScore: number;
    recommendations: string[];
  }> {
    // Simplified ML-based detection
    const config = rule.rule_config;
    const features = config.features || [];
    
    let score = 0;
    let featureCount = 0;

    for (const feature of features) {
      const value = this.extractFeatureValue(event, feature);
      if (value !== null) {
        // Simple scoring based on feature weights
        score += value * (feature.weight || 1);
        featureCount++;
      }
    }

    if (featureCount === 0) {
      return { triggered: false, riskScore: 0, recommendations: [] };
    }

    const normalizedScore = score / featureCount;
    const threshold = config.threshold || 0.7;

    if (normalizedScore > threshold) {
      return {
        triggered: true,
        riskScore: Math.min(100, normalizedScore * 100),
        recommendations: [
          'ML model detected potential threat',
          'Review event context and user behavior patterns',
        ],
      };
    }

    return { triggered: false, riskScore: 0, recommendations: [] };
  }

  private extractFeatureValue(event: any, feature: any): number | null {
    try {
      const path = feature.path.split('.');
      let value = event;
      
      for (const key of path) {
        value = value[key];
        if (value === undefined || value === null) {
          return null;
        }
      }

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }

      if (typeof value === 'string') {
        return value.length;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async loadRules(): Promise<void> {
    try {
      const { data: rules } = await supabase
        .from('security_threat_rules')
        .select('*')
        .eq('is_active', true);

      if (rules) {
        this.rules = rules;
        this.lastRuleUpdate = new Date();
      }
    } catch (error) {
      console.error('Failed to load threat detection rules:', error);
    }
  }

  private async ensureRulesLoaded(): Promise<void> {
    if (Date.now() - this.lastRuleUpdate.getTime() > this.ruleUpdateInterval) {
      await this.loadRules();
    }
  }

  private startRuleUpdater(): void {
    setInterval(() => {
      this.loadRules();
    }, this.ruleUpdateInterval);
  }

  async createDefaultRules(orgId: string): Promise<void> {
    const defaultRules = [
      {
        org_id: orgId,
        rule_name: 'High Risk Authentication Failures',
        rule_type: 'threshold',
        rule_config: {
          threshold: 5,
          time_window_minutes: 15,
          event_type: 'authentication_failure',
          risk_score: 70,
        },
        detection_logic: 'Detect multiple authentication failures within time window',
        severity_level: 'high',
        is_active: true,
        false_positive_rate: 0.05,
        accuracy_score: 0.85,
      },
      {
        org_id: orgId,
        rule_name: 'Suspicious IP Pattern',
        rule_type: 'pattern',
        rule_config: {
          pattern: '(tor|proxy|vpn|anonymous)',
          field: 'ip_address',
          risk_score: 60,
        },
        detection_logic: 'Detect connections from suspicious IP addresses',
        severity_level: 'medium',
        is_active: true,
        false_positive_rate: 0.1,
        accuracy_score: 0.75,
      },
      {
        org_id: orgId,
        rule_name: 'Unusual Session Duration',
        rule_type: 'anomaly',
        rule_config: {
          metric: 'session_duration',
          deviation_threshold: 2.5,
        },
        detection_logic: 'Detect sessions with unusual duration patterns',
        severity_level: 'medium',
        is_active: true,
        false_positive_rate: 0.15,
        accuracy_score: 0.70,
      },
    ];

    for (const rule of defaultRules) {
      await supabase.from('security_threat_rules').insert([rule]);
    }
  }
}

export const threatDetectionEngine = ThreatDetectionEngine.getInstance();