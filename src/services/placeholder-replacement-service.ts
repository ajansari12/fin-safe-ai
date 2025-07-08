// Batch update service for replacing placeholder text with realistic defaults
import { supabase } from "@/integrations/supabase/client";
import { lookupService } from "./lookup-service";

export class PlaceholderReplacementService {
  // Common placeholder texts to replace with contextual alternatives
  private static readonly PLACEHOLDER_REPLACEMENTS = {
    // Generic placeholders
    "Select option": "Choose from options below",
    "Choose an option": "Select appropriate option",
    "Enter text": "Type here",
    "No data available": "No risk data configured yet",
    "Example Company": "Northern Bank of Canada (example)",
    "Sample Data": "Canadian Banking Example",
    
    // Form placeholders
    "Enter your email": "your.email@yourbank.ca",
    "Enter password": "Use a strong password (8+ characters)",
    "Enter name": "e.g. John Smith",
    "Enter description": "Provide detailed description...",
    "Enter title": "Brief descriptive title",
    
    // Financial/Banking specific
    "Select vendor": "Choose third-party provider",
    "Select severity": "Business impact severity level",
    "Select category": "Risk/incident classification",
    "Select framework": "Regulatory compliance framework",
    "Select frequency": "How often is this performed?",
    "Enter amount": "Amount in CAD ($)",
    
    // Canadian regulatory specific
    "Select jurisdiction": "Canadian regulatory authority",
    "Select institution type": "Bank, Credit Union, Trust Company, etc.",
    "Enter regulatory code": "e.g. OSFI E-21, Basel III category",
    
    // Empty states
    "No results found": "No risk management data found",
    "Nothing to show": "Configure your risk data to see results",
    "Empty list": "Add items to get started",
    "No items": "Start by creating your first entry"
  };

  static getContextualPlaceholder(originalPlaceholder: string, context?: string): string {
    // First check for exact match
    if (this.PLACEHOLDER_REPLACEMENTS[originalPlaceholder]) {
      return this.PLACEHOLDER_REPLACEMENTS[originalPlaceholder];
    }

    // Apply context-specific replacements
    if (context) {
      switch (context) {
        case 'vendor':
          return originalPlaceholder.replace(/vendor/i, 'third-party provider')
                                  .replace(/company/i, 'financial services provider');
        case 'incident':
          return originalPlaceholder.replace(/issue/i, 'operational risk event')
                                  .replace(/problem/i, 'business disruption');
        case 'control':
          return originalPlaceholder.replace(/control/i, 'risk control measure')
                                  .replace(/test/i, 'compliance verification');
        case 'kri':
          return originalPlaceholder.replace(/indicator/i, 'risk performance metric')
                                  .replace(/metric/i, 'KRI measurement');
        default:
          return originalPlaceholder;
      }
    }

    return originalPlaceholder;
  }

  static getEmptyStateMessage(component: string): { title: string, description: string } {
    const messages = {
      incidents: {
        title: "No Incidents Logged",
        description: "Start by logging your first operational risk incident to track and manage business disruptions."
      },
      vendors: {
        title: "No Third-Party Providers",
        description: "Add your critical vendors and service providers to monitor third-party risks and dependencies."
      },
      controls: {
        title: "No Risk Controls Configured", 
        description: "Create your first risk control to implement OSFI E-21 compliance and operational risk management."
      },
      kris: {
        title: "No Key Risk Indicators",
        description: "Set up KRIs to monitor and measure your operational risk exposure in real-time."
      },
      frameworks: {
        title: "No Governance Frameworks",
        description: "Create governance frameworks to establish risk management policies and compliance structures."
      },
      analytics: {
        title: "No Risk Analytics Available",
        description: "Risk data and metrics will appear here once you configure incidents, controls, and KRIs."
      },
      reports: {
        title: "No Reports Generated",
        description: "Create your first risk management report for executive review and regulatory compliance."
      },
      default: {
        title: "No Data Available",
        description: "Configure your risk management data to see content here."
      }
    };

    return messages[component] || messages.default;
  }

  static getCanadianBankingExample(type: string): string {
    const examples = {
      bankName: "Northern Bank of Canada",
      creditUnion: "Prairie Credit Union",
      trustCompany: "Atlantic Trust Company",
      vendor: "Canadian Core Banking Solutions Inc.",
      system: "Core Banking Platform",
      incident: "ATM Network Connectivity Issue",
      control: "Multi-Factor Authentication (MFA)",
      kri: "System Downtime Duration",
      framework: "OSFI E-21 Operational Risk Management",
      address: "123 Bay Street, Suite 400, Toronto, ON M5J 2T3",
      phone: "+1 (416) 555-0123",
      email: "contact@northernbank.ca"
    };

    return examples[type] || "Canadian Banking Example";
  }
}

// Helper function to enhance Select components with better placeholders
export const enhanceSelectPlaceholder = (
  originalPlaceholder: string, 
  options: any[], 
  context?: string
): string => {
  if (!options || options.length === 0) {
    return `No ${context || 'options'} available`;
  }

  if (options.length === 1) {
    return `${options[0].label || options[0]}`;
  }

  const contextualPlaceholder = PlaceholderReplacementService.getContextualPlaceholder(
    originalPlaceholder, 
    context
  );

  return `${contextualPlaceholder} (${options.length} available)`;
};

// Export for use in components
export { PlaceholderReplacementService as DefaultsService };