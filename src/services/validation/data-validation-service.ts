
export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'number' | 'range' | 'pattern' | 'custom';
  message: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any, formData: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
}

export interface CrossFieldValidation {
  fields: string[];
  validator: (values: any) => { isValid: boolean; message?: string };
  message: string;
}

class DataValidationService {
  private validationRules: Map<string, ValidationRule[]> = new Map();
  private crossFieldRules: Map<string, CrossFieldValidation[]> = new Map();

  // Initialize validation rules for different forms
  initializeRules() {
    // Risk Assessment Form Rules
    this.validationRules.set('riskAssessment', [
      {
        field: 'riskTitle',
        type: 'required',
        message: 'Risk title is required'
      },
      {
        field: 'likelihood',
        type: 'range',
        min: 1,
        max: 5,
        message: 'Likelihood must be between 1 and 5'
      },
      {
        field: 'impact',
        type: 'range',
        min: 1,
        max: 5,
        message: 'Impact must be between 1 and 5'
      },
      {
        field: 'riskScore',
        type: 'custom',
        message: 'Risk score must align with likelihood and impact ratings',
        customValidator: (value, formData) => {
          const expectedScore = (formData.likelihood || 1) * (formData.impact || 1);
          return Math.abs(value - expectedScore) <= 2; // Allow 2-point tolerance
        }
      }
    ]);

    // Cross-field validation for risk assessment
    this.crossFieldRules.set('riskAssessment', [
      {
        fields: ['likelihood', 'impact', 'riskScore'],
        validator: (values) => {
          const { likelihood, impact, riskScore } = values;
          const expectedScore = likelihood * impact;
          const isValid = Math.abs(riskScore - expectedScore) <= 2;
          return { isValid, message: isValid ? '' : 'Risk score should align with likelihood × impact calculation' };
        },
        message: 'Risk score calculation validation failed'
      }
    ]);

    // Tolerance Definition Rules
    this.validationRules.set('toleranceDefinition', [
      {
        field: 'operationName',
        type: 'required',
        message: 'Operation name is required'
      },
      {
        field: 'rto',
        type: 'number',
        min: 1,
        message: 'RTO must be a positive number'
      },
      {
        field: 'rpo',
        type: 'number',
        min: 1,
        message: 'RPO must be a positive number'
      },
      {
        field: 'serviceLevel',
        type: 'range',
        min: 1,
        max: 100,
        message: 'Service level must be between 1 and 100'
      },
      {
        field: 'financialThreshold',
        type: 'number',
        min: 0,
        message: 'Financial threshold must be non-negative'
      }
    ]);

    // Cross-field validation for tolerance
    this.crossFieldRules.set('toleranceDefinition', [
      {
        fields: ['rto', 'rpo'],
        validator: (values) => {
          const { rto, rpo } = values;
          const isValid = rpo <= rto;
          return { isValid, message: isValid ? '' : 'RPO should not exceed RTO' };
        },
        message: 'RPO/RTO relationship validation failed'
      }
    ]);
  }

  validateForm(formType: string, formData: any): ValidationResult {
    const rules = this.validationRules.get(formType) || [];
    const crossRules = this.crossFieldRules.get(formType) || [];
    
    const errors: { field: string; message: string }[] = [];
    const warnings: { field: string; message: string }[] = [];

    // Field-level validation
    for (const rule of rules) {
      const fieldValue = formData[rule.field];
      const validationResult = this.validateField(fieldValue, rule, formData);
      
      if (!validationResult.isValid) {
        errors.push({ field: rule.field, message: rule.message });
      }
    }

    // Cross-field validation
    for (const crossRule of crossRules) {
      const values = crossRule.fields.reduce((acc, field) => {
        acc[field] = formData[field];
        return acc;
      }, {} as any);

      const result = crossRule.validator(values);
      if (!result.isValid) {
        errors.push({ field: crossRule.fields[0], message: result.message || crossRule.message });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateField(value: any, rule: ValidationRule, formData: any): { isValid: boolean } {
    switch (rule.type) {
      case 'required':
        return { isValid: value !== null && value !== undefined && value !== '' };
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return { isValid: !value || emailRegex.test(value) };
      
      case 'number':
        const numValue = Number(value);
        return { isValid: !isNaN(numValue) && (rule.min === undefined || numValue >= rule.min) && (rule.max === undefined || numValue <= rule.max) };
      
      case 'range':
        const rangeValue = Number(value);
        return { isValid: !isNaN(rangeValue) && rangeValue >= (rule.min || 0) && rangeValue <= (rule.max || Infinity) };
      
      case 'pattern':
        return { isValid: !value || (rule.pattern && rule.pattern.test(value)) };
      
      case 'custom':
        return { isValid: !rule.customValidator || rule.customValidator(value, formData) };
      
      default:
        return { isValid: true };
    }
  }

  validateBulkData(data: any[], formType: string): { validRows: any[]; invalidRows: any[]; errors: any[] } {
    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const errors: any[] = [];

    data.forEach((row, index) => {
      const validation = this.validateForm(formType, row);
      
      if (validation.isValid) {
        validRows.push(row);
      } else {
        invalidRows.push({ ...row, _rowIndex: index });
        errors.push({
          rowIndex: index,
          errors: validation.errors,
          data: row
        });
      }
    });

    return { validRows, invalidRows, errors };
  }
}

export const dataValidationService = new DataValidationService();
// Initialize rules on service creation
dataValidationService.initializeRules();
