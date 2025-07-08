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
import { intelligentFrameworkGenerationService } from "@/services/intelligent-framework-generation-service";

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
    
    setIsSubmitting(true);
    
    try {
      // Save progress first
      await saveTempProgress();
      
      // Step-specific processing with enhanced feedback
      if (step === 1) {
        // Step 1: Basic Information
        toast({
          title: "Information Saved",
          description: "Basic organization information captured successfully.",
        });
        
        await completeStep('organization-basic', 'Organization Basic Information', {
          name: orgData.name,
          sector: orgData.sector,
          size: orgData.size
        });
        
      } else if (step === 2) {
        // Step 2: Create organization record - this is the critical step
        toast({
          title: "Creating Organization",
          description: "Setting up your organization in the system...",
        });
        
        try {
          const organizationId = await createOrganizationRecord();
          console.log('✅ Organization setup completed:', organizationId);
          
          // Clear temporary progress after successful creation
          await clearSavedProgress();
          
        } catch (error) {
          console.error('Organization creation failed:', error);
          
          // Enhanced error feedback based on error type
          let errorTitle = "Organization Creation Failed";
          let errorDescription = "Failed to create organization. Please try again.";
          
          if (error instanceof Error) {
            if (error.message.includes('duplicate')) {
              errorTitle = "Organization Already Exists";
              errorDescription = "An organization with this name already exists. Please choose a different name.";
            } else if (error.message.includes('timeout')) {
              errorTitle = "Request Timed Out";
              errorDescription = "The request took too long. Please check your connection and try again.";
            } else if (error.message.includes('permission')) {
              errorTitle = "Permission Denied";
              errorDescription = "You don't have permission to create an organization. Please contact support.";
            } else {
              errorDescription = error.message;
            }
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive",
          });
          return; // Don't proceed to next step
        }
        
      } else if (step === 3) {
        // Step 3: Assessment completion
        toast({
          title: "Assessment Complete",
          description: "Organization assessment data saved successfully.",
        });
        
        await completeStep('organization-profile', 'Organization Profile Assessment', {
          profileData: orgData
        });
      }
      
      // Progress to next step
      setStep(step + 1);
      updateCompletionEstimate(orgData);
      
    } catch (error) {
      console.error('Error progressing to next step:', error);
      
      // Progressive error disclosure
      const isDetailedError = error instanceof Error && error.message.length > 50;
      
      toast({
        title: "Progress Error",
        description: isDetailedError 
          ? "An error occurred. Please try again or contact support if the issue persists."
          : error instanceof Error ? error.message : "Failed to save progress. Please try again.",
        variant: "destructive",
      });
      
      // Log detailed error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error info:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Framework generation will be handled by FrameworkGenerationStep component
  // This removes the conflicting framework generation flow

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
      // Detect whether user has an existing organization (Update mode) or not (Setup mode)
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id || '')
        .single();

      const existingOrgId = profile?.organization_id;
      const isSetupMode = !existingOrgId;
      
      console.log(`Operating in ${isSetupMode ? 'Setup' : 'Update'} mode${existingOrgId ? ` (org_id: ${existingOrgId})` : ''}`);

      const { data, error } = await supabase.functions.invoke('enrich-organization-data', {
        body: {
          org_id: existingOrgId || null,
          company_name: orgData.name.trim(),
          domain: domain?.trim() || undefined,
          mode: isSetupMode ? 'setup' : 'update'
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
        } else if (error.message?.includes('Unauthorized')) {
          errorMessage = 'Access denied. Please ensure you have permission to update this organization.';
        }
        
        toast({
          title: "Auto-Populate Failed",
          description: errorMessage,
          variant: errorVariant,
        });
        return;
      }

      if (data?.success) {
        if (data.mode === 'setup' && data.enriched_data) {
          // Setup mode: Update local state with enriched data
          const enrichedData = data.enriched_data;
          console.log('Received enriched data for setup:', enrichedData);
          
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
            console.log(`Successfully enriched ${fieldsUpdated} fields in setup mode:`, updatedFields);
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

        } else if (data.mode === 'update') {
          // Update mode: Data was persisted to database, show success message
          console.log('Organization updated successfully in database');
          toast({
            title: "Organization Updated",
            description: "Your organization information has been updated with enriched data.",
          });

        } else {
          console.error('Unexpected response mode:', data.mode);
          toast({
            title: "Auto-Populate Failed",
            description: "Received unexpected response from enrichment service.",
            variant: "destructive",
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

  // Create organization record atomically with profile linking
  const createOrganizationRecord = async (retryCount = 0): Promise<string> => {
    const maxRetries = 3;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if organization already exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.organization_id) {
      console.log('Organization already exists, skipping creation');
      toast({
        title: "Organization Found",
        description: "Using existing organization setup.",
      });
      return profile.organization_id;
    }

    try {
      // Use atomic database function to create organization and link profile
      const { data, error } = await supabase.rpc('create_organization_with_profile', {
        p_org_name: orgData.name,
        p_sector: orgData.sector,
        p_size: orgData.size,
        p_regulatory_guidelines: orgData.regulatoryFrameworks,
        p_user_id: user.id
      });

      if (error) {
        console.error('Failed to create organization:', error);
        
        // Enhanced error handling with specific messages
        let errorMessage = 'Failed to create organization.';
        if (error.message?.includes('duplicate key')) {
          errorMessage = 'An organization with this name already exists.';
        } else if (error.message?.includes('foreign key')) {
          errorMessage = 'User profile not found. Please refresh and try again.';
        } else if (error.message?.includes('permission')) {
          errorMessage = 'Insufficient permissions to create organization.';
        } else if (error.message?.includes('timeout')) {
          errorMessage = 'Database timeout. Please try again.';
        } else if (error.message?.includes('connection')) {
          errorMessage = 'Connection error. Please check your internet and try again.';
        }
        
        const enhancedError = new Error(`${errorMessage} (${error.message})`);
        throw enhancedError;
      }

      if (!data || data.length === 0) {
        throw new Error('Organization creation returned no data');
      }

      const result = data[0];
      if (!result.profile_updated) {
        console.warn('Profile was not updated during organization creation');
        toast({
          title: "Profile Update Warning",
          description: "Organization created but profile update failed. You may need to refresh the page.",
          variant: "default",
        });
      }

      // Create user role using our existing service function
      try {
        await createUserRole(result.organization_id, orgData.userRole);
        console.log('✅ User role created successfully');
      } catch (roleError) {
        console.error('Failed to create user role:', roleError);
        // Organization is created but role assignment failed
        toast({
          title: "Role Assignment Issue",
          description: "Organization created but role assignment failed. You may need to contact support.",
          variant: "destructive",
        });
        // Don't throw here - org is created, continue
      }

      // Force refresh of the user profile in auth context
      try {
        await supabase.auth.refreshSession();
      } catch (error) {
        console.warn('Failed to refresh session:', error);
      }

      console.log('Organization created successfully:', result.organization_id);
      
      toast({
        title: "Organization Created Successfully",
        description: "Your organization has been set up and is ready for the next step.",
      });

      return result.organization_id;

    } catch (error) {
      // Retry logic for transient errors
      if (retryCount < maxRetries && 
          error instanceof Error && 
          (error.message.includes('timeout') || 
           error.message.includes('network') ||
           error.message.includes('connection') ||
           error.message.includes('temporary'))) {
        
        console.log(`Retrying organization creation (attempt ${retryCount + 1}/${maxRetries})...`);
        
        // Show retry notification
        toast({
          title: "Retrying...",
          description: `Connection issue detected. Retrying (${retryCount + 1}/${maxRetries})...`,
          variant: "default",
        });
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return createOrganizationRecord(retryCount + 1);
      }
      
      // If we've exhausted retries or it's not a retriable error, throw
      throw error;
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user and organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.organization_id) {
        throw new Error('Organization not found. Please restart the setup process.');
      }

      const organizationId = userProfile.organization_id;

      // Update organization with any additional enhanced data
      await supabase
        .from('organizations')
        .update({
          sub_sector: orgData.subSector,
          org_type: orgData.orgType,
          geographic_scope: orgData.geographicScope,
          asset_size: orgData.assetSize,
          capital_tier: orgData.capitalTier,
          regulatory_classification: orgData.primaryRegulators
        })
        .eq('id', organizationId);

      // Create or update organizational profile with enhanced data
      const profileData = {
        organization_id: organizationId,
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

      const orgProfile = await organizationalIntelligenceService.createOrUpdateProfile(profileData);

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
          .eq('organization_id', organizationId);
      }

      // Upload policy files if any
      if (orgData.policyFiles.length > 0) {
        await Promise.all(
          orgData.policyFiles.map(file => uploadPolicyFile(file, organizationId))
        );
      }

      // Save selected framework if any
      if (frameworkProgress.selectedFramework) {
        await supabase
          .from('generated_frameworks')
          .insert({
            organization_id: organizationId,
            profile_id: orgProfile?.id || '', 
            template_id: frameworkProgress.selectedFramework.id,
            framework_data: frameworkProgress.selectedFramework.template_data,
            customizations: frameworkProgress.customizations || {},
            implementation_status: 'pending_deployment'
          });
      }

      // Generate AI frameworks after organization setup
      await generateInitialFrameworks(organizationId, orgProfile?.id);

      // Complete onboarding step
      await completeStep('organization-setup-complete', 'Organization Setup Complete', {
        organizationId: organizationId,
        frameworkGenerated: !!frameworkProgress.selectedFramework
      });

      // Clear saved progress
      await clearSavedProgress();

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: user.id,
            organizationId: organizationId
          }
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the setup if email fails
      }

      // Success animation and confirmation with enhanced feedback
      const successDetails = [
        "Organization Profile Created",
        "User Permissions Configured",
        orgData.policyFiles.length > 0 ? "Policy Documents Uploaded" : null,
        frameworkProgress.selectedFramework ? "Framework Template Applied" : null
      ].filter(Boolean);

      toast({
        title: "🎉 Setup Complete!", 
        description: `Your organization has been successfully configured. Redirecting to your dashboard...`,
      });

      // Delayed redirect with success animation
      setTimeout(() => {
        navigate("/app/dashboard", { 
          state: { 
            setupCompleted: true,
            organizationId: organizationId,
            successDetails
          }
        });
      }, 2000);
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

  const generateInitialFrameworks = async (organizationId: string, profileId?: string) => {
    if (!profileId) {
      console.warn('No profile ID provided for framework generation');
      return;
    }

    try {
      toast({
        title: "Generating AI Frameworks",
        description: "Creating tailored frameworks based on your organization profile...",
      });

      const frameworkTypes = ['governance', 'risk_appetite', 'control', 'compliance'];
      
      await intelligentFrameworkGenerationService.generateFrameworks({
        profileId,
        frameworkTypes,
        customizations: {}
      });
      
      toast({
        title: "Frameworks Generated",
        description: "AI-powered frameworks have been created successfully!",
      });
    } catch (error) {
      console.error('Framework generation failed:', error);
      toast({
        title: "Framework Generation Failed",
        description: "Failed to generate frameworks automatically. You can view and create them manually in the Governance section.",
        variant: "destructive",
      });
    }
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
    // Framework generation now handled by FrameworkGenerationStep
    resumeFromSaved,
    startFresh,
    validateCurrentStep,
    createOrganizationRecord
  };
}