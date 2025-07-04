import { parseUUIDFromQuery, validateUUID, normalizeUUID } from "@/lib/uuid-validation";
import { getCurrentOrgId } from "@/lib/organization-context";

// Query parameter validation utilities
export class QueryValidator {
  
  // Extract and validate UUID from URL search params
  static getUUIDParam(
    searchParams: URLSearchParams, 
    paramName: string, 
    required: boolean = true
  ): string | null {
    const value = searchParams.get(paramName);
    
    if (!value) {
      if (required) {
        throw new Error(`Missing required parameter: ${paramName}`);
      }
      return null;
    }

    try {
      return normalizeUUID(value);
    } catch (error) {
      throw new Error(`Invalid ${paramName}: ${error.message}`);
    }
  }

  // Extract multiple UUIDs from comma-separated parameter
  static getUUIDArrayParam(
    searchParams: URLSearchParams, 
    paramName: string
  ): string[] {
    const value = searchParams.get(paramName);
    
    if (!value) return [];

    return value.split(',')
      .map(uuid => uuid.trim())
      .filter(uuid => uuid.length > 0)
      .map(uuid => {
        try {
          return normalizeUUID(uuid);
        } catch (error) {
          throw new Error(`Invalid UUID in ${paramName}: ${uuid}`);
        }
      });
  }

  // Validate organization ID in context
  static async validateOrgAccess(providedOrgId?: string): Promise<string> {
    const currentOrgId = await getCurrentOrgId();
    
    if (providedOrgId) {
      const normalizedProvided = normalizeUUID(providedOrgId);
      if (normalizedProvided !== currentOrgId) {
        throw new Error("Access denied: Organization ID mismatch");
      }
      return normalizedProvided;
    }
    
    return currentOrgId;
  }

  // Parse and validate org_id from various sources
  static async extractOrgId(
    searchParams?: URLSearchParams,
    body?: any,
    defaultToCurrent: boolean = true
  ): Promise<string> {
    // Try to get from search params first
    if (searchParams?.has('org_id')) {
      const orgId = this.getUUIDParam(searchParams, 'org_id');
      if (orgId) {
        return await this.validateOrgAccess(orgId);
      }
    }

    // Try to get from body
    if (body?.org_id) {
      const orgId = validateUUID(body.org_id);
      return await this.validateOrgAccess(orgId);
    }

    // Default to current organization
    if (defaultToCurrent) {
      return await getCurrentOrgId();
    }

    throw new Error("Organization ID not provided and not defaulting to current");
  }
}

// Form data validation utilities
export class FormValidator {
  
  // Validate UUID field in form data
  static validateUUIDField(data: FormData | Record<string, any>, fieldName: string, required: boolean = true): string | null {
    const value = data instanceof FormData ? data.get(fieldName) : data[fieldName];
    
    if (!value) {
      if (required) {
        throw new Error(`${fieldName} is required`);
      }
      return null;
    }

    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    try {
      return normalizeUUID(value);
    } catch (error) {
      throw new Error(`Invalid ${fieldName}: ${error.message}`);
    }
  }

  // Validate organization context in form submissions
  static async validateFormOrgContext(data: FormData | Record<string, any>): Promise<string> {
    const orgId = this.validateUUIDField(data, 'org_id', false);
    return await QueryValidator.validateOrgAccess(orgId || undefined);
  }
}

// Supabase edge function validation utilities
export class EdgeFunctionValidator {
  
  // Validate request contains proper organization context
  static async validateRequest(request: Request): Promise<{
    orgId: string;
    searchParams: URLSearchParams;
    body?: any;
  }> {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let body;
    try {
      if (request.method !== 'GET') {
        body = await request.json();
      }
    } catch {
      // Body parsing failed, continue without body
    }

    const orgId = await QueryValidator.extractOrgId(searchParams, body, true);

    return {
      orgId,
      searchParams,
      body
    };
  }

  // Create standardized error response
  static createErrorResponse(message: string, status: number = 400): Response {
    return new Response(
      JSON.stringify({ 
        error: message,
        timestamp: new Date().toISOString()
      }),
      { 
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Create success response with validated data
  static createSuccessResponse(data: any, status: number = 200): Response {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        timestamp: new Date().toISOString()
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Validation middleware for common patterns
export function withUUIDValidation<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  paramNames: string[] = ['id', 'org_id']
): T {
  return (async (...args: any[]) => {
    try {
      // Validate UUID parameters if they exist
      const params = args[0] as Record<string, any>;
      if (params) {
        for (const paramName of paramNames) {
          if (params[paramName]) {
            params[paramName] = normalizeUUID(params[paramName]);
          }
        }
      }
      
      return await handler(...args);
    } catch (error) {
      if (error.message.includes('Invalid UUID')) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }) as T;
}