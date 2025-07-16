/**
 * Content Security Policy utilities for enhanced security
 */

export interface CSPConfig {
  // Script sources
  scriptSrc: string[];
  // Style sources
  styleSrc: string[];
  // Image sources
  imgSrc: string[];
  // Font sources
  fontSrc: string[];
  // Connect sources (API endpoints)
  connectSrc: string[];
  // Frame sources
  frameSrc: string[];
  // Object sources
  objectSrc: string[];
  // Media sources
  mediaSrc: string[];
  // Child sources
  childSrc: string[];
  // Worker sources
  workerSrc: string[];
  // Manifest sources
  manifestSrc: string[];
  // Report URI
  reportUri?: string;
}

export class ContentSecurityPolicy {
  private static readonly DEFAULT_CONFIG: CSPConfig = {
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Vite in development
      "'unsafe-eval'", // Required for Vite in development
      "https://cdn.jsdelivr.net", // Common CDN
      "https://unpkg.com" // Common CDN
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS libraries
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net"
    ],
    imgSrc: [
      "'self'",
      "data:", // For data URIs
      "https:", // Allow HTTPS images
      "blob:" // For generated images
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
      "data:"
    ],
    connectSrc: [
      "'self'",
      "https://ooocjyscnvbahsyryzxp.supabase.co", // Supabase API
      "https://api.openai.com", // OpenAI API
      "https://api.anthropic.com", // Anthropic API
      "wss://ooocjyscnvbahsyryzxp.supabase.co", // Supabase WebSocket
      "https://vitals.vercel-insights.com" // Vercel Analytics
    ],
    frameSrc: [
      "'self'",
      "https://ooocjyscnvbahsyryzxp.supabase.co" // Supabase embeds
    ],
    objectSrc: ["'none'"], // Prevent object/embed attacks
    mediaSrc: [
      "'self'",
      "https:",
      "blob:",
      "data:"
    ],
    childSrc: [
      "'self'",
      "blob:"
    ],
    workerSrc: [
      "'self'",
      "blob:"
    ],
    manifestSrc: ["'self'"]
  };

  private static readonly PRODUCTION_CONFIG: Partial<CSPConfig> = {
    scriptSrc: [
      "'self'",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com"
    ],
    styleSrc: [
      "'self'",
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net"
    ]
  };

  /**
   * Generate CSP header value
   */
  static generateCSPHeader(customConfig?: Partial<CSPConfig>): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseConfig = isProduction 
      ? { ...this.DEFAULT_CONFIG, ...this.PRODUCTION_CONFIG }
      : this.DEFAULT_CONFIG;
    
    const config = customConfig ? { ...baseConfig, ...customConfig } : baseConfig;
    
    const directives = [
      `default-src 'self'`,
      `script-src ${config.scriptSrc.join(' ')}`,
      `style-src ${config.styleSrc.join(' ')}`,
      `img-src ${config.imgSrc.join(' ')}`,
      `font-src ${config.fontSrc.join(' ')}`,
      `connect-src ${config.connectSrc.join(' ')}`,
      `frame-src ${config.frameSrc.join(' ')}`,
      `object-src ${config.objectSrc.join(' ')}`,
      `media-src ${config.mediaSrc.join(' ')}`,
      `child-src ${config.childSrc.join(' ')}`,
      `worker-src ${config.workerSrc.join(' ')}`,
      `manifest-src ${config.manifestSrc.join(' ')}`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `upgrade-insecure-requests`
    ];

    if (config.reportUri) {
      directives.push(`report-uri ${config.reportUri}`);
    }

    return directives.join('; ');
  }

  /**
   * Generate CSP meta tag
   */
  static generateCSPMetaTag(customConfig?: Partial<CSPConfig>): string {
    const cspHeader = this.generateCSPHeader(customConfig);
    return `<meta http-equiv="Content-Security-Policy" content="${cspHeader}">`;
  }

  /**
   * Apply CSP to document (for dynamic application)
   */
  static applyCSP(customConfig?: Partial<CSPConfig>): void {
    if (typeof document === 'undefined') return;

    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    const metaTag = document.createElement('meta');
    metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
    metaTag.setAttribute('content', this.generateCSPHeader(customConfig));
    document.head.appendChild(metaTag);
  }

  /**
   * Validate CSP configuration
   */
  static validateConfig(config: CSPConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for common misconfigurations
    if (config.scriptSrc.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
      errors.push("'unsafe-eval' should not be used in production");
    }

    if (config.objectSrc.includes("'self'") || config.objectSrc.includes("https:")) {
      errors.push("object-src should be 'none' for security");
    }

    if (!config.connectSrc.some(src => src.includes('supabase.co'))) {
      errors.push("Missing Supabase API endpoint in connect-src");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * React hook for CSP management
 */
export function useContentSecurityPolicy(customConfig?: Partial<CSPConfig>) {
  const applyCSP = () => {
    ContentSecurityPolicy.applyCSP(customConfig);
  };

  const generateHeader = () => {
    return ContentSecurityPolicy.generateCSPHeader(customConfig);
  };

  const validateConfig = () => {
    const config = customConfig ? { ...ContentSecurityPolicy['DEFAULT_CONFIG'], ...customConfig } : ContentSecurityPolicy['DEFAULT_CONFIG'];
    return ContentSecurityPolicy.validateConfig(config);
  };

  return {
    applyCSP,
    generateHeader,
    validateConfig
  };
}