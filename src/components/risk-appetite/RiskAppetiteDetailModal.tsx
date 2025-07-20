
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';
import { RiskAppetiteStatement } from '@/hooks/useRiskAppetite';

interface RiskAppetiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  statement: RiskAppetiteStatement | null;
}

const RiskAppetiteDetailModal: React.FC<RiskAppetiteDetailModalProps> = ({
  isOpen,
  onClose,
  statement
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!statement) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const daysUntilReview = Math.ceil(
    (new Date(statement.review_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                {statement.statement_name}
              </DialogTitle>
              <DialogDescription>
                Risk Appetite Statement Details
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(statement.approval_status)}>
              {statement.approval_status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Risk Categories</TabsTrigger>
            <TabsTrigger value="limits">Limits & Thresholds</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Effective Date:</span>
                    <span className="font-medium">
                      {new Date(statement.effective_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Review:</span>
                    <span className="font-medium">
                      {new Date(statement.review_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Days Until Review:</span>
                    <Badge variant={daysUntilReview < 30 ? "destructive" : "secondary"}>
                      {daysUntilReview} days
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Compliance</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Risk Categories:</span>
                    <span className="font-medium">4 defined</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active KRIs:</span>
                    <span className="font-medium">12 monitoring</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {statement.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {statement.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Management Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(statement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(statement.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {statement.approved_at && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Approved on {new Date(statement.approved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Categories</CardTitle>
                <CardDescription>
                  Defined risk appetite levels across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Operational Risk', level: 'Cautious', description: 'Limited tolerance for operational disruptions' },
                    { name: 'Financial Risk', level: 'Minimal', description: 'Very low tolerance for financial losses' },
                    { name: 'Compliance Risk', level: 'Averse', description: 'Zero tolerance for compliance breaches' },
                    { name: 'Strategic Risk', level: 'Open', description: 'Moderate tolerance for strategic initiatives' }
                  ].map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge variant="outline">{category.level}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quantitative Limits</CardTitle>
                <CardDescription>
                  Numerical thresholds and tolerance levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Operational Loss Limit', value: '$500K', warning: '$400K', critical: '$450K' },
                    { metric: 'System Downtime', value: '4 hours/month', warning: '3 hours', critical: '3.5 hours' },
                    { metric: 'Compliance Breaches', value: '0', warning: '0', critical: '0' },
                    { metric: 'Customer Complaints', value: '<1%', warning: '0.8%', critical: '0.9%' }
                  ].map((limit, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{limit.metric}</h4>
                        <Badge variant="outline">{limit.value}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Warning:</span>
                          <span className="text-yellow-600">{limit.warning}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Critical:</span>
                          <span className="text-red-600">{limit.critical}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monitoring Status
                </CardTitle>
                <CardDescription>
                  Real-time monitoring and breach detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-muted-foreground">Active KRIs</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">2</div>
                      <div className="text-sm text-muted-foreground">Warning Alerts</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">0</div>
                      <div className="text-sm text-muted-foreground">Critical Breaches</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Alerts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">System Response Time Alert</div>
                          <div className="text-xs text-muted-foreground">Warning threshold exceeded - 2 hours ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Transaction Volume Alert</div>
                          <div className="text-xs text-muted-foreground">Approaching warning level - 4 hours ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Edit Statement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskAppetiteDetailModal;
