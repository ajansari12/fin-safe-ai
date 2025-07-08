import { supabase } from "@/integrations/supabase/client";
import {
  INCIDENT_CATEGORIES,
  CONTROL_FRAMEWORKS,
  CANADIAN_CONTROL_EXAMPLES,
  VENDOR_CATEGORIES,
  CANADIAN_VENDOR_EXAMPLES,
  KRI_EXAMPLES,
  BUSINESS_FUNCTIONS,
  REGULATORY_FRAMEWORKS,
  ORGANIZATION_TYPES,
  getContextualDefaults
} from "@/lib/canadian-banking-defaults";

interface LookupOption {
  value: string;
  label: string;
  priority?: string;
  description?: string;
  framework?: string;
  [key: string]: any;
}

class LookupService {
  // Get current user's organization type for contextual defaults
  private async getOrgContext() {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) return null;

      const { data: org } = await supabase
        .from('organizations')
        .select('sector, size')
        .eq('id', profile.organization_id)
        .single();

      return org;
    } catch (error) {
      console.warn('Could not fetch org context:', error);
      return null;
    }
  }

  async getIncidentCategories(): Promise<LookupOption[]> {
    // Try to get org-specific categories, fallback to defaults
    try {
      const { data: orgCategories } = await supabase
        .from('incident_logs')
        .select('category')
        .not('category', 'is', null)
        .limit(50);

      const existingCategories = [...new Set(orgCategories?.map(i => i.category) || [])];
      
      // Merge with defaults, prioritizing contextual ones
      const allCategories = INCIDENT_CATEGORIES.map(cat => ({
        value: cat.value,
        label: cat.label,
        priority: cat.priority
      }));

      // Add any org-specific categories not in defaults
      existingCategories.forEach(cat => {
        if (!allCategories.find(ac => ac.value === cat)) {
          allCategories.push({
            value: cat,
            label: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            priority: 'medium'
          });
        }
      });

      return allCategories;
    } catch (error) {
      console.warn('Using default incident categories:', error);
      return INCIDENT_CATEGORIES;
    }
  }

  async getControlFrameworks(): Promise<LookupOption[]> {
    const orgContext = await this.getOrgContext();
    const contextualDefaults = getContextualDefaults(orgContext?.sector);
    
    // Prioritize frameworks based on org type
    return CONTROL_FRAMEWORKS.map(framework => ({
      ...framework,
      priority: contextualDefaults.primaryFrameworks.includes(framework.value) ? 'high' : 'medium'
    }));
  }

  async getControlExamples(): Promise<LookupOption[]> {
    return CANADIAN_CONTROL_EXAMPLES.map(example => ({
      value: example.title.toLowerCase().replace(/ /g, '_'),
      label: example.title,
      description: example.description,
      framework: example.framework,
      frequency: example.frequency,
      type: example.type
    }));
  }

  async getVendorCategories(): Promise<LookupOption[]> {
    const orgContext = await this.getOrgContext();
    const contextualDefaults = getContextualDefaults(orgContext?.sector);
    
    return VENDOR_CATEGORIES.map(category => ({
      ...category,
      priority: contextualDefaults.criticalVendorTypes.includes(category.value) ? 'high' : 'medium'
    }));
  }

  async getVendorExamples(): Promise<LookupOption[]> {
    // Try to get existing vendors first
    try {
      const { data: orgVendors } = await supabase
        .from('third_party_profiles')
        .select('vendor_name, services, criticality')
        .limit(20);

      const existingVendors = orgVendors?.map(vendor => ({
        value: vendor.vendor_name.toLowerCase().replace(/ /g, '_'),
        label: vendor.vendor_name,
        criticality: vendor.criticality,
        services: vendor.services
      })) || [];

      // Merge with examples if org has few vendors
      if (existingVendors.length < 5) {
        const examples = CANADIAN_VENDOR_EXAMPLES.map(example => ({
          value: example.vendor_name.toLowerCase().replace(/ /g, '_'),
          label: example.vendor_name,
          category: example.category,
          criticality: example.criticality,
          services: example.services
        }));
        
        return [...existingVendors, ...examples];
      }

      return existingVendors;
    } catch (error) {
      console.warn('Using default vendor examples:', error);
      return CANADIAN_VENDOR_EXAMPLES.map(example => ({
        value: example.vendor_name.toLowerCase().replace(/ /g, '_'),
        label: example.vendor_name,
        category: example.category,
        criticality: example.criticality,
        services: example.services
      }));
    }
  }

  async getKRIExamples(): Promise<LookupOption[]> {
    return KRI_EXAMPLES.map(kri => ({
      value: kri.name.toLowerCase().replace(/ /g, '_'),
      label: kri.name,
      description: kri.description,
      threshold_warning: kri.threshold_warning,
      threshold_critical: kri.threshold_critical,
      frequency: kri.frequency,
      risk_category: kri.risk_category
    }));
  }

  async getBusinessFunctions(): Promise<LookupOption[]> {
    // Try to get org-specific business functions first
    try {
      const { data: orgFunctions } = await supabase
        .from('business_functions')
        .select('id, name, criticality, description')
        .order('name');

      if (orgFunctions && orgFunctions.length > 0) {
        return orgFunctions.map(func => ({
          value: func.id,
          label: func.name,
          criticality: func.criticality,
          description: func.description
        }));
      }

      // Fallback to defaults
      return BUSINESS_FUNCTIONS.map((func, index) => ({
        value: `default_${index}`,
        label: func.name,
        criticality: func.criticality
      }));
    } catch (error) {
      console.warn('Using default business functions:', error);
      return BUSINESS_FUNCTIONS.map((func, index) => ({
        value: `default_${index}`,
        label: func.name,
        criticality: func.criticality
      }));
    }
  }

  async getRegulatoryFrameworks(): Promise<LookupOption[]> {
    const orgContext = await this.getOrgContext();
    const contextualDefaults = getContextualDefaults(orgContext?.sector);
    
    return REGULATORY_FRAMEWORKS.map(framework => ({
      ...framework,
      priority: contextualDefaults.primaryFrameworks.includes(framework.value) ? 'high' : 'medium'
    }));
  }

  async getOrganizationTypes(): Promise<LookupOption[]> {
    return ORGANIZATION_TYPES;
  }

  async getUsers(): Promise<LookupOption[]> {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name');

      return users?.map(user => ({
        value: user.id,
        label: user.full_name || 'Unknown User',
        role: user.role
      })) || [];
    } catch (error) {
      console.warn('Could not fetch users:', error);
      return [];
    }
  }

  // Generic lookup method
  async getLookupData(type: string): Promise<LookupOption[]> {
    switch (type) {
      case 'incident_categories':
        return this.getIncidentCategories();
      case 'control_frameworks':
        return this.getControlFrameworks();
      case 'control_examples':
        return this.getControlExamples();
      case 'vendor_categories':
        return this.getVendorCategories();
      case 'vendor_examples':
        return this.getVendorExamples();
      case 'kri_examples':
        return this.getKRIExamples();
      case 'business_functions':
        return this.getBusinessFunctions();
      case 'regulatory_frameworks':
        return this.getRegulatoryFrameworks();
      case 'organization_types':
        return this.getOrganizationTypes();
      case 'users':
        return this.getUsers();
      default:
        return [];
    }
  }
}

export const lookupService = new LookupService();