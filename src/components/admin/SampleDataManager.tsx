import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Trash2, BarChart3, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { sampleDataService, type SampleDataResults } from '@/services/sample-data-service';
import { useToast } from '@/hooks/use-toast';

const SampleDataManager: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState<SampleDataResults | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const statsData = await sampleDataService.getSampleDataStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load data statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      // Use extended parameters for comprehensive sample data
      const result = await sampleDataService.generateExtendedSampleData({
        kriLogsMonths: 6,
        vendorCount: 30,
        incidentCount: 20,
        governanceCount: 60,
        includeFailedSLA: true,
        mixedSeverity: true
      });
      setLastResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Sample data generated successfully",
        });
        await loadStats(); // Refresh stats
      } else {
        toast({
          title: "Warning",
          description: "Sample data generation completed with some issues",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: "Error",
        description: "Failed to generate sample data",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all sample data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsClearing(true);
      await sampleDataService.clearSampleData();
      toast({
        title: "Success",
        description: "Sample data cleared successfully",
      });
      await loadStats(); // Refresh stats
      setLastResult(null);
    } catch (error) {
      console.error('Error clearing sample data:', error);
      toast({
        title: "Error",
        description: "Failed to clear sample data",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const getTotalRecords = () => {
    return Object.values(stats).reduce((sum, count) => sum + count, 0);
  };

  const getTableDisplayName = (table: string) => {
    const names = {
      organizations: 'Organizations',
      profiles: 'User Profiles',
      incident_logs: 'Incident Logs',
      controls: 'Controls',
      third_party_profiles: 'Vendor Profiles',
      vendor_contracts: 'Vendor Contracts',
      continuity_plans: 'Continuity Plans',
      governance_frameworks: 'Governance Frameworks',
      governance_policies: 'Governance Policies'
    };
    return names[table as keyof typeof names] || table;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sample Data Manager</h2>
          <p className="text-muted-foreground">
            Generate comprehensive sample data for testing and demonstrations
          </p>
        </div>
        <Button
          onClick={loadStats}
          variant="outline"
          size="sm"
          disabled={isLoadingStats}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{getTotalRecords()}</p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.organizations || 0}</p>
                <p className="text-xs text-muted-foreground">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.profiles || 0}</p>
                <p className="text-xs text-muted-foreground">User Profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{Object.keys(stats).length}</p>
                <p className="text-xs text-muted-foreground">Data Tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGenerateData}
              disabled={isGenerating || isClearing}
              className="flex-1"
            >
              <Database className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Sample Data'}
            </Button>
            
            <Button
              onClick={handleClearData}
              variant="destructive"
              disabled={isGenerating || isClearing || getTotalRecords() === 0}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating sample data...</span>
                <span>This may take a few minutes</span>
              </div>
              <Progress value={33} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats).map(([table, count]) => (
              <div key={table} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{getTableDisplayName(table)}</span>
                <Badge variant={count > 0 ? "default" : "secondary"}>
                  {count.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Generation Result */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              Last Generation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {lastResult.message}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(lastResult.results).map(([key, value]) => {
                if (key === 'errors') return null;
                return (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-primary">{value}</div>
                    <div className="text-xs text-muted-foreground">
                      {getTableDisplayName(key)}
                    </div>
                  </div>
                );
              })}
            </div>

            {lastResult.results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{lastResult.results.errors.length} errors occurred:</strong>
                  <ul className="mt-2 ml-4 list-disc">
                    {lastResult.results.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {lastResult.results.errors.length > 5 && (
                      <li className="text-sm">... and {lastResult.results.errors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SampleDataManager;