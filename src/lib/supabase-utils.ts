
import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "./error-handling";

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Helper functions for common queries
export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching user profile');
    return null;
  }
}

export async function getUserOrganization() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching user organization');
    return null;
  }
}

// Specific utility functions for different tables
export async function getIncidentsWithPagination(options: QueryOptions = {}) {
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

    let query = supabase
      .from('incident_logs')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    ErrorHandler.handle(error, 'Paginating incidents');
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    };
  }
}

export async function getPoliciesWithPagination(options: QueryOptions = {}) {
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

    let query = supabase
      .from('governance_policies')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    ErrorHandler.handle(error, 'Paginating policies');
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    };
  }
}

export async function getKRILogsWithPagination(options: QueryOptions = {}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'measurement_date',
      sortOrder = 'desc',
      filters = {}
    } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('kri_logs')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    ErrorHandler.handle(error, 'Paginating KRI logs');
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    };
  }
}

// Safe query helpers
export async function safeGetSingleIncident(id: string) {
  try {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching incident record');
    return null;
  }
}

export async function safeGetSinglePolicy(id: string) {
  try {
    const { data, error } = await supabase
      .from('governance_policies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching policy record');
    return null;
  }
}

export async function safeDeleteRecord(tableName: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName as any)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    ErrorHandler.handle(error, `Deleting ${tableName} record`);
    return false;
  }
}
