
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { 
  getRiskCategories, 
  getRiskAppetiteStatementById, 
  saveRiskAppetiteWorkflow,
  publishRiskAppetiteStatement
} from "@/services/risk-management-service";
import { 
  RiskCategory, 
  RiskThreshold, 
  KRIDefinition,
  RiskAppetiteFormData 
} from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskCategoryForm } from "@/components/risk-appetite/RiskCategoryForm";
import { KRIList } from "@/components/risk-appetite/KRIList";
import { ArrowLeft, Save, Check, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function RiskAppetiteWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("statement");
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<RiskAppetiteFormData>({
    statement: {
      title: "",
      description: "",
      status: "draft",
    },
    thresholds: [],
    kris: {},
  });

  // Load risk categories and statement data if editing
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load risk categories
      const categoriesData = await getRiskCategories();
      setCategories(categoriesData);
      
      // Initialize empty thresholds for each category
      if (categoriesData.length > 0 && !id) {
        setFormData(prev => ({
          ...prev,
          thresholds: categoriesData.map(category => ({
            category_id: category.id,
            tolerance_level: 'medium' as const,
          }))
        }));
      }
      
      // Load statement data if editing
      if (id) {
        const statement = await getRiskAppetiteStatementById(id);
        if (statement) {
          // Set statement data
          setFormData({
            statement: {
              id: statement.id,
              title: statement.title,
              description: statement.description,
              status: statement.status,
              version: statement.version,
            },
            thresholds: statement.thresholds.map(threshold => ({
              id: threshold.id,
              category_id: threshold.category_id,
              tolerance_level: threshold.tolerance_level,
              description: threshold.description,
              escalation_trigger: threshold.escalation_trigger,
            })),
            kris: statement.thresholds.reduce((acc, threshold) => {
              acc[threshold.id] = threshold.kris.map(kri => ({
                id: kri.id,
                name: kri.name,
                description: kri.description,
                measurement_frequency: kri.measurement_frequency,
                target_value: kri.target_value,
                warning_threshold: kri.warning_threshold,
                critical_threshold: kri.critical_threshold,
              }));
              return acc;
            }, {} as Record<string, Partial<KRIDefinition>[]>),
          });
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id]);

  // Update statement data
  const handleStatementChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      statement: {
        ...prev.statement,
        [field]: value,
      }
    }));
  };

  // Update threshold data
  const handleThresholdSubmit = (thresholdData: Partial<RiskThreshold>) => {
    setFormData(prev => {
      const updatedThresholds = [...prev.thresholds];
      const index = updatedThresholds.findIndex(t => 
        t.id === thresholdData.id || t.category_id === thresholdData.category_id
      );
      
      if (index !== -1) {
        updatedThresholds[index] = {
          ...updatedThresholds[index],
          ...thresholdData
        };
      } else {
        updatedThresholds.push(thresholdData);
      }
      
      return {
        ...prev,
        thresholds: updatedThresholds
      };
    });
    
    toast.success(`Risk threshold for ${
      categories.find(c => c.id === thresholdData.category_id)?.name
    } updated`);
  };

  // KRI management
  const handleAddKRI = (thresholdId: string, kri: Partial<KRIDefinition>) => {
    setFormData(prev => {
      const kriList = prev.kris[thresholdId] || [];
      return {
        ...prev,
        kris: {
          ...prev.kris,
          [thresholdId]: [...kriList, kri]
        }
      };
    });
  };

  const handleUpdateKRI = (thresholdId: string, kri: Partial<KRIDefinition>) => {
    setFormData(prev => {
      const kriList = [...(prev.kris[thresholdId] || [])];
      const index = kriList.findIndex(k => k.id === kri.id);
      
      if (index !== -1) {
        kriList[index] = { ...kriList[index], ...kri };
      }
      
      return {
        ...prev,
        kris: {
          ...prev.kris,
          [thresholdId]: kriList
        }
      };
    });
  };

  const handleDeleteKRI = (thresholdId: string, kriId: string) => {
    setFormData(prev => {
      const kriList = [...(prev.kris[thresholdId] || [])];
      const filteredList = kriList.filter(k => k.id !== kriId);
      
      return {
        ...prev,
        kris: {
          ...prev.kris,
          [thresholdId]: filteredList
        }
      };
    });
    
    toast.success("KRI deleted");
  };

  // Save the entire form
  const handleSaveForm = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to save a risk appetite statement");
      return;
    }
    
    if (!formData.statement.title) {
      toast.error("Please enter a title for the risk appetite statement");
      setActiveTab("statement");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const orgId = user.org_id || "default";
      const statementId = await saveRiskAppetiteWorkflow(formData, orgId, user?.id);
      
      if (statementId) {
        toast.success("Risk appetite statement saved successfully");
        if (!id) {
          // If this was a new statement, redirect to edit view
          navigate(`/risk-appetite/edit/${statementId}`);
        }
      } 
    } finally {
      setIsSaving(false);
    }
  };

  // Publish the statement
  const handlePublish = async () => {
    if (!id) {
      toast.error("Save the statement before publishing");
      return;
    }
    
    setIsPublishing(true);
    
    try {
      const success = await publishRiskAppetiteStatement(id, user?.id);
      
      if (success) {
        setFormData(prev => ({
          ...prev,
          statement: {
            ...prev.statement,
            status: 'active'
          }
        }));
        
        toast.success("Risk appetite statement published successfully");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Navigate back to list
  const handleBack = () => {
    navigate("/risk-appetite");
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading risk appetite data...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Risk Appetite
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mt-2">
              {id ? "Edit" : "Create"} Risk Appetite Statement
            </h1>
            <p className="text-muted-foreground">
              Define your organization's risk tolerance levels across different categories.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveForm}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            
            {formData.statement.status !== 'active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" disabled={isPublishing || !id}>
                    <Check className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Publish Risk Appetite Statement</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will make the risk appetite statement official and visible to all authorized users.
                      Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePublish}>
                      Publish
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {formData.statement.status === 'active' && (
              <Button variant="outline" disabled>
                <Check className="mr-2 h-4 w-4" />
                Published
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="thresholds">Risk Thresholds</TabsTrigger>
            <TabsTrigger value="kris">Key Risk Indicators</TabsTrigger>
          </TabsList>
          
          <TabsContent value="statement">
            <Card>
              <CardHeader>
                <CardTitle>Risk Appetite Statement</CardTitle>
                <CardDescription>
                  Define the overall risk appetite statement for your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="E.g., FY 2024 Risk Appetite Statement"
                    value={formData.statement.title || ''}
                    onChange={(e) => handleStatementChange('title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description of your organization's overall risk appetite..."
                    value={formData.statement.description || ''}
                    onChange={(e) => handleStatementChange('description', e.target.value)}
                    className="mt-1"
                    rows={6}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-sm text-muted-foreground">
                  {formData.statement.status === 'draft' ? (
                    <span className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Draft - Not yet published
                    </span>
                  ) : formData.statement.status === 'active' ? (
                    <span className="flex items-center text-green-600">
                      <Check className="mr-2 h-4 w-4" />
                      Published (Version {formData.statement.version})
                    </span>
                  ) : (
                    <span>Archived</span>
                  )}
                </div>
                <Button onClick={() => setActiveTab("thresholds")}>
                  Continue to Risk Thresholds
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="thresholds">
            <Card>
              <CardHeader>
                <CardTitle>Risk Thresholds</CardTitle>
                <CardDescription>
                  Define tolerance levels for each risk category.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category) => {
                  const threshold = formData.thresholds.find(t => t.category_id === category.id);
                  return (
                    <RiskCategoryForm
                      key={category.id}
                      category={category}
                      initialData={threshold}
                      onSubmit={handleThresholdSubmit}
                    />
                  );
                })}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setActiveTab("statement")}>
                  Back to Statement
                </Button>
                <Button onClick={() => setActiveTab("kris")}>
                  Continue to Key Risk Indicators
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="kris">
            <Card>
              <CardHeader>
                <CardTitle>Key Risk Indicators</CardTitle>
                <CardDescription>
                  Define KRIs for each risk category to monitor risk levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.thresholds.map((threshold) => {
                  if (!threshold.id) return null;
                  
                  const category = categories.find(c => c.id === threshold.category_id);
                  if (!category) return null;
                  
                  return (
                    <div key={threshold.id} className="mb-8">
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tolerance Level: <span className="font-medium capitalize">{threshold.tolerance_level}</span>
                      </p>
                      {threshold.description && (
                        <p className="text-sm mb-2">{threshold.description}</p>
                      )}
                      {threshold.escalation_trigger && (
                        <p className="text-sm mb-4">
                          <span className="font-medium">Escalation Trigger:</span> {threshold.escalation_trigger}
                        </p>
                      )}
                      
                      <KRIList
                        thresholdId={threshold.id}
                        kris={formData.kris[threshold.id] || []}
                        onAddKRI={(kri) => handleAddKRI(threshold.id!, kri)}
                        onUpdateKRI={(kri) => handleUpdateKRI(threshold.id!, kri)}
                        onDeleteKRI={(kriId) => handleDeleteKRI(threshold.id!, kriId)}
                      />
                      
                      <Separator className="my-6" />
                    </div>
                  );
                })}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setActiveTab("thresholds")}>
                  Back to Thresholds
                </Button>
                <Button onClick={handleSaveForm} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save All"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
