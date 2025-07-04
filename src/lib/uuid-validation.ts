import { z } from "zod";

// UUID validation schema
export const uuidSchema = z.string().uuid("Invalid UUID format");

// Organization ID validation
export const orgIdSchema = z.string().uuid("Invalid organization ID format");

// Validate and normalize UUID
export function validateUUID(value: unknown): string {
  const result = uuidSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid UUID: ${result.error.issues[0].message}`);
  }
  return result.data.toLowerCase(); // Normalize to lowercase
}

// Validate organization ID
export function validateOrgId(value: unknown): string {
  const result = orgIdSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid organization ID: ${result.error.issues[0].message}`);
  }
  return result.data.toLowerCase(); // Normalize to lowercase
}

// Check if string is a valid UUID format
export function isValidUUID(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}

// Generate a default/placeholder UUID (for testing only)
export const PLACEHOLDER_UUID = "00000000-0000-0000-0000-000000000000";

// Normalize UUID format
export function normalizeUUID(uuid: string): string {
  if (!uuid) return uuid;
  
  // Remove any extra whitespace and convert to lowercase
  const normalized = uuid.trim().toLowerCase();
  
  // Validate the format
  if (!isValidUUID(normalized)) {
    throw new Error(`Invalid UUID format: ${uuid}`);
  }
  
  return normalized;
}

// Parse UUID from query parameters safely
export function parseUUIDFromQuery(value: string | string[] | undefined): string | null {
  if (!value) return null;
  
  // Handle array case (multiple values)
  const stringValue = Array.isArray(value) ? value[0] : value;
  
  if (!stringValue) return null;
  
  try {
    return normalizeUUID(stringValue);
  } catch {
    console.warn(`Invalid UUID in query parameter: ${stringValue}`);
    return null;
  }
}

// Validate that a value is not a placeholder/default UUID
export function isNotPlaceholderUUID(uuid: string): boolean {
  const normalized = uuid.toLowerCase();
  return normalized !== PLACEHOLDER_UUID && 
         normalized !== "default-org-id" &&
         !normalized.includes("default") &&
         !normalized.includes("placeholder");
}

// Schema for validating organization context
export const orgContextSchema = z.object({
  org_id: uuidSchema.refine(isNotPlaceholderUUID, {
    message: "Organization ID cannot be a placeholder value"
  }),
  user_id: uuidSchema.optional(),
});

// Validate organization context
export function validateOrgContext(context: unknown) {
  return orgContextSchema.parse(context);
}