
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Users, AlertTriangle } from "lucide-react";

const MobileBusinessContinuity = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-40 p-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Business Continuity</h1>
          <p className="text-sm text-muted-foreground">
            Ensure continuous operations
          </p>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Plans Active</p>
                  <p className="text-lg font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-medium">Tests Due</p>
                  <p className="text-lg font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <div className="sticky top-20 bg-background z-30 pb-4">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="plans" className="text-xs">Plans</TabsTrigger>
              <TabsTrigger value="tests" className="text-xs">Tests</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Continuity Plans</CardTitle>
                <CardDescription>Active business continuity plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">IT Systems Recovery</p>
                      <p className="text-sm text-muted-foreground">RTO: 4 hours</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Customer Service Continuity</p>
                      <p className="text-sm text-muted-foreground">RTO: 2 hours</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Financial Operations</p>
                      <p className="text-sm text-muted-foreground">RTO: 1 hour</p>
                    </div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tests" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Continuity Tests</CardTitle>
                <CardDescription>Scheduled and completed tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Q1 IT Recovery Test</p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Passed</span>
                    </div>
                    <p className="text-sm text-muted-foreground">RTO target met: 3.5 hours</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Communication Test</p>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Due</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Scheduled: March 15, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                <CardDescription>Key personnel for crisis response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Crisis Response Team</p>
                      <p className="text-sm text-muted-foreground">24/7 emergency line</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Communication Coordinator</p>
                      <p className="text-sm text-muted-foreground">External communications</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileBusinessContinuity;
