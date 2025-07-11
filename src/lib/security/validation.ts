// Input validation and sanitization utilities

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'uuid';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  sanitize?: boolean;
}

export class InputValidator {
  private static readonly HTML_SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  private static readonly JAVASCRIPT_PROTOCOL_REGEX = /javascript:/gi;
  private static readonly EVENT_HANDLER_REGEX = /on\w+\s*=/gi;
  private static readonly SQL_INJECTION_PATTERNS = [
    /('|(\\')|(;)|(\\)|(\-\-)|(\/\*))/i,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
  ];

  static validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    for (const rule of rules) {
      const value = data[rule.field];
      const fieldResult = this.validateField(value, rule);
      
      if (!fieldResult.valid) {
        errors.push(...fieldResult.errors.map(err => `${rule.field}: ${err}`));
      } else if (rule.sanitize && fieldResult.sanitized !== undefined) {
        sanitized[rule.field] = fieldResult.sanitized;
      } else {
        sanitized[rule.field] = value;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? sanitized : undefined,
    };
  }

  private static validateField(value: any, rule: ValidationRule): ValidationResult {
    const errors: string[] = [];
    let sanitized = value;

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      return { valid: false, errors: ['Field is required'] };
    }

    // Skip validation for optional empty fields
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { valid: true, errors: [] };
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push('Must be a string');
          break;
        }
        
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`Must be at least ${rule.minLength} characters`);
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`Must be no more than ${rule.maxLength} characters`);
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push('Invalid format');
        }
        
        if (rule.sanitize) {
          sanitized = this.sanitizeString(value);
        }
        
        // Check for SQL injection patterns
        if (this.containsSqlInjection(value)) {
          errors.push('Contains potentially malicious content');
        }
        break;

      case 'number':
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (typeof numValue !== 'number' || isNaN(numValue)) {
          errors.push('Must be a valid number');
          break;
        }
        
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push(`Must be at least ${rule.min}`);
        }
        
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push(`Must be no more than ${rule.max}`);
        }
        
        sanitized = numValue;
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push('Must be a boolean');
        }
        break;

      case 'email':
        if (typeof value !== 'string') {
          errors.push('Must be a string');
          break;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Must be a valid email address');
        }
        
        if (rule.sanitize) {
          sanitized = this.sanitizeString(value.toLowerCase().trim());
        }
        break;

      case 'url':
        if (typeof value !== 'string') {
          errors.push('Must be a string');
          break;
        }
        
        try {
          new URL(value);
          if (rule.sanitize) {
            sanitized = this.sanitizeString(value);
          }
        } catch {
          errors.push('Must be a valid URL');
        }
        break;

      case 'uuid':
        if (typeof value !== 'string') {
          errors.push('Must be a string');
          break;
        }
        
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
          errors.push('Must be a valid UUID');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: rule.sanitize ? sanitized : value,
    };
  }

  private static sanitizeString(str: string): string {
    return str
      .replace(this.HTML_SCRIPT_REGEX, '')
      .replace(this.JAVASCRIPT_PROTOCOL_REGEX, '')
      .replace(this.EVENT_HANDLER_REGEX, '')
      .trim();
  }

  private static containsSqlInjection(str: string): boolean {
    return this.SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
  }

  // Predefined validation rule sets
  static readonly COMMON_RULES = {
    name: {
      field: 'name',
      type: 'string' as const,
      required: true,
      minLength: 1,
      maxLength: 255,
      sanitize: true,
    },
    email: {
      field: 'email',
      type: 'email' as const,
      required: true,
      sanitize: true,
    },
    description: {
      field: 'description',
      type: 'string' as const,
      required: false,
      maxLength: 10000,
      sanitize: true,
    },
    id: {
      field: 'id',
      type: 'uuid' as const,
      required: true,
    },
    role: {
      field: 'role',
      type: 'string' as const,
      required: true,
      pattern: /^(admin|analyst|reviewer|auditor|executive)$/,
    },
  };
}

// Role-specific validation
export const validateRoleAssignment = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    InputValidator.COMMON_RULES.id,
    InputValidator.COMMON_RULES.role,
    {
      field: 'organizationId',
      type: 'uuid',
      required: true,
    },
  ];

  return InputValidator.validate(data, rules);
};

// Incident validation
export const validateIncidentData = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    {
      field: 'title',
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 255,
      sanitize: true,
    },
    {
      field: 'description',
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 10000,
      sanitize: true,
    },
    {
      field: 'severity',
      type: 'string',
      required: true,
      pattern: /^(low|medium|high|critical)$/,
    },
    {
      field: 'category',
      type: 'string',
      required: true,
      maxLength: 100,
      sanitize: true,
    },
  ];

  return InputValidator.validate(data, rules);
};

// Policy validation
export const validatePolicyData = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    {
      field: 'title',
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 255,
      sanitize: true,
    },
    {
      field: 'content',
      type: 'string',
      required: true,
      minLength: 50,
      maxLength: 50000,
      sanitize: true,
    },
    {
      field: 'version',
      type: 'string',
      required: true,
      pattern: /^\d+\.\d+(\.\d+)?$/,
    },
    {
      field: 'framework',
      type: 'string',
      required: true,
      maxLength: 100,
      sanitize: true,
    },
  ];

  return InputValidator.validate(data, rules);
};

// User profile validation
export const validateUserProfile = (data: any): ValidationResult => {
  const rules: ValidationRule[] = [
    {
      field: 'fullName',
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 255,
      sanitize: true,
    },
    {
      field: 'email',
      type: 'email',
      required: true,
      sanitize: true,
    },
    {
      field: 'avatarUrl',
      type: 'url',
      required: false,
      sanitize: true,
    },
  ];

  return InputValidator.validate(data, rules);
};