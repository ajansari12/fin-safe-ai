
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Database, GitBranch, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  dataOrchestrationService, 
  DataLineage, 
  DataQualityMetrics, 
  SyncEvent, 
  DataValidationRule 
} from '@/services/data-orchestration-service';

interface DataOrchestrationManagerProps {
  orgId: string;
}

const DataOrchestrationManager: React.FC<DataOrchestrationManagerProps> = ({ orgId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dataLineage, setDataLineage] = useState<DataLineage[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetrics[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [validationRules, setValidationRules] = useState<DataValidationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      loadOrchestrationData();
    }
  }, [orgId]);

  const loadOrchestrationData = async () => {
    try {
      setLoading(true);
      const [lineageData, metricsData, eventsData, rulesData] = await Promise.all([
        dataOrchestrationService.getDataLineage(orgId),
        dataOrchestrationService.getDataQualityMetrics(orgId),
        dataOrchestrationService.getSyncEvents(orgId),
        dataOrchestrationService.getValidationRules(orgId)
      ]);

      setDataLineage(lineageData);
      setQualityMetrics(metricsData);
      setSyncEvents(eventsData);
      setValidationRules(rulesData);
    } catch (error) {
      console.error('Error loading orchestration data:', error);
      toast({
        title: "Error",
        description: "Failed to load data orchestration information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'default';
      case 'pending':
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'conflict':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleResolveConflict = async (lineageId: string) => {
    try {
      await dataOrchestrationService.resolveDataConflict(lineageId, user?.id || '', {
        resolved_by_user: true,
        resolution_method: 'manual'
      });
      
      toast({
        title: "Success",
        description: "Data conflict resolved successfully"
      });
      
      await loadOrchestrationData();
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Error",
        description: "Failed to resolve data conflict",
        variant: "destructive"
      });
    }
  };

  const handleRetrySync = async (eventId: string) => {
    try {
      await dataOrchestrationService.updateSyncEventStatus(eventId, 'pending');
      
      toast({
        title: "Success",
        description: "Sync event queued for retry"
      });
      
      await loadOrchestrationData();
    } catch (error) {
      console.error('Error retrying sync:', error);
      toast({
        title: "Error",
        description: "Failed to retry sync event",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading data orchestration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Orchestration</h2>
          <p className="text-muted-foreground">
            Monitor and manage cross-module data synchronization and quality
          </p>
        </div>
        <Button onClick={loadOrchestrationData} variant="outline">
          <Database className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Lineage Records</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataLineage.length}</div>
            <p className="text-xs text-muted-foreground">
              {dataLineage.filter(l => l.sync_status === 'conflict').length} conflicts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityMetrics.length > 0 
                ? Math.round(qualityMetrics.reduce((sum, m) => sum + m.quality_score, 0) / qualityMetrics.length)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              {qualityMetrics.length} records analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Events</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {syncEvents.filter(e => e.sync_status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Rules</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {validationRules.filter(r => r.is_active).length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lineage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lineage">Data Lineage</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="sync">Sync Events</TabsTrigger>
          <TabsTrigger value="validation">Validation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Lineage Tracking</CardTitle>
              <CardDescription>
                Track data flow and transformations across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataLineage.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No data lineage records</h3>
                  <p className="text-muted-foreground">
                    Data lineage will be tracked automatically as data flows between modules
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dataLineage.map((lineage) => (
                    <div key={lineage.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {lineage.source_table} → {lineage.target_table}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Operation: {lineage.operation_type}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getStatusBadgeVariant(lineage.sync_status)}>
                              {lineage.sync_status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(lineage.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {lineage.sync_status === 'conflict' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveConflict(lineage.id)}
                          >
                            Resolve Conflict
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Metrics</CardTitle>
              <CardDescription>
                Monitor data quality across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qualityMetrics.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No quality metrics available</h3>
                  <p className="text-muted-foreground">
                    Quality metrics will be generated as data is validated
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qualityMetrics.map((metric) => (
                    <div key={metric.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{metric.table_name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Overall</p>
                              <p className="font-medium">{metric.quality_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Completeness</p>
                              <p className="font-medium">{metric.completeness_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Accuracy</p>
                              <p className="font-medium">{metric.accuracy_score}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Consistency</p>
                              <p className="font-medium">{metric.consistency_score}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Events</CardTitle>
              <CardDescription>
                Monitor cross-module data synchronization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No sync events</h3>
                  <p className="text-muted-foreground">
                    Synchronization events will appear here as data changes occur
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {syncEvents.slice(0, 10).map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {event.source_module} → {event.target_modules.join(', ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {event.entity_type} | {event.event_type}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getStatusBadgeVariant(event.sync_status)}>
                              {event.sync_status}
                            </Badge>
                            {event.retry_count > 0 && (
                              <Badge variant="outline">
                                Retry {event.retry_count}/{event.max_retries}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {event.sync_status === 'failed' && event.retry_count < event.max_retries && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetrySync(event.id)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation Rules</CardTitle>
              <CardDescription>
                Manage data validation rules across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationRules.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No validation rules</h3>
                  <p className="text-muted-foreground">
                    Create validation rules to ensure data quality across modules
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{rule.rule_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Type: {rule.rule_type} | Tables: {rule.target_tables.join(', ')}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getSeverityBadgeVariant(rule.severity)}>
                              {rule.severity}
                            </Badge>
                            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {rule.error_message && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {rule.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataOrchestrationManager;
