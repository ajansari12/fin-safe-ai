
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bell, X, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface KRIBreach {
  id: string;
  kri_id: string;
  breach_date: string;
  breach_level: 'warning' | 'critical';
  breach_value: number;
  threshold_value: number;
  root_cause?: string;
  impact_assessment?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assigned_to?: string;
  resolved_date?: string;
}

const KRIBreachNotifications: React.FC = () => {
  const { profile } = useAuth();
  const [breaches, setBreaches] = useState<KRIBreach[]>([]);
  const [dismissedBreaches, setDismissedBreaches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load breaches on component mount
  useEffect(() => {
    if (profile?.organization_id) {
      loadBreaches();
    }
  }, [profile?.organization_id]);

  const loadBreaches = async () => {
    try {
      const { data, error } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', profile?.organization_id)
        .eq('resolution_status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedBreaches: KRIBreach[] = (data || []).map(breach => ({
        id: breach.id,
        kri_id: breach.threshold_id || '',
        breach_date: breach.breach_date,
        breach_level: breach.breach_severity === 'critical' ? 'critical' : 'warning',
        breach_value: Number(breach.actual_value),
        threshold_value: Number(breach.threshold_value),
        root_cause: breach.remediation_actions,
        impact_assessment: breach.business_impact,
        status: breach.resolution_status === 'open' ? 'open' : 'investigating',
        assigned_to: breach.escalated_to_name,
        resolved_date: breach.resolution_date,
      }));

      setBreaches(transformedBreaches);
    } catch (error) {
      console.error('Error loading KRI breaches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissBreach = (breachId: string) => {
    setDismissedBreaches(prev => [...prev, breachId]);
  };

  const handleAcknowledgeBreach = async (breachId: string) => {
    try {
      const { error } = await supabase
        .from('appetite_breach_logs')
        .update({ 
          resolution_status: 'investigating',
          escalated_at: new Date().toISOString()
        })
        .eq('id', breachId);

      if (error) throw error;
      
      setDismissedBreaches(prev => [...prev, breachId]);
      await loadBreaches(); // Refresh the list
    } catch (error) {
      console.error('Error acknowledging breach:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const openBreaches = breaches.filter(breach => 
    breach.status === 'open' && !dismissedBreaches.includes(breach.id)
  );

  if (openBreaches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Active Risk Appetite Breaches ({openBreaches.length})</h3>
      </div>

      {openBreaches.map((breach) => (
        <Alert key={breach.id} className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Risk Appetite Threshold Breach</span>
                <Badge 
                  variant="outline" 
                  className={
                    breach.breach_level === 'critical' 
                      ? 'border-red-500 text-red-700' 
                      : 'border-orange-500 text-orange-700'
                  }
                >
                  {breach.breach_level}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Actual Value:</strong> {breach.breach_value} 
                  <span className="text-muted-foreground"> (Threshold: {breach.threshold_value})</span>
                </p>
                <p>
                  <strong>Breach Date:</strong> {new Date(breach.breach_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Variance:</strong> 
                  <span className="font-semibold text-red-600 ml-1">
                    +{Math.round(((breach.breach_value - breach.threshold_value) / breach.threshold_value) * 100)}%
                  </span>
                </p>
                {breach.impact_assessment && (
                  <p><strong>Impact:</strong> {breach.impact_assessment}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAcknowledgeBreach(breach.id)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                Investigate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismissBreach(breach.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            Monitor your risk appetite breaches in real-time and ensure timely remediation.
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={loadBreaches}>
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default KRIBreachNotifications;
