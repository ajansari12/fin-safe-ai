
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile, getUserOrganization } from "@/lib/supabase-utils";
import { predictiveRiskModelingService } from "./predictive/predictive-risk-modeling-service";
import { intelligentRiskAssessmentService } from "./predictive/intelligent-risk-assessment-service";
import { recommendationsEngineService } from "./predictive/recommendations-engine-service";
import { naturalLanguageProcessingService } from "./nlp/natural-language-processing-service";

export interface EnhancedAIResponse {
  response: string;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
  visualizations?: any[];
  followUpQuestions: string[];
  sources: string[];
}

interface ProcessingContext {
  module?: string;
  orgId: string;
  orgSector?: string;
  userRole?: string;
}

class EnhancedAIAssistantService {
  async processEnhancedMessage(
    message: string,
    context: ProcessingContext
  ): Promise<string> {
    try {
      // Analyze the message using NLP
      const messageAnalysis = await naturalLanguageProcessingService.classifyDocument(message);
      
      // Route to appropriate processing based on message type
      if (this.isPredictiveAnalysisRequest(message)) {
        return await this.handlePredictiveAnalysis(message, context);
      }
      
      if (this.isRiskAssessmentRequest(message)) {
        return await this.handleRiskAssessment(message, context);
      }
      
      if (this.isRecommendationRequest(message)) {
        return await this.handleRecommendations(message, context);
      }
      
      if (this.isDocumentAnalysisRequest(message)) {
        return await this.handleDocumentAnalysis(message, context);
      }
      
      if (this.isAnomalyDetectionRequest(message)) {
        return await this.handleAnomalyDetection(message, context);
      }
      
      // Default to general AI assistance
      return await this.handleGeneralAssistance(message, context);
      
    } catch (error) {
      console.error('Error processing enhanced message:', error);
      return "I apologize, but I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.";
    }
  }

  private isPredictiveAnalysisRequest(message: string): boolean {
    const keywords = ['predict', 'forecast', 'trend', 'future', 'probability', 'likelihood', 'projection'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isRiskAssessmentRequest(message: string): boolean {
    const keywords = ['assess', 'evaluation', 'score', 'rating', 'risk level', 'severity'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isRecommendationRequest(message: string): boolean {
    const keywords = ['recommend', 'suggest', 'advice', 'best practice', 'should', 'optimize'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isDocumentAnalysisRequest(message: string): boolean {
    const keywords = ['analyze', 'review', 'document', 'policy', 'procedure', 'extract', 'summarize'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAnomalyDetectionRequest(message: string): boolean {
    const keywords = ['anomaly', 'unusual', 'outlier', 'abnormal', 'irregular', 'deviation'];
    return keywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private async handlePredictiveAnalysis(message: string, context: ProcessingContext): Promise<string> {
    try {
      const [predictions, correlations] = await Promise.all([
        predictiveRiskModelingService.generateRiskPredictions(context.orgId),
        predictiveRiskModelingService.analyzeRiskCorrelations(context.orgId)
      ]);

      let response = "**🔮 Predictive Risk Analysis:**\n\n";
      
      if (predictions.length > 0) {
        response += "**Risk Predictions:**\n";
        predictions.slice(0, 3).forEach(pred => {
          response += `• **${pred.riskName}:** Current score ${pred.currentScore} → Predicted ${pred.predictedScore} (${pred.timeHorizon})\n`;
          response += `  Confidence: ${(pred.confidenceInterval.lower)}-${(pred.confidenceInterval.upper)}\n`;
          if (pred.recommendedActions.length > 0) {
            response += `  Recommended: ${pred.recommendedActions[0]}\n`;
          }
          response += "\n";
        });
      }

      if (correlations.length > 0) {
        response += "**Risk Correlations:**\n";
        correlations.slice(0, 2).forEach(corr => {
          response += `• **${corr.primaryRisk}** shows ${corr.networkEffect > 0.7 ? 'strong' : 'moderate'} correlation with:\n`;
          corr.correlatedRisks.slice(0, 2).forEach(related => {
            response += `  - ${related.riskName} (${Math.round(related.correlationStrength * 100)}% correlation)\n`;
          });
          response += "\n";
        });
      }

      response += "**Key Insights:**\n";
      response += "• Predictive models show emerging patterns in your risk landscape\n";
      response += "• Risk correlations indicate potential cascade effects\n";
      response += "• Early intervention can significantly reduce predicted risk materialization\n";

      return response;
    } catch (error) {
      console.error('Error in predictive analysis:', error);
      return "I encountered an issue generating the predictive analysis. Please check your data sources and try again.";
    }
  }

  private async handleRiskAssessment(message: string, context: ProcessingContext): Promise<string> {
    try {
      const riskScores = await intelligentRiskAssessmentService.generateIntelligentRiskScores(context.orgId);
      
      let response = "**📊 Intelligent Risk Assessment:**\n\n";
      
      if (riskScores.length > 0) {
        response += "**Current Risk Scores:**\n";
        riskScores.forEach(score => {
          const trendEmoji = score.trendDirection === 'increasing' ? '📈' : 
                            score.trendDirection === 'decreasing' ? '📉' : '➡️';
          
          response += `• **${score.riskName}:** ${score.currentScore}/10 ${trendEmoji}\n`;
          response += `  Historical: ${score.historicalScore}/10 | Confidence: ${Math.round(score.confidence * 100)}%\n`;
          response += `  ${score.explanation}\n\n`;
        });
        
        response += "**Benchmark Comparison:**\n";
        const firstScore = riskScores[0];
        if (firstScore.benchmarkComparison) {
          response += `• Industry Average: ${firstScore.benchmarkComparison.industry}\n`;
          response += `• Similar Organizations: ${firstScore.benchmarkComparison.size}\n`;
          response += `• Regional Average: ${firstScore.benchmarkComparison.region}\n\n`;
        }
      }

      response += "**Assessment Methodology:**\n";
      response += "• Multi-factor analysis incorporating incident data, KRIs, and control effectiveness\n";
      response += "• Machine learning algorithms trained on industry benchmarks\n";
      response += "• Real-time adjustment based on current business environment\n";

      return response;
    } catch (error) {
      console.error('Error in risk assessment:', error);
      return "I encountered an issue with the risk assessment. Please ensure your risk data is up to date and try again.";
    }
  }

  private async handleRecommendations(message: string, context: ProcessingContext): Promise<string> {
    try {
      const [mitigationRecs, bestPractices, trainingRecs] = await Promise.all([
        recommendationsEngineService.generateMitigationRecommendations('operational', 'medium', context.orgId),
        recommendationsEngineService.generateBestPracticeRecommendations(context.orgId),
        recommendationsEngineService.generateTrainingRecommendations(context.orgId)
      ]);

      let response = "**💡 AI-Powered Recommendations:**\n\n";
      
      if (mitigationRecs.length > 0) {
        response += "**Risk Mitigation Strategies:**\n";
        mitigationRecs.slice(0, 3).forEach(rec => {
          response += `• **${rec.strategy}** (Priority: ${rec.priority}/10)\n`;
          response += `  Expected Impact: ${Math.round(rec.expectedImpact * 100)}% risk reduction\n`;
          response += `  Implementation: ${rec.timeframe} | Cost: ${rec.implementationCost}\n`;
          response += `  ${rec.description}\n\n`;
        });
      }

      if (bestPractices.length > 0) {
        response += "**Best Practice Opportunities:**\n";
        bestPractices.slice(0, 2).forEach(practice => {
          if (practice.currentGap !== 'none') {
            response += `• **${practice.title}**\n`;
            response += `  Current Gap: ${practice.currentGap} | Target: ${practice.maturityLevel}\n`;
            response += `  ${practice.description}\n\n`;
          }
        });
      }

      if (trainingRecs.length > 0) {
        response += "**Training Recommendations:**\n";
        trainingRecs.slice(0, 2).forEach(training => {
          response += `• **${training.skillGap}** (${training.priority} priority)\n`;
          response += `  Target: ${training.targetAudience.join(', ')}\n`;
          response += `  Duration: ${training.estimatedDuration} | Cost: ${training.cost}\n\n`;
        });
      }

      response += "**Implementation Guidance:**\n";
      response += "• Prioritize high-impact, low-cost initiatives first\n";
      response += "• Consider resource constraints and change management requirements\n";
      response += "• Monitor implementation progress with defined success metrics\n";

      return response;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return "I encountered an issue generating recommendations. Please check your organizational data and try again.";
    }
  }

  private async handleDocumentAnalysis(message: string, context: ProcessingContext): Promise<string> {
    try {
      // In a real implementation, this would analyze an actual document
      // For now, provide guidance on document analysis capabilities
      
      let response = "**📄 Document Analysis Capabilities:**\n\n";
      
      response += "I can analyze various types of risk-related documents:\n\n";
      
      response += "**Supported Document Types:**\n";
      response += "• Risk assessments and audit reports\n";
      response += "• Policies and procedures\n";
      response += "• Incident reports and post-mortems\n";
      response += "• Regulatory compliance documents\n";
      response += "• Business continuity plans\n\n";
      
      response += "**Analysis Features:**\n";
      response += "• **Risk Extraction:** Automatically identify and categorize risks\n";
      response += "• **Sentiment Analysis:** Assess tone and confidence levels\n";
      response += "• **Compliance Mapping:** Link requirements to regulations\n";
      response += "• **Action Item Extraction:** Identify required actions and deadlines\n";
      response += "• **Entity Recognition:** Extract key entities and relationships\n\n";
      
      response += "**How to Use:**\n";
      response += "1. Upload your document to the system\n";
      response += "2. Ask me to 'analyze the uploaded document'\n";
      response += "3. I'll provide detailed insights and recommendations\n\n";
      
      response += "Would you like to upload a document for analysis, or do you have specific questions about document analysis capabilities?";

      return response;
    } catch (error) {
      console.error('Error in document analysis:', error);
      return "I encountered an issue with document analysis. Please try again or contact support.";
    }
  }

  private async handleAnomalyDetection(message: string, context: ProcessingContext): Promise<string> {
    try {
      const anomalies = await predictiveRiskModelingService.detectAnomalies(context.orgId);
      
      let response = "**🚨 Anomaly Detection Results:**\n\n";
      
      if (anomalies.length > 0) {
        response += "**Detected Anomalies:**\n";
        anomalies.forEach(anomaly => {
          const severityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
          }[anomaly.severity];
          
          response += `${severityEmoji} **${anomaly.metric}**\n`;
          response += `  Current Value: ${anomaly.value}\n`;
          response += `  Expected Range: ${anomaly.expectedRange.min} - ${anomaly.expectedRange.max}\n`;
          response += `  Anomaly Score: ${Math.round(anomaly.anomalyScore * 100)}%\n`;
          response += `  ${anomaly.explanation}\n\n`;
          
          if (anomaly.suggestedInvestigation.length > 0) {
            response += `  **Recommended Actions:**\n`;
            anomaly.suggestedInvestigation.forEach(action => {
              response += `  • ${action}\n`;
            });
            response += "\n";
          }
        });
        
        response += "**Summary:**\n";
        const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
        const highCount = anomalies.filter(a => a.severity === 'high').length;
        
        if (criticalCount > 0) {
          response += `• ${criticalCount} critical anomalies require immediate attention\n`;
        }
        if (highCount > 0) {
          response += `• ${highCount} high-severity anomalies need investigation within 24 hours\n`;
        }
        
        response += "• Regular monitoring is recommended to prevent future anomalies\n";
        
      } else {
        response += "✅ **No significant anomalies detected** in your current data.\n\n";
        response += "**What this means:**\n";
        response += "• Your risk metrics are within expected ranges\n";
        response += "• Current patterns align with historical baselines\n";
        response += "• No immediate investigation required\n\n";
        response += "**Recommendations:**\n";
        response += "• Continue regular monitoring of key metrics\n";
        response += "• Review anomaly detection thresholds quarterly\n";
        response += "• Consider expanding monitoring to additional data sources\n";
      }

      return response;
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      return "I encountered an issue with anomaly detection. Please check your data sources and try again.";
    }
  }

  private async handleGeneralAssistance(message: string, context: ProcessingContext): Promise<string> {
    try {
      // Use the existing AI assistant functionality as fallback
      const response = await supabase.functions.invoke('ai-assistant', {
        body: {
          message,
          context: {
            module: context.module,
            userRole: context.userRole,
            orgSector: context.orgSector,
            orgSize: 'medium' // Default value
          },
          userId: context.orgId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data?.response || "I'm here to help with your operational resilience questions. You can ask me about risk management, compliance, predictions, recommendations, or document analysis.";
    } catch (error) {
      console.error('Error in general assistance:', error);
      return "I'm your enhanced AI assistant for operational resilience. I can help with:\n\n" +
             "🔮 **Predictive Analysis** - Risk forecasting and trend analysis\n" +
             "📊 **Risk Assessment** - Intelligent scoring and benchmarking\n" +
             "💡 **Recommendations** - Personalized mitigation strategies\n" +
             "📄 **Document Analysis** - Extract insights from reports and policies\n" +
             "🚨 **Anomaly Detection** - Identify unusual patterns in your data\n\n" +
             "What would you like to explore today?";
    }
  }
}

export const enhancedAIAssistantService = new EnhancedAIAssistantService();
