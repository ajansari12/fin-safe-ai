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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results = {
      organizations: 0,
      profiles: 0,
      incident_logs: 0,
      controls: 0,
      vendor_contracts: 0,
      continuity_plans: 0,
      governance_policies: 0,
      errors: []
    };

    // 1. Create Organizations
    const organizations = [];
    const orgData = [
      {
        name: "First National Bank of Canada",
        sector: "banking",
        size: "large",
        regulatory_guidelines: ["OSFI E-21", "PIPEDA", "BCBS 239"]
      },
      {
        name: "Maple Leaf Insurance Corp",
        sector: "insurance",
        size: "medium",
        regulatory_guidelines: ["OSFI E-21", "PIPEDA", "IFRS 17"]
      },
      {
        name: "Arctic Investment Management",
        sector: "investment_management",
        size: "small",
        regulatory_guidelines: ["CSA", "IIROC", "OSFI E-21"]
      },
      {
        name: "Northern FinTech Solutions",
        sector: "fintech",
        size: "medium",
        regulatory_guidelines: ["FINTRAC", "PIPEDA", "PCI DSS"]
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

    // 3. Create Incident Logs
    for (const org of organizations) {
      const orgProfiles = profiles.filter(p => p.organization_id === org.id);
      
      for (let i = 0; i < faker.number.int({ min: 5, max: 15 }); i++) {
        const severity = faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']);
        const status = faker.helpers.arrayElement(['open', 'in_progress', 'resolved', 'closed']);
        const reportedDate = faker.date.past({ years: 1 });
        
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
          first_response_at: status !== 'open' ? faker.date.between({ from: reportedDate, to: new Date() }).toISOString() : null,
          resolved_at: status === 'resolved' || status === 'closed' ? faker.date.recent().toISOString() : null,
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

    // 5. Create Vendor Contracts (Third Party Profiles first, then contracts)
    for (const org of organizations) {
      for (let i = 0; i < faker.number.int({ min: 3, max: 8 }); i++) {
        // Create vendor profile first
        const vendor = {
          org_id: org.id,
          vendor_name: faker.company.name(),
          vendor_type: faker.helpers.arrayElement(['technology', 'financial', 'operational', 'consulting']),
          service_category: faker.helpers.arrayElement(['cloud_services', 'payment_processing', 'data_analytics', 'cybersecurity', 'compliance']),
          risk_rating: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
          criticality: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
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

      // Create policies for this framework
      const policyTypes = [
        'Risk Management Policy',
        'Information Security Policy',
        'Business Continuity Policy',
        'Vendor Management Policy',
        'Incident Management Policy',
        'Data Governance Policy',
        'Compliance Monitoring Policy'
      ];

      for (const policyType of policyTypes) {
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