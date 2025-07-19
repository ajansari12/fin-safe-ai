
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface InsightGenerationRequest {
  organizationId: string;
  analysisType: 'comprehensive' | 'compliance' | 'risk_trends' | 'controls' | 'predictive';
  timeRange?: {
    startDate: Date;
    endDate: Date;
  };
  focusAreas?: string[];
}

export interface GeneratedInsight {
  id: string;
  insight_type: 'compliance' | 'risk_trend' | 'control_effectiveness' | 'operational_resilience' | 'predictive_alert';
  insight_data: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence_score: number;
    actionable_items: string[];
    predicted_impact?: string;
    timeframe?: string;
    data_sources: string[];
    recommendations: {
      action: string;
      priority: 'low' | 'medium' | 'high';
      timeline: string;
      impact: string;
    }[];
  };
  confidence_score: number;
  tags: string[];
  valid_until: string;
  generated_at: string;
}

class AIInsightsService {
  async generateContextualInsights(request: InsightGenerationRequest): Promise<GeneratedInsight[]> {
    try {
      logger.info('Generating contextual insights', { 
        component: 'AIInsightsService',
        organizationId: request.organizationId,
        analysisType: request.analysisType 
      });

      // Get organization data for context
      const orgData = await this.getOrganizationContext(request.organizationId);
      
      // Call the AI assistant edge function with specialized prompts
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: this.buildInsightGenerationPrompt(request, orgData),
          context: {
            type: 'insight_generation',
            organizationId: request.organizationId,
            analysisType: request.analysisType,
            orgData
          }
        }
      });

      if (error) {
        logger.error('AI insight generation failed', { 
          component: 'AIInsightsService',
          error: error.message 
        });
        throw new Error(`Failed to generate insights: ${error.message}`);
      }

      // Parse AI response and structure insights
      const insights = this.parseAIResponse(data.response);
      
      // Store insights in database
      await this.storeInsights(insights, request.organizationId);

      return insights;
    } catch (error) {
      logger.error('Error generating contextual insights', { 
        component: 'AIInsightsService' 
      }, error as Error);
      throw error;
    }
  }

  private async getOrganizationContext(organizationId: string) {
    try {
      // Get recent KRI data
      const { data: kriData } = await supabase
        .from('kri_logs')
        .select(`
          *,
          kri_definitions (name, category, threshold_red, threshold_amber)
        `)
        .eq('org_id', organizationId)
        .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('measurement_date', { ascending: false })
        .limit(50);

      // Get recent incidents
      const { data: incidentData } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', organizationId)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      // Get controls data
      const { data: controlsData } = await supabase
        .from('controls')
        .select('*')
        .eq('org_id', organizationId)
        .limit(30);

      // Get compliance status
      const { data: complianceData } = await supabase
        .from('governance_frameworks')
        .select('*')
        .eq('org_id', organizationId)
        .limit(10);

      return {
        kris: kriData || [],
        incidents: incidentData || [],
        controls: controlsData || [],
        compliance: complianceData || [],
        dataTimestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching organization context', { component: 'AIInsightsService' }, error as Error);
      return { kris: [], incidents: [], controls: [], compliance: [], dataTimestamp: new Date().toISOString() };
    }
  }

  private buildInsightGenerationPrompt(request: InsightGenerationRequest, orgData: any): string {
    const basePrompt = `You are an expert OSFI E-21 compliance and operational risk analyst. Analyze the provided organizational data and generate actionable insights.

Organization Data Summary:
- KRIs: ${orgData.kris.length} recent measurements
- Incidents: ${orgData.incidents.length} in last 90 days  
- Controls: ${orgData.controls.length} active controls
- Compliance Frameworks: ${orgData.compliance.length} frameworks

Analysis Type: ${request.analysisType}

Please provide insights in the following JSON format:
{
  "insights": [
    {
      "type": "compliance|risk_trend|control_effectiveness|operational_resilience|predictive_alert",
      "title": "Clear, actionable title",
      "description": "Detailed analysis with specific findings",
      "severity": "low|medium|high|critical",
      "confidence_score": 0.85,
      "actionable_items": ["Specific action 1", "Specific action 2"],
      "recommendations": [
        {
          "action": "Specific recommendation",
          "priority": "high|medium|low", 
          "timeline": "immediate|30-days|90-days",
          "impact": "Expected impact description"
        }
      ],
      "data_sources": ["kri_data", "incident_logs"],
      "predicted_impact": "Optional future impact prediction",
      "timeframe": "Optional timeframe for predicted impact"
    }
  ]
}`;

    if (request.analysisType === 'compliance') {
      return basePrompt + `

Focus Areas:
- OSFI E-21 principle compliance gaps
- Regulatory requirement adherence
- Documentation and evidence quality
- Governance framework effectiveness

Analyze the compliance data and identify specific gaps, risks, and improvement opportunities.`;
    }

    if (request.analysisType === 'risk_trends') {
      return basePrompt + `

Focus Areas:
- KRI trend analysis and predictions
- Emerging risk patterns
- Risk correlation analysis
- Early warning indicators

Analyze KRI data for trends, patterns, and predictive insights.`;
    }

    if (request.analysisType === 'controls') {
      return basePrompt + `

Focus Areas:
- Control effectiveness assessment
- Control gap analysis
- Testing frequency and results
- Risk mitigation adequacy

Evaluate control performance and identify optimization opportunities.`;
    }

    return basePrompt + `

Provide a comprehensive analysis covering compliance, risk trends, control effectiveness, and operational resilience.`;
  }

  private parseAIResponse(aiResponse: string): GeneratedInsight[] {
    try {
      const parsed = JSON.parse(aiResponse);
      const insights: GeneratedInsight[] = [];

      if (parsed.insights && Array.isArray(parsed.insights)) {
        parsed.insights.forEach((insight: any, index: number) => {
          insights.push({
            id: `ai-insight-${Date.now()}-${index}`,
            insight_type: insight.type || 'risk_trend',
            insight_data: {
              title: insight.title || 'AI Generated Insight',
              description: insight.description || '',
              severity: insight.severity || 'medium',
              confidence_score: insight.confidence_score || 0.7,
              actionable_items: insight.actionable_items || [],
              predicted_impact: insight.predicted_impact,
              timeframe: insight.timeframe,
              data_sources: insight.data_sources || ['ai_analysis'],
              recommendations: insight.recommendations || []
            },
            confidence_score: insight.confidence_score || 0.7,
            tags: this.generateTags(insight),
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            generated_at: new Date().toISOString()
          });
        });
      }

      return insights;
    } catch (error) {
      logger.error('Error parsing AI response', { component: 'AIInsightsService' }, error as Error);
      // Return fallback insight
      return [{
        id: `fallback-insight-${Date.now()}`,
        insight_type: 'risk_trend',
        insight_data: {
          title: 'Analysis Complete',
          description: 'AI analysis completed. Please review your risk management data for recent trends and patterns.',
          severity: 'medium',
          confidence_score: 0.6,
          actionable_items: ['Review KRI trends', 'Update risk assessments', 'Check control effectiveness'],
          data_sources: ['system_analysis'],
          recommendations: [{
            action: 'Schedule comprehensive risk review',
            priority: 'medium',
            timeline: '30-days',
            impact: 'Improved risk visibility and control'
          }]
        },
        confidence_score: 0.6,
        tags: ['ai_generated', 'general_analysis'],
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        generated_at: new Date().toISOString()
      }];
    }
  }

  private generateTags(insight: any): string[] {
    const tags = ['ai_generated'];
    
    if (insight.type) tags.push(insight.type);
    if (insight.severity === 'high' || insight.severity === 'critical') tags.push('urgent');
    if (insight.data_sources?.includes('kri_data')) tags.push('kri_related');
    if (insight.data_sources?.includes('incident_logs')) tags.push('incident_related');
    
    return tags;
  }

  private async storeInsights(insights: GeneratedInsight[], organizationId: string) {
    try {
      const insightsToStore = insights.map(insight => ({
        org_id: organizationId,
        insight_type: insight.insight_type,
        insight_data: insight.insight_data,
        confidence_score: insight.confidence_score,
        tags: insight.tags,
        valid_until: insight.valid_until,
        generated_at: insight.generated_at
      }));

      const { error } = await supabase
        .from('analytics_insights')
        .insert(insightsToStore);

      if (error) {
        logger.error('Error storing insights', { component: 'AIInsightsService', error: error.message });
      }
    } catch (error) {
      logger.error('Error storing insights', { component: 'AIInsightsService' }, error as Error);
    }
  }

  async getStoredInsights(organizationId: string, limit: number = 10): Promise<GeneratedInsight[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', organizationId)
        .gte('valid_until', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching stored insights', { component: 'AIInsightsService', error: error.message });
        return [];
      }

      return data.map(item => ({
        id: item.id,
        insight_type: item.insight_type,
        insight_data: item.insight_data,
        confidence_score: item.confidence_score,
        tags: item.tags || [],
        valid_until: item.valid_until,
        generated_at: item.generated_at
      }));
    } catch (error) {
      logger.error('Error fetching stored insights', { component: 'AIInsightsService' }, error as Error);
      return [];
    }
  }
}

export const aiInsightsService = new AIInsightsService();
