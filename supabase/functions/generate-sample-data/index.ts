import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { faker } from "https://esm.sh/@faker-js/faker@8.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Dynamic data templates based on organization type
const getBusinessFunctionsByOrgType = (orgType: string) => {
  switch (orgType) {
    case 'banking-schedule-i':
      return [
        'Retail Banking', 'Commercial Banking', 'Investment Banking', 'Treasury Management',
        'Wealth Management', 'Digital Banking', 'Credit Risk Management', 'Market Risk Management',
        'Operational Risk Management', 'Compliance & Regulatory Affairs', 'Internal Audit',
        'Technology & Innovation', 'Human Resources', 'Customer Service'
      ];
    case 'banking-schedule-ii':
      return [
        'Foreign Exchange Operations', 'Corporate Banking', 'Trade Finance', 'Treasury Operations',
        'Liquidity Management', 'Cybersecurity Operations', 'Outsourcing Risk Management',
        'Compliance Monitoring', 'Internal Controls', 'Operational Risk'
      ];
    case 'credit-union':
      return [
        'Member Services', 'Community Lending', 'Deposit Operations', 'Member Relations',
        'Branch Operations', 'Digital Services', 'Credit Administration', 'Risk Management',
        'Compliance', 'Community Development'
      ];
    case 'fintech':
      return [
        'Payment Processing', 'Digital Wallet Services', 'API Management', 'Data Analytics',
        'Customer Onboarding', 'Fraud Detection', 'Regulatory Technology', 'Platform Operations',
        'Security Operations', 'Customer Support'
      ];
    default:
      return ['Operations', 'Risk Management', 'Compliance', 'Technology', 'Customer Service'];
  }
};

const getKRIsByOrgType = (orgType: string) => {
  switch (orgType) {
    case 'banking-schedule-i':
      return [
        { name: 'Capital Adequacy Ratio', unit: 'percentage', threshold_warning: 8.0, threshold_critical: 6.0 },
        { name: 'Liquidity Coverage Ratio', unit: 'percentage', threshold_warning: 100, threshold_critical: 90 },
        { name: 'Net Stable Funding Ratio', unit: 'percentage', threshold_warning: 100, threshold_critical: 95 },
        { name: 'Credit Loss Provisions', unit: 'currency', threshold_warning: 10000000, threshold_critical: 20000000 },
        { name: 'Operational Risk Losses', unit: 'currency', threshold_warning: 1000000, threshold_critical: 5000000 },
        { name: 'Customer Complaint Rate', unit: 'percentage', threshold_warning: 2.0, threshold_critical: 5.0 },
        { name: 'System Availability', unit: 'percentage', threshold_warning: 99.5, threshold_critical: 99.0 },
        { name: 'Cybersecurity Incidents', unit: 'count', threshold_warning: 3, threshold_critical: 7 }
      ];
    case 'banking-schedule-ii':
      return [
        { name: 'Liquidity Buffer Ratio', unit: 'percentage', threshold_warning: 15, threshold_critical: 10 },
        { name: 'Outsourcing Risk Score', unit: 'score', threshold_warning: 70, threshold_critical: 85 },
        { name: 'Cybersecurity Incidents', unit: 'count', threshold_warning: 2, threshold_critical: 5 },
        { name: 'Cross-Border Transaction Delays', unit: 'percentage', threshold_warning: 5, threshold_critical: 10 },
        { name: 'Parent Company Dependency Risk', unit: 'score', threshold_warning: 60, threshold_critical: 80 },
        { name: 'Regulatory Compliance Score', unit: 'percentage', threshold_warning: 95, threshold_critical: 90 }
      ];
    case 'credit-union':
      return [
        { name: 'Member Satisfaction Score', unit: 'percentage', threshold_warning: 85, threshold_critical: 75 },
        { name: 'Loan Default Rate', unit: 'percentage', threshold_warning: 2.0, threshold_critical: 4.0 },
        { name: 'Operational Efficiency Ratio', unit: 'percentage', threshold_warning: 75, threshold_critical: 85 },
        { name: 'Community Investment Ratio', unit: 'percentage', threshold_warning: 5, threshold_critical: 3 },
        { name: 'Credit Risk Exposure', unit: 'currency', threshold_warning: 5000000, threshold_critical: 10000000 },
        { name: 'Branch Service Quality', unit: 'score', threshold_warning: 4.0, threshold_critical: 3.5 }
      ];
    case 'fintech':
      return [
        { name: 'API Response Time', unit: 'milliseconds', threshold_warning: 500, threshold_critical: 1000 },
        { name: 'Transaction Success Rate', unit: 'percentage', threshold_warning: 99.5, threshold_critical: 99.0 },
        { name: 'Platform Uptime', unit: 'percentage', threshold_warning: 99.9, threshold_critical: 99.5 },
        { name: 'Data Security Incidents', unit: 'count', threshold_warning: 1, threshold_critical: 3 },
        { name: 'Customer Onboarding Time', unit: 'minutes', threshold_warning: 15, threshold_critical: 30 },
        { name: 'Fraud Detection Rate', unit: 'percentage', threshold_warning: 95, threshold_critical: 90 }
      ];
    default:
      return [
        { name: 'System Availability', unit: 'percentage', threshold_warning: 99.5, threshold_critical: 99.0 },
        { name: 'Risk Score', unit: 'score', threshold_warning: 70, threshold_critical: 85 }
      ];
  }
};

const getPoliciesByOrgType = (orgType: string, regulatoryClassification: string[]) => {
  const basePolicies = ['Risk Management Policy', 'Information Security Policy', 'Data Governance Policy'];
  
  switch (orgType) {
    case 'banking-schedule-i':
      return [
        ...basePolicies,
        'Basel III Capital Management Policy',
        'OSFI E-21 Operational Risk Policy',
        'Liquidity Risk Management Policy',
        'Credit Risk Policy',
        'Market Risk Policy',
        'Model Risk Management Policy',
        'Anti-Money Laundering Policy',
        'Business Continuity Policy',
        'Third Party Risk Policy',
        'Consumer Protection Policy',
        'Stress Testing Policy'
      ];
    case 'banking-schedule-ii':
      return [
        ...basePolicies,
        'OSFI E-21 Operational Risk Policy',
        'Basel III Compliance Policy',
        'Outsourcing Risk Management Policy',
        'Cross-Border Operations Policy',
        'Parent Company Governance Policy',
        'Liquidity Management Policy',
        'Foreign Exchange Risk Policy',
        'Cybersecurity Policy'
      ];
    case 'credit-union':
      return [
        ...basePolicies,
        'Member Relations Policy',
        'Community Lending Policy',
        'Deposit Insurance Policy',
        'Provincial Regulatory Compliance Policy',
        'Member Privacy Policy',
        'Credit Risk Policy',
        'Operational Risk Policy',
        'Business Continuity Policy'
      ];
    case 'fintech':
      return [
        ...basePolicies,
        'FINTRAC Compliance Policy',
        'PCI DSS Security Policy',
        'API Security Policy',
        'Data Privacy Policy',
        'Platform Operations Policy',
        'Customer Onboarding Policy',
        'Fraud Prevention Policy',
        'Incident Response Policy'
      ];
    default:
      return basePolicies;
  }
};

const getVendorsByOrgType = (orgType: string) => {
  switch (orgType) {
    case 'banking-schedule-i':
      return [
        { name: 'Core Banking Systems Inc.', type: 'technology', category: 'core_banking', criticality: 'critical' },
        { name: 'Risk Analytics Solutions', type: 'technology', category: 'risk_management', criticality: 'high' },
        { name: 'Compliance Monitoring Corp', type: 'operational', category: 'compliance', criticality: 'high' },
        { name: 'Cybersecurity Services Ltd', type: 'technology', category: 'cybersecurity', criticality: 'critical' },
        { name: 'Payment Processing Network', type: 'financial', category: 'payment_processing', criticality: 'critical' },
        { name: 'Data Center Services', type: 'technology', category: 'infrastructure', criticality: 'high' }
      ];
    case 'banking-schedule-ii':
      return [
        { name: 'Foreign Exchange Platform', type: 'financial', category: 'fx_trading', criticality: 'critical' },
        { name: 'Trade Finance Systems', type: 'technology', category: 'trade_finance', criticality: 'high' },
        { name: 'Liquidity Management Solutions', type: 'financial', category: 'liquidity', criticality: 'high' },
        { name: 'Cybersecurity Monitoring', type: 'technology', category: 'cybersecurity', criticality: 'critical' },
        { name: 'Outsourced Operations Provider', type: 'operational', category: 'bpo', criticality: 'high' }
      ];
    case 'credit-union':
      return [
        { name: 'Member Services Platform', type: 'technology', category: 'member_services', criticality: 'high' },
        { name: 'Community Banking Solutions', type: 'technology', category: 'banking_core', criticality: 'critical' },
        { name: 'Credit Processing Services', type: 'financial', category: 'credit_processing', criticality: 'medium' },
        { name: 'Digital Banking Provider', type: 'technology', category: 'digital_banking', criticality: 'high' }
      ];
    case 'fintech':
      return [
        { name: 'Cloud Infrastructure Provider', type: 'technology', category: 'cloud_services', criticality: 'critical' },
        { name: 'Payment Gateway Services', type: 'financial', category: 'payment_processing', criticality: 'critical' },
        { name: 'Data Analytics Platform', type: 'technology', category: 'data_analytics', criticality: 'high' },
        { name: 'API Security Solutions', type: 'technology', category: 'cybersecurity', criticality: 'high' },
        { name: 'Fraud Detection Engine', type: 'technology', category: 'fraud_detection', criticality: 'critical' }
      ];
    default:
      return [
        { name: 'Technology Services Inc.', type: 'technology', category: 'general_it', criticality: 'medium' }
      ];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request parameters
    const body = await req.json().catch(() => ({}));
    const params = {
      kriLogsMonths: body.kriLogsMonths || 6,
      vendorCount: body.vendorCount || 25,
      incidentCount: body.incidentCount || 15,
      governanceCount: body.governanceCount || 50,
      includeFailedSLA: body.includeFailedSLA !== false,
      mixedSeverity: body.mixedSeverity !== false
    };
    
    const results = {
      organizations: 0,
      profiles: 0,
      incident_logs: 0,
      controls: 0,
      vendor_contracts: 0,
      continuity_plans: 0,
      governance_policies: 0,
      kri_logs: 0,
      kri_definitions: 0,
      errors: []
    };

    // 1. Create Organizations with enhanced classification
    const organizations = [];
    const orgData = [
      {
        name: "First National Bank of Canada",
        sector: "banking",
        size: "large",
        org_type: "banking-schedule-i",
        sub_sector: "Commercial",
        employee_count: 15000,
        asset_size: 250000000000,
        capital_tier: "Tier 1",
        geographic_scope: "National",
        regulatory_guidelines: ["OSFI E-21", "PIPEDA", "BCBS 239"],
        regulatory_classification: ["OSFI E-21", "Basel III", "PIPEDA"]
      },
      {
        name: "Deutsche Bank Canada Branch",
        sector: "banking", 
        size: "large",
        org_type: "banking-schedule-ii",
        sub_sector: "Investment",
        employee_count: 800,
        asset_size: 45000000000,
        capital_tier: "Tier 1",
        geographic_scope: "National",
        regulatory_guidelines: ["OSFI E-21", "PIPEDA", "BCBS 239"],
        regulatory_classification: ["OSFI E-21", "Basel III", "FINTRAC"]
      },
      {
        name: "Coastal Community Credit Union",
        sector: "credit_union",
        size: "medium",
        org_type: "credit-union", 
        sub_sector: "Community",
        employee_count: 450,
        asset_size: 2800000000,
        capital_tier: "Not Applicable",
        geographic_scope: "Regional",
        regulatory_guidelines: ["OSFI E-21", "CUDIC"],
        regulatory_classification: ["Provincial Credit Union Act", "OSFI E-21"]
      },
      {
        name: "Northern FinTech Solutions",
        sector: "fintech",
        size: "medium", 
        org_type: "fintech",
        sub_sector: "Payment Processing",
        employee_count: 250,
        asset_size: 150000000,
        capital_tier: "Not Applicable",
        geographic_scope: "National",
        regulatory_guidelines: ["FINTRAC", "PIPEDA", "PCI DSS"],
        regulatory_classification: ["FINTRAC", "PIPEDA", "PCI DSS"]
      }
    ];

    for (const org of orgData) {
      const { data, error } = await supabase
        .from('organizations')
        .insert([org])
        .select()
        .single();
      
      if (error) {
        results.errors.push(`Organization error: ${error.message}`);
      } else {
        organizations.push(data);
        results.organizations++;
      }
    }

    // 2. Create User Profiles with different roles
    const profiles = [];
    const roles = ['admin', 'risk_manager', 'compliance_officer', 'auditor', 'analyst', 'user'];
    
    for (const org of organizations) {
      for (const role of roles) {
        // Create auth user first
        const authUser = {
          id: crypto.randomUUID(),
          email: `${role.toLowerCase()}@${org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          email_confirmed_at: new Date().toISOString(),
          raw_user_meta_data: {
            full_name: `${faker.person.firstName()} ${faker.person.lastName()}`
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Insert into auth.users (requires service role)
        const { error: authError } = await supabase.auth.admin.createUser({
          email: authUser.email,
          password: 'SamplePassword123!',
          email_confirm: true,
          user_metadata: authUser.raw_user_meta_data
        });

        if (authError) {
          results.errors.push(`Auth user error: ${authError.message}`);
          continue;
        }

        // Create profile
        const profile = {
          id: authUser.id,
          full_name: authUser.raw_user_meta_data.full_name,
          role: role,
          organization_id: org.id,
          phone: faker.phone.number(),
          department: faker.commerce.department(),
          job_title: faker.person.jobTitle()
        };

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([profile])
          .select()
          .single();

        if (profileError) {
          results.errors.push(`Profile error: ${profileError.message}`);
        } else {
          profiles.push(profileData);
          results.profiles++;
        }
      }
    }

    // 3. Create Incident Logs with extended parameters
    for (const org of organizations) {
      const orgProfiles = profiles.filter(p => p.organization_id === org.id);
      const incidentsPerOrg = Math.ceil(params.incidentCount / organizations.length);
      
      for (let i = 0; i < incidentsPerOrg; i++) {
        const severity = params.mixedSeverity 
          ? faker.helpers.arrayElement(['low', 'medium', 'high', 'critical'])
          : faker.helpers.weightedArrayElement([
              { weight: 0.4, value: 'medium' },
              { weight: 0.3, value: 'high' },
              { weight: 0.2, value: 'low' },
              { weight: 0.1, value: 'critical' }
            ]);
        
        const status = faker.helpers.arrayElement(['open', 'in_progress', 'resolved', 'closed']);
        const reportedDate = faker.date.past({ years: 1 });
        
        // Add SLA breach scenarios
        const hasSLABreach = params.includeFailedSLA && faker.datatype.boolean(0.3);
        const maxResponseHours = severity === 'critical' ? 1 : severity === 'high' ? 4 : 24;
        const maxResolutionHours = severity === 'critical' ? 4 : severity === 'high' ? 24 : 72;
        
        const incident = {
          org_id: org.id,
          title: faker.helpers.arrayElement([
            'System Outage - Core Banking Platform',
            'Data Security Incident - Unauthorized Access',
            'Payment Processing Failure',
            'Network Connectivity Issues',
            'Vendor Service Disruption',
            'Database Performance Degradation',
            'Third-Party Integration Failure',
            'Compliance Documentation Gap'
          ]),
          description: faker.lorem.paragraph(3),
          severity: severity,
          category: faker.helpers.arrayElement(['operational', 'security', 'compliance', 'technical', 'vendor']),
          status: status,
          reported_by: faker.helpers.arrayElement(orgProfiles)?.id,
          assigned_to: faker.helpers.arrayElement(orgProfiles)?.id,
          reported_at: reportedDate.toISOString(),
          first_response_at: status !== 'open' ? 
            (hasSLABreach ? 
              faker.date.between({ from: reportedDate, to: new Date(reportedDate.getTime() + (maxResponseHours * 2) * 60 * 60 * 1000) }) 
              : faker.date.between({ from: reportedDate, to: new Date(reportedDate.getTime() + maxResponseHours * 60 * 60 * 1000) })
            ).toISOString() : null,
          resolved_at: status === 'resolved' || status === 'closed' ? 
            (hasSLABreach ?
              faker.date.between({ from: reportedDate, to: new Date(reportedDate.getTime() + (maxResolutionHours * 2) * 60 * 60 * 1000) })
              : faker.date.recent()
            ).toISOString() : null,
          max_response_time_hours: maxResponseHours,
          max_resolution_time_hours: maxResolutionHours,
          impact_assessment: faker.lorem.sentence(),
          root_cause: status === 'resolved' || status === 'closed' ? faker.lorem.sentence() : null,
          lessons_learned: status === 'closed' ? faker.lorem.paragraph() : null,
          escalation_level: faker.number.int({ min: 0, max: 3 }),
          business_functions_affected: faker.helpers.arrayElements(['payments', 'trading', 'lending', 'customer_service'], { min: 1, max: 3 })
        };

        const { error } = await supabase
          .from('incident_logs')
          .insert([incident]);

        if (error) {
          results.errors.push(`Incident error: ${error.message}`);
        } else {
          results.incident_logs++;
        }
      }
    }

    // 4. Create Controls
    for (const org of organizations) {
      const orgProfiles = profiles.filter(p => p.organization_id === org.id);
      
      for (let i = 0; i < faker.number.int({ min: 8, max: 20 }); i++) {
        const control = {
          org_id: org.id,
          control_name: faker.helpers.arrayElement([
            'Multi-Factor Authentication',
            'Data Encryption at Rest',
            'Access Control Reviews',
            'Backup and Recovery Testing',
            'Vulnerability Scanning',
            'Change Management Process',
            'Incident Response Procedures',
            'Vendor Risk Assessment',
            'Employee Security Training',
            'Business Continuity Planning'
          ]),
          control_description: faker.lorem.paragraph(2),
          control_type: faker.helpers.arrayElement(['preventive', 'detective', 'corrective', 'compensating']),
          category: faker.helpers.arrayElement(['technical', 'administrative', 'physical']),
          risk_category: faker.helpers.arrayElement(['operational', 'cyber', 'credit', 'market', 'liquidity']),
          owner: faker.helpers.arrayElement(orgProfiles)?.id,
          implementation_status: faker.helpers.arrayElement(['planned', 'in_progress', 'implemented', 'needs_improvement']),
          effectiveness_rating: faker.number.int({ min: 1, max: 5 }),
          test_frequency_days: faker.helpers.arrayElement([30, 60, 90, 180, 365]),
          last_test_date: faker.date.past({ years: 1 }),
          next_test_due_date: faker.date.future({ years: 1 }),
          status: faker.helpers.arrayElement(['active', 'inactive', 'under_review']),
          compliance_frameworks: faker.helpers.arrayElements(['SOX', 'PCI-DSS', 'OSFI E-21', 'ISO 27001'], { min: 1, max: 3 })
        };

        const { error } = await supabase
          .from('controls')
          .insert([control]);

        if (error) {
          results.errors.push(`Control error: ${error.message}`);
        } else {
          results.controls++;
        }
      }
    }

    // 5. Create Vendor Contracts (Third Party Profiles first, then contracts) - Dynamic by org type
    for (const org of organizations) {
      const vendorTemplates = getVendorsByOrgType(org.org_type);
      const additionalVendorsCount = Math.max(0, Math.ceil(params.vendorCount / organizations.length) - vendorTemplates.length);
      
      // Create template-based vendors specific to org type
      for (const template of vendorTemplates) {
        const vendor = {
          org_id: org.id,
          vendor_name: template.name,
          vendor_type: template.type,
          service_category: template.category,
          risk_rating: faker.helpers.weightedArrayElement([
            { weight: 0.3, value: 'low' },
            { weight: 0.4, value: 'medium' },
            { weight: 0.25, value: 'high' },
            { weight: 0.05, value: 'critical' }
          ]),
          criticality: template.criticality,
          contact_name: faker.person.fullName(),
          contact_email: faker.internet.email(),
          contact_phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          country: 'Canada',
          website: faker.internet.url(),
          status: faker.helpers.arrayElement(['active', 'inactive', 'under_review']),
          onboarding_date: faker.date.past({ years: 2 }),
          last_assessment_date: faker.date.past({ years: 1 }),
          next_assessment_date: faker.date.future({ years: 1 }),
          services_provided: `Specialized ${template.category} services for ${org.org_type} organization`,
          compliance_certifications: faker.helpers.arrayElements(['SOC 2', 'ISO 27001', 'PCI DSS', 'GDPR'], { min: 1, max: 3 })
        };

        const { data: vendorData, error: vendorError } = await supabase
          .from('third_party_profiles')
          .insert([vendor])
          .select()
          .single();

        if (vendorError) {
          results.errors.push(`Vendor error: ${vendorError.message}`);
          continue;
        }

        // Create contract for this vendor
        const startDate = faker.date.past({ years: 1 });
        const endDate = faker.date.future({ years: 2 });
        
        const contract = {
          vendor_profile_id: vendorData.id,
          contract_name: `${vendor.vendor_name} Service Agreement`,
          contract_type: faker.helpers.arrayElement(['service_agreement', 'software_license', 'consulting', 'maintenance']),
          start_date: startDate,
          end_date: endDate,
          renewal_date: faker.date.between({ from: new Date(), to: endDate }),
          contract_value: faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }),
          currency: 'CAD',
          status: faker.helpers.arrayElement(['active', 'expired', 'terminated', 'under_negotiation']),
          auto_renewal: faker.datatype.boolean(),
          notice_period_days: faker.helpers.arrayElement([30, 60, 90]),
          payment_terms: faker.helpers.arrayElement(['net_30', 'net_60', 'quarterly', 'annually']),
          key_terms: faker.lorem.paragraph(),
          performance_metrics: faker.lorem.sentence(),
          termination_clauses: faker.lorem.sentence()
        };

        const { error: contractError } = await supabase
          .from('vendor_contracts')
          .insert([contract]);

        if (contractError) {
          results.errors.push(`Contract error: ${contractError.message}`);
        } else {
          results.vendor_contracts++;
        }
      }
      
      // Create additional random vendors to reach the target count
      for (let i = 0; i < additionalVendorsCount; i++) {
        const vendor = {
          org_id: org.id,
          vendor_name: faker.company.name(),
          vendor_type: faker.helpers.arrayElement(['technology', 'financial', 'operational', 'consulting']),
          service_category: faker.helpers.arrayElement(['cloud_services', 'payment_processing', 'data_analytics', 'cybersecurity', 'compliance']),
          risk_rating: faker.helpers.weightedArrayElement([
            { weight: 0.3, value: 'low' },
            { weight: 0.4, value: 'medium' },
            { weight: 0.25, value: 'high' },
            { weight: 0.05, value: 'critical' }
          ]),
          criticality: faker.helpers.weightedArrayElement([
            { weight: 0.3, value: 'low' },
            { weight: 0.4, value: 'medium' },
            { weight: 0.25, value: 'high' },
            { weight: 0.05, value: 'critical' }
          ]),
          contact_name: faker.person.fullName(),
          contact_email: faker.internet.email(),
          contact_phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          country: 'Canada',
          website: faker.internet.url(),
          status: faker.helpers.arrayElement(['active', 'inactive', 'under_review']),
          onboarding_date: faker.date.past({ years: 2 }),
          last_assessment_date: faker.date.past({ years: 1 }),
          next_assessment_date: faker.date.future({ years: 1 }),
          services_provided: faker.lorem.paragraph(),
          compliance_certifications: faker.helpers.arrayElements(['SOC 2', 'ISO 27001', 'PCI DSS', 'GDPR'], { min: 1, max: 3 })
        };

        const { data: vendorData, error: vendorError } = await supabase
          .from('third_party_profiles')
          .insert([vendor])
          .select()
          .single();

        if (vendorError) {
          results.errors.push(`Vendor error: ${vendorError.message}`);
          continue;
        }

        // Create contract for this vendor
        const startDate = faker.date.past({ years: 1 });
        const endDate = faker.date.future({ years: 2 });
        
        const contract = {
          vendor_profile_id: vendorData.id,
          contract_name: `${vendor.vendor_name} Service Agreement`,
          contract_type: faker.helpers.arrayElement(['service_agreement', 'software_license', 'consulting', 'maintenance']),
          start_date: startDate,
          end_date: endDate,
          renewal_date: faker.date.between({ from: new Date(), to: endDate }),
          contract_value: faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }),
          currency: 'CAD',
          status: faker.helpers.arrayElement(['active', 'expired', 'terminated', 'under_negotiation']),
          auto_renewal: faker.datatype.boolean(),
          notice_period_days: faker.helpers.arrayElement([30, 60, 90]),
          payment_terms: faker.helpers.arrayElement(['net_30', 'net_60', 'quarterly', 'annually']),
          key_terms: faker.lorem.paragraph(),
          performance_metrics: faker.lorem.sentence(),
          termination_clauses: faker.lorem.sentence()
        };

        const { error: contractError } = await supabase
          .from('vendor_contracts')
          .insert([contract]);

        if (contractError) {
          results.errors.push(`Contract error: ${contractError.message}`);
        } else {
          results.vendor_contracts++;
        }
      }
    }

    // 6. Create Continuity Plans
    for (const org of organizations) {
      const orgProfiles = profiles.filter(p => p.organization_id === org.id);
      
      for (let i = 0; i < faker.number.int({ min: 3, max: 8 }); i++) {
        const plan = {
          org_id: org.id,
          plan_name: faker.helpers.arrayElement([
            'Core Banking System Recovery Plan',
            'Data Center Disaster Recovery',
            'Cybersecurity Incident Response',
            'Pandemic Business Continuity',
            'Vendor Failure Contingency',
            'Payment Processing Backup Plan',
            'Communication Crisis Plan',
            'Regulatory Reporting Continuity'
          ]),
          plan_description: faker.lorem.paragraph(2),
          business_function: faker.helpers.arrayElement(['payments', 'trading', 'lending', 'customer_service', 'operations']),
          criticality: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
          rto_hours: faker.helpers.arrayElement([1, 2, 4, 8, 24, 72]),
          rpo_hours: faker.helpers.arrayElement([0.25, 0.5, 1, 2, 4, 8]),
          plan_owner: faker.helpers.arrayElement(orgProfiles)?.id,
          plan_status: faker.helpers.arrayElement(['draft', 'under_review', 'approved', 'active', 'needs_update']),
          last_tested_date: faker.date.past({ years: 1 }),
          next_test_date: faker.date.future({ years: 1 }),
          plan_version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
          approval_date: faker.date.past({ years: 1 }),
          review_frequency_months: faker.helpers.arrayElement([6, 12, 24]),
          recovery_strategies: faker.lorem.paragraph(),
          communication_plan: faker.lorem.paragraph(),
          resource_requirements: faker.lorem.sentence(),
          dependencies: faker.helpers.arrayElements(['third_party_vendor', 'internal_system', 'external_service'], { min: 1, max: 3 })
        };

        const { error } = await supabase
          .from('continuity_plans')
          .insert([plan]);

        if (error) {
          results.errors.push(`Continuity plan error: ${error.message}`);
        } else {
          results.continuity_plans++;
        }
      }
    }

    // 7. Create Governance Frameworks and Policies
    for (const org of organizations) {
      const orgProfiles = profiles.filter(p => p.organization_id === org.id);
      
      // Create a governance framework first
      const framework = {
        org_id: org.id,
        framework_name: `${org.name} Risk Management Framework`,
        framework_description: faker.lorem.paragraph(2),
        framework_type: 'risk_management',
        implementation_status: faker.helpers.arrayElement(['planning', 'in_progress', 'implemented', 'under_review']),
        version: `${faker.number.int({ min: 1, max: 3 })}.${faker.number.int({ min: 0, max: 9 })}`,
        effective_date: faker.date.past({ years: 1 }),
        review_date: faker.date.future({ years: 1 }),
        owner_id: faker.helpers.arrayElement(orgProfiles)?.id,
        approval_status: faker.helpers.arrayElement(['draft', 'under_review', 'approved', 'archived']),
        compliance_mapping: ['OSFI E-21', 'ISO 31000'],
        objectives: faker.lorem.paragraph()
      };

      const { data: frameworkData, error: frameworkError } = await supabase
        .from('governance_frameworks')
        .insert([framework])
        .select()
        .single();

      if (frameworkError) {
        results.errors.push(`Framework error: ${frameworkError.message}`);
        continue;
      }

      // Create policies for this framework - dynamic by org type
      const orgSpecificPolicies = getPoliciesByOrgType(org.org_type, org.regulatory_classification);
      const policiesPerOrg = Math.ceil(params.governanceCount / (organizations.length * 2)); // Half policies, half frameworks
      const selectedPolicies = faker.helpers.arrayElements(orgSpecificPolicies, Math.min(policiesPerOrg, orgSpecificPolicies.length));

      for (const policyType of selectedPolicies) {
        const policy = {
          framework_id: frameworkData.id,
          policy_name: policyType,
          policy_description: faker.lorem.paragraph(2),
          policy_type: faker.helpers.arrayElement(['operational', 'security', 'compliance', 'risk']),
          policy_category: faker.helpers.arrayElement(['governance', 'risk_management', 'compliance', 'operations']),
          status: faker.helpers.arrayElement(['draft', 'under_review', 'approved', 'archived']),
          version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
          effective_date: faker.date.past({ years: 1 }),
          review_date: faker.date.future({ years: 1 }),
          expiry_date: faker.date.future({ years: 3 }),
          owner_id: faker.helpers.arrayElement(orgProfiles)?.id,
          approved_by: faker.helpers.arrayElement(orgProfiles.filter(p => p.role === 'admin'))?.id,
          approved_at: faker.date.past({ years: 1 }),
          policy_content: faker.lorem.paragraphs(5, '\n\n'),
          scope: faker.lorem.sentence(),
          applicability: faker.lorem.sentence(),
          enforcement_level: faker.helpers.arrayElement(['mandatory', 'recommended', 'guidance']),
          compliance_requirements: faker.helpers.arrayElements(['OSFI E-21', 'PIPEDA', 'SOX', 'ISO 27001'], { min: 1, max: 3 }),
          related_procedures: faker.lorem.sentence(),
          review_frequency_months: faker.helpers.arrayElement([6, 12, 24])
        };

        const { error: policyError } = await supabase
          .from('governance_policies')
          .insert([policy]);

        if (policyError) {
          results.errors.push(`Policy error: ${policyError.message}`);
        } else {
          results.governance_policies++;
        }
      }
    }

    // 8. Create KRI Definitions and Logs for 6 months - Dynamic by org type
    for (const org of organizations) {
      const orgProfiles = profiles.filter(p => p.organization_id === org.id);
      
      // Get org-specific KRIs based on organization type
      const kriTypes = getKRIsByOrgType(org.org_type);

      for (const kriType of kriTypes) {
        // Create KRI Definition
        const kriDefinition = {
          org_id: org.id,
          kri_name: kriType.name,
          kri_description: `Monitoring ${kriType.name.toLowerCase()} for risk management`,
          measurement_unit: kriType.unit,
          calculation_method: faker.lorem.sentence(),
          data_source: faker.helpers.arrayElement(['automated_system', 'manual_entry', 'third_party_api']),
          collection_frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
          warning_threshold: kriType.threshold_warning,
          critical_threshold: kriType.threshold_critical,
          target_value: kriType.threshold_warning * 0.8,
          owner_id: faker.helpers.arrayElement(orgProfiles)?.id,
          status: 'active',
          risk_category: faker.helpers.arrayElement(['operational', 'credit', 'market', 'liquidity', 'cyber']),
          business_function: faker.helpers.arrayElement(['payments', 'trading', 'lending', 'operations'])
        };

        const { data: kriData, error: kriError } = await supabase
          .from('kri_definitions')
          .insert([kriDefinition])
          .select()
          .single();

        if (kriError) {
          results.errors.push(`KRI Definition error: ${kriError.message}`);
          continue;
        } else {
          results.kri_definitions++;
        }

        // Create 6 months of KRI logs
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - params.kriLogsMonths);
        
        for (let month = 0; month < params.kriLogsMonths; month++) {
          const measurementDate = new Date(startDate);
          measurementDate.setMonth(measurementDate.getMonth() + month);
          
          // Generate realistic values with some variation
          const baseValue = kriType.threshold_warning * (0.7 + Math.random() * 0.4);
          const actualValue = baseValue + (Math.random() - 0.5) * baseValue * 0.3;
          
          // Determine threshold breach
          let thresholdBreached = 'none';
          if (actualValue >= kriType.threshold_critical) {
            thresholdBreached = 'critical';
          } else if (actualValue >= kriType.threshold_warning) {
            thresholdBreached = 'warning';
          }

          const kriLog = {
            kri_id: kriData.id,
            measurement_date: measurementDate.toISOString().split('T')[0],
            actual_value: Math.round(actualValue * 100) / 100,
            target_value: kriDefinition.target_value,
            threshold_breached: thresholdBreached,
            notes: thresholdBreached !== 'none' ? 
              `${thresholdBreached.toUpperCase()} threshold breached - requires attention` : 
              'Normal operational levels maintained',
            measured_by: faker.helpers.arrayElement(orgProfiles)?.id
          };

          const { error: logError } = await supabase
            .from('kri_logs')
            .insert([kriLog]);

          if (logError) {
            results.errors.push(`KRI Log error: ${logError.message}`);
          } else {
            results.kri_logs++;
          }
        }
      }
    }

    // 9. Create Business Functions based on org type
    for (const org of organizations) {
      const businessFunctions = getBusinessFunctionsByOrgType(org.org_type);
      
      for (const functionName of businessFunctions) {
        const businessFunction = {
          org_id: org.id,
          name: functionName,
          description: `${functionName} operations for ${org.org_type} organization`,
          criticality: faker.helpers.weightedArrayElement([
            { weight: 0.2, value: 'low' },
            { weight: 0.4, value: 'medium' },
            { weight: 0.3, value: 'high' },
            { weight: 0.1, value: 'critical' }
          ]),
          category: faker.helpers.arrayElement(['core', 'support', 'regulatory', 'strategic']),
          owner: faker.helpers.arrayElement(profiles.filter(p => p.organization_id === org.id))?.full_name || 'TBD'
        };

        const { error } = await supabase
          .from('business_functions')
          .insert([businessFunction]);

        if (error) {
          results.errors.push(`Business Function error: ${error.message}`);
        }
      }
    }

    // Update onboarding status for all organizations to completed
    for (const org of organizations) {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          onboarding_status: 'completed',
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', org.id);

      if (error) {
        results.errors.push(`Organization status update error: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sample data generated successfully",
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Sample data generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});