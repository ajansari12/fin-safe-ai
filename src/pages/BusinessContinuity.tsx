
import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Users, AlertTriangle } from "lucide-react";
import MobileBusinessContinuity from "@/components/business-continuity/MobileBusinessContinuity";
import { useIsMobile } from "@/hooks/use-mobile";

const BusinessContinuityContent = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBusinessContinuity />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Continuity</h1>
        <p className="text-muted-foreground">
          Ensure continuous operations during disruptions and plan for recovery.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Continuity plans in place
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Scheduled this quarter
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">
              Recovery time objective
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Emergency contacts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Continuity Plans</TabsTrigger>
          <TabsTrigger value="tests">Tests & Exercises</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Business Continuity Plans</CardTitle>
              <CardDescription>
                Detailed plans for maintaining operations during disruptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Business continuity planning features are coming soon. This will include
                plan creation, RTO/RPO management, and recovery procedures.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Tests & Exercises</CardTitle>
              <CardDescription>
                Regular testing to validate continuity plan effectiveness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Testing and exercise management features are coming soon. This will include
                test scheduling, execution tracking, and results analysis.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Key personnel and external contacts for crisis response.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Emergency contact management features are coming soon. This will include
                contact directories, escalation trees, and communication templates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BusinessContinuity = () => {
  return (
    <AuthenticatedLayout>
      <BusinessContinuityContent />
    </AuthenticatedLayout>
  );
};

export default BusinessContinuity;
