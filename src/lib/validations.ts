
import { z } from "zod";

// Common validation patterns
const emailSchema = z.string().email("Please enter a valid email address");
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number").optional();
const requiredString = z.string().min(1, "This field is required");

// Incident validation schema
export const incidentSchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a severity level"
  }),
  category: z.string().min(1, "Please select a category"),
  business_function_id: z.string().uuid("Please select a business function"),
  reported_by: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
  impact_rating: z.number().min(1).max(5).optional(),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;

// Policy validation schema
export const policySchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  framework_id: z.string().uuid("Please select a framework"),
  status: z.enum(["draft", "active", "under_review", "approved", "rejected", "archived"]).default("draft"),
  review_due_date: z.date().optional(),
  assigned_reviewer_name: z.string().optional(),
});

export type PolicyFormData = z.infer<typeof policySchema>;

// KRI validation schema
export const kriSchema = z.object({
  name: requiredString.min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  measurement_frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually"], {
    required_error: "Please select a measurement frequency"
  }),
  target_value: z.string().optional(),
  warning_threshold: z.string().optional(),
  critical_threshold: z.string().optional(),
  control_id: z.string().uuid().optional(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
});

export type KRIFormData = z.infer<typeof kriSchema>;

// User management validation schema
export const userInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "manager", "analyst", "reviewer"], {
    required_error: "Please select a role"
  }),
});

export type UserInviteFormData = z.infer<typeof userInviteSchema>;

// Third party validation schema
export const vendorSchema = z.object({
  vendor_name: requiredString.min(2, "Vendor name must be at least 2 characters"),
  service_provided: requiredString,
  criticality: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select criticality level"
  }),
  status: z.enum(["active", "inactive", "under_review", "terminated"]).default("active"),
  contact_name: z.string().optional(),
  contact_email: emailSchema.optional(),
  contact_phone: phoneSchema,
  risk_rating: z.enum(["low", "medium", "high", "critical"]).optional(),
  last_assessment_date: z.date().optional(),
  notes: z.string().optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

// Business function validation schema
export const businessFunctionSchema = z.object({
  name: requiredString.min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  criticality: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select criticality level"
  }),
  category: z.string().optional(),
  owner: z.string().optional(),
});

export type BusinessFunctionFormData = z.infer<typeof businessFunctionSchema>;

// Governance framework validation schema
export const frameworkSchema = z.object({
  title: requiredString.min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export type FrameworkFormData = z.infer<typeof frameworkSchema>;

// Data retention policy validation schema
export const dataRetentionSchema = z.object({
  table_name: requiredString,
  retention_period_days: z.number().min(1, "Retention period must be at least 1 day").max(3650, "Retention period cannot exceed 10 years"),
  auto_delete: z.boolean().default(false),
  description: z.string().optional(),
});

export type DataRetentionFormData = z.infer<typeof dataRetentionSchema>;

// API key validation schema
export const apiKeySchema = z.object({
  key_name: requiredString.min(3, "Key name must be at least 3 characters"),
  key_type: z.enum(["api_key", "webhook", "integration"], {
    required_error: "Please select key type"
  }),
  description: z.string().optional(),
  expires_at: z.date().optional(),
});

export type ApiKeyFormData = z.infer<typeof apiKeySchema>;
