import { supabase } from '@/integrations/supabase/client';

export interface DataAvailabilityStatus {
  incidents: {
    count: number;
    hasData: boolean;
    lastEntry?: string;
  };
  kris: {
    count: number;
    hasData: boolean;
    withMeasurements: number;
  };
  vendors: {
    count: number;
    hasData: boolean;
    riskAssessed: number;
  };
  controls: {
    count: number;
    hasData: boolean;
    tested: number;
  };
  businessFunctions: {
    count: number;
    hasData: boolean;
  };
  totalDataScore: number;
  readyForPredictive: boolean;
}

export interface DataRequirement {
  module: string;
  title: string;
  description: string;
  status: 'complete' | 'partial' | 'missing';
  count: number;
  minimumRequired: number;
  actionUrl: string;
  actionText: string;
}

class DataAvailabilityService {
  async checkDataAvailability(orgId: string): Promise<DataAvailabilityStatus> {
    console.log('DataAvailabilityService: Starting check for org', orgId);
    try {
      // First get KRI definitions
      const krisResult = await supabase
        .from('kri_definitions')
        .select('id')
        .eq('org_id', orgId);

      // Get KRI logs only if we have KRI definitions
      const kriIds = krisResult.data?.map(k => k.id) || [];
      let kriLogsResult = { data: [] };
      if (kriIds.length > 0) {
        kriLogsResult = await supabase
          .from('kri_logs')
          .select('kri_id')
          .in('kri_id', kriIds);
      }

      // Get controls first
      const controlsResult = await supabase
        .from('controls')
        .select('id')
        .eq('org_id', orgId);

      // Get control tests only if we have controls
      const controlIds = controlsResult.data?.map(c => c.id) || [];
      let controlTestsResult = { data: [] };
      if (controlIds.length > 0) {
        controlTestsResult = await supabase
          .from('control_tests')
          .select('control_id')
          .in('control_id', controlIds);
      }

      // Get other data in parallel
      const [
        incidentsResult,
        vendorsResult,
        businessFunctionsResult
      ] = await Promise.all([
        supabase
          .from('incident_logs')
          .select('id, created_at')
          .eq('org_id', orgId),
        supabase
          .from('third_party_profiles')
          .select('id, risk_rating')
          .eq('org_id', orgId),
        supabase
          .from('business_functions')
          .select('id')
          .eq('org_id', orgId)
      ]);

      console.log('DataAvailabilityService: Got results', {
        incidents: incidentsResult.data?.length || 0,
        kris: krisResult.data?.length || 0,
        kriLogs: kriLogsResult.data?.length || 0,
        vendors: vendorsResult.data?.length || 0,
        controls: controlsResult.data?.length || 0,
        controlTests: controlTestsResult.data?.length || 0,
        businessFunctions: businessFunctionsResult.data?.length || 0
      });

      const incidents = {
        count: incidentsResult.data?.length || 0,
        hasData: (incidentsResult.data?.length || 0) > 0,
        lastEntry: incidentsResult.data?.[0]?.created_at
      };

      const kris = {
        count: krisResult.data?.length || 0,
        hasData: (krisResult.data?.length || 0) > 0,
        withMeasurements: kriLogsResult.data?.length || 0
      };

      const vendors = {
        count: vendorsResult.data?.length || 0,
        hasData: (vendorsResult.data?.length || 0) > 0,
        riskAssessed: vendorsResult.data?.filter(v => v.risk_rating).length || 0
      };

      const controls = {
        count: controlsResult.data?.length || 0,
        hasData: (controlsResult.data?.length || 0) > 0,
        tested: controlTestsResult.data?.length || 0
      };

      const businessFunctions = {
        count: businessFunctionsResult.data?.length || 0,
        hasData: (businessFunctionsResult.data?.length || 0) > 0
      };

      // Calculate overall data score (0-100)
      const totalDataScore = Math.round((
        (incidents.hasData ? 25 : 0) +
        (kris.hasData && kris.withMeasurements > 0 ? 25 : 0) +
        (vendors.hasData && vendors.riskAssessed > 0 ? 25 : 0) +
        (controls.hasData && controls.tested > 0 ? 25 : 0)
      ));

      const readyForPredictive = totalDataScore >= 50; // Need at least 2 modules with data

      return {
        incidents,
        kris,
        vendors,
        controls,
        businessFunctions,
        totalDataScore,
        readyForPredictive
      };
    } catch (error) {
      console.error('Error checking data availability:', error);
      return {
        incidents: { count: 0, hasData: false },
        kris: { count: 0, hasData: false, withMeasurements: 0 },
        vendors: { count: 0, hasData: false, riskAssessed: 0 },
        controls: { count: 0, hasData: false, tested: 0 },
        businessFunctions: { count: 0, hasData: false },
        totalDataScore: 0,
        readyForPredictive: false
      };
    }
  }

  generateDataRequirements(status: DataAvailabilityStatus): DataRequirement[] {
    return [
      {
        module: 'incidents',
        title: 'Incident History',
        description: 'Historical incident data is needed to predict future incident patterns and frequencies.',
        status: status.incidents.count >= 5 ? 'complete' : status.incidents.hasData ? 'partial' : 'missing',
        count: status.incidents.count,
        minimumRequired: 5,
        actionUrl: '/app/incident-log',
        actionText: status.incidents.hasData ? 'Add More Incidents' : 'Log First Incident'
      },
      {
        module: 'kris',
        title: 'KRI Measurements',
        description: 'Key Risk Indicator trends help predict threshold breaches and risk appetite violations.',
        status: status.kris.withMeasurements >= 3 ? 'complete' : status.kris.withMeasurements > 0 ? 'partial' : 'missing',
        count: status.kris.withMeasurements,
        minimumRequired: 3,
        actionUrl: '/app/controls-and-kri',
        actionText: status.kris.hasData ? 'Add KRI Measurements' : 'Define KRIs'
      },
      {
        module: 'vendors',
        title: 'Third-Party Risk Data',
        description: 'Vendor risk assessments enable prediction of supply chain and third-party risk events.',
        status: status.vendors.riskAssessed >= 3 ? 'complete' : status.vendors.riskAssessed > 0 ? 'partial' : 'missing',
        count: status.vendors.riskAssessed,
        minimumRequired: 3,
        actionUrl: '/app/third-party-risk',
        actionText: status.vendors.hasData ? 'Complete Risk Assessments' : 'Add First Vendor'
      },
      {
        module: 'controls',
        title: 'Control Effectiveness',
        description: 'Control testing results help predict control failures and effectiveness trends.',
        status: status.controls.tested >= 5 ? 'complete' : status.controls.tested > 0 ? 'partial' : 'missing',
        count: status.controls.tested,
        minimumRequired: 5,
        actionUrl: '/app/controls-and-kri',
        actionText: status.controls.hasData ? 'Run Control Tests' : 'Define Controls'
      }
    ];
  }
}

export const dataAvailabilityService = new DataAvailabilityService();