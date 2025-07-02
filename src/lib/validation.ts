import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const requiredStringSchema = z.string().min(1, 'This field is required');
export const optionalStringSchema = z.string().optional();
export const numberSchema = z.number().min(0, 'Must be a positive number');
export const dateSchema = z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format');
export const uuidSchema = z.string().uuid('Invalid ID format');

// Organization validation
export const organizationSchema = z.object({
  name: requiredStringSchema,
  sector: requiredStringSchema,
  size: requiredStringSchema,
  regulatory_guidelines: z.array(z.string()).optional()
});

// Risk-related validation
export const riskSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const riskStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed']);

export const riskAssessmentSchema = z.object({
  title: requiredStringSchema,
  description: optionalStringSchema,
  severity: riskSeveritySchema,
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  assigned_to: uuidSchema.optional(),
  due_date: dateSchema.optional()
});

// KRI validation
export const kriSchema = z.object({
  name: requiredStringSchema,
  description: optionalStringSchema,
  measurement_frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  warning_threshold: z.number().min(0),
  critical_threshold: z.number().min(0),
  target_value: z.number().min(0).optional(),
  unit_of_measurement: requiredStringSchema
});

// Incident validation
export const incidentSchema = z.object({
  title: requiredStringSchema,
  description: requiredStringSchema,
  severity: riskSeveritySchema,
  category: requiredStringSchema,
  status: riskStatusSchema,
  assigned_to: uuidSchema.optional(),
  reported_by: uuidSchema,
  business_function: requiredStringSchema.optional()
});

// Third party validation
export const thirdPartySchema = z.object({
  vendor_name: requiredStringSchema,
  contact_person: requiredStringSchema,
  email: emailSchema,
  phone: optionalStringSchema,
  service_type: requiredStringSchema,
  criticality: z.enum(['low', 'medium', 'high', 'critical']),
  contract_start_date: dateSchema,
  contract_end_date: dateSchema,
  last_assessment_date: dateSchema.optional(),
  next_review_date: dateSchema
});

// Control validation
export const controlSchema = z.object({
  name: requiredStringSchema,
  description: requiredStringSchema,
  control_type: z.enum(['preventive', 'detective', 'corrective']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually']),
  owner: requiredStringSchema,
  testing_frequency_days: z.number().min(1).max(365),
  effectiveness_rating: z.number().min(1).max(5).optional()
});

// Document validation
export const documentSchema = z.object({
  title: requiredStringSchema,
  description: optionalStringSchema,
  document_type: requiredStringSchema,
  status: z.enum(['draft', 'review', 'approved', 'archived']),
  review_due_date: dateSchema.optional(),
  expiry_date: dateSchema.optional()
});

// Business function validation
export const businessFunctionSchema = z.object({
  name: requiredStringSchema,
  description: requiredStringSchema,
  criticality: z.enum(['low', 'medium', 'high', 'critical']),
  owner: requiredStringSchema,
  rto_hours: z.number().min(0).max(8760), // Max 1 year in hours
  rpo_hours: z.number().min(0).max(8760)
});

// Form validation helper
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 1000); // Limit length
}

export function sanitizeNumber(input: string | number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
}

export function sanitizeDate(input: string): Date | null {
  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
}