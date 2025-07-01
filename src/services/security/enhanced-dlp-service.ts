
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { zeroTrustService } from "./zero-trust-service";

export interface DLPPattern {
  id?: string;
  patternName: string;
  patternType: 'regex' | 'keyword' | 'ml_classification' | 'hash' | 'structured_data';
  patternRegex: string;
  classificationLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  riskScore: number;
  actionOnMatch: 'log' | 'warn' | 'block' | 'quarantine' | 'encrypt';
  isActive: boolean;
}

export interface DLPViolation {
  violationType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedData: any;
  contextData?: any;
  actionTaken: string;
  investigationStatus: 'pending' | 'investigating' | 'resolved' | 'false_positive';
}

export interface DataClassification {
  dataType: string;
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  dataPatterns: string[];
  protectionRequirements: {
    encryption: boolean;
    accessLogging: boolean;
    retentionPolicy: string;
    geographicRestrictions: string[];
  };
}

class EnhancedDLPService {
  private patterns: DLPPattern[] = [];
  private isMonitoring = false;

  // Built-in patterns for common sensitive data types
  private readonly builtInPatterns: DLPPattern[] = [
    {
      patternName: 'Credit Card Numbers',
      patternType: 'regex' as const,
      patternRegex: '\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b',
      classificationLevel: 'restricted' as const,
      riskScore: 9,
      actionOnMatch: 'block' as const,
      isActive: true
    },
    {
      patternName: 'Social Security Numbers',
      patternType: 'regex' as const,
      patternRegex: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
      classificationLevel: 'restricted' as const,
      riskScore: 9,
      actionOnMatch: 'block' as const,
      isActive: true
    },
    {
      patternName: 'Email Addresses',
      patternType: 'regex' as const,
      patternRegex: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      classificationLevel: 'internal' as const,
      riskScore: 4,
      actionOnMatch: 'log' as const,
      isActive: true
    },
    {
      patternName: 'Phone Numbers',
      patternType: 'regex' as const,
      patternRegex: '\\b\\d{3}-\\d{3}-\\d{4}\\b|\\(\\d{3}\\)\\s?\\d{3}-\\d{4}',
      classificationLevel: 'internal' as const,
      riskScore: 3,
      actionOnMatch: 'log' as const,
      isActive: true
    },
    {
      patternName: 'IP Addresses',
      patternType: 'regex' as const,
      patternRegex: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      classificationLevel: 'internal' as const,
      riskScore: 2,
      actionOnMatch: 'log' as const,
      isActive: true
    },
    {
      patternName: 'API Keys',
      patternType: 'regex' as const,
      patternRegex: '(?i)api[_-]?key[\\s]*[:=][\\s]*[\'"]?([a-zA-Z0-9]{20,})[\'"]?',
      classificationLevel: 'restricted' as const,
      riskScore: 8,
      actionOnMatch: 'block' as const,
      isActive: true
    },
    {
      patternName: 'Passwords',
      patternType: 'regex' as const,
      patternRegex: '(?i)password[\\s]*[:=][\\s]*[\'"]?([^\\s\'"]+)[\'"]?',
      classificationLevel: 'restricted' as const,
      riskScore: 8,
      actionOnMatch: 'block' as const,
      isActive: true
    }
  ];

  constructor() {
    this.initializePatterns();
  }

  // Pattern Management
  async initializePatterns(): Promise<void> {
    try {
      // Load custom patterns from database
      const customPatterns = await this.getDLPPatterns();
      
      // Combine with built-in patterns
      this.patterns = [...this.builtInPatterns, ...customPatterns];
    } catch (error) {
      console.error('Failed to initialize DLP patterns:', error);
      this.patterns = [...this.builtInPatterns];
    }
  }

  async addDLPPattern(pattern: Omit<DLPPattern, 'id'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('dlp_patterns')
      .insert({
        org_id: profile.organization_id,
        pattern_name: pattern.patternName,
        pattern_type: pattern.patternType,
        pattern_regex: pattern.patternRegex,
        classification_level: pattern.classificationLevel,
        risk_score: pattern.riskScore,
        action_on_match: pattern.actionOnMatch,
        is_active: pattern.isActive,
        created_by: profile.id
      })
      .select()
      .single();

    if (error) throw error;

    // Add to local patterns
    this.patterns.push({
      id: data.id,
      patternName: data.pattern_name,
      patternType: data.pattern_type as DLPPattern['patternType'],
      patternRegex: data.pattern_regex,
      classificationLevel: data.classification_level as DLPPattern['classificationLevel'],
      riskScore: data.risk_score,
      actionOnMatch: data.action_on_match as DLPPattern['actionOnMatch'],
      isActive: data.is_active
    });
  }

  async getDLPPatterns(): Promise<DLPPattern[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('dlp_patterns')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true);

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      patternName: d.pattern_name,
      patternType: d.pattern_type as DLPPattern['patternType'],
      patternRegex: d.pattern_regex,
      classificationLevel: d.classification_level as DLPPattern['classificationLevel'],
      riskScore: d.risk_score,
      actionOnMatch: d.action_on_match as DLPPattern['actionOnMatch'],
      isActive: d.is_active
    }));
  }

  // Real-time Monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupDocumentMonitoring();
    this.setupFormMonitoring();
    this.setupFileUploadMonitoring();
    this.setupClipboardMonitoring();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    // Remove event listeners would go here
  }

  private setupDocumentMonitoring(): void {
    // Monitor document content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          this.scanContent(document.body.textContent || '');
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private setupFormMonitoring(): void {
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (target && (target.type === 'text' || target.type === 'email' || target.tagName === 'TEXTAREA')) {
        this.scanContent(target.value, {
          elementType: target.tagName,
          inputType: target.type,
          fieldName: target.name || target.id
        });
      }
    });
  }

  private setupFileUploadMonitoring(): void {
    document.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target && target.type === 'file' && target.files) {
        Array.from(target.files).forEach(file => {
          this.scanFile(file);
        });
      }
    });
  }

  private setupClipboardMonitoring(): void {
    document.addEventListener('paste', (event) => {
      const clipboardData = event.clipboardData?.getData('text');
      if (clipboardData) {
        this.scanContent(clipboardData, { source: 'clipboard' });
      }
    });
  }

  // Content Scanning
  async scanContent(content: string, context?: any): Promise<any[]> {
    const violations: any[] = [];

    for (const pattern of this.patterns) {
      if (!pattern.isActive) continue;

      const matches = this.findMatches(content, pattern);
      
      for (const match of matches) {
        const violation = {
          pattern: pattern.patternName,
          match: match.redacted,
          position: match.position,
          context: context || {},
          severity: this.calculateSeverity(pattern.riskScore),
          action: pattern.actionOnMatch
        };

        violations.push(violation);

        // Execute action
        await this.executeAction(pattern.actionOnMatch, violation, content, context);
      }
    }

    return violations;
  }

  private findMatches(content: string, pattern: DLPPattern): any[] {
    const matches: any[] = [];
    const regex = new RegExp(pattern.patternRegex, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
      matches.push({
        value: match[0],
        redacted: this.redactSensitiveData(match[0]),
        position: match.index,
        length: match[0].length
      });
    }

    return matches;
  }

  private redactSensitiveData(data: string): string {
    if (data.length <= 4) return '*'.repeat(data.length);
    
    // Show first and last 2 characters, redact middle
    return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2);
  }

  private calculateSeverity(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  // Action Execution
  private async executeAction(action: string, violation: any, content: string, context?: any): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) return;

    switch (action) {
      case 'log':
        await this.logViolation(violation, 'logged');
        break;
      case 'warn':
        await this.warnUser(violation);
        await this.logViolation(violation, 'warned');
        break;
      case 'block':
        await this.blockAction(violation, context);
        await this.logViolation(violation, 'blocked');
        break;
      case 'quarantine':
        await this.quarantineData(violation, content);
        await this.logViolation(violation, 'quarantined');
        break;
      case 'encrypt':
        await this.encryptSensitiveData(violation, content);
        await this.logViolation(violation, 'encrypted');
        break;
    }

    // Create security context and log event
    const securityContext = await zeroTrustService.createSecurityContext(profile.id);
    await zeroTrustService.logSecurityEvent({
      eventType: 'dlp_violation',
      eventCategory: 'data_protection',
      actionPerformed: action,
      actionDetails: violation,
      riskScore: this.calculateRiskScore(violation.severity),
      outcome: 'success'
    }, securityContext);
  }

  private calculateRiskScore(severity: string): number {
    switch (severity) {
      case 'critical': return 90;
      case 'high': return 70;
      case 'medium': return 50;
      case 'low': return 20;
      default: return 0;
    }
  }

  private async logViolation(violation: any, actionTaken: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    await supabase.from('dlp_violations').insert({
      org_id: profile.organization_id,
      user_id: profile.id,
      violation_type: violation.pattern,
      severity: violation.severity,
      detected_data: { 
        redactedMatch: violation.match,
        position: violation.position,
        context: violation.context
      },
      action_taken: actionTaken,
      investigation_status: 'pending'
    });
  }

  private async warnUser(violation: any): Promise<void> {
    // Show user warning (could be toast, modal, etc.)
    console.warn(`DLP Warning: ${violation.pattern} detected`, violation);
    
    // In a real implementation, this would show a user-friendly warning
    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification('Data Loss Prevention Alert', {
        body: `Sensitive data detected: ${violation.pattern}`,
        icon: '/warning-icon.png'
      });
    }
  }

  private async blockAction(violation: any, context?: any): Promise<void> {
    // Block the action that triggered the violation
    console.log('Action blocked due to DLP violation:', violation);
    
    // If this is a form submission, prevent it
    if (context?.elementType === 'FORM') {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', (e) => e.preventDefault());
      });
    }
    
    // If this is a file upload, clear the input
    if (context?.elementType === 'INPUT' && context?.inputType === 'file') {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        (input as HTMLInputElement).value = '';
      });
    }
  }

  private async quarantineData(violation: any, content: string): Promise<void> {
    // Store quarantined data for review
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    // For now, just log the quarantined data - in a real implementation
    // this would be stored in a secure quarantine table
    console.log('Data quarantined:', { violation, content: content.substring(0, 100) });
  }

  private async encryptSensitiveData(violation: any, content: string): Promise<void> {
    // Implement field-level encryption for sensitive data
    console.log('Encrypting sensitive data:', violation);
    
    // In a real implementation, this would encrypt the data
    // For now, we'll just log the action
  }

  // File Scanning
  async scanFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const violations = await this.scanContent(content, {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            source: 'file_upload'
          });
          resolve(violations);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // Read file as text
      reader.readAsText(file);
    });
  }

  // Data Classification
  async classifyData(data: string, context?: any): Promise<DataClassification | null> {
    const matchedPatterns = this.patterns.filter(pattern => {
      const regex = new RegExp(pattern.patternRegex, 'gi');
      return regex.test(data);
    });

    if (matchedPatterns.length === 0) {
      return {
        dataType: 'unclassified',
        sensitivityLevel: 'public',
        dataPatterns: [],
        protectionRequirements: {
          encryption: false,
          accessLogging: false,
          retentionPolicy: 'standard',
          geographicRestrictions: []
        }
      };
    }

    // Get highest classification level
    const highestPattern = matchedPatterns.reduce((prev, current) => 
      prev.riskScore > current.riskScore ? prev : current
    );

    return {
      dataType: highestPattern.patternName,
      sensitivityLevel: highestPattern.classificationLevel,
      dataPatterns: matchedPatterns.map(p => p.patternName),
      protectionRequirements: {
        encryption: highestPattern.classificationLevel === 'restricted',
        accessLogging: ['confidential', 'restricted'].includes(highestPattern.classificationLevel),
        retentionPolicy: highestPattern.classificationLevel === 'restricted' ? 'short_term' : 'standard',
        geographicRestrictions: highestPattern.classificationLevel === 'restricted' ? ['domestic_only'] : []
      }
    };
  }

  // Analytics and Reporting
  async getDLPViolations(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }

    const { data, error } = await supabase
      .from('dlp_violations')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDLPAnalytics(): Promise<any> {
    const violations = await this.getDLPViolations('month');
    
    return {
      totalViolations: violations.length,
      violationsBySeverity: {
        critical: violations.filter(v => v.severity === 'critical').length,
        high: violations.filter(v => v.severity === 'high').length,
        medium: violations.filter(v => v.severity === 'medium').length,
        low: violations.filter(v => v.severity === 'low').length
      },
      violationsByType: violations.reduce((acc, v) => {
        acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      violationsByAction: violations.reduce((acc, v) => {
        acc[v.action_taken] = (acc[v.action_taken] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topViolators: this.getTopViolators(violations),
      complianceScore: this.calculateComplianceScore(violations)
    };
  }

  private getTopViolators(violations: any[]): any[] {
    const violatorCounts = violations.reduce((acc, v) => {
      acc[v.user_id] = (acc[v.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(violatorCounts)
      .sort(([,a], [,b]) => Number(b) - Number(a))
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, count }));
  }

  private calculateComplianceScore(violations: any[]): number {
    const totalActions = violations.length;
    if (totalActions === 0) return 100;

    const blockedOrQuarantined = violations.filter(v => 
      ['blocked', 'quarantined'].includes(v.action_taken)
    ).length;

    return Math.round((blockedOrQuarantined / totalActions) * 100);
  }

  // Privacy Rights Management
  async handleDataSubjectRequest(requestType: 'access' | 'rectification' | 'erasure' | 'portability', userId: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    switch (requestType) {
      case 'access':
        return await this.generateDataAccessReport(userId);
      case 'rectification':
        return await this.initiateDataRectification(userId);
      case 'erasure':
        return await this.initiateDataErasure(userId);
      case 'portability':
        return await this.generateDataPortabilityPackage(userId);
      default:
        throw new Error('Invalid request type');
    }
  }

  private async generateDataAccessReport(userId: string): Promise<any> {
    // Generate comprehensive report of all data for the user
    return {
      reportId: crypto.randomUUID(),
      userId,
      generatedAt: new Date().toISOString(),
      dataCategories: {
        profile: 'Profile information',
        securityLogs: 'Security and access logs',
        violations: 'DLP violation records',
        documents: 'Document access history'
      }
    };
  }

  private async initiateDataRectification(userId: string): Promise<any> {
    // Start workflow for data rectification
    return {
      requestId: crypto.randomUUID(),
      status: 'initiated',
      userId,
      nextSteps: ['Verify identity', 'Review data', 'Apply corrections']
    };
  }

  private async initiateDataErasure(userId: string): Promise<any> {
    // Start workflow for data erasure
    return {
      requestId: crypto.randomUUID(),
      status: 'initiated',
      userId,
      nextSteps: ['Verify right to erasure', 'Check legal obligations', 'Execute erasure']
    };
  }

  private async generateDataPortabilityPackage(userId: string): Promise<any> {
    // Generate data portability package
    return {
      packageId: crypto.randomUUID(),
      userId,
      format: 'JSON',
      status: 'generating',
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

export const enhancedDLPService = new EnhancedDLPService();
