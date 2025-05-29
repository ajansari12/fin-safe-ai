
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

export class SupabaseQueryBuilder {
  static async paginate<T>(
    tableName: string,
    options: QueryOptions = {},
    selectFields = '*'
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

      let query = supabase
        .from(tableName)
        .select(selectFields, { count: 'exact' })
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

  static async findByOrg<T>(
    tableName: string,
    orgId: string,
    options: QueryOptions = {},
    selectFields = '*'
  ): Promise<PaginatedResult<T>> {
    return this.paginate<T>(tableName, {
      ...options,
      filters: { ...options.filters, org_id: orgId }
    }, selectFields);
  }

  static async safeGetSingle<T>(
    tableName: string,
    id: string,
    selectFields = '*'
  ): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorHandler.handle(error, `Fetching ${tableName} record`);
      return null;
    }
  }

  static async safeUpdate<T>(
    tableName: string,
    id: string,
    updates: Partial<T>,
    selectFields = '*'
  ): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select(selectFields)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorHandler.handle(error, `Updating ${tableName} record`);
      return null;
    }
  }

  static async safeInsert<T>(
    tableName: string,
    record: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    selectFields = '*'
  ): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select(selectFields)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      ErrorHandler.handle(error, `Inserting ${tableName} record`);
      return null;
    }
  }

  static async safeDelete(tableName: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      ErrorHandler.handle(error, `Deleting ${tableName} record`);
      return false;
    }
  }
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
