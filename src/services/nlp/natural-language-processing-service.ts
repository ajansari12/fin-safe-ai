import { supabase } from "@/integrations/supabase/client";

export interface DocumentAnalysis {
  documentId: string;
  documentType: string;
  keyRiskIndicators: Array<{
    indicator: string;
    relevance: number;
    context: string;
  }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sentimentScore: number; // -1 to 1
  themes: Array<{
    theme: string;
    frequency: number;
    importance: number;
  }>;
  actionItems: string[];
  compliance: Array<{
    regulation: string;
    relevance: number;
    requirements: string[];
  }>;
  entities: Array<{
    entity: string;
    type: 'person' | 'organization' | 'location' | 'regulation' | 'risk_category';
    confidence: number;
  }>;
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  keyPhrases: Array<{
    phrase: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  }>;
  emotionalTone: Array<{
    emotion: string;
    intensity: number;
  }>;
  concerns: string[];
  positiveAspects: string[];
}

export interface RiskExtraction {
  extractedRisks: Array<{
    riskDescription: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    sourceContext: string;
  }>;
  mitigationStrategies: Array<{
    strategy: string;
    applicableRisks: string[];
    effectiveness: number;
  }>;
  recommendations: string[];
}

export interface DocumentClassification {
  primaryCategory: string;
  secondaryCategories: string[];
  confidence: number;
  suggestedTags: string[];
  documentType: 'policy' | 'procedure' | 'report' | 'assessment' | 'incident' | 'audit' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiredActions: string[];
}

class NaturalLanguageProcessingService {
  private riskKeywords = {
    operational: ['process', 'procedure', 'system', 'operation', 'service', 'downtime', 'failure'],
    cyber: ['security', 'breach', 'attack', 'malware', 'phishing', 'vulnerability', 'encryption'],
    compliance: ['regulation', 'regulatory', 'audit', 'compliance', 'violation', 'penalty', 'requirement'],
    financial: ['financial', 'credit', 'market', 'liquidity', 'currency', 'interest', 'default'],
    reputational: ['reputation', 'brand', 'public', 'media', 'customer', 'stakeholder', 'image']
  };

  private sentimentWords = {
    positive: ['good', 'excellent', 'strong', 'effective', 'successful', 'robust', 'improved'],
    negative: ['poor', 'weak', 'failed', 'inadequate', 'concerning', 'problematic', 'deficient'],
    neutral: ['average', 'standard', 'normal', 'typical', 'regular', 'expected', 'baseline']
  };

  private regulationKeywords = {
    'OSFI': ['osfi', 'office of the superintendent', 'prudential', 'guideline'],
    'SOX': ['sarbanes', 'oxley', 'sox', 'section 404', 'internal controls'],
    'GDPR': ['gdpr', 'general data protection', 'privacy', 'data protection'],
    'PCI DSS': ['pci', 'payment card', 'cardholder', 'data security'],
    'ISO 27001': ['iso 27001', 'information security', 'isms']
  };

  async analyzeDocument(documentText: string, documentType: string): Promise<DocumentAnalysis> {
    try {
      const sentences = this.tokenizeSentences(documentText);
      const words = this.tokenizeWords(documentText);
      
      const keyRiskIndicators = this.extractKeyRiskIndicators(sentences);
      const riskLevel = this.assessOverallRiskLevel(keyRiskIndicators, sentences);
      const sentimentScore = this.calculateSentimentScore(words);
      const themes = this.extractThemes(sentences);
      const actionItems = this.extractActionItems(sentences);
      const compliance = this.extractComplianceRequirements(sentences);
      const entities = this.extractEntities(sentences);

      return {
        documentId: this.generateDocumentId(),
        documentType,
        keyRiskIndicators,
        riskLevel,
        sentimentScore,
        themes,
        actionItems,
        compliance,
        entities
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const sentences = this.tokenizeSentences(text);
      const words = this.tokenizeWords(text);
      
      const sentimentScore = this.calculateSentimentScore(words);
      const overallSentiment = this.classifySentiment(sentimentScore);
      const keyPhrases = this.extractKeyPhrases(sentences);
      const emotionalTone = this.analyzeEmotionalTone(sentences);
      const concerns = this.extractConcerns(sentences);
      const positiveAspects = this.extractPositiveAspects(sentences);

      return {
        overallSentiment,
        sentimentScore,
        keyPhrases,
        emotionalTone,
        concerns,
        positiveAspects
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async extractRiskIndicators(text: string): Promise<RiskExtraction> {
    try {
      const sentences = this.tokenizeSentences(text);
      
      const extractedRisks = this.identifyRisks(sentences);
      const mitigationStrategies = this.extractMitigationStrategies(sentences);
      const recommendations = this.generateRecommendations(extractedRisks);

      return {
        extractedRisks,
        mitigationStrategies,
        recommendations
      };
    } catch (error) {
      console.error('Error extracting risk indicators:', error);
      throw error;
    }
  }

  async classifyDocument(text: string): Promise<DocumentClassification> {
    try {
      const sentences = this.tokenizeSentences(text);
      const words = this.tokenizeWords(text);
      
      const primaryCategory = this.classifyPrimaryCategory(words);
      const secondaryCategories = this.classifySecondaryCategories(words);
      const confidence = this.calculateClassificationConfidence(words, primaryCategory);
      const suggestedTags = this.generateTags(words, sentences);
      const documentType = this.classifyDocumentType(sentences);
      const priority = this.assessPriority(sentences);
      const requiredActions = this.extractRequiredActions(sentences);

      return {
        primaryCategory,
        secondaryCategories,
        confidence,
        suggestedTags,
        documentType,
        priority,
        requiredActions
      };
    } catch (error) {
      console.error('Error classifying document:', error);
      throw error;
    }
  }

  private tokenizeSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  private tokenizeWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private extractKeyRiskIndicators(sentences: string[]): Array<{
    indicator: string;
    relevance: number;
    context: string;
  }> {
    const indicators = [];
    
    for (const sentence of sentences) {
      const words = this.tokenizeWords(sentence);
      
      for (const [category, keywords] of Object.entries(this.riskKeywords)) {
        const matchingKeywords = keywords.filter(keyword => 
          words.some(word => word.includes(keyword))
        );
        
        if (matchingKeywords.length > 0) {
          indicators.push({
            indicator: `${category} risk indicators`,
            relevance: matchingKeywords.length / keywords.length,
            context: sentence.trim()
          });
        }
      }
    }
    
    return indicators.slice(0, 10); // Return top 10 indicators
  }

  private assessOverallRiskLevel(
    indicators: Array<{ relevance: number }>,
    sentences: string[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const avgRelevance = indicators.reduce((sum, ind) => sum + ind.relevance, 0) / indicators.length;
    const criticalWords = ['critical', 'severe', 'major', 'urgent', 'immediate'];
    const hasCriticalWords = sentences.some(sentence => 
      criticalWords.some(word => sentence.toLowerCase().includes(word))
    );
    
    if (hasCriticalWords || avgRelevance > 0.8) return 'critical';
    if (avgRelevance > 0.6) return 'high';
    if (avgRelevance > 0.3) return 'medium';
    return 'low';
  }

  private calculateSentimentScore(words: string[]): number {
    let score = 0;
    let count = 0;
    
    for (const word of words) {
      if (this.sentimentWords.positive.includes(word)) {
        score += 1;
        count++;
      } else if (this.sentimentWords.negative.includes(word)) {
        score -= 1;
        count++;
      }
    }
    
    return count > 0 ? score / count : 0;
  }

  private extractThemes(sentences: string[]): Array<{
    theme: string;
    frequency: number;
    importance: number;
  }> {
    const themes = new Map<string, number>();
    const themeKeywords = {
      'Risk Management': ['risk', 'management', 'mitigation', 'control'],
      'Compliance': ['compliance', 'regulatory', 'audit', 'requirement'],
      'Security': ['security', 'protection', 'safeguard', 'defense'],
      'Operations': ['operations', 'process', 'procedure', 'workflow'],
      'Governance': ['governance', 'oversight', 'supervision', 'policy']
    };
    
    for (const sentence of sentences) {
      const words = this.tokenizeWords(sentence);
      
      for (const [theme, keywords] of Object.entries(themeKeywords)) {
        const matches = keywords.filter(keyword => words.includes(keyword)).length;
        if (matches > 0) {
          themes.set(theme, (themes.get(theme) || 0) + matches);
        }
      }
    }
    
    return Array.from(themes.entries())
      .map(([theme, frequency]) => ({
        theme,
        frequency,
        importance: frequency / sentences.length
      }))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);
  }

  private extractActionItems(sentences: string[]): string[] {
    const actionWords = ['must', 'should', 'need', 'require', 'implement', 'establish', 'ensure'];
    const actionItems = [];
    
    for (const sentence of sentences) {
      const hasActionWord = actionWords.some(word => 
        sentence.toLowerCase().includes(word)
      );
      
      if (hasActionWord) {
        actionItems.push(sentence.trim());
      }
    }
    
    return actionItems.slice(0, 10);
  }

  private extractComplianceRequirements(sentences: string[]): Array<{
    regulation: string;
    relevance: number;
    requirements: string[];
  }> {
    const compliance = [];
    
    for (const [regulation, keywords] of Object.entries(this.regulationKeywords)) {
      const relevantSentences = sentences.filter(sentence => 
        keywords.some(keyword => sentence.toLowerCase().includes(keyword))
      );
      
      if (relevantSentences.length > 0) {
        compliance.push({
          regulation,
          relevance: relevantSentences.length / sentences.length,
          requirements: relevantSentences.slice(0, 3)
        });
      }
    }
    
    return compliance;
  }

  private extractEntities(sentences: string[]): Array<{
    entity: string;
    type: 'person' | 'organization' | 'location' | 'regulation' | 'risk_category';
    confidence: number;
  }> {
    const entities = [];
    const entityPatterns = {
      organization: /\b[A-Z][a-z]+ (?:Inc|Corp|Ltd|LLC|Company|Bank|Insurance)\b/g,
      regulation: /\b(?:OSFI|SOX|GDPR|PCI DSS|ISO \d+)\b/g,
      risk_category: /\b(?:operational|cyber|compliance|financial|reputational) risk\b/gi
    };
    
    for (const sentence of sentences) {
      for (const [type, pattern] of Object.entries(entityPatterns)) {
        const matches = sentence.match(pattern);
        if (matches) {
          for (const match of matches) {
            entities.push({
              entity: match,
              type: type as any,
              confidence: 0.8
            });
          }
        }
      }
    }
    
    return entities.slice(0, 20);
  }

  private classifySentiment(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  private extractKeyPhrases(sentences: string[]): Array<{
    phrase: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
  }> {
    const phrases = [];
    
    for (const sentence of sentences) {
      const words = this.tokenizeWords(sentence);
      const sentimentScore = this.calculateSentimentScore(words);
      const sentiment = this.classifySentiment(sentimentScore);
      
      if (Math.abs(sentimentScore) > 0.2) {
        phrases.push({
          phrase: sentence.trim(),
          sentiment,
          confidence: Math.abs(sentimentScore)
        });
      }
    }
    
    return phrases.slice(0, 10);
  }

  private analyzeEmotionalTone(sentences: string[]): Array<{
    emotion: string;
    intensity: number;
  }> {
    const emotions = {
      concern: ['concern', 'worry', 'issue', 'problem', 'challenge'],
      confidence: ['confident', 'strong', 'robust', 'solid', 'reliable'],
      urgency: ['urgent', 'immediate', 'critical', 'emergency', 'priority']
    };
    
    const emotionalTone = [];
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      let intensity = 0;
      for (const sentence of sentences) {
        const words = this.tokenizeWords(sentence);
        intensity += keywords.filter(keyword => words.includes(keyword)).length;
      }
      
      if (intensity > 0) {
        emotionalTone.push({
          emotion,
          intensity: intensity / sentences.length
        });
      }
    }
    
    return emotionalTone;
  }

  private extractConcerns(sentences: string[]): string[] {
    const concernWords = ['concern', 'issue', 'problem', 'risk', 'challenge', 'deficiency'];
    const concerns = [];
    
    for (const sentence of sentences) {
      const hasConcernWord = concernWords.some(word => 
        sentence.toLowerCase().includes(word)
      );
      
      if (hasConcernWord) {
        concerns.push(sentence.trim());
      }
    }
    
    return concerns.slice(0, 5);
  }

  private extractPositiveAspects(sentences: string[]): string[] {
    const positiveWords = ['effective', 'strong', 'good', 'excellent', 'successful', 'improved'];
    const positiveAspects = [];
    
    for (const sentence of sentences) {
      const hasPositiveWord = positiveWords.some(word => 
        sentence.toLowerCase().includes(word)
      );
      
      if (hasPositiveWord) {
        positiveAspects.push(sentence.trim());
      }
    }
    
    return positiveAspects.slice(0, 5);
  }

  private identifyRisks(sentences: string[]): Array<{
    riskDescription: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    sourceContext: string;
  }> {
    const risks = [];
    
    for (const sentence of sentences) {
      const words = this.tokenizeWords(sentence);
      
      for (const [category, keywords] of Object.entries(this.riskKeywords)) {
        const matchCount = keywords.filter(keyword => words.includes(keyword)).length;
        
        if (matchCount > 0) {
          const severity = this.assessSeverity(sentence);
          risks.push({
            riskDescription: `${category} risk identified`,
            category,
            severity,
            confidence: matchCount / keywords.length,
            sourceContext: sentence.trim()
          });
        }
      }
    }
    
    return risks.slice(0, 10);
  }

  private assessSeverity(sentence: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalWords = ['critical', 'severe', 'major'];
    const highWords = ['high', 'significant', 'serious'];
    const mediumWords = ['medium', 'moderate', 'noticeable'];
    
    const lowerSentence = sentence.toLowerCase();
    
    if (criticalWords.some(word => lowerSentence.includes(word))) return 'critical';
    if (highWords.some(word => lowerSentence.includes(word))) return 'high';
    if (mediumWords.some(word => lowerSentence.includes(word))) return 'medium';
    return 'low';
  }

  private extractMitigationStrategies(sentences: string[]): Array<{
    strategy: string;
    applicableRisks: string[];
    effectiveness: number;
  }> {
    const mitigationWords = ['mitigate', 'control', 'prevent', 'reduce', 'manage', 'address'];
    const strategies = [];
    
    for (const sentence of sentences) {
      const hasMitigationWord = mitigationWords.some(word => 
        sentence.toLowerCase().includes(word)
      );
      
      if (hasMitigationWord) {
        strategies.push({
          strategy: sentence.trim(),
          applicableRisks: ['operational', 'cyber'], // Simplified
          effectiveness: 0.7
        });
      }
    }
    
    return strategies.slice(0, 5);
  }

  private generateRecommendations(risks: any[]): string[] {
    const recommendations = [];
    
    if (risks.some(r => r.category === 'cyber')) {
      recommendations.push('Implement comprehensive cybersecurity framework');
    }
    
    if (risks.some(r => r.category === 'operational')) {
      recommendations.push('Establish robust operational risk management procedures');
    }
    
    if (risks.some(r => r.severity === 'critical')) {
      recommendations.push('Prioritize immediate risk mitigation for critical risks');
    }
    
    return recommendations;
  }

  private calculateROI(riskExposure: number, effectiveness: number, budgetMultiplier: number): number {
    const riskReduction = Math.min(0.5, riskExposure * 0.3 * budgetMultiplier);
    const costIncrease = Math.abs(budgetMultiplier - 1);
    
    return costIncrease > 0 ? riskReduction / costIncrease : riskReduction;
  }

  private isSignificantOptimization(optimization: any): boolean {
    const budgetChange = Math.abs(
      Number(optimization.recommendedAllocation.budget) - Number(optimization.currentAllocation.budget)
    ) / Number(optimization.currentAllocation.budget);
    
    return budgetChange > 0.1; // 10% threshold
  }

  private classifyPrimaryCategory(words: string[]): string {
    const categoryScores = {};
    
    for (const [category, keywords] of Object.entries(this.riskKeywords)) {
      const score = keywords.filter(keyword => words.includes(keyword)).length;
      categoryScores[category] = score;
    }
    
    const maxCategory = Object.entries(categoryScores)
      .reduce((max, [category, score]) => score > max[1] ? [category, score] : max, ['operational', 0]);
    
    return maxCategory[0];
  }

  private classifySecondaryCategories(words: string[]): string[] {
    const categoryScores = {};
    
    for (const [category, keywords] of Object.entries(this.riskKeywords)) {
      const score = keywords.filter(keyword => words.includes(keyword)).length;
      if (score > 0) {
        categoryScores[category] = score;
      }
    }
    
    return Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)
      .slice(1, 4) // Skip primary category
      .map(([category]) => category);
  }

  private calculateClassificationConfidence(words: string[], primaryCategory: string): number {
    const keywords = this.riskKeywords[primaryCategory] || [];
    const matches = keywords.filter(keyword => words.includes(keyword)).length;
    return Math.min(1, matches / keywords.length);
  }

  private generateTags(words: string[], sentences: string[]): string[] {
    const tags = new Set<string>();
    
    // Add risk category tags
    for (const [category, keywords] of Object.entries(this.riskKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        tags.add(category);
      }
    }
    
    // Add regulation tags
    for (const [regulation, keywords] of Object.entries(this.regulationKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        tags.add(regulation);
      }
    }
    
    return Array.from(tags).slice(0, 10);
  }

  private classifyDocumentType(sentences: string[]): 'policy' | 'procedure' | 'report' | 'assessment' | 'incident' | 'audit' | 'other' {
    const typeKeywords = {
      policy: ['policy', 'guideline', 'standard', 'framework'],
      procedure: ['procedure', 'process', 'step', 'instruction'],
      report: ['report', 'analysis', 'findings', 'summary'],
      assessment: ['assessment', 'evaluation', 'review', 'analysis'],
      incident: ['incident', 'event', 'occurrence', 'breach'],
      audit: ['audit', 'examination', 'inspection', 'compliance']
    };
    
    const text = sentences.join(' ').toLowerCase();
    let maxScore = 0;
    let documentType: any = 'other';
    
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        documentType = type;
      }
    }
    
    return documentType;
  }

  private assessPriority(sentences: string[]): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentWords = ['urgent', 'immediate', 'critical', 'emergency'];
    const highWords = ['high', 'important', 'significant', 'major'];
    const mediumWords = ['medium', 'moderate', 'standard'];
    
    const text = sentences.join(' ').toLowerCase();
    
    if (urgentWords.some(word => text.includes(word))) return 'urgent';
    if (highWords.some(word => text.includes(word))) return 'high';
    if (mediumWords.some(word => text.includes(word))) return 'medium';
    return 'low';
  }

  private extractRequiredActions(sentences: string[]): string[] {
    const actionWords = ['must', 'shall', 'required', 'need to', 'should'];
    const actions = [];
    
    for (const sentence of sentences) {
      const hasActionWord = actionWords.some(word => 
        sentence.toLowerCase().includes(word)
      );
      
      if (hasActionWord) {
        actions.push(sentence.trim());
      }
    }
    
    return actions.slice(0, 5);
  }

  private generateDocumentId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const naturalLanguageProcessingService = new NaturalLanguageProcessingService();
