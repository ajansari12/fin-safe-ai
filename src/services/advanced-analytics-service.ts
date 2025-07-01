
import { supabase } from "@/integrations/supabase/client";

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'risk_prediction' | 'anomaly_detection' | 'correlation_analysis' | 'scenario_modeling';
  algorithm: string;
  accuracy: number;
  last_trained: string;
  features: string[];
  predictions: any[];
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  generated_at: string;
}

export interface QueryResult {
  data: any[];
  metadata: {
    total_rows: number;
    execution_time: number;
    columns: string[];
  };
}

class AdvancedAnalyticsService {
  // Predictive Analytics
  async trainRiskPredictionModel(orgId: string, modelConfig: any): Promise<PredictiveModel> {
    try {
      // Get historical risk data for training
      const { data: riskData } = await supabase
        .from('risk_intelligence')
        .select('*')
        .eq('org_id', orgId)
        .order('collected_at', { ascending: false })
        .limit(1000);

      const { data: incidentData } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .order('reported_at', { ascending: false })
        .limit(500);

      // Simulate model training (in production, this would use actual ML algorithms)
      const features = this.extractFeatures(riskData || [], incidentData || []);
      const model = this.trainModel(features, modelConfig);

      return {
        id: `model-${Date.now()}`,
        name: modelConfig.name || 'Risk Prediction Model',
        type: 'risk_prediction',
        algorithm: modelConfig.algorithm || 'random_forest',
        accuracy: Math.random() * 0.3 + 0.7, // Simulate 70-100% accuracy
        last_trained: new Date().toISOString(),
        features: ['risk_score', 'incident_frequency', 'vendor_rating', 'compliance_score'],
        predictions: model.predictions
      };
    } catch (error) {
      console.error('Error training prediction model:', error);
      throw error;
    }
  }

  async detectAnomalies(orgId: string, dataType: string): Promise<AnalyticsInsight[]> {
    try {
      let data: any[] = [];
      
      switch (dataType) {
        case 'kri_values':
          const { data: kriData } = await supabase
            .from('kri_logs')
            .select(`
              *,
              kri_definitions!inner(
                name,
                threshold_id,
                risk_thresholds!inner(
                  statement_id,
                  risk_appetite_statements!inner(org_id)
                )
              )
            `)
            .eq('kri_definitions.risk_thresholds.risk_appetite_statements.org_id', orgId)
            .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
          data = kriData || [];
          break;

        case 'incident_patterns':
          const { data: incidentData } = await supabase
            .from('incident_logs')
            .select('*')
            .eq('org_id', orgId)
            .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          data = incidentData || [];
          break;
      }

      return this.analyzeAnomalies(data, dataType);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  async performCorrelationAnalysis(orgId: string): Promise<AnalyticsInsight[]> {
    try {
      // Get data from multiple sources
      const [riskData, incidentData, kriData] = await Promise.all([
        supabase.from('risk_intelligence').select('*').eq('org_id', orgId).limit(100),
        supabase.from('incident_logs').select('*').eq('org_id', orgId).limit(100),
        supabase.from('kri_logs').select(`
          *,
          kri_definitions!inner(
            name,
            risk_thresholds!inner(
              risk_appetite_statements!inner(org_id)
            )
          )
        `).eq('kri_definitions.risk_thresholds.risk_appetite_statements.org_id', orgId).limit(100)
      ]);

      return this.calculateCorrelations(
        riskData.data || [],
        incidentData.data || [],
        kriData.data || []
      );
    } catch (error) {
      console.error('Error performing correlation analysis:', error);
      return [];
    }
  }

  // Natural Language Query Processing
  async processNaturalLanguageQuery(query: string, orgId: string): Promise<QueryResult> {
    try {
      // Simple NLP processing (in production, would use advanced NLP models)
      const processedQuery = this.parseNaturalLanguageQuery(query);
      const sqlQuery = this.generateSQLFromNLP(processedQuery, orgId);
      
      // Execute the generated query
      const startTime = Date.now();
      const result = await this.executeQuery(sqlQuery);
      const executionTime = Date.now() - startTime;

      return {
        data: result.data || [],
        metadata: {
          total_rows: result.data?.length || 0,
          execution_time: executionTime,
          columns: result.data?.[0] ? Object.keys(result.data[0]) : []
        }
      };
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw error;
    }
  }

  // Automated Insights Generation
  async generateAutomatedInsights(orgId: string): Promise<AnalyticsInsight[]> {
    try {
      const insights: AnalyticsInsight[] = [];

      // Trend Analysis
      const trendInsights = await this.analyzeTrends(orgId);
      insights.push(...trendInsights);

      // Risk Pattern Analysis
      const patternInsights = await this.analyzeRiskPatterns(orgId);
      insights.push(...patternInsights);

      // Performance Insights
      const performanceInsights = await this.analyzePerformance(orgId);
      insights.push(...performanceInsights);

      return insights.sort((a, b) => 
        this.getImpactScore(b.impact) - this.getImpactScore(a.impact)
      );
    } catch (error) {
      console.error('Error generating automated insights:', error);
      return [];
    }
  }

  // Monte Carlo Simulation
  async runMonteCarloSimulation(
    scenarios: any[],
    iterations: number = 1000
  ): Promise<{
    results: any[];
    statistics: {
      mean: number;
      median: number;
      standardDeviation: number;
      percentiles: { [key: string]: number };
    };
  }> {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const simulationResult = this.runSingleSimulation(scenarios);
      results.push(simulationResult);
    }

    const statistics = this.calculateStatistics(results);

    return { results, statistics };
  }

  // Helper Methods
  private extractFeatures(riskData: any[], incidentData: any[]): any[] {
    return riskData.map(risk => ({
      risk_score: risk.risk_score || 0,
      confidence_score: risk.confidence_score || 0,
      data_freshness: risk.data_freshness_hours || 0,
      incident_count: incidentData.filter(i => 
        new Date(i.reported_at).getTime() >= new Date(risk.collected_at).getTime() - 7 * 24 * 60 * 60 * 1000
      ).length
    }));
  }

  private trainModel(features: any[], config: any): any {
    // Simulate model training
    const predictions = features.map(feature => ({
      predicted_risk: Math.min(100, feature.risk_score * (1 + Math.random() * 0.2)),
      confidence: Math.random() * 0.3 + 0.7,
      factors: ['risk_score', 'incident_count']
    }));

    return { predictions };
  }

  private analyzeAnomalies(data: any[], dataType: string): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    if (dataType === 'kri_values' && data.length > 0) {
      // Detect unusual KRI spikes
      const values = data.map(d => d.actual_value).filter(v => v != null);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      
      const anomalies = data.filter(d => 
        d.actual_value && Math.abs(d.actual_value - mean) > 2 * stdDev
      );

      if (anomalies.length > 0) {
        insights.push({
          id: `anomaly-${Date.now()}`,
          type: 'anomaly',
          title: 'Unusual KRI Values Detected',
          description: `${anomalies.length} KRI measurements show values significantly outside normal ranges`,
          confidence: 0.85,
          impact: anomalies.length > 3 ? 'high' : 'medium',
          data: { anomalies, threshold: 2 * stdDev },
          generated_at: new Date().toISOString()
        });
      }
    }

    return insights;
  }

  private calculateCorrelations(riskData: any[], incidentData: any[], kriData: any[]): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Analyze correlation between risk scores and incident frequency
    if (riskData.length > 0 && incidentData.length > 0) {
      const correlation = this.pearsonCorrelation(
        riskData.map(r => r.risk_score || 0),
        riskData.map(r => {
          const riskDate = new Date(r.collected_at);
          return incidentData.filter(i => 
            Math.abs(new Date(i.reported_at).getTime() - riskDate.getTime()) < 7 * 24 * 60 * 60 * 1000
          ).length;
        })
      );

      if (Math.abs(correlation) > 0.5) {
        insights.push({
          id: `correlation-${Date.now()}`,
          type: 'correlation',
          title: 'Risk Score and Incident Frequency Correlation',
          description: `${correlation > 0 ? 'Strong positive' : 'Strong negative'} correlation (${correlation.toFixed(2)}) found between risk scores and incident frequency`,
          confidence: Math.abs(correlation),
          impact: Math.abs(correlation) > 0.7 ? 'high' : 'medium',
          data: { correlation, sample_size: riskData.length },
          generated_at: new Date().toISOString()
        });
      }
    }

    return insights;
  }

  private parseNaturalLanguageQuery(query: string): any {
    const keywords = {
      metrics: ['incidents', 'risks', 'kri', 'controls', 'vendors'],
      timeframes: ['today', 'week', 'month', 'quarter', 'year'],
      aggregations: ['count', 'sum', 'average', 'maximum', 'minimum'],
      filters: ['high', 'critical', 'open', 'resolved', 'active']
    };

    const parsed = {
      metric: null,
      timeframe: null,
      aggregation: null,
      filters: []
    };

    const queryLower = query.toLowerCase();

    // Extract metric
    for (const metric of keywords.metrics) {
      if (queryLower.includes(metric)) {
        parsed.metric = metric;
        break;
      }
    }

    // Extract timeframe
    for (const timeframe of keywords.timeframes) {
      if (queryLower.includes(timeframe)) {
        parsed.timeframe = timeframe;
        break;
      }
    }

    // Extract aggregation
    for (const agg of keywords.aggregations) {
      if (queryLower.includes(agg)) {
        parsed.aggregation = agg;
        break;
      }
    }

    // Extract filters
    for (const filter of keywords.filters) {
      if (queryLower.includes(filter)) {
        parsed.filters.push(filter);
      }
    }

    return parsed;
  }

  private generateSQLFromNLP(parsed: any, orgId: string): string {
    // This is a simplified SQL generation - in production would be more sophisticated
    let query = '';
    
    if (parsed.metric === 'incidents') {
      query = `SELECT * FROM incident_logs WHERE org_id = '${orgId}'`;
      
      if (parsed.filters.includes('critical')) {
        query += ` AND severity = 'critical'`;
      }
      
      if (parsed.timeframe === 'month') {
        query += ` AND reported_at >= NOW() - INTERVAL '30 days'`;
      }
    }

    return query || `SELECT * FROM incident_logs WHERE org_id = '${orgId}' LIMIT 10`;
  }

  private async executeQuery(sqlQuery: string): Promise<any> {
    // In production, this would execute the actual SQL query
    // For now, return mock data based on the query type
    return {
      data: [
        { id: 1, title: 'Sample Result', value: 42 },
        { id: 2, title: 'Another Result', value: 38 }
      ]
    };
  }

  private async analyzeTrends(orgId: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Analyze incident trends
    const { data: recentIncidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: previousIncidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .lt('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const recentCount = recentIncidents?.length || 0;
    const previousCount = previousIncidents?.length || 0;
    const trend = recentCount - previousCount;

    if (Math.abs(trend) > 2) {
      insights.push({
        id: `trend-${Date.now()}`,
        type: 'trend',
        title: trend > 0 ? 'Increasing Incident Trend' : 'Decreasing Incident Trend',
        description: `Incident volume has ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend)} incidents compared to the previous month`,
        confidence: 0.9,
        impact: Math.abs(trend) > 5 ? 'high' : 'medium',
        data: { current: recentCount, previous: previousCount, change: trend },
        generated_at: new Date().toISOString()
      });
    }

    return insights;
  }

  private async analyzeRiskPatterns(orgId: string): Promise<AnalyticsInsight[]> {
    // Placeholder for risk pattern analysis
    return [];
  }

  private async analyzePerformance(orgId: string): Promise<AnalyticsInsight[]> {
    // Placeholder for performance analysis
    return [];
  }

  private getImpactScore(impact: string): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[impact as keyof typeof scores] || 0;
  }

  private runSingleSimulation(scenarios: any[]): any {
    // Simulate a single Monte Carlo iteration
    return scenarios.reduce((result, scenario) => {
      const randomFactor = Math.random();
      const scenarioResult = scenario.baseValue * (1 + (randomFactor - 0.5) * scenario.volatility);
      return result + scenarioResult;
    }, 0);
  }

  private calculateStatistics(results: number[]): any {
    const sorted = results.sort((a, b) => a - b);
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      mean,
      median,
      standardDeviation,
      percentiles: {
        '5th': sorted[Math.floor(sorted.length * 0.05)],
        '25th': sorted[Math.floor(sorted.length * 0.25)],
        '75th': sorted[Math.floor(sorted.length * 0.75)],
        '95th': sorted[Math.floor(sorted.length * 0.95)]
      }
    };
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
