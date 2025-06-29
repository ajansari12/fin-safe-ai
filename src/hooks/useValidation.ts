
import { useState, useCallback } from 'react';
import { dataValidationService, ValidationResult } from '@/services/validation/data-validation-service';

export const useValidation = (formType: string) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const validate = useCallback((formData: any) => {
    const result = dataValidationService.validateForm(formType, formData);
    setValidationResult(result);
    return result;
  }, [formType]);

  const validateField = useCallback((fieldName: string, value: any, formData: any) => {
    const result = dataValidationService.validateForm(formType, { ...formData, [fieldName]: value });
    const fieldErrors = result.errors.filter(error => error.field === fieldName);
    const fieldWarnings = result.warnings.filter(warning => warning.field === fieldName);
    
    return {
      isValid: fieldErrors.length === 0,
      errors: fieldErrors,
      warnings: fieldWarnings
    };
  }, [formType]);

  const clearValidation = useCallback(() => {
    setValidationResult({
      isValid: true,
      errors: [],
      warnings: []
    });
  }, []);

  return {
    validationResult,
    validate,
    validateField,
    clearValidation,
    hasErrors: validationResult.errors.length > 0,
    hasWarnings: validationResult.warnings.length > 0
  };
};
