import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  createOrganization, 
  updateUserProfile, 
  createUserRole, 
  uploadPolicyFile 
} from "@/services/organization-service";

interface OrganizationData {
  name: string;
  sector: string;
  size: string;
  userRole: 'admin' | 'analyst' | 'reviewer';
  regulatoryFrameworks: string[];
  policyFiles: File[];
}

export function useOrganizationSetup() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: "",
    sector: "",
    size: "",
    userRole: "admin",
    regulatoryFrameworks: ["E-21"],
    policyFiles: [],
  });

  const handleNext = () => {
    if (step === 1 && !orgData.name) {
      toast({
        title: "Organization name required",
        description: "Please enter your organization name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
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

      // Upload policy files if any
      if (orgData.policyFiles.length > 0) {
        await Promise.all(
          orgData.policyFiles.map(file => uploadPolicyFile(file, organization.id))
        );
      }

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: (await supabase.auth.getUser()).data.user?.id,
            organizationId: organization.id
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the setup if email fails
      }

      toast({
        title: "Setup Complete",
        description: "Your organization has been set up successfully.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Organization setup error:", error);
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your organization. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof OrganizationData, value: any) => {
    setOrgData({
      ...orgData,
      [field]: value,
    });
  };

  return {
    step,
    orgData,
    isSubmitting,
    handleNext,
    handleBack,
    handleComplete,
    handleChange,
  };
}
