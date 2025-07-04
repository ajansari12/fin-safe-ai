import { supabase } from "@/integrations/supabase/client";
import { PLACEHOLDER_UUID } from "@/lib/uuid-validation";

export interface SampleDataResults {
  success: boolean;
  message: string;
  results: {
    organizations: number;
    profiles: number;
    incident_logs: number;
    controls: number;
    vendor_contracts: number;
    continuity_plans: number;
    governance_policies: number;
    errors: string[];
  };
}

class SampleDataService {
  // Generate comprehensive sample data
  async generateSampleData(): Promise<SampleDataResults> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-sample-data', {
        body: {}
      });

      if (error) {
        throw new Error(`Failed to generate sample data: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Sample data generation error:', error);
      throw error;
    }
  }

  // Clear all sample data (useful for testing)
  async clearSampleData(): Promise<void> {
    try {
      // Note: This will cascade delete based on foreign key relationships
      const tables = [
        'governance_policies',
        'governance_frameworks', 
        'continuity_plans',
        'vendor_contracts',
        'third_party_profiles',
        'controls',
        'incident_logs',
        'profiles',
        // Note: Don't delete from auth.users as it requires admin privileges
        'organizations'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', PLACEHOLDER_UUID); // Delete all except system records

        if (error && !error.message.includes('violates row-level security policy')) {
          console.warn(`Warning deleting from ${table}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Error clearing sample data:', error);
      throw error;
    }
  }

  // Get sample data statistics
  async getSampleDataStats(): Promise<Record<string, number>> {
    try {
      const stats: Record<string, number> = {};
      
      const tables = [
        'organizations',
        'profiles', 
        'incident_logs',
        'controls',
        'third_party_profiles',
        'vendor_contracts',
        'continuity_plans',
        'governance_frameworks',
        'governance_policies'
      ];

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.warn(`Error counting ${table}:`, error.message);
          stats[table] = 0;
        } else {
          stats[table] = count || 0;
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting sample data stats:', error);
      throw error;
    }
  }
}

export const sampleDataService = new SampleDataService();