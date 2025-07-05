import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Save, Clock, Users, Building, Brain, Settings, Target, Sparkles } from "lucide-react";
import { PolicyUploader } from "@/components/setup/PolicyUploader";
import { useEnhancedOrganizationSetup } from "@/hooks/useEnhancedOrganizationSetup";
import FrameworkGenerationPreview from "./FrameworkGenerationPreview";

const EnhancedOrganizationSetup = () => {
  const {
    step,
    orgData,
    isSubmitting,
    completionEstimate,
    saveInProgress,
    frameworkProgress,
    isEnrichingOrganization,
    handleNext,
    handleBack,
    handleComplete,
    handleChange,
    handleEnrichOrganization,
  } = useEnhancedOrganizationSetup();

  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleFrameworkChange = (frameworkId: string, checked: boolean) => {
    const currentFrameworks = orgData.regulatoryFrameworks;
    if (checked) {
      handleChange("regulatoryFrameworks", [...currentFrameworks, frameworkId]);
    } else {
      handleChange("regulatoryFrameworks", currentFrameworks.filter(id => id !== frameworkId));
    }
  };

  const StepIndicator = ({ stepNumber, title, icon: Icon, isActive, isCompleted }: any) => (
    <div className="flex flex-col items-center space-y-2">
      <div className={`
        flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
          isActive ? 'bg-primary border-primary text-white' :
          'bg-background border-muted-foreground/30 text-muted-foreground'}
      `}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <div className={`text-xs font-medium ${
          isActive ? 'text-primary' : 
          isCompleted ? 'text-green-600' : 
          'text-muted-foreground'
        }`}>
          {title}
        </div>
        {isCompleted && (
          <Badge variant="secondary" className="text-xs mt-1">
            Done
          </Badge>
        )}
      </div>
    </div>
  );

  const stepConfig = [
    { title: "Organization", icon: Building },
    { title: "Profile", icon: Users },
    { title: "Assessment", icon: Brain },
    { title: "Frameworks", icon: Settings },
    { title: "Generation", icon: Target },
    { title: "Review", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">ResilientFI</span>
          </div>
        </div>
        
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Intelligent Setup Progress</CardTitle>
              <div className="flex items-center gap-4">
                {saveInProgress && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Save className="h-4 w-4 animate-pulse" />
                    Saving...
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  ~{completionEstimate} min remaining
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {step} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
              
              {/* Step indicators */}
              <div className="grid grid-cols-6 gap-4 mt-6">
                {stepConfig.map((config, index) => (
                  <StepIndicator
                    key={index}
                    stepNumber={index + 1}
                    title={config.title}
                    icon={config.icon}
                    isActive={step === index + 1}
                    isCompleted={step > index + 1}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          {/* Step 1: Basic Organization Information */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Basic information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="org-name" className="text-sm font-medium">
                    Organization Name *
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      id="org-name"
                      value={orgData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter your organization name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEnrichOrganization()}
                      disabled={!orgData.name.trim() || isEnrichingOrganization}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isEnrichingOrganization ? 'Auto-Populating...' : 'Auto-Populate'}
                    </Button>
                  </div>
                  {isEnrichingOrganization && (
                    <p className="text-sm text-muted-foreground">
                      Searching for public information about your organization...
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="sector" className="text-sm font-medium">
                      Primary Sector *
                    </label>
                    <Select
                      value={orgData.sector}
                      onValueChange={(value) => handleChange("sector", value)}
                    >
                      <SelectTrigger id="sector">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="banking">Banking</SelectItem>
                         <SelectItem value="banking-schedule-i">Banking - Schedule I (Canadian Bank)</SelectItem>
                         <SelectItem value="banking-schedule-ii">Banking - Schedule II (Foreign Bank Subsidiary)</SelectItem>
                         <SelectItem value="banking-schedule-iii">Banking - Schedule III (Foreign Bank Branch)</SelectItem>
                         <SelectItem value="insurance">Insurance</SelectItem>
                         <SelectItem value="asset-management">Asset Management</SelectItem>
                         <SelectItem value="credit-union">Credit Union</SelectItem>
                         <SelectItem value="fintech">FinTech</SelectItem>
                         <SelectItem value="other">Other Financial Institution</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="size" className="text-sm font-medium">
                      Organization Size *
                    </label>
                    <Select
                      value={orgData.size}
                      onValueChange={(value) => handleChange("size", value)}
                    >
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Select organization size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt;100 employees)</SelectItem>
                        <SelectItem value="medium">Medium (100-1,000 employees)</SelectItem>
                        <SelectItem value="large">Large (1,000+ employees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleNext}>Continue to Profile</Button>
              </CardFooter>
            </>
          )}

          {/* Step 2: Enhanced Profile Information */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Organizational Profile</CardTitle>
                <CardDescription>
                  Detailed information to customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="sub-sector" className="text-sm font-medium">
                      Sub-sector
                    </label>
                    <Select
                      value={orgData.subSector || ""}
                      onValueChange={(value) => handleChange("subSector", value)}
                    >
                      <SelectTrigger id="sub-sector">
                        <SelectValue placeholder="Select sub-sector" />
                      </SelectTrigger>
                       <SelectContent>
                         {(orgData.sector === 'banking' || orgData.sector?.startsWith('banking-schedule')) && (
                           <>
                             <SelectItem value="retail-banking">Retail Banking</SelectItem>
                             <SelectItem value="commercial-banking">Commercial Banking</SelectItem>
                             <SelectItem value="investment-banking">Investment Banking</SelectItem>
                             <SelectItem value="digital-banking">Digital Banking</SelectItem>
                             <SelectItem value="mortgage-lending">Mortgage Lending</SelectItem>
                             <SelectItem value="wealth-management">Wealth Management</SelectItem>
                           </>
                         )}
                        {orgData.sector === 'insurance' && (
                          <>
                            <SelectItem value="life-insurance">Life Insurance</SelectItem>
                            <SelectItem value="property-casualty">Property & Casualty</SelectItem>
                            <SelectItem value="reinsurance">Reinsurance</SelectItem>
                            <SelectItem value="insurtech">InsurTech</SelectItem>
                          </>
                        )}
                        {orgData.sector === 'asset-management' && (
                          <>
                            <SelectItem value="mutual-funds">Mutual Funds</SelectItem>
                            <SelectItem value="hedge-funds">Hedge Funds</SelectItem>
                            <SelectItem value="pension-funds">Pension Funds</SelectItem>
                            <SelectItem value="private-equity">Private Equity</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="employee-count" className="text-sm font-medium">
                      Number of Employees
                    </label>
                    <Input 
                      id="employee-count"
                      type="number"
                      value={orgData.employeeCount || ""}
                      onChange={(e) => handleChange("employeeCount", parseInt(e.target.value) || 0)}
                      placeholder="Enter employee count"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="asset-size" className="text-sm font-medium">
                      Total Assets (CAD Millions)
                    </label>
                    <Input 
                      id="asset-size"
                      type="number"
                      value={orgData.assetSize || ""}
                      onChange={(e) => handleChange("assetSize", parseInt(e.target.value) || 0)}
                      placeholder="Enter total assets"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="geographic-scope" className="text-sm font-medium">
                      Geographic Scope
                    </label>
                    <Select
                      value={orgData.geographicScope || ""}
                      onValueChange={(value) => handleChange("geographicScope", value)}
                    >
                      <SelectTrigger id="geographic-scope">
                        <SelectValue placeholder="Select geographic scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local/Regional</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                 </div>

                 {/* Canadian Banking Specific Fields */}
                 {(orgData.sector === 'banking' || orgData.sector?.startsWith('banking-schedule')) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label htmlFor="banking-license" className="text-sm font-medium">
                         Banking License Type
                       </label>
                       <Select
                         value={orgData.bankingLicenseType || ""}
                         onValueChange={(value) => handleChange("bankingLicenseType", value)}
                       >
                         <SelectTrigger id="banking-license">
                           <SelectValue placeholder="Select license type" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="federal">Federal Charter</SelectItem>
                           <SelectItem value="provincial">Provincial Charter</SelectItem>
                           <SelectItem value="foreign-subsidiary">Foreign Bank Subsidiary</SelectItem>
                           <SelectItem value="foreign-branch">Foreign Bank Branch</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div className="space-y-2">
                       <label htmlFor="capital-tier" className="text-sm font-medium">
                         Capital Tier Classification
                       </label>
                       <Select
                         value={orgData.capitalTier || ""}
                         onValueChange={(value) => handleChange("capitalTier", value)}
                       >
                         <SelectTrigger id="capital-tier">
                           <SelectValue placeholder="Select capital tier" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="tier-1">Tier 1 (Core Capital)</SelectItem>
                           <SelectItem value="tier-2">Tier 2 (Supplementary Capital)</SelectItem>
                           <SelectItem value="tier-3">Tier 3 (Market Risk)</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                 )}

                 <div className="space-y-2">
                   <label htmlFor="user-role" className="text-sm font-medium">
                     Your Role in the Organization
                   </label>
                   <Select
                     value={orgData.userRole}
                     onValueChange={(value: 'admin' | 'analyst' | 'reviewer') => handleChange("userRole", value)}
                   >
                     <SelectTrigger id="user-role">
                       <SelectValue placeholder="Select your role" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="admin">Administrator</SelectItem>
                       <SelectItem value="analyst">Risk Analyst</SelectItem>
                       <SelectItem value="reviewer">Reviewer</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext}>Continue to Assessment</Button>
              </CardFooter>
            </>
          )}

          {/* Step 3: Maturity Assessment */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Organizational Maturity Assessment</CardTitle>
                <CardDescription>
                  Help us understand your current maturity levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-3 block">Risk Management Maturity</label>
                    <RadioGroup
                      value={orgData.riskMaturity || ""}
                      onValueChange={(value) => handleChange("riskMaturity", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="risk-basic" />
                        <Label htmlFor="risk-basic">Basic - Ad-hoc risk management</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="developing" id="risk-developing" />
                        <Label htmlFor="risk-developing">Developing - Some formal processes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="risk-advanced" />
                        <Label htmlFor="risk-advanced">Advanced - Comprehensive risk framework</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sophisticated" id="risk-sophisticated" />
                        <Label htmlFor="risk-sophisticated">Sophisticated - Integrated, predictive risk management</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Compliance Maturity</label>
                    <RadioGroup
                      value={orgData.complianceMaturity || ""}
                      onValueChange={(value) => handleChange("complianceMaturity", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="compliance-basic" />
                        <Label htmlFor="compliance-basic">Basic - Reactive compliance</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="developing" id="compliance-developing" />
                        <Label htmlFor="compliance-developing">Developing - Regular monitoring</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="compliance-advanced" />
                        <Label htmlFor="compliance-advanced">Advanced - Proactive compliance management</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sophisticated" id="compliance-sophisticated" />
                        <Label htmlFor="compliance-sophisticated">Sophisticated - Predictive compliance optimization</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-3 block">Technology Maturity</label>
                    <RadioGroup
                      value={orgData.technologyMaturity || ""}
                      onValueChange={(value) => handleChange("technologyMaturity", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="tech-basic" />
                        <Label htmlFor="tech-basic">Basic - Legacy systems, manual processes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="developing" id="tech-developing" />
                        <Label htmlFor="tech-developing">Developing - Some automation, modernizing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="tech-advanced" />
                        <Label htmlFor="tech-advanced">Advanced - Modern systems, good integration</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sophisticated" id="tech-sophisticated" />
                        <Label htmlFor="tech-sophisticated">Sophisticated - Cutting-edge, AI-enabled</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext}>Continue to Frameworks</Button>
              </CardFooter>
            </>
          )}

          {/* Step 4: Regulatory Frameworks */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Regulatory Frameworks</CardTitle>
                <CardDescription>
                  Select applicable regulatory frameworks for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="e21" 
                      checked={orgData.regulatoryFrameworks.includes("E-21")}
                      onCheckedChange={(checked) => handleFrameworkChange("E-21", !!checked)}
                    />
                    <label htmlFor="e21" className="text-sm font-medium">
                      OSFI E-21 (Operational Risk Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="b10" 
                      checked={orgData.regulatoryFrameworks.includes("B-10")}
                      onCheckedChange={(checked) => handleFrameworkChange("B-10", !!checked)}
                    />
                    <label htmlFor="b10" className="text-sm font-medium">
                      OSFI B-10 (Third-Party Risk Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="b13" 
                      checked={orgData.regulatoryFrameworks.includes("B-13")}
                      onCheckedChange={(checked) => handleFrameworkChange("B-13", !!checked)}
                    />
                    <label htmlFor="b13" className="text-sm font-medium">
                      OSFI B-13 (Technology and Cyber Risk Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="iso22301" 
                      checked={orgData.regulatoryFrameworks.includes("ISO-22301")}
                      onCheckedChange={(checked) => handleFrameworkChange("ISO-22301", !!checked)}
                    />
                    <label htmlFor="iso22301" className="text-sm font-medium">
                      ISO 22301 (Business Continuity Management)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="basel" 
                      checked={orgData.regulatoryFrameworks.includes("Basel-III")}
                      onCheckedChange={(checked) => handleFrameworkChange("Basel-III", !!checked)}
                    />
                    <label htmlFor="basel" className="text-sm font-medium">
                      Basel III (International Banking Regulation)
                    </label>
                  </div>

                   <div className="flex items-center space-x-2">
                     <Checkbox 
                       id="nist" 
                       checked={orgData.regulatoryFrameworks.includes("NIST-CSF")}
                       onCheckedChange={(checked) => handleFrameworkChange("NIST-CSF", !!checked)}
                     />
                     <label htmlFor="nist" className="text-sm font-medium">
                       NIST Cybersecurity Framework
                     </label>
                   </div>

                   {/* Canadian Banking Specific Frameworks */}
                   {(orgData.sector === 'banking' || orgData.sector?.startsWith('banking-schedule')) && (
                     <>
                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="bank-act" 
                           checked={orgData.regulatoryFrameworks.includes("Bank-Act")}
                           onCheckedChange={(checked) => handleFrameworkChange("Bank-Act", !!checked)}
                         />
                         <label htmlFor="bank-act" className="text-sm font-medium">
                           Bank Act (Canada)
                         </label>
                       </div>

                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="cdic" 
                           checked={orgData.regulatoryFrameworks.includes("CDIC")}
                           onCheckedChange={(checked) => handleFrameworkChange("CDIC", !!checked)}
                         />
                         <label htmlFor="cdic" className="text-sm font-medium">
                           CDIC Guidelines (Deposit Insurance)
                         </label>
                       </div>

                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="car" 
                           checked={orgData.regulatoryFrameworks.includes("CAR")}
                           onCheckedChange={(checked) => handleFrameworkChange("CAR", !!checked)}
                         />
                         <label htmlFor="car" className="text-sm font-medium">
                           Capital Adequacy Requirements (OSFI)
                         </label>
                       </div>

                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="lcr" 
                           checked={orgData.regulatoryFrameworks.includes("LCR")}
                           onCheckedChange={(checked) => handleFrameworkChange("LCR", !!checked)}
                         />
                         <label htmlFor="lcr" className="text-sm font-medium">
                           Liquidity Coverage Ratio (OSFI)
                         </label>
                       </div>
                     </>
                   )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Framework Generation Mode</label>
                  <Select
                    value={orgData.frameworkGenerationMode || "automatic"}
                    onValueChange={(value) => handleChange("frameworkGenerationMode", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic - AI generates optimal frameworks</SelectItem>
                      <SelectItem value="guided">Guided - AI assists with manual selection</SelectItem>
                      <SelectItem value="manual">Manual - Full control over framework selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext}>Continue to Policies</Button>
              </CardFooter>
            </>
          )}

          {/* Step 5: Policy Upload */}
          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Upload Existing Policies</CardTitle>
                <CardDescription>
                  Optionally upload existing organizational policies for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PolicyUploader
                  files={orgData.policyFiles}
                  onFilesChange={(files) => handleChange("policyFiles", files)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext}>Generate Framework</Button>
              </CardFooter>
            </>
          )}

          {/* Step 6: Framework Generation & Review */}
          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>Framework Generation & Review</CardTitle>
                <CardDescription>
                  Generate and review your customized risk management framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FrameworkGenerationPreview
                  orgData={orgData}
                  frameworkProgress={frameworkProgress}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Setting up..." : "Complete Setup"}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EnhancedOrganizationSetup;