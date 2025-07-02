import { supabase } from "@/integrations/supabase/client";
import { cachedFetch, performanceMonitor } from "@/lib/performance-utils";

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  data: any;
  generated_at: string;
}

export interface PredictiveMetric {
  metric: string;
  current_value: number;
  predicted_value: number;
  prediction_date: string;
  confidence_interval: [number, number];
  factors: string[];
}

export interface RealTimeAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

class AdvancedAnalyticsService {
  async generateAutomatedInsights(orgId: string): Promise<AnalyticsInsight[]> {
    return cachedFetch(`insights_${orgId}`, async () => {
      const endTiming = performanceMonitor.startTiming('generate_insights');
      
      try {
        // Get existing insights from database
        const { data: existingInsights } = await supabase
          .from('analytics_insights')
          .select('*')
          .eq('org_id', orgId)
          .gte('generated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('generated_at', { ascending: false })
          .limit(10);

        if (existingInsights && existingInsights.length > 0) {
          return existingInsights.map(insight => ({
            id: insight.id,
            type: insight.insight_type as any,
            title: insight.insight_data.title || 'Generated Insight',
            description: insight.insight_data.description || '',
            impact: insight.insight_data.impact || 'medium',
            confidence: insight.confidence_score || 0.8,
            data: insight.insight_data,
            generated_at: insight.generated_at
          }));
        }

        // Generate new insights
        const insights = await this.analyzeDataAndGenerateInsights(orgId);
        
        // Store insights in database
        for (const insight of insights) {
          await supabase.from('analytics_insights').insert({
            org_id: orgId,
            insight_type: insight.type,
            insight_data: {
              title: insight.title,
              description: insight.description,
              impact: insight.impact,
              data: insight.data
            },
            confidence_score: insight.confidence,
            generated_at: new Date().toISOString()
          });
        }

        return insights;
      } catch (error) {
        console.error('Error generating insights:', error);
        return this.getFallbackInsights();
      } finally {
        endTiming();
      }
    }, 10 * 60 * 1000); // Cache for 10 minutes
  }

  private async analyzeDataAndGenerateInsights(orgId: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Analyze incident trends
    const incidentInsights = await this.analyzeIncidentTrends(orgId);
    insights.push(...incidentInsights);

    // Analyze KRI patterns
    const kriInsights = await this.analyzeKRIPatterns(orgId);
    insights.push(...kriInsights);

    // Analyze vendor risk correlations
    const vendorInsights = await this.analyzeVendorRiskCorrelations(orgId);
    insights.push(...vendorInsights);

    return insights;
  }

  private async analyzeIncidentTrends(orgId: string): Promise<AnalyticsInsight[]> {
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!incidents || incidents.length === 0) return [];

    const insights: AnalyticsInsight[] = [];

    // Trend analysis
    const criticalIncidents = incidents.filter(i => i.severity === 'critical');
    if (criticalIncidents.length > 5) {
      insights.push({
        id: `trend_critical_${Date.now()}`,
        type: 'trend',
        title: 'Rising Critical Incidents',
        description: `${criticalIncidents.length} critical incidents in the last 30 days, indicating potential systemic issues`,
        impact: 'high',
        confidence: 0.85,
        data: { count: criticalIncidents.length, trend: 'increasing' },
        generated_at: new Date().toISOString()
      });
    }

    // Category analysis
    const categoryCount = incidents.reduce((acc, incident) => {
      const category = incident.category || 'operational';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (dominantCategory && (dominantCategory[1] as number) > incidents.length * 0.4) {
      insights.push({
        id: `correlation_category_${Date.now()}`,
        type: 'correlation',
        title: `${dominantCategory[0]} Risk Concentration`,
        description: `${Math.round(((dominantCategory[1] as number) / incidents.length) * 100)}% of incidents are ${dominantCategory[0]}-related, suggesting focused risk exposure`,
        impact: 'medium',
        confidence: 0.75,
        data: { category: dominantCategory[0], percentage: ((dominantCategory[1] as number) / incidents.length) * 100 },
        generated_at: new Date().toISOString()
      });
    }

    return insights;
  }

  private async analyzeKRIPatterns(orgId: string): Promise<AnalyticsInsight[]> {
    const { data: kriLogs } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(kri_name, warning_threshold, critical_threshold)
      `)
      .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('measurement_date', { ascending: false });

    if (!kriLogs || kriLogs.length === 0) return [];

    const insights: AnalyticsInsight[] = [];

    // Identify KRIs with consistent threshold breaches
    const breachPatterns = kriLogs
      .filter(log => log.threshold_breached)
      .reduce((acc, log) => {
        const kriName = log.kri_definitions.kri_name;
        acc[kriName] = (acc[kriName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(breachPatterns).forEach(([kriName, breachCount]) => {
      if ((breachCount as number) >= 3) {
        insights.push({
          id: `anomaly_kri_${kriName}_${Date.now()}`,
          type: 'anomaly',
          title: `Persistent KRI Breach: ${kriName}`,
          description: `${kriName} has breached thresholds ${breachCount} times in the last 30 days, indicating potential control gaps`,
          impact: (breachCount as number) >= 5 ? 'critical' : 'high',
          confidence: 0.9,
          data: { kri: kriName, breach_count: breachCount },
          generated_at: new Date().toISOString()
        });
      }
    });

    return insights;
  }

  private async analyzeVendorRiskCorrelations(orgId: string): Promise<AnalyticsInsight[]> {
    const { data: vendors } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', orgId);

    if (!vendors || vendors.length === 0) return [];

    const insights: AnalyticsInsight[] = [];

    // High-risk vendor concentration
    const highRiskVendors = vendors.filter(v => v.risk_rating === 'high');
    const criticalVendors = vendors.filter(v => v.criticality === 'critical');

    if (highRiskVendors.length > vendors.length * 0.3) {
      insights.push({
        id: `recommendation_vendor_${Date.now()}`,
        type: 'recommendation',
        title: 'High Vendor Risk Concentration',
        description: `${Math.round((highRiskVendors.length / vendors.length) * 100)}% of vendors are high-risk. Consider diversification and enhanced due diligence`,
        impact: 'medium',
        confidence: 0.8,
        data: { 
          high_risk_count: highRiskVendors.length, 
          total_vendors: vendors.length,
          percentage: (highRiskVendors.length / vendors.length) * 100
        },
        generated_at: new Date().toISOString()
      });
    }

    // Critical vendor assessments overdue
    const overdueAssessments = criticalVendors.filter(v => {
      if (!v.last_assessment_date) return true;
      const daysSinceAssessment = (Date.now() - new Date(v.last_assessment_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceAssessment > 365;
    });

    if (overdueAssessments.length > 0) {
      insights.push({
        id: `prediction_vendor_${Date.now()}`,
        type: 'prediction',
        title: 'Critical Vendor Assessment Risk',
        description: `${overdueAssessments.length} critical vendors have overdue assessments, potentially increasing operational risk`,
        impact: 'high',
        confidence: 0.85,
        data: { overdue_count: overdueAssessments.length, vendors: overdueAssessments.map(v => v.vendor_name) },
        generated_at: new Date().toISOString()
      });
    }

    return insights;
  }

  async getPredictiveMetrics(orgId: string): Promise<PredictiveMetric[]> {
    return cachedFetch(`predictive_metrics_${orgId}`, async () => {
      // Simplified predictive modeling - in production would use ML algorithms
      const metrics: PredictiveMetric[] = [];

      // Predict incident volume
      const { data: recentIncidents } = await supabase
        .from('incident_logs')
        .select('reported_at, severity')
        .eq('org_id', orgId)
        .gte('reported_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (recentIncidents && recentIncidents.length > 0) {
        const weeklyAverage = recentIncidents.length / 12; // 90 days / 7 days per week
        const trend = this.calculateTrend(recentIncidents);
        const predictedNext30Days = Math.round(weeklyAverage * 4.3 * (1 + trend));

        metrics.push({
          metric: 'Incident Volume',
          current_value: recentIncidents.filter(i => 
            new Date(i.reported_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          predicted_value: predictedNext30Days,
          prediction_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          confidence_interval: [
            Math.max(0, predictedNext30Days - 3),
            predictedNext30Days + 5
          ],
          factors: ['Historical patterns', 'Seasonal trends', 'Current risk indicators']
        });
      }

      return metrics;
    }, 15 * 60 * 1000); // Cache for 15 minutes
  }

  private calculateTrend(incidents: any[]): number {
    // Simple trend calculation - positive means increasing, negative means decreasing
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    const recentCount = incidents.filter(i => 
      new Date(i.reported_at).getTime() > thirtyDaysAgo
    ).length;

    const olderCount = incidents.filter(i => {
      const date = new Date(i.reported_at).getTime();
      return date > sixtyDaysAgo && date <= thirtyDaysAgo;
    }).length;

    if (olderCount === 0) return 0;
    return (recentCount - olderCount) / olderCount;
  }

  async getRealTimeAlerts(orgId: string): Promise<RealTimeAlert[]> {
    const alerts: RealTimeAlert[] = [];

    try {
      // Get recent KRI breaches
      const { data: kriBreaches } = await supabase
        .from('kri_logs')
        .select(`
          *,
          kri_definitions!inner(kri_name)
        `)
        .not('threshold_breached', 'is', null)
        .gte('measurement_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('measurement_date', { ascending: false })
        .limit(5);

      kriBreaches?.forEach(breach => {
        alerts.push({
          id: `kri_${breach.id}`,
          type: 'KRI Breach',
          severity: breach.threshold_breached === 'critical' ? 'critical' : 'high',
          message: `${breach.kri_definitions.kri_name} exceeded ${breach.threshold_breached} threshold`,
          source: 'KRI Monitoring',
          timestamp: new Date(breach.measurement_date).toISOString(),
          acknowledged: false
        });
      });

      // Get active incidents
      const { data: activeIncidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .neq('status', 'resolved')
        .in('severity', ['critical', 'high'])
        .order('reported_at', { ascending: false })
        .limit(3);

      activeIncidents?.forEach(incident => {
        alerts.push({
          id: `incident_${incident.id}`,
          type: 'Active Incident',
          severity: incident.severity as any,
          message: incident.title,
          source: 'Incident Management',
          timestamp: incident.reported_at,
          acknowledged: false
        });
      });

      return alerts.slice(0, 8); // Limit to 8 most recent alerts
    } catch (error) {
      console.error('Error fetching real-time alerts:', error);
      return [];
    }
  }

  private getFallbackInsights(): AnalyticsInsight[] {
    return [
      {
        id: 'fallback_1',
        type: 'recommendation',
        title: 'Regular Risk Assessment',
        description: 'Consider scheduling regular risk assessments to maintain visibility into emerging threats',
        impact: 'medium',
        confidence: 0.7,
        data: {},
        generated_at: new Date().toISOString()
      },
      {
        id: 'fallback_2',
        type: 'trend',
        title: 'Baseline Establishment',
        description: 'Continue collecting data to establish baseline metrics for predictive analytics',
        impact: 'low',
        confidence: 0.6,
        data: {},
        generated_at: new Date().toISOString()
      }
    ];
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();