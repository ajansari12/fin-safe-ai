
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { PolicyUploader } from "@/components/setup/PolicyUploader";
import { useOrganizationSetup } from "@/hooks/useOrganizationSetup";

const OrganizationSetup = () => {
  const {
    step,
    orgData,
    isSubmitting,
    handleNext,
    handleBack,
    handleComplete,
    handleChange,
  } = useOrganizationSetup();

  const handleFrameworkChange = (frameworkId: string, checked: boolean) => {
    const currentFrameworks = orgData.regulatoryFrameworks;
    if (checked) {
      handleChange("regulatoryFrameworks", [...currentFrameworks, frameworkId]);
    } else {
      handleChange("regulatoryFrameworks", currentFrameworks.filter(id => id !== frameworkId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">ResilientFI</span>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Organization</span>
            </div>
            <div className="h-0.5 w-16 bg-muted"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Role & Compliance</span>
            </div>
            <div className="h-0.5 w-16 bg-muted"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Policies</span>
            </div>
            <div className="h-0.5 w-16 bg-muted"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 4 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                4
              </div>
              <span className="ml-2 text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>
        
        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Tell us about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="org-name" className="text-sm font-medium">
                    Organization Name *
                  </label>
                  <Input 
                    id="org-name"
                    value={orgData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter your organization name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sector" className="text-sm font-medium">
                    Sector
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
                    Organization Size
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
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleNext}>Next Step</Button>
              </CardFooter>
            </>
          )}
          
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>User Role & Regulatory Frameworks</CardTitle>
                <CardDescription>
                  Set your role and select applicable regulatory frameworks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Regulatory Frameworks</h4>
                  
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleNext}>Next Step</Button>
              </CardFooter>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Upload Existing Policies</CardTitle>
                <CardDescription>
                  Optionally upload any existing organizational policies
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
                <Button onClick={handleNext}>Next Step</Button>
              </CardFooter>
            </>
          )}
          
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Confirmation</CardTitle>
                <CardDescription>
                  Review your organization setup information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Organization Name</div>
                    <div className="font-medium">{orgData.name || "Not provided"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Sector</div>
                    <div className="font-medium">{orgData.sector || "Not selected"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Organization Size</div>
                    <div className="font-medium">{orgData.size || "Not selected"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Your Role</div>
                    <div className="font-medium capitalize">{orgData.userRole}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Regulatory Frameworks</div>
                    <div className="font-medium">
                      {orgData.regulatoryFrameworks.length > 0 
                        ? orgData.regulatoryFrameworks.join(", ")
                        : "None selected"
                      }
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Policy Files</div>
                    <div className="font-medium">
                      {orgData.policyFiles.length > 0 
                        ? `${orgData.policyFiles.length} file(s) to upload`
                        : "No files to upload"
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>Back</Button>
                <Button onClick={handleComplete} disabled={isSubmitting}>
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

export default OrganizationSetup;
