
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  Clock, 
  Target, 
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ContinuityPlanForm from "@/components/business-continuity/ContinuityPlanForm";
import ContinuityTestForm from "@/components/business-continuity/ContinuityTestForm";
import RecoveryContactsManager from "@/components/business-continuity/RecoveryContactsManager";
import { businessContinuityService, ContinuityPlan, ContinuityTest } from "@/services/business-continuity-service";
import { supabase } from "@/integrations/supabase/client";

const BusinessContinuity = () => {
  const { user, profile } = useAuth();
  const [continuityPlans, setContinuityPlans] = useState<ContinuityPlan[]>([]);
  const [continuityTests, setContinuityTests] = useState<ContinuityTest[]>([]);
  const [businessFunctions, setBusinessFunctions] = useState<Array<{ id: string; name: string; criticality: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ContinuityPlan | null>(null);
  const [selectedTest, setSelectedTest] = useState<ContinuityTest | null>(null);
  const [selectedPlanForContacts, setSelectedPlanForContacts] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.organization_id) {
      loadData();
    }
  }, [profile?.organization_id]);

  const loadData = async () => {
    if (!profile?.organization_id) return;

    try {
      setLoading(true);
      const [plansData, testsData, functionsData] = await Promise.all([
        businessContinuityService.getContinuityPlans(profile.organization_id),
        businessContinuityService.getContinuityTests(profile.organization_id),
        loadBusinessFunctions()
      ]);

      setContinuityPlans(plansData);
      setContinuityTests(testsData);
      setBusinessFunctions(functionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "There was an error loading the business continuity data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessFunctions = async () => {
    const { data, error } = await supabase
      .from('business_functions')
      .select('id, name, criticality')
      .eq('org_id', profile?.organization_id);
    
    if (error) throw error;
    return data || [];
  };

  const openPlanForm = (plan?: ContinuityPlan) => {
    setSelectedPlan(plan || null);
    setPlanFormOpen(true);
  };

  const openTestForm = (test?: ContinuityTest) => {
    setSelectedTest(test || null);
    setTestFormOpen(true);
  };

  const openContactsManager = (planId: string) => {
    setSelectedPlanForContacts(planId);
    setContactsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'tabletop': return 'bg-blue-100 text-blue-800';
      case 'dry_run': return 'bg-yellow-100 text-yellow-800';
      case 'full_scale': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading business continuity data...</span>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Continuity</h1>
          <p className="text-muted-foreground">
            Manage business continuity plans, recovery strategies, and test schedules.
          </p>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans">Continuity Plans</TabsTrigger>
            <TabsTrigger value="tests">Testing Schedule</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Continuity Plans
                    </CardTitle>
                    <CardDescription>
                      Business continuity plans with RTO, fallback steps, and recovery procedures.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openPlanForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {continuityPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Continuity Plans</h3>
                    <p className="text-gray-500 mb-4">Create your first business continuity plan to get started.</p>
                    <Button onClick={() => openPlanForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Plan
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Business Function</TableHead>
                        <TableHead>RTO</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Tested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {continuityPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.plan_name}</TableCell>
                          <TableCell>
                            <div>
                              <div>{plan.business_functions?.name}</div>
                              <Badge variant="outline" className="text-xs">
                                {plan.business_functions?.criticality}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {plan.rto_hours}h
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(plan.status)}>
                              {plan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {plan.last_tested_date ? 
                              format(new Date(plan.last_tested_date), 'MMM d, yyyy') : 
                              'Never'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPlanForm(plan)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openContactsManager(plan.id)}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Testing Schedule
                    </CardTitle>
                    <CardDescription>
                      Schedule and manage continuity tests to validate recovery procedures.
                    </CardDescription>
                  </div>
                  <Button onClick={() => openTestForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {continuityTests.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Scheduled</h3>
                    <p className="text-gray-500 mb-4">Schedule your first continuity test to validate your plans.</p>
                    <Button onClick={() => openTestForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule First Test
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {continuityTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.test_name}</TableCell>
                          <TableCell>
                            <div>
                              <div>{test.continuity_plans?.plan_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {test.continuity_plans?.business_functions?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTestTypeColor(test.test_type)}>
                              {test.test_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(test.scheduled_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(test.status)}>
                              {test.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {test.overall_score ? (
                              <div className="flex items-center gap-1">
                                {test.overall_score >= 4 ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : test.overall_score >= 3 ? (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                {test.overall_score}/5
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTestForm(test)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{continuityPlans.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {continuityPlans.filter(p => p.status === 'active').length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled Tests</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {continuityTests.filter(t => t.status === 'scheduled').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {continuityTests.filter(t => t.status === 'completed').length} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {continuityPlans.length > 0 ? 
                      Math.round(continuityPlans.reduce((sum, p) => sum + p.rto_hours, 0) / continuityPlans.length) : 0
                    }h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recovery time objective
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates to continuity plans and test results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...continuityPlans, ...continuityTests]
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {'plan_name' in item ? (
                            <FileText className="h-5 w-5 text-blue-500" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {'plan_name' in item ? item.plan_name : item.test_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Updated {format(new Date(item.updated_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ContinuityPlanForm
          open={planFormOpen}
          onOpenChange={setPlanFormOpen}
          plan={selectedPlan || undefined}
          businessFunctions={businessFunctions}
          orgId={profile?.organization_id || ''}
          onSuccess={loadData}
        />

        <ContinuityTestForm
          open={testFormOpen}
          onOpenChange={setTestFormOpen}
          test={selectedTest || undefined}
          continuityPlans={continuityPlans}
          orgId={profile?.organization_id || ''}
          onSuccess={loadData}
        />

        <Dialog open={contactsOpen} onOpenChange={setContactsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recovery Contacts</DialogTitle>
            </DialogHeader>
            {selectedPlanForContacts && (
              <RecoveryContactsManager
                planId={selectedPlanForContacts}
                orgId={profile?.organization_id || ''}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
};

export default BusinessContinuity;
