
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ExternalLink, Calendar, User, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'compliance' | 'kri' | 'control' | 'incident' | 'risk';
  entityId: string;
  data: any;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  entityType,
  entityId,
  data
}) => {
  const getEntityTitle = () => {
    switch (entityType) {
      case 'compliance':
        return data?.principleName || 'Compliance Principle';
      case 'kri':
        return data?.name || 'Key Risk Indicator';
      case 'control':
        return data?.title || 'Control';
      case 'incident':
        return data?.title || 'Incident';
      case 'risk':
        return data?.name || 'Risk';
      default:
        return 'Details';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-500/10 text-green-700 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
      warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      critical: 'bg-red-500/10 text-red-700 border-red-500/20',
      compliant: 'bg-green-500/10 text-green-700 border-green-500/20',
      'non-compliant': 'bg-red-500/10 text-red-700 border-red-500/20',
    };

    return (
      <Badge 
        variant="outline" 
        className={statusColors[status as keyof typeof statusColors] || 'bg-gray-500/10 text-gray-700 border-gray-500/20'}
      >
        {status}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'deteriorating':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderComplianceDetails = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
        <TabsTrigger value="gaps">Gaps</TabsTrigger>
        <TabsTrigger value="actions">Actions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.currentScore || 0}%</div>
              <div className="text-sm text-muted-foreground">
                Target: {data?.targetScore || 100}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{data?.lastAssessment ? new Date(data.lastAssessment).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="requirements" className="space-y-4">
        <ScrollArea className="h-[400px]">
          {data?.requirements?.map((req: any, index: number) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">{req.title}</CardTitle>
                <CardDescription>{req.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  {getStatusBadge(req.status)}
                </div>
              </CardContent>
            </Card>
          )) || <div className="text-center text-muted-foreground">No requirements data available</div>}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="gaps" className="space-y-4">
        <ScrollArea className="h-[400px]">
          {data?.gaps?.map((gap: any, index: number) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {gap.title}
                </CardTitle>
                <CardDescription>{gap.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Severity:</span>
                    {getStatusBadge(gap.severity)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Due Date:</span>
                    <span className="text-sm">{gap.dueDate ? new Date(gap.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || <div className="text-center text-muted-foreground">No gaps identified</div>}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="actions" className="space-y-4">
        <ScrollArea className="h-[400px]">
          {data?.actionPlan?.map((action: any, index: number) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    {getStatusBadge(action.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assigned To:</span>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{action.assignedTo || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Due Date:</span>
                    <span className="text-sm">{action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || <div className="text-center text-muted-foreground">No actions planned</div>}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  const renderKRIDetails = () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="breaches">Breaches</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.currentValue || 0}</div>
              <div className="text-sm text-muted-foreground">
                {data?.unit || 'units'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getTrendIcon(data?.trend)}
                <span className="capitalize">{data?.trend || 'stable'}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(data?.status || 'active')}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data?.description || 'No description available'}</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="thresholds" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-yellow-600">Warning Threshold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.warningThreshold || 0}</div>
              <div className="text-sm text-muted-foreground">
                {data?.unit || 'units'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Critical Threshold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.criticalThreshold || 0}</div>
              <div className="text-sm text-muted-foreground">
                {data?.unit || 'units'}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Measurement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Frequency:</span>
              <span className="text-sm capitalize">{data?.frequency || 'monthly'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Data Source:</span>
              <span className="text-sm">{data?.dataSource || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Owner:</span>
              <span className="text-sm">{data?.owner || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Historical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="breaches" className="space-y-4">
        <ScrollArea className="h-[400px]">
          {data?.breaches?.map((breach: any, index: number) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Breach on {new Date(breach.date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Level:</span>
                    {getStatusBadge(breach.level)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Value:</span>
                    <span className="text-sm">{breach.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Root Cause:</span>
                    <span className="text-sm">{breach.rootCause || 'Under investigation'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) || <div className="text-center text-muted-foreground">No breaches recorded</div>}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );

  const renderDefaultDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">ID:</span>
              <p className="text-sm text-muted-foreground">{entityId}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Type:</span>
              <p className="text-sm text-muted-foreground capitalize">{entityType}</p>
            </div>
          </div>
          
          {data?.description && (
            <div>
              <span className="text-sm font-medium">Description:</span>
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>
          )}
          
          <div className="text-center text-muted-foreground">
            Detailed view for {entityType} is being developed
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (entityType) {
      case 'compliance':
        return renderComplianceDetails();
      case 'kri':
        return renderKRIDetails();
      default:
        return renderDefaultDetails();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{getEntityTitle()}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
