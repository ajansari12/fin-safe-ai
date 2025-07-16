import { securityIncidentMonitor } from './security-incident-monitor';
import { logger } from '@/lib/logger';

export interface CSPViolationReport {
  'document-uri': string;
  referrer?: string;
  'blocked-uri': string;
  'violated-directive': string;
  'original-policy': string;
  disposition: 'enforce' | 'report';
  'effective-directive': string;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
  'status-code'?: number;
  'script-sample'?: string;
}

export interface ProcessedViolation {
  violation_type: string;
  blocked_uri: string;
  violated_directive: string;
  source_file?: string;
  line_number?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_action: string;
  auto_fix_available: boolean;
}

class CSPViolationReporter {
  private readonly VIOLATION_ENDPOINT = '/api/csp-violations';
  private readonly MAX_VIOLATIONS_PER_MINUTE = 50;
  private violationCount = new Map<string, number>();

  constructor() {
    this.setupViolationHandler();
  }

  private setupViolationHandler(): void {
    // Set up global CSP violation handler
    if (typeof window !== 'undefined') {
      document.addEventListener('securitypolicyviolation', (event) => {
        this.handleViolation({
          'document-uri': event.documentURI,
          referrer: event.referrer,
          'blocked-uri': event.blockedURI,
          'violated-directive': event.violatedDirective,
          'original-policy': event.originalPolicy,
          disposition: event.disposition,
          'effective-directive': event.effectiveDirective,
          'source-file': event.sourceFile,
          'line-number': event.lineNumber,
          'column-number': event.columnNumber,
          'status-code': event.statusCode,
          'script-sample': event.sample
        });
      });
    }
  }

  async handleViolation(violation: CSPViolationReport): Promise<void> {
    try {
      // Rate limiting
      if (!this.shouldProcessViolation(violation)) {
        return;
      }

      const processedViolation = this.processViolation(violation);
      
      // Log to security incident monitor
      await securityIncidentMonitor.logIncident({
        type: 'policy_violation',
        severity: this.mapRiskLevelToSeverity(processedViolation.risk_level),
        source: 'csp-violation-reporter',
        details: {
          violation_type: processedViolation.violation_type,
          blocked_uri: processedViolation.blocked_uri,
          violated_directive: processedViolation.violated_directive,
          source_file: processedViolation.source_file,
          line_number: processedViolation.line_number,
          document_uri: violation['document-uri'],
          referrer: violation.referrer,
          original_policy: violation['original-policy'],
          disposition: violation.disposition,
          recommended_action: processedViolation.recommended_action,
          auto_fix_available: processedViolation.auto_fix_available
        },
        user_agent: navigator.userAgent,
        ip_address: undefined // Will be populated by server
      });

      // Log structured violation
      logger.warn('CSP violation detected', {
        module: 'csp-violation-reporter',
        metadata: {
          violation_type: processedViolation.violation_type,
          blocked_uri: processedViolation.blocked_uri,
          violated_directive: processedViolation.violated_directive,
          risk_level: processedViolation.risk_level,
          recommended_action: processedViolation.recommended_action
        }
      });

      // Handle critical violations
      if (processedViolation.risk_level === 'critical') {
        await this.handleCriticalViolation(processedViolation, violation);
      }

    } catch (error) {
      logger.error('Error handling CSP violation', {
        module: 'csp-violation-reporter',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  private shouldProcessViolation(violation: CSPViolationReport): boolean {
    // Skip common false positives
    if (this.isKnownFalsePositive(violation)) {
      return false;
    }

    // Rate limiting per violation type
    const key = `${violation['violated-directive']}-${violation['blocked-uri']}`;
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const countKey = `${key}-${minute}`;
    
    const currentCount = this.violationCount.get(countKey) || 0;
    if (currentCount >= this.MAX_VIOLATIONS_PER_MINUTE) {
      return false;
    }

    this.violationCount.set(countKey, currentCount + 1);
    
    // Clean up old counts
    this.cleanupOldCounts();

    return true;
  }

  private isKnownFalsePositive(violation: CSPViolationReport): boolean {
    const blockedUri = violation['blocked-uri'];
    const violatedDirective = violation['violated-directive'];

    // Known browser extensions
    const extensionPatterns = [
      /chrome-extension:/,
      /moz-extension:/,
      /safari-extension:/,
      /ms-browser-extension:/
    ];

    if (extensionPatterns.some(pattern => pattern.test(blockedUri))) {
      return true;
    }

    // Known CDN or third-party services that might be temporarily blocked
    const knownServices = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'unpkg.com',
      'jsdelivr.net'
    ];

    if (knownServices.some(service => blockedUri.includes(service))) {
      return true;
    }

    // Inline violations from allowed sources
    if (violatedDirective.includes('script-src') && blockedUri === 'inline') {
      // Check if this is from a trusted source
      const sourceFile = violation['source-file'];
      if (sourceFile && (sourceFile.includes('localhost') || sourceFile.includes('127.0.0.1'))) {
        return true;
      }
    }

    return false;
  }

  private processViolation(violation: CSPViolationReport): ProcessedViolation {
    const violationType = this.categorizeViolation(violation);
    const riskLevel = this.assessRiskLevel(violation);
    const recommendedAction = this.generateRecommendedAction(violation);
    const autoFixAvailable = this.canAutoFix(violation);

    return {
      violation_type: violationType,
      blocked_uri: violation['blocked-uri'],
      violated_directive: violation['violated-directive'],
      source_file: violation['source-file'],
      line_number: violation['line-number'],
      risk_level: riskLevel,
      recommended_action: recommendedAction,
      auto_fix_available: autoFixAvailable
    };
  }

  private categorizeViolation(violation: CSPViolationReport): string {
    const directive = violation['violated-directive'];
    const blockedUri = violation['blocked-uri'];

    if (directive.includes('script-src')) {
      if (blockedUri === 'inline') {
        return 'inline-script-execution';
      } else if (blockedUri === 'eval') {
        return 'eval-usage';
      } else {
        return 'external-script-load';
      }
    }

    if (directive.includes('style-src')) {
      return blockedUri === 'inline' ? 'inline-style-usage' : 'external-style-load';
    }

    if (directive.includes('img-src')) {
      return 'unauthorized-image-load';
    }

    if (directive.includes('frame-src')) {
      return 'unauthorized-frame-load';
    }

    if (directive.includes('connect-src')) {
      return 'unauthorized-network-request';
    }

    return 'unknown-csp-violation';
  }

  private assessRiskLevel(violation: CSPViolationReport): 'low' | 'medium' | 'high' | 'critical' {
    const directive = violation['violated-directive'];
    const blockedUri = violation['blocked-uri'];

    // Critical risks
    if (blockedUri === 'eval' || blockedUri.includes('javascript:')) {
      return 'critical';
    }

    if (directive.includes('script-src') && blockedUri === 'inline') {
      return 'high';
    }

    if (directive.includes('frame-src') && !this.isTrustedDomain(blockedUri)) {
      return 'high';
    }

    // Medium risks
    if (directive.includes('connect-src') && !this.isTrustedDomain(blockedUri)) {
      return 'medium';
    }

    if (directive.includes('style-src') && blockedUri === 'inline') {
      return 'medium';
    }

    // Low risks
    if (directive.includes('img-src') || directive.includes('font-src')) {
      return 'low';
    }

    return 'medium';
  }

  private isTrustedDomain(uri: string): boolean {
    const trustedDomains = [
      'localhost',
      '127.0.0.1',
      'supabase.com',
      'googleapis.com',
      'gstatic.com',
      'unpkg.com',
      'jsdelivr.net'
    ];

    return trustedDomains.some(domain => uri.includes(domain));
  }

  private generateRecommendedAction(violation: CSPViolationReport): string {
    const directive = violation['violated-directive'];
    const blockedUri = violation['blocked-uri'];

    if (blockedUri === 'eval') {
      return 'Remove eval() usage and replace with safer alternatives';
    }

    if (directive.includes('script-src') && blockedUri === 'inline') {
      return 'Move inline scripts to external files or add nonce/hash to CSP';
    }

    if (directive.includes('style-src') && blockedUri === 'inline') {
      return 'Move inline styles to external CSS files or add nonce/hash to CSP';
    }

    if (directive.includes('script-src') && blockedUri !== 'inline') {
      return `Add '${blockedUri}' to script-src directive or verify if this script is necessary`;
    }

    if (directive.includes('connect-src')) {
      return `Add '${blockedUri}' to connect-src directive if this is a trusted API endpoint`;
    }

    if (directive.includes('img-src')) {
      return `Add '${blockedUri}' to img-src directive if this is a trusted image source`;
    }

    return 'Review and update CSP policy to allow this resource if it is trusted';
  }

  private canAutoFix(violation: CSPViolationReport): boolean {
    const directive = violation['violated-directive'];
    const blockedUri = violation['blocked-uri'];

    // Can auto-fix by adding trusted domains to CSP
    if (this.isTrustedDomain(blockedUri) && 
        (directive.includes('script-src') || 
         directive.includes('style-src') || 
         directive.includes('img-src') || 
         directive.includes('font-src'))) {
      return true;
    }

    return false;
  }

  private async handleCriticalViolation(processedViolation: ProcessedViolation, originalViolation: CSPViolationReport): Promise<void> {
    logger.critical('Critical CSP violation detected', {
      module: 'csp-violation-reporter',
      metadata: {
        violation_type: processedViolation.violation_type,
        blocked_uri: processedViolation.blocked_uri,
        violated_directive: processedViolation.violated_directive,
        document_uri: originalViolation['document-uri'],
        source_file: processedViolation.source_file,
        line_number: processedViolation.line_number
      }
    });

    // Additional critical violation handling
    // In a real implementation, this would:
    // - Send immediate alerts to security team
    // - Potentially block the user session
    // - Trigger automated incident response
  }

  private mapRiskLevelToSeverity(riskLevel: 'low' | 'medium' | 'high' | 'critical'): 'low' | 'medium' | 'high' | 'critical' {
    return riskLevel;
  }

  private cleanupOldCounts(): void {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);
    
    for (const [key] of this.violationCount.entries()) {
      const keyMinute = parseInt(key.split('-').pop() || '0');
      if (currentMinute - keyMinute > 5) { // Keep only last 5 minutes
        this.violationCount.delete(key);
      }
    }
  }
}

export const cspViolationReporter = new CSPViolationReporter();