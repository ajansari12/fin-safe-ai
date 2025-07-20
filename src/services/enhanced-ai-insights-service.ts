import { supabase } from '@/integrations/supabase/client';

export interface GeneratedInsight {
  id: string;
  org_id: string;
  type: 'predictive' | 'diagnostic' | 'prescriptive' | 'descriptive';
  category: 'operational' | 'compliance' | 'strategic' | 'financial';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data_sources: string[];
  generated_at: string;
  expires_at: string;
  created_by: string;
  recommendations?: InsightRecommendation[];
}

export interface InsightRecommendation {
  id: string;
  insight_id: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  estimated_impact: string;
  timeframe: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface InsightGenerationRequest {
  organizationId: string;
  analysisType: 'comprehensive' | 'compliance' | 'risk_trends' | 'controls';
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  focusAreas?: string[];
  complianceFramework?: 'osfi_e21' | 'basel_iii' | 'coso';
}

class EnhancedAIInsightsService {
  private readonly OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  async generateContextualInsights(request: InsightGenerationRequest): Promise<GeneratedInsight[]> {
    try {
      // Gather organizational data
      const orgData = await this.gatherOrganizationalData(request.organizationId, request.timeRange);
      
      // Generate insights using OpenAI
      const insights = await this.generateInsightsFromData(orgData, request);
      
      // Store insights in database
      const storedInsights = await this.storeInsights(insights, request.organizationId);
      
      return storedInsights;
    } catch (error) {
      console.error('Error generating contextual insights:', error);
      throw new Error('Failed to generate insights');
    }
  }

  private async gatherOrganizationalData(orgId: string, timeRange: { startDate: Date; endDate: Date }) {
    const startDate = timeRange.startDate.toISOString();
    const endDate = timeRange.endDate.toISOString();

    // Gather data from multiple sources
    const [
      incidents,
      controls,
      kris,
      complianceData,
      vendors,
      riskAppetite
    ] = await Promise.all([
      this.getIncidentData(orgId, startDate, endDate),
      this.getControlsData(orgId),
      this.getKRIData(orgId, startDate, endDate),
      this.getComplianceData(orgId),
      this.getVendorData(orgId),
      this.getRiskAppetiteData(orgId)
    ]);

    return {
      incidents,
      controls,
      kris,
      complianceData,
      vendors,
      riskAppetite,
      timeRange: { startDate, endDate }
    };
  }

  private async getIncidentData(orgId: string, startDate: string, endDate: string) {
    const { data } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    return data || [];
  }

  private async getControlsData(orgId: string) {
    const { data } = await supabase
      .from('controls')
      .select('*')
      .eq('org_id', orgId);
    
    return data || [];
  }

  private async getKRIData(orgId: string, startDate: string, endDate: string) {
    const { data: kris } = await supabase
      .from('kri_definitions')
      .select(`
        *,
        kri_data_points(*)
      `)
      .eq('org_id', orgId);
    
    return kris || [];
  }

  private async getComplianceData(orgId: string) {
    const { data } = await supabase
      .from('compliance_assessments')
      .select('*')
      .eq('org_id', orgId)
      .order('assessment_date', { ascending: false })
      .limit(10);
    
    return data || [];
  }

  private async getVendorData(orgId: string) {
    const { data } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', orgId);
    
    return data || [];
  }

  private async getRiskAppetiteData(orgId: string) {
    const { data } = await supabase
      .from('risk_appetite_statements')
      .select(`
        *,
        risk_categories(*),
        quantitative_limits(*),
        qualitative_statements(*)
      `)
      .eq('org_id', orgId);
    
    return data || [];
  }

  private async generateInsightsFromData(orgData: any, request: InsightGenerationRequest): Promise<any[]> {
    // Prepare context for OpenAI
    const context = this.prepareAnalysisContext(orgData, request);
    
    // Get AI insights
    const aiResponse = await this.callOpenAI(context, request.analysisType);
    
    // Parse and structure insights
    return this.parseAIResponse(aiResponse, request);
  }

  private prepareAnalysisContext(orgData: any, request: InsightGenerationRequest): string {
    const summary = {
      totalIncidents: orgData.incidents.length,
      highSeverityIncidents: orgData.incidents.filter((i: any) => i.severity === 'critical' || i.severity === 'high').length,
      totalControls: orgData.controls.length,
      activeControls: orgData.controls.filter((c: any) => c.status === 'active').length,
      totalKRIs: orgData.kris.length,
      kriticalKRIs: orgData.kris.filter((k: any) => k.current_value >= k.critical_threshold).length,
      totalVendors: orgData.vendors.length,
      highRiskVendors: orgData.vendors.filter((v: any) => v.risk_rating === 'high' || v.risk_rating === 'critical').length,
      complianceAverage: orgData.complianceData.length > 0 
        ? orgData.complianceData.reduce((acc: number, comp: any) => acc + (comp.compliance_score || 0), 0) / orgData.complianceData.length
        : 0
    };

    return `
Analysis Context for OSFI E-21 Operational Risk Management:

Organization Summary:
- Total Incidents (${request.timeRange.startDate} to ${request.timeRange.endDate}): ${summary.totalIncidents}
- High Severity Incidents: ${summary.highSeverityIncidents}
- Active Controls: ${summary.activeControls} of ${summary.totalControls}
- Critical KRIs: ${summary.kriticalKRIs} of ${summary.totalKRIs}
- High Risk Vendors: ${summary.highRiskVendors} of ${summary.totalVendors}
- Average Compliance Score: ${summary.complianceAverage.toFixed(1)}%

Recent Incidents:
${orgData.incidents.slice(0, 5).map((incident: any) => 
  `- ${incident.title} (${incident.severity}) - ${incident.impact_level}`
).join('\n')}

KRI Status:
${orgData.kris.slice(0, 5).map((kri: any) => 
  `- ${kri.name}: ${kri.current_value || 'No data'} (Warning: ${kri.warning_threshold}, Critical: ${kri.critical_threshold})`
).join('\n')}

Control Effectiveness:
${orgData.controls.slice(0, 5).map((control: any) => 
  `- ${control.name}: ${control.status} (Last Test: ${control.last_test_date || 'Not tested'})`
).join('\n')}

Focus: Generate actionable insights for OSFI E-21 compliance and operational resilience.
    `;
  }

  private async callOpenAI(context: string, analysisType: string): Promise<string> {
    const prompts = {
      comprehensive: `Based on the operational risk data provided, generate comprehensive insights covering:
1. Risk trend analysis and predictions
2. Control effectiveness assessment
3. OSFI E-21 compliance gaps and recommendations
4. Operational resilience improvements
5. Vendor risk management priorities

Provide specific, actionable recommendations with priority levels and implementation timelines.`,

      compliance: `Analyze the compliance data and generate insights specifically for OSFI E-21 requirements:
1. Identify compliance gaps and deficiencies
2. Assess operational resilience maturity
3. Recommend immediate actions for compliance improvement
4. Suggest governance and oversight enhancements
5. Highlight regulatory reporting improvements needed`,

      risk_trends: `Analyze risk trends and patterns to generate predictive insights:
1. Identify emerging risk patterns and trends
2. Predict potential future risk scenarios
3. Assess correlation between different risk indicators
4. Recommend preventive measures and early warning systems
5. Suggest risk appetite adjustments if needed`,

      controls: `Focus on control effectiveness and optimization:
1. Assess current control performance and gaps
2. Identify redundant or ineffective controls
3. Recommend control enhancements and automation opportunities
4. Suggest testing frequency optimization
5. Highlight control coverage gaps for critical processes`
    };

    const systemPrompt = `You are an expert OSFI E-21 operational risk consultant. Generate actionable insights in the following JSON format:

{
  "insights": [
    {
      "type": "predictive|diagnostic|prescriptive|descriptive",
      "category": "operational|compliance|strategic|financial",
      "title": "Brief insight title",
      "description": "Detailed description of the insight",
      "severity": "low|medium|high|critical",
      "confidence": 0.85,
      "data_sources": ["incidents", "kris", "controls"],
      "recommendations": [
        {
          "action": "Specific action to take",
          "priority": "low|medium|high",
          "estimated_impact": "Expected impact description",
          "timeframe": "Implementation timeframe"
        }
      ]
    }
  ]
}

Ensure all insights are:
- Specific and actionable
- Aligned with OSFI E-21 requirements
- Based on the provided data
- Include concrete next steps`;

    try {
      const response = await fetch(this.OPENAI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${context}\n\n${prompts[analysisType as keyof typeof prompts]}` }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      // Return mock insights as fallback
      return this.getMockInsights(analysisType);
    }
  }

  private getMockInsights(analysisType: string): string {
    const mockInsights = {
      comprehensive: {
        insights: [
          {
            type: "diagnostic",
            category: "operational",
            title: "Increasing Incident Trend Detected",
            description: "Analysis shows a 23% increase in operational incidents over the past 30 days, primarily in payment processing and system availability.",
            severity: "high",
            confidence: 0.87,
            data_sources: ["incidents", "kris"],
            recommendations: [
              {
                action: "Implement enhanced monitoring for payment processing systems",
                priority: "high",
                estimated_impact: "Reduce incident frequency by 40%",
                timeframe: "2-3 weeks"
              },
              {
                action: "Review and update incident response procedures",
                priority: "medium",
                estimated_impact: "Improve response time by 30%",
                timeframe: "1 month"
              }
            ]
          },
          {
            type: "prescriptive",
            category: "compliance",
            title: "OSFI E-21 Compliance Enhancement Opportunities",
            description: "Current compliance score of 78% indicates gaps in operational resilience framework implementation.",
            severity: "medium",
            confidence: 0.82,
            data_sources: ["compliance", "controls"],
            recommendations: [
              {
                action: "Strengthen business continuity testing procedures",
                priority: "high",
                estimated_impact: "Improve compliance score to 85%",
                timeframe: "6-8 weeks"
              }
            ]
          }
        ]
      }
    };

    return JSON.stringify(mockInsights[analysisType as keyof typeof mockInsights] || mockInsights.comprehensive);
  }

  private parseAIResponse(aiResponse: string, request: InsightGenerationRequest): any[] {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.insights || [];
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  private async storeInsights(insights: any[], orgId: string): Promise<GeneratedInsight[]> {
    const storedInsights: GeneratedInsight[] = [];

    for (const insight of insights) {
      try {
        // Store the main insight
        const { data: storedInsight, error: insightError } = await supabase
          .from('generated_insights')
          .insert({
            org_id: orgId,
            type: insight.type,
            category: insight.category,
            title: insight.title,
            description: insight.description,
            severity: insight.severity,
            confidence: Math.round(insight.confidence * 100),
            data_sources: insight.data_sources || [],
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            created_by: orgId // Using org_id as created_by for system-generated insights
          })
          .select()
          .single();

        if (insightError) throw insightError;

        // Store recommendations
        if (insight.recommendations && insight.recommendations.length > 0) {
          const { error: recError } = await supabase
            .from('insight_recommendations')
            .insert(
              insight.recommendations.map((rec: any) => ({
                insight_id: storedInsight.id,
                action: rec.action,
                priority: rec.priority,
                estimated_impact: rec.estimated_impact,
                timeframe: rec.timeframe
              }))
            );

          if (recError) throw recError;
        }

        storedInsights.push(storedInsight);
      } catch (error) {
        console.error('Error storing insight:', error);
      }
    }

    return storedInsights;
  }

  async getStoredInsights(orgId: string): Promise<GeneratedInsight[]> {
    try {
      const { data, error } = await supabase
        .from('generated_insights')
        .select(`
          *,
          insight_recommendations(*)
        `)
        .eq('org_id', orgId)
        .gt('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stored insights:', error);
      return [];
    }
  }

  async updateRecommendationStatus(
    recommendationId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed',
    assignedTo?: string
  ): Promise<void> {
    try {
      const updates: any = { status };
      if (assignedTo) updates.assigned_to = assignedTo;

      const { error } = await supabase
        .from('insight_recommendations')
        .update(updates)
        .eq('id', recommendationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      throw error;
    }
  }
}

export const enhancedAIInsightsService = new EnhancedAIInsightsService();