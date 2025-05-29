
import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "../error-handling";
import { QueryOptions, PaginatedResult } from "./types";

// Generic pagination function with simplified query building
async function createPaginatedQuery<T>(
  tableName: string,
  options: QueryOptions = {}
): Promise<PaginatedResult<T>> {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters = {}
    } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query using raw query builder without excessive chaining
    const query = supabase.from(tableName);
    let baseQuery = query.select('*', { count: 'exact' });
    
    // Apply filters using individual queries to avoid type complexity
    const filterEntries = Object.entries(filters).filter(([, value]) => 
      value !== undefined && value !== null && value !== ''
    );

    for (const [key, value] of filterEntries) {
      if (typeof value === 'string' && value.includes('%')) {
        baseQuery = (baseQuery as any).ilike(key, value);
      } else {
        baseQuery = (baseQuery as any).eq(key, value);
      }
    }

    // Apply range and order with type assertion
    const { data, error, count } = await (baseQuery as any)
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    ErrorHandler.handle(error, `Paginating ${tableName}`);
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    };
  }
}

// Specific utility functions for different tables
export async function getIncidentsWithPagination(options: QueryOptions = {}): Promise<PaginatedResult<any>> {
  return createPaginatedQuery('incident_logs', options);
}

export async function getPoliciesWithPagination(options: QueryOptions = {}): Promise<PaginatedResult<any>> {
  return createPaginatedQuery('governance_policies', options);
}

export async function getKRILogsWithPagination(options: QueryOptions = {}): Promise<PaginatedResult<any>> {
  const defaultOptions = {
    ...options,
    sortBy: options.sortBy || 'measurement_date'
  };
  return createPaginatedQuery('kri_logs', defaultOptions);
}
