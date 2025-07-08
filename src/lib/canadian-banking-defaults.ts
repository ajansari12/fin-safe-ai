// Canadian Banking Industry Defaults and Constants
// Based on OSFI E-21, Basel III, and Canadian regulatory frameworks

export const INCIDENT_CATEGORIES = [
  { value: "cyber_security", label: "Cyber Security Incident", priority: "high" },
  { value: "operational_disruption", label: "Operational Disruption", priority: "high" },
  { value: "system_failure", label: "Core Banking System Failure", priority: "critical" },
  { value: "data_breach", label: "Personal Data Breach", priority: "critical" },
  { value: "fraud", label: "Fraud Detection", priority: "high" },
  { value: "third_party", label: "Third-Party Provider Issue", priority: "medium" },
  { value: "compliance_breach", label: "Regulatory Compliance Breach", priority: "high" },
  { value: "business_continuity", label: "Business Continuity Event", priority: "medium" },
  { value: "vendor_failure", label: "Critical Vendor Failure", priority: "high" },
  { value: "network_outage", label: "Network Infrastructure Outage", priority: "medium" }
];

export const CONTROL_TYPES = [
  { value: "preventive", label: "Preventive Control" },
  { value: "detective", label: "Detective Control" },
  { value: "corrective", label: "Corrective Control" },
  { value: "compensating", label: "Compensating Control" }
];

export const CONTROL_FRAMEWORKS = [
  { value: "osfi_e21", label: "OSFI E-21 (Operational Risk Management)" },
  { value: "coso", label: "COSO Internal Control Framework" },
  { value: "iso_27001", label: "ISO 27001 (Information Security)" },
  { value: "nist", label: "NIST Cybersecurity Framework" },
  { value: "basel_iii", label: "Basel III Risk Management" },
  { value: "pipeda", label: "PIPEDA Privacy Controls" },
  { value: "aml_fintrac", label: "AML/FINTRAC Compliance" },
  { value: "sox", label: "SOX Financial Reporting Controls" }
];

export const CANADIAN_CONTROL_EXAMPLES = [
  { 
    title: "Multi-Factor Authentication (MFA)", 
    description: "Mandatory MFA for all banking system access in compliance with OSFI Cyber Security Self-Assessment",
    framework: "osfi_e21",
    frequency: "continuous",
    type: "preventive"
  },
  {
    title: "Daily Transaction Monitoring",
    description: "Automated monitoring of suspicious transactions per FINTRAC requirements",
    framework: "aml_fintrac", 
    frequency: "daily",
    type: "detective"
  },
  {
    title: "Quarterly Penetration Testing",
    description: "External penetration testing of core banking infrastructure per OSFI guidelines",
    framework: "osfi_e21",
    frequency: "quarterly", 
    type: "detective"
  },
  {
    title: "Data Backup and Recovery Testing",
    description: "Monthly testing of critical data backup and recovery procedures",
    framework: "basel_iii",
    frequency: "monthly",
    type: "corrective"
  },
  {
    title: "Vendor Risk Assessment Reviews",
    description: "Annual comprehensive risk assessments for all critical third-party vendors",
    framework: "osfi_e21",
    frequency: "annually",
    type: "preventive"
  }
];

export const VENDOR_CATEGORIES = [
  { value: "core_banking", label: "Core Banking System Provider" },
  { value: "payment_processor", label: "Payment Processing Service" },
  { value: "cloud_infrastructure", label: "Cloud Infrastructure Provider" },
  { value: "cybersecurity", label: "Cybersecurity Solutions" },
  { value: "data_analytics", label: "Data Analytics Platform" },
  { value: "compliance_software", label: "Compliance Management Software" },
  { value: "atm_network", label: "ATM Network Services" },
  { value: "card_services", label: "Credit/Debit Card Services" },
  { value: "risk_management", label: "Risk Management Platform" },
  { value: "audit_consulting", label: "Audit & Consulting Services" }
];

export const CANADIAN_VENDOR_EXAMPLES = [
  {
    vendor_name: "Core Banking Solutions Inc.",
    category: "core_banking",
    criticality: "critical",
    services: ["Account Management", "Transaction Processing", "Customer Database"]
  },
  {
    vendor_name: "SecureCloud Canada",
    category: "cloud_infrastructure", 
    criticality: "high",
    services: ["Cloud Hosting", "Data Storage", "Disaster Recovery"]
  },
  {
    vendor_name: "CyberGuard Financial",
    category: "cybersecurity",
    criticality: "high", 
    services: ["Threat Detection", "Security Monitoring", "Incident Response"]
  },
  {
    vendor_name: "PaymentTech Solutions",
    category: "payment_processor",
    criticality: "critical",
    services: ["Interac Processing", "Visa/Mastercard Gateway", "Real-time Payments"]
  },
  {
    vendor_name: "RiskAnalytics Pro",
    category: "risk_management",
    criticality: "medium",
    services: ["Risk Scoring", "Portfolio Analysis", "Regulatory Reporting"]
  }
];

export const RISK_CATEGORIES = [
  { value: "operational", label: "Operational Risk", osfi_category: "OR-1" },
  { value: "credit", label: "Credit Risk", osfi_category: "CR-1" },
  { value: "market", label: "Market Risk", osfi_category: "MR-1" },
  { value: "liquidity", label: "Liquidity Risk", osfi_category: "LR-1" },
  { value: "strategic", label: "Strategic Risk", osfi_category: "SR-1" },
  { value: "reputation", label: "Reputation Risk", osfi_category: "RR-1" },
  { value: "compliance", label: "Compliance Risk", osfi_category: "CR-2" },
  { value: "cybersecurity", label: "Cybersecurity Risk", osfi_category: "OR-2" }
];

export const KRI_EXAMPLES = [
  {
    name: "System Downtime Duration",
    description: "Total minutes of core banking system downtime per month",
    threshold_warning: 60,
    threshold_critical: 120,
    frequency: "monthly",
    risk_category: "operational"
  },
  {
    name: "Failed Login Attempts",
    description: "Number of failed authentication attempts indicating potential breach",
    threshold_warning: 1000,
    threshold_critical: 5000,
    frequency: "daily", 
    risk_category: "cybersecurity"
  },
  {
    name: "Transaction Processing Errors", 
    description: "Percentage of failed transaction processing requests",
    threshold_warning: 0.5,
    threshold_critical: 1.0,
    frequency: "daily",
    risk_category: "operational"
  },
  {
    name: "Regulatory Submission Delays",
    description: "Number of days late for mandatory regulatory submissions",
    threshold_warning: 1,
    threshold_critical: 3,
    frequency: "monthly",
    risk_category: "compliance"
  }
];

export const BUSINESS_FUNCTIONS = [
  { name: "Retail Banking Operations", criticality: "critical" },
  { name: "Commercial Lending", criticality: "high" },
  { name: "Investment Services", criticality: "high" },
  { name: "Payment Processing", criticality: "critical" },
  { name: "Customer Support", criticality: "medium" },
  { name: "Risk Management", criticality: "high" },
  { name: "Compliance & Audit", criticality: "high" },
  { name: "IT Infrastructure", criticality: "critical" },
  { name: "Human Resources", criticality: "low" },
  { name: "Marketing & Communications", criticality: "low" }
];

export const REGULATORY_FRAMEWORKS = [
  { value: "osfi_e21", label: "OSFI E-21 - Operational Risk Management" },
  { value: "basel_iii", label: "Basel III - Capital Requirements" },
  { value: "pipeda", label: "PIPEDA - Privacy Protection" },
  { value: "fintrac", label: "FINTRAC - Anti-Money Laundering" },
  { value: "pcaob", label: "PCAOB - Public Company Accounting" },
  { value: "ifrs", label: "IFRS - Financial Reporting Standards" },
  { value: "csa", label: "CSA - Securities Regulation" },
  { value: "osfi_b20", label: "OSFI B-20 - Residential Mortgage Underwriting" }
];

export const ORGANIZATION_TYPES = [
  { value: "schedule_i_bank", label: "Schedule I Bank (Domestic)" },
  { value: "schedule_ii_bank", label: "Schedule II Bank (Foreign Subsidiary)" }, 
  { value: "schedule_iii_bank", label: "Schedule III Bank (Foreign Branch)" },
  { value: "credit_union", label: "Credit Union/Caisse Populaire" },
  { value: "trust_company", label: "Trust Company" },
  { value: "insurance_company", label: "Insurance Company" },
  { value: "investment_dealer", label: "Investment Dealer" },
  { value: "fintech", label: "FinTech Company" },
  { value: "payment_service", label: "Payment Service Provider" }
];

// Helper function to get contextual defaults based on organization type
export const getContextualDefaults = (orgType?: string) => {
  const isBank = orgType?.includes('bank');
  const isCreditUnion = orgType === 'credit_union';
  const isFintech = orgType === 'fintech';

  return {
    primaryFrameworks: isBank 
      ? ['osfi_e21', 'basel_iii', 'fintrac']
      : isCreditUnion 
      ? ['osfi_e21', 'pipeda', 'fintrac']
      : ['nist', 'iso_27001'],
    
    criticalVendorTypes: isBank
      ? ['core_banking', 'payment_processor', 'cybersecurity']
      : isFintech
      ? ['cloud_infrastructure', 'payment_processor', 'cybersecurity'] 
      : ['core_banking', 'cybersecurity', 'compliance_software'],
      
    priorityIncidentCategories: isBank
      ? ['system_failure', 'cyber_security', 'data_breach']
      : ['operational_disruption', 'cyber_security', 'third_party']
  };
};