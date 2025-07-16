import { ContentSecurityPolicy } from './content-security-policy';

/**
 * Security headers middleware for enhanced protection
 */
export class SecurityHeaders {
  static apply(): void {
    // Apply CSP headers
    ContentSecurityPolicy.applyCSP();
    
    // Apply additional security headers via meta tags
    this.applySecurityMetaTags();
  }

  private static applySecurityMetaTags(): void {
    if (typeof document === 'undefined') return;

    const headers = [
      // X-Frame-Options
      { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
      // X-Content-Type-Options
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      // Referrer-Policy
      { 'http-equiv': 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      // Permissions-Policy
      { 'http-equiv': 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' },
      // X-XSS-Protection
      { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' }
    ];

    headers.forEach(header => {
      const existingMeta = document.querySelector(`meta[http-equiv="${header['http-equiv']}"]`);
      if (existingMeta) {
        existingMeta.remove();
      }

      const metaTag = document.createElement('meta');
      metaTag.setAttribute('http-equiv', header['http-equiv']);
      metaTag.setAttribute('content', header.content);
      document.head.appendChild(metaTag);
    });
  }

  /**
   * Validate current security headers
   */
  static validateHeaders(): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check if CSP is applied
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      warnings.push('Content Security Policy not found');
    }

    // Check X-Frame-Options
    const frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    if (!frameMeta) {
      warnings.push('X-Frame-Options header not found');
    }

    // Check X-Content-Type-Options
    const contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!contentTypeMeta) {
      warnings.push('X-Content-Type-Options header not found');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
}