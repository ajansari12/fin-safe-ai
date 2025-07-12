/**
 * Data normalization utilities for handling JOIN query results
 * and ensuring consistent data structures across the application
 */

/**
 * Normalizes Supabase JOIN results where relationships are returned as arrays
 * but we expect single objects
 */
export function normalizeJoinResult<T extends Record<string, any>>(data: T): T {
  const normalized = { ...data } as any;
  
  // Check each property for array-like structures that should be single objects
  Object.keys(normalized).forEach(key => {
    const value = normalized[key];
    
    // If it's an array with a single object, extract the object
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'object') {
      normalized[key] = value[0];
    }
    // If it's an empty array, set to undefined
    else if (Array.isArray(value) && value.length === 0) {
      normalized[key] = undefined;
    }
  });
  
  return normalized as T;
}

/**
 * Normalizes an array of JOIN results
 */
export function normalizeJoinResults<T>(data: T[]): T[] {
  return data.map(item => normalizeJoinResult(item));
}

/**
 * Safely extracts a nested property from a JOIN result
 * Handles both array and object structures
 */
export function extractJoinProperty<T>(joinResult: any, propertyPath: string): T | undefined {
  if (!joinResult) return undefined;
  
  const path = propertyPath.split('.');
  let current = joinResult;
  
  for (const segment of path) {
    if (!current) return undefined;
    
    // If current is an array, take the first element
    if (Array.isArray(current) && current.length > 0) {
      current = current[0];
    }
    
    current = current[segment];
  }
  
  return current;
}

/**
 * Column name compatibility layer - deprecated, use primary column names
 * @deprecated Use primary column names directly (name, title, etc.)
 */
export function normalizeColumnNames<T extends Record<string, any>>(data: T): T {
  // Simplified implementation - database handles aliases via generated columns
  return { ...data } as T;
}

/**
 * Business function specific normalization
 */
export function normalizeBusinessFunction(data: any) {
  if (!data) return undefined;
  
  const normalized = normalizeJoinResult(data);
  return normalizeColumnNames(normalized);
}

/**
 * Comprehensive data transformation for service responses
 */
export function transformServiceResponse<T extends Record<string, any>>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) {
    return data.map(item => {
      const normalized = normalizeJoinResult(item);
      return normalizeColumnNames(normalized);
    });
  } else {
    const normalized = normalizeJoinResult(data);
    return normalizeColumnNames(normalized);
  }
}

/**
 * Validates that required relationships are properly loaded
 */
export function validateRelationships(data: any, requiredRelations: string[]): boolean {
  for (const relation of requiredRelations) {
    const value = extractJoinProperty(data, relation);
    if (!value) {
      console.warn(`Missing required relationship: ${relation}`);
      return false;
    }
  }
  return true;
}

/**
 * Type-safe business function extraction
 */
export interface NormalizedBusinessFunction {
  name: string;
  function_name?: string;
  criticality: string;
  [key: string]: any;
}

export function extractBusinessFunction(data: any): NormalizedBusinessFunction | undefined {
  const businessFunction = extractJoinProperty(data, 'business_functions') || 
                          extractJoinProperty(data, 'business_function');
  
  if (!businessFunction || typeof businessFunction !== 'object') return undefined;
  
  const bf = businessFunction as any;
  const name = bf.name;
  const criticality = bf.criticality || 'medium';
  
  if (!name) return undefined;
  
  return normalizeColumnNames({
    name,
    criticality,
    ...bf
  });
}

/**
 * Framework generation data normalization
 */
export function normalizeFrameworkGenerationResult(result: any) {
  return {
    framework_name: result.framework_name || result.framework?.framework_name || 'Generated Framework',
    framework_type: result.framework_type || result.framework?.framework_type || 'unknown',
    effectiveness_score: result.effectiveness_score || 85,
    generation_metadata: result.generation_metadata || {},
    framework_data: result.framework_data || {}
  };
}