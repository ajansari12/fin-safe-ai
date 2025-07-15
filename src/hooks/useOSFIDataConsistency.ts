import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OSFIDataValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lastValidated: string;
}

interface OSFIDataSources {
  compliance_policies: any[];
  compliance_checks: any[];
  controls: any[];
  regulatory_reports: any[];
  continuity_plans: any[];
  third_party_profiles: any[];
  risk_alerts: any[];
  kri_logs: any[];
}

export const useOSFIDataConsistency = (orgId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Centralized data fetching with error handling
  const { data: osfiData, error, isLoading, refetch } = useQuery({
    queryKey: ['osfi-data-consistency', orgId],
    queryFn: async (): Promise<OSFIDataSources> => {
      if (!orgId) throw new Error('Organization ID is required');

      const queries = await Promise.allSettled([
        supabase.from('compliance_policies').select('*').eq('org_id', orgId),
        supabase.from('compliance_checks').select('*').eq('org_id', orgId),
        supabase.from('controls').select('*').eq('org_id', orgId),
        supabase.from('regulatory_reports').select('*').eq('org_id', orgId),
        supabase.from('continuity_plans').select('*').eq('org_id', orgId),
        supabase.from('third_party_profiles').select('*').eq('org_id', orgId),
        supabase.from('risk_alerts').select('*').eq('org_id', orgId),
        supabase.from('kri_logs').select('*').eq('org_id', orgId)
      ]);

      const results: OSFIDataSources = {
        compliance_policies: [],
        compliance_checks: [],
        controls: [],
        regulatory_reports: [],
        continuity_plans: [],
        third_party_profiles: [],
        risk_alerts: [],
        kri_logs: []
      };

      const keys = Object.keys(results) as (keyof OSFIDataSources)[];
      
      queries.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          results[keys[index]] = result.value.data;
        } else if (result.status === 'rejected') {
          console.error(`Failed to fetch ${keys[index]}:`, result.reason);
        }
      });

      return results;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Handle errors with useEffect to avoid onError deprecation
  useEffect(() => {
    if (error) {
      console.error('OSFI data fetch error:', error);
      toast({
        title: "Data Loading Error",
        description: "Some OSFI data may be incomplete. Please refresh if issues persist.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Data validation function
  const validateData = useCallback((): OSFIDataValidation => {
    if (!osfiData) {
      return {
        isValid: false,
        errors: ['No data available'],
        warnings: [],
        lastValidated: new Date().toISOString()
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate data relationships
    const policies = osfiData.compliance_policies;
    const checks = osfiData.compliance_checks;
    const controls = osfiData.controls;

    // Check for orphaned compliance checks
    const orphanedChecks = checks.filter(check => 
      check.policy_id && !policies.some(policy => policy.id === check.policy_id)
    );
    if (orphanedChecks.length > 0) {
      warnings.push(`${orphanedChecks.length} compliance checks reference non-existent policies`);
    }

    // Check for missing OSFI framework policies
    const osfiPolicies = policies.filter(p => p.framework === 'OSFI-E21');
    if (osfiPolicies.length === 0) {
      warnings.push('No OSFI E-21 policies found');
    }

    // Validate control effectiveness scores
    const invalidControls = controls.filter(control => 
      control.effectiveness_score !== null && 
      (control.effectiveness_score < 0 || control.effectiveness_score > 100)
    );
    if (invalidControls.length > 0) {
      errors.push(`${invalidControls.length} controls have invalid effectiveness scores`);
    }

    // Check for stale data
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const staleReports = osfiData.regulatory_reports.filter(report => 
      new Date(report.updated_at) < oneMonthAgo && report.report_status === 'draft'
    );
    if (staleReports.length > 0) {
      warnings.push(`${staleReports.length} regulatory reports haven't been updated in over a month`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      lastValidated: new Date().toISOString()
    };
  }, [osfiData]);

  // Cache invalidation utilities
  const invalidateCache = useCallback((scope?: 'all' | 'compliance' | 'risk' | 'continuity') => {
    if (scope === 'all') {
      queryClient.invalidateQueries({ queryKey: ['osfi-data-consistency'] });
    } else {
      // Selective invalidation based on scope
      const patterns = {
        compliance: ['osfi-compliance', 'compliance-policies', 'compliance-checks'],
        risk: ['osfi-risk', 'risk-alerts', 'third-party'],
        continuity: ['osfi-continuity', 'continuity-plans', 'scenario-tests']
      };

      if (scope && patterns[scope]) {
        patterns[scope].forEach(pattern => {
          queryClient.invalidateQueries({ queryKey: [pattern] });
        });
      }
    }
  }, [queryClient]);

  // Computed metrics for consistency
  const consistencyMetrics = useCallback(() => {
    if (!osfiData) return null;

    const totalEntities = Object.values(osfiData).reduce((sum, arr) => sum + arr.length, 0);
    const validation = validateData();
    
    return {
      totalEntities,
      dataQualityScore: validation.isValid ? 100 : Math.max(0, 100 - (validation.errors.length * 20)),
      lastSync: new Date().toISOString(),
      coverage: {
        compliance: osfiData.compliance_policies.length > 0,
        controls: osfiData.controls.length > 0,
        reporting: osfiData.regulatory_reports.length > 0,
        continuity: osfiData.continuity_plans.length > 0,
        thirdParty: osfiData.third_party_profiles.length > 0
      }
    };
  }, [osfiData, validateData]);

  return {
    // Data access
    data: osfiData,
    isLoading,
    error,
    
    // Data validation
    validation: validateData(),
    metrics: consistencyMetrics(),
    
    // Cache management
    refetch,
    invalidateCache,
    
    // Utility functions
    getDataByPrinciple: useCallback((principle: string) => {
      if (!osfiData) return null;
      
      const principleMap: { [key: string]: string[] } = {
        'Principle 1': ['governance', 'oversight'],
        'Principle 2': ['operational', 'model'],
        'Principle 3': ['risk', 'appetite'],
        'Principle 4': ['data', 'quality'],
        'Principle 5': ['governance', 'lineage'],
        'Principle 6': ['continuity', 'business'],
        'Principle 7': ['third', 'vendor']
      };

      const keywords = principleMap[principle] || [];
      
      return {
        policies: osfiData.compliance_policies.filter(p => 
          keywords.some(keyword => p.policy_name?.toLowerCase().includes(keyword))
        ),
        controls: osfiData.controls.filter(c => 
          keywords.some(keyword => c.title?.toLowerCase().includes(keyword))
        ),
        reports: osfiData.regulatory_reports.filter(r => 
          keywords.some(keyword => r.report_type?.toLowerCase().includes(keyword))
        )
      };
    }, [osfiData])
  };
};