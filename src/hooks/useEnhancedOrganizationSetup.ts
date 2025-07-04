import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { organizationalIntelligenceService } from "@/services/organizational-intelligence-service";
import { templateLibraryService } from "@/services/template-library-service";
import { 
  createOrganization, 
  updateUserProfile, 
  createUserRole, 
  uploadPolicyFile 
} from "@/services/organization-service";

interface EnhancedOrganizationData {
  // Basic organization data
  name: string;
  sector: string;
  size: string;
  userRole: 'admin' | 'analyst' | 'reviewer';
  regulatoryFrameworks: string[];
  policyFiles: File[];
  
  // Enhanced profiling data
  employeeCount?: number;
  assetSize?: number;
  geographicScope?: string;
  subSector?: string;
  orgType?: string;
  businessLines?: string[];
  riskMaturity?: 'basic' | 'developing' | 'advanced' | 'sophisticated';
  complianceMaturity?: 'basic' | 'developing' | 'advanced' | 'sophisticated';
  technologyMaturity?: 'basic' | 'developing' | 'advanced' | 'sophisticated';
  digitalTransformation?: 'basic' | 'developing' | 'advanced' | 'sophisticated';
  riskCulture?: string;
  regulatoryHistory?: string;
  primaryRegulators?: string[];
  applicableFrameworks?: string[];
  growthStrategy?: string;
  marketPosition?: string;
  
  // Canadian Banking specific fields
  bankingLicenseType?: string;
  capitalTier?: string;
  osfiRating?: string;
  depositInsurance?: boolean;
  
  // Framework generation preferences
  frameworkGenerationMode?: 'automatic' | 'guided' | 'manual';
  customizationPreferences?: Record<string, any>;
}

interface FrameworkGenerationProgress {
  status: 'not_started' | 'analyzing' | 'generating' | 'customizing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  generatedFrameworks: any[];
  selectedFramework?: any;
  customizations?: Record<string, any>;
  errorMessage?: string;
}

export function useEnhancedOrganizationSetup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionEstimate, setCompletionEstimate] = useState(15); // minutes
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [isEnrichingOrganization, setIsEnrichingOrganization] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { completeStep } = useOnboarding();
  
  // Framework generation state
  const [frameworkProgress, setFrameworkProgress] = useState<FrameworkGenerationProgress>({
    status: 'not_started',
    progress: 0,
    currentStep: 'Initializing',
    generatedFrameworks: []
  });
  
  const [orgData, setOrgData] = useState<EnhancedOrganizationData>({
    name: "",
    sector: "",
    size: "",
    userRole: "admin",
    regulatoryFrameworks: ["E-21"],
    policyFiles: [],
    frameworkGenerationMode: 'automatic'
  });

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(saveInterval);
  }, [orgData]);

  // Load saved progress on component mount
  useEffect(() => {
    loadSavedProgress();
  }, []);

  const autoSave = async () => {
    if (step > 1 && orgData.name) {
      setSaveInProgress(true);
      try {
        await saveTempProgress();
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaveInProgress(false);
      }
    }
  };

  const saveTempProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('temp_organization_setup')
      .upsert({
        user_id: user.id,
        setup_data: orgData,
        current_step: step,
        completion_estimate: completionEstimate,
        framework_progress: frameworkProgress
      });
  };

  const loadSavedProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('temp_organization_setup')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setOrgData(data.setup_data);
      setStep(data.current_step);
      setCompletionEstimate(data.completion_estimate || 15);
      setFrameworkProgress(data.framework_progress || frameworkProgress);
    }
  };

  const clearSavedProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('temp_organization_setup')
      .delete()
      .eq('user_id', user.id);
  };

  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        if (!orgData.name) {
          toast({
            title: "Organization name required",
            description: "Please enter your organization name to continue.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        if (!orgData.sector || !orgData.size) {
          toast({
            title: "Required fields missing",
            description: "Please select both sector and organization size.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3:
        // Enhanced profiling - validate key fields
        if (!orgData.riskMaturity || !orgData.complianceMaturity) {
          toast({
            title: "Assessment incomplete",
            description: "Please complete the risk and compliance maturity assessment.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const updateCompletionEstimate = (stepData: Partial<EnhancedOrganizationData>) => {
    // Calculate completion estimate based on data complexity
    let estimate = 10; // Base estimate
    
    if (stepData.frameworkGenerationMode === 'guided') estimate += 5;
    if (stepData.frameworkGenerationMode === 'manual') estimate += 10;
    if (stepData.policyFiles && stepData.policyFiles.length > 0) estimate += 3;
    if (stepData.applicableFrameworks && stepData.applicableFrameworks.length > 3) estimate += 2;
    
    setCompletionEstimate(estimate);
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    
    try {
      await saveTempProgress();
      
      // Complete onboarding step if in onboarding context
      if (step === 1) {
        await completeStep('organization-basic', 'Organization Basic Information', {
          name: orgData.name,
          sector: orgData.sector,
          size: orgData.size
        });
      } else if (step === 3) {
        await completeStep('organization-profile', 'Organization Profile Assessment', {
          profileData: orgData
        });
      }
      
      setStep(step + 1);
      updateCompletionEstimate(orgData);
    } catch (error) {
      console.error('Error progressing to next step:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const generateFramework = async () => {
    setFrameworkProgress({
      status: 'analyzing',
      progress: 10,
      currentStep: 'Analyzing organizational profile',
      generatedFrameworks: []
    });

    try {
      // Step 1: Create organizational profile
      setFrameworkProgress(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Creating organizational profile'
      }));

      const profileData = {
        sub_sector: orgData.subSector,
        employee_count: orgData.employeeCount,
        asset_size: orgData.assetSize,
        geographic_scope: orgData.geographicScope,
        risk_maturity: orgData.riskMaturity as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        compliance_maturity: orgData.complianceMaturity as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        technology_maturity: orgData.technologyMaturity as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        digital_transformation: orgData.digitalTransformation as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        risk_culture: orgData.riskCulture,
        regulatory_history: orgData.regulatoryHistory,
        business_lines: orgData.businessLines,
        primary_regulators: orgData.primaryRegulators,
        applicable_frameworks: orgData.applicableFrameworks,
        growth_strategy: orgData.growthStrategy,
        market_position: orgData.marketPosition
      };

      const profile = await organizationalIntelligenceService.createOrUpdateProfile(profileData);

      // Step 2: Generate framework templates
      setFrameworkProgress(prev => ({
        ...prev,
        status: 'generating',
        progress: 50,
        currentStep: 'Generating framework templates'
      }));

      const frameworks = await templateLibraryService.generateIndustrySpecificTemplates(
        orgData.sector,
        profile
      );

      // Step 3: Customize frameworks
      setFrameworkProgress(prev => ({
        ...prev,
        status: 'customizing',
        progress: 75,
        currentStep: 'Customizing frameworks for your organization'
      }));

      const customizedFrameworks = [];
      for (const framework of frameworks) {
        const customized = await templateLibraryService.getCustomizedTemplate({
          orgId: profile?.organization_id || '',
          templateId: framework.id,
          organizationalProfile: profile,
          customizationPreferences: orgData.customizationPreferences
        });
        customizedFrameworks.push(customized);
      }

      // Step 4: Complete
      setFrameworkProgress({
        status: 'completed',
        progress: 100,
        currentStep: 'Framework generation completed',
        generatedFrameworks: customizedFrameworks
      });

      toast({
        title: "Framework Generation Complete",
        description: `Generated ${customizedFrameworks.length} customized frameworks for your organization.`,
      });

    } catch (error) {
      console.error('Framework generation failed:', error);
      setFrameworkProgress({
        status: 'error',
        progress: 0,
        currentStep: 'Framework generation failed',
        generatedFrameworks: [],
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      });

      toast({
        title: "Framework Generation Failed",
        description: "There was an error generating your frameworks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectFramework = (framework: any) => {
    setFrameworkProgress(prev => ({
      ...prev,
      selectedFramework: framework
    }));
  };

  const customizeFramework = (customizations: Record<string, any>) => {
    setFrameworkProgress(prev => ({
      ...prev,
      customizations
    }));
  };

  const handleEnrichOrganization = async (domain?: string) => {
    if (!orgData.name.trim()) {
      toast({
        title: "Organization name required",
        description: "Please enter your organization name to enable auto-populate.",
        variant: "destructive",
      });
      return;
    }

    setIsEnrichingOrganization(true);
    console.log(`Starting organization enrichment for: "${orgData.name}"`);

    try {
      const { data, error } = await supabase.functions.invoke('enrich-organization-data', {
        body: {
          org_id: null,
          company_name: orgData.name.trim(),
          domain: domain?.trim() || undefined,
          mode: 'setup'
        }
      });

      if (error) {
        console.error('Supabase function invocation error:', error);
        
        // Parse error details for better user feedback
        let errorMessage = 'Unable to auto-populate organization details.';
        let errorVariant: "destructive" | "default" = "destructive";
        
        if (error.message?.includes('configuration missing') || error.message?.includes('API key')) {
          errorMessage = 'Auto-populate service is currently unavailable. Please fill in details manually.';
          errorVariant = "default";
        } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        }
        
        toast({
          title: "Auto-Populate Failed",
          description: errorMessage,
          variant: errorVariant,
        });
        return;
      }

      if (data?.success && data?.enriched_data) {
        const enrichedData = data.enriched_data;
        console.log('Received enriched data:', enrichedData);
        
        // Track which fields were updated
        let fieldsUpdated = 0;
        const updatedFields: string[] = [];
        
        // Create mapping for enriched data to our org data structure
        const mappedSector = mapOrgTypeToSector(enrichedData.org_type, enrichedData.sector);
        const mappedSize = mapEmployeeCountToSize(enrichedData.employee_count);
        
        // Update organization data with enriched fields
        setOrgData(prev => {
          const updates: Partial<EnhancedOrganizationData> = {};
          
          if (mappedSector && mappedSector !== prev.sector) {
            updates.sector = mappedSector;
            updatedFields.push('sector');
            fieldsUpdated++;
          }
          
          if (enrichedData.org_type && enrichedData.org_type !== prev.orgType) {
            updates.orgType = enrichedData.org_type;
            updatedFields.push('organization type');
            fieldsUpdated++;
          }
          
          if (enrichedData.sub_sector && enrichedData.sub_sector !== prev.subSector) {
            updates.subSector = enrichedData.sub_sector;
            updatedFields.push('sub-sector');
            fieldsUpdated++;
          }
          
          if (enrichedData.geographic_scope && enrichedData.geographic_scope !== prev.geographicScope) {
            updates.geographicScope = enrichedData.geographic_scope;
            updatedFields.push('geographic scope');
            fieldsUpdated++;
          }
          
          if (enrichedData.employee_count && enrichedData.employee_count !== prev.employeeCount) {
            updates.employeeCount = enrichedData.employee_count;
            updatedFields.push('employee count');
            fieldsUpdated++;
          }
          
          if (enrichedData.asset_size && enrichedData.asset_size !== prev.assetSize) {
            updates.assetSize = enrichedData.asset_size;
            updatedFields.push('asset size');
            fieldsUpdated++;
          }
          
          if (enrichedData.capital_tier && enrichedData.capital_tier !== prev.capitalTier) {
            updates.capitalTier = enrichedData.capital_tier;
            updatedFields.push('capital tier');
            fieldsUpdated++;
          }
          
          if (enrichedData.regulatory_classification && 
              JSON.stringify(enrichedData.regulatory_classification) !== JSON.stringify(prev.primaryRegulators)) {
            updates.primaryRegulators = enrichedData.regulatory_classification;
            updatedFields.push('regulatory frameworks');
            fieldsUpdated++;
          }
          
          if (mappedSize && mappedSize !== prev.size) {
            updates.size = mappedSize;
            updatedFields.push('organization size');
            fieldsUpdated++;
          }
          
          return { ...prev, ...updates };
        });

        if (fieldsUpdated > 0) {
          console.log(`Successfully enriched ${fieldsUpdated} fields:`, updatedFields);
          toast({
            title: "Organization Data Auto-Populated",
            description: `Successfully populated ${fieldsUpdated} field${fieldsUpdated > 1 ? 's' : ''}: ${updatedFields.join(', ')}.`,
          });
        } else {
          toast({
            title: "No New Information Found",
            description: "No additional information could be found to populate the form.",
            variant: "default",
          });
        }
      } else if (data?.fallback) {
        console.log('Fallback mode triggered:', data.message);
        
        let fallbackMessage = "Unable to find detailed information for this organization.";
        if (data.error === 'API configuration missing') {
          fallbackMessage = "Auto-populate service is currently unavailable.";
        } else if (data.error === 'External API error') {
          fallbackMessage = "External service is temporarily unavailable.";
        }
        
        toast({
          title: "Auto-Populate Unavailable",
          description: `${fallbackMessage} Please fill in details manually.`,
          variant: "default",
        });
      } else {
        console.error('Unexpected response format:', data);
        toast({
          title: "Auto-Populate Failed",
          description: "Received unexpected response from enrichment service.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Organization enrichment failed with exception:', error);
      
      let errorMessage = "An unexpected error occurred during auto-populate.";
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error occurred. Please check your connection and try again.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timed out. Please try again later.";
        }
      }
      
      toast({
        title: "Auto-Populate Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsEnrichingOrganization(false);
      console.log('Organization enrichment process completed');
    }
  };

  // Helper function to map org_type to our sector values
  const mapOrgTypeToSector = (orgType?: string, sector?: string): string | undefined => {
    if (!orgType) return sector;
    
    const orgTypeMapping: Record<string, string> = {
      'banking-schedule-i': 'banking-schedule-i',
      'banking-schedule-ii': 'banking-schedule-ii', 
      'banking-schedule-iii': 'banking-schedule-iii',
      'credit-union': 'credit-union',
      'trust-company': 'banking',
      'insurance': 'insurance',
      'fintech': 'fintech',
      'other': 'other'
    };
    
    return orgTypeMapping[orgType] || sector || 'other';
  };

  // Helper function to map employee count to size
  const mapEmployeeCountToSize = (employeeCount?: number): string | undefined => {
    if (!employeeCount) return undefined;
    
    if (employeeCount < 100) return 'small';
    if (employeeCount <= 1000) return 'medium';
    return 'large';
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Create organization
      const organization = await createOrganization({
        name: orgData.name,
        sector: orgData.sector,
        size: orgData.size,
        regulatory_guidelines: orgData.regulatoryFrameworks,
      });

      // Update user profile with organization ID
      await updateUserProfile(organization.id);

      // Create user role
      await createUserRole(organization.id, orgData.userRole);

      // Create organizational profile with enhanced data
      const profileData = {
        organization_id: organization.id,
        sub_sector: orgData.subSector,
        employee_count: orgData.employeeCount,
        asset_size: orgData.assetSize,
        geographic_scope: orgData.geographicScope,
        risk_maturity: orgData.riskMaturity as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        compliance_maturity: orgData.complianceMaturity as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        technology_maturity: orgData.technologyMaturity as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        digital_transformation: orgData.digitalTransformation as 'basic' | 'developing' | 'advanced' | 'sophisticated' | undefined,
        risk_culture: orgData.riskCulture,
        regulatory_history: orgData.regulatoryHistory,
        business_lines: orgData.businessLines,
        primary_regulators: orgData.primaryRegulators,
        applicable_frameworks: orgData.applicableFrameworks,
        growth_strategy: orgData.growthStrategy,
        market_position: orgData.marketPosition
      };

      const profile = await organizationalIntelligenceService.createOrUpdateProfile(profileData);

      // Store Canadian banking specific data in organizational_profiles table
      if (orgData.sector?.startsWith('banking-schedule') || orgData.bankingLicenseType) {
        await supabase
          .from('organizational_profiles')
          .update({
            banking_schedule: orgData.sector?.startsWith('banking-schedule') ? orgData.sector.replace('banking-schedule-', 'schedule-') : null,
            banking_license_type: orgData.bankingLicenseType,
            capital_tier: orgData.capitalTier,
            osfi_rating: orgData.osfiRating,
            deposit_insurance_coverage: orgData.depositInsurance || false
          })
          .eq('organization_id', organization.id);
      }

      // Upload policy files if any
      if (orgData.policyFiles.length > 0) {
        await Promise.all(
          orgData.policyFiles.map(file => uploadPolicyFile(file, organization.id))
        );
      }

      // Save selected framework if any
      if (frameworkProgress.selectedFramework) {
        await supabase
          .from('generated_frameworks')
          .insert({
            organization_id: organization.id,
            profile_id: '', // Would be populated with actual profile ID
            template_id: frameworkProgress.selectedFramework.id,
            framework_data: frameworkProgress.selectedFramework.template_data,
            customizations: frameworkProgress.customizations || {},
            implementation_status: 'pending_deployment'
          });
      }

      // Complete onboarding step
      await completeStep('organization-setup-complete', 'Organization Setup Complete', {
        organizationId: organization.id,
        frameworkGenerated: !!frameworkProgress.selectedFramework
      });

      // Clear saved progress
      await clearSavedProgress();

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            organizationId: organization.id
          }
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the setup if email fails
      }

      toast({
        title: "Setup Complete", 
        description: "Your organization has been set up successfully with intelligent frameworks.",
      });

      navigate("/app/dashboard");
    } catch (error) {
      console.error("Organization setup error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Setup Failed",
        description: `Error: ${errorMessage}. Please check your information and try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof EnhancedOrganizationData, value: any) => {
    setOrgData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    updateCompletionEstimate({ ...orgData, [field]: value });
  };

  const resumeFromSaved = () => {
    loadSavedProgress();
  };

  const startFresh = async () => {
    await clearSavedProgress();
    setStep(1);
    setOrgData({
      name: "",
      sector: "",
      size: "",
      userRole: "admin",
      regulatoryFrameworks: ["E-21"],
      policyFiles: [],
      frameworkGenerationMode: 'automatic'
    });
    setFrameworkProgress({
      status: 'not_started',
      progress: 0,
      currentStep: 'Initializing',
      generatedFrameworks: []
    });
  };

  return {
    step,
    orgData,
    isSubmitting,
    completionEstimate,
    saveInProgress,
    isEnrichingOrganization,
    frameworkProgress,
    handleNext,
    handleBack,
    handleComplete,
    handleChange,
    handleEnrichOrganization,
    generateFramework,
    selectFramework,
    customizeFramework,
    resumeFromSaved,
    startFresh,
    validateCurrentStep
  };
}