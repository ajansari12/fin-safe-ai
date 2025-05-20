
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

const OrganizationSetup = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [orgData, setOrgData] = useState({
    name: "",
    industry: "",
    size: "",
    country: "Canada",
    regulatoryFrameworks: [],
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

  const handleComplete = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Setup Complete",
        description: "Your organization has been set up successfully.",
      });
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setOrgData({
      ...orgData,
      [field]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <div className="h-0.5 w-12 bg-muted"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Compliance</span>
            </div>
            <div className="h-0.5 w-12 bg-muted"></div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                3
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
                    Organization Name
                  </label>
                  <Input 
                    id="org-name"
                    value={orgData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter your organization name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </label>
                  <Select
                    value={orgData.industry}
                    onValueChange={(value) => handleChange("industry", value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="asset-management">Asset Management</SelectItem>
                      <SelectItem value="credit-union">Credit Union</SelectItem>
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
                <CardTitle>Regulatory Framework</CardTitle>
                <CardDescription>
                  Select the regulatory frameworks applicable to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="e21" className="rounded border-gray-300" checked />
                    <label htmlFor="e21" className="text-sm font-medium">
                      OSFI E-21 (Operational Risk Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="b10" className="rounded border-gray-300" />
                    <label htmlFor="b10" className="text-sm font-medium">
                      OSFI B-10 (Third-Party Risk Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="b13" className="rounded border-gray-300" />
                    <label htmlFor="b13" className="text-sm font-medium">
                      OSFI B-13 (Technology and Cyber Risk Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="iso22301" className="rounded border-gray-300" />
                    <label htmlFor="iso22301" className="text-sm font-medium">
                      ISO 22301 (Business Continuity Management)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="other" className="rounded border-gray-300" />
                    <label htmlFor="other" className="text-sm font-medium">
                      Other frameworks (will be configured later)
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleNext}>Next Step</Button>
              </CardFooter>
            </>
          )}
          
          {step === 3 && (
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
                    <div className="text-sm text-muted-foreground">Industry</div>
                    <div className="font-medium">{orgData.industry || "Not selected"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Organization Size</div>
                    <div className="font-medium">{orgData.size || "Not selected"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Primary Regulatory Framework</div>
                    <div className="font-medium">OSFI E-21 (Operational Risk Management)</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
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
