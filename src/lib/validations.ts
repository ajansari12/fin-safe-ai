
import { z } from "zod";

// Common validation patterns
const emailSchema = z.string().email("Please enter a valid email address");
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number").optional();
const requiredString = z.string().min(1, "This field is required");
const positiveNumber = z.number().positive("Must be a positive number");
const nonNegativeNumber = z.number().min(0, "Must be zero or positive");

// Security settings validation
export const authSettingsSchema = z.object({
  mfa_enforced: z.boolean(),
  session_timeout_minutes: z.number().min(5, "Minimum 5 minutes").max(1440, "Maximum 24 hours"),
  password_policy: z.object({
    min_length: z.number().min(6, "Minimum 6 characters").max(32, "Maximum 32 characters"),
    require_uppercase: z.boolean(),
    require_numbers: z.boolean(),
    require_symbols: z.boolean(),
  }),
  ip_whitelist: z.array(z.string().ip("Invalid IP address")).optional(),
  allowed_auth_methods: z.array(z.string()).min(1, "At least one auth method required"),
});

export type AuthSettingsFormData = z.infer<typeof authSettingsSchema>;

// Enhanced incident validation schema
export const incidentSchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  severity: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a severity level"
  }),
  category: z.string().min(1, "Please select a category"),
  business_function_id: z.string().uuid("Please select a business function"),
  reported_by: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
  impact_rating: z.number().min(1, "Minimum rating is 1").max(10, "Maximum rating is 10").optional(),
  max_response_time_hours: positiveNumber.max(168, "Maximum 168 hours").optional(),
  max_resolution_time_hours: positiveNumber.max(720, "Maximum 720 hours").optional(),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;

// Enhanced KRI validation schema
export const kriSchema = z.object({
  name: requiredString.min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  measurement_frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually"], {
    required_error: "Please select a measurement frequency"
  }),
  target_value: z.string().max(50, "Target value too long").optional(),
  warning_threshold: z.string().max(50, "Warning threshold too long").optional(),
  critical_threshold: z.string().max(50, "Critical threshold too long").optional(),
  control_id: z.string().uuid().optional(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
});

export type KRIFormData = z.infer<typeof kriSchema>;

// KRI log validation
export const kriLogSchema = z.object({
  kri_id: z.string().uuid("Invalid KRI ID"),
  measurement_date: z.date(),
  actual_value: z.number(),
  target_value: z.number().optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export type KRILogFormData = z.infer<typeof kriLogSchema>;

// Policy validation schema with enhanced validation
export const policySchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  framework_id: z.string().uuid("Please select a framework"),
  status: z.enum(["draft", "active", "under_review", "approved", "rejected", "archived"]).default("draft"),
  review_due_date: z.date().optional(),
  assigned_reviewer_name: z.string().max(100, "Reviewer name too long").optional(),
});

export type PolicyFormData = z.infer<typeof policySchema>;

// User management validation schema
export const userInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "manager", "analyst", "reviewer"], {
    required_error: "Please select a role"
  }),
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
});

export type UserInviteFormData = z.infer<typeof userInviteSchema>;

// Third party validation schema with enhanced validation
export const vendorSchema = z.object({
  vendor_name: requiredString.min(2, "Vendor name must be at least 2 characters").max(100, "Name too long"),
  service_provided: requiredString.max(200, "Service description too long"),
  criticality: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select criticality level"
  }),
  status: z.enum(["active", "inactive", "under_review", "terminated"]).default("active"),
  contact_name: z.string().max(100, "Contact name too long").optional(),
  contact_email: emailSchema.optional(),
  contact_phone: phoneSchema,
  risk_rating: z.enum(["low", "medium", "high", "critical"]).optional(),
  last_assessment_date: z.date().optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// Business function validation schema
export const businessFunctionSchema = z.object({
  name: requiredString.min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  criticality: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select criticality level"
  }),
  category: z.string().max(50, "Category too long").optional(),
  owner: z.string().max(100, "Owner name too long").optional(),
});

export type BusinessFunctionFormData = z.infer<typeof businessFunctionSchema>;

// Governance framework validation schema
export const frameworkSchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export type FrameworkFormData = z.infer<typeof frameworkSchema>;

// Control validation schema
export const controlSchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  scope: requiredString.max(200, "Scope description too long"),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually"]),
  owner: requiredString.max(100, "Owner name too long"),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
  test_method: z.enum(["manual", "automated", "hybrid"]).optional(),
  test_frequency_days: positiveNumber.max(365, "Maximum 365 days").optional(),
});

export type ControlFormData = z.infer<typeof controlSchema>;

// Data retention policy validation schema
export const dataRetentionSchema = z.object({
  table_name: requiredString.max(50, "Table name too long"),
  retention_period_days: z.number().min(1, "Retention period must be at least 1 day").max(3650, "Retention period cannot exceed 10 years"),
  auto_delete: z.boolean().default(false),
  description: z.string().max(500, "Description too long").optional(),
});

export type DataRetentionFormData = z.infer<typeof dataRetentionSchema>;

// API key validation schema
export const apiKeySchema = z.object({
  key_name: requiredString.min(3, "Key name must be at least 3 characters").max(100, "Name too long"),
  key_type: z.enum(["api_key", "webhook", "integration"], {
    required_error: "Please select key type"
  }),
  description: z.string().max(500, "Description too long").optional(),
  expires_at: z.date().optional(),
});

export type ApiKeyFormData = z.infer<typeof apiKeySchema>;

// Impact tolerance validation
export const impactToleranceSchema = z.object({
  function_id: z.string().uuid("Invalid function ID"),
  max_tolerable_downtime: requiredString,
  recovery_time_objective: requiredString,
  quantitative_threshold: requiredString.max(200, "Threshold description too long"),
  financial_impact: z.string().max(1000, "Financial impact description too long").optional(),
  reputational_impact: z.string().max(1000, "Reputational impact description too long").optional(),
  compliance_impact: z.string().max(1000, "Compliance impact description too long").optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type ImpactToleranceFormData = z.infer<typeof impactToleranceSchema>;

// Server-side validation helpers
export const validateWithSchema = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Common validation patterns for reuse
export const commonValidations = {
  email: emailSchema,
  phone: phoneSchema,
  requiredString,
  positiveNumber,
  nonNegativeNumber,
  uuid: z.string().uuid("Invalid ID format"),
  date: z.date(),
  optionalDate: z.date().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["active", "inactive", "draft"]),
  criticality: z.enum(["low", "medium", "high", "critical"]),
};
