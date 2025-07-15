import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from '@/utils/performance-monitor';

export interface VendorFeedData {
  id: string;
  vendor_id: string;
  feed_type: string;
  data_payload: any;
  processed_at: string;
  status: 'processing' | 'completed' | 'failed';
  processing_time_ms?: number;
}

export interface VendorRiskAlert {
  id: string;
  vendor_id: string;
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alert_data: any;
  created_at: string;
  acknowledged: boolean;
}

export class VendorFeedIntegrationService {
  private static instance: VendorFeedIntegrationService;
  private processingQueue: VendorFeedData[] = [];
  private isProcessing = false;
  private batchSize = 10;

  static getInstance(): VendorFeedIntegrationService {
    if (!VendorFeedIntegrationService.instance) {
      VendorFeedIntegrationService.instance = new VendorFeedIntegrationService();
    }
    return VendorFeedIntegrationService.instance;
  }

  // Process vendor feed data with performance monitoring
  async processFeedData(feedData: VendorFeedData[]): Promise<{ 
    processed: number; 
    failed: number; 
    processingTime: number; 
  }> {
    const startTime = performance.now();
    let processed = 0;
    let failed = 0;

    // Add to processing queue
    this.processingQueue.push(...feedData);

    // Process in batches to prevent overwhelming the system
    while (this.processingQueue.length > 0 && !this.isProcessing) {
      this.isProcessing = true;
      
      const batch = this.processingQueue.splice(0, this.batchSize);
      
      try {
        const results = await Promise.allSettled(
          batch.map(item => this.processIndividualFeed(item))
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            processed++;
          } else {
            failed++;
            console.error(`Failed to process feed ${batch[index].id}:`, result.reason);
          }
        });

      } catch (error) {
        console.error('Batch processing error:', error);
        failed += batch.length;
      } finally {
        this.isProcessing = false;
      }
    }

    const processingTime = performance.now() - startTime;
    
    // Log performance metrics
    if (processingTime > 1000) {
      console.warn(`⚠️ Vendor feed processing is slow: ${processingTime.toFixed(2)}ms`);
    }

    return { processed, failed, processingTime };
  }

  // Process individual feed item with performance tracking
  private async processIndividualFeed(feedItem: VendorFeedData): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Simulate processing logic
      await this.analyzeFeedData(feedItem);
      
      // Generate risk alerts if needed
      await this.generateRiskAlerts(feedItem);
      
      // Update processing time
      const processingTime = performance.now() - startTime;
      feedItem.processing_time_ms = processingTime;
      feedItem.status = 'completed';
      feedItem.processed_at = new Date().toISOString();

      // Store in database
      await this.storeFeedData(feedItem);

    } catch (error) {
      feedItem.status = 'failed';
      throw error;
    }
  }

  // Analyze feed data for risk patterns
  private async analyzeFeedData(feedItem: VendorFeedData): Promise<void> {
    // Simulate analysis logic
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check for risk patterns in the data
    const riskScore = this.calculateRiskScore(feedItem.data_payload);
    
    if (riskScore > 0.7) {
      // High risk detected, prepare alert
      feedItem.data_payload.risk_score = riskScore;
      feedItem.data_payload.requires_alert = true;
    }
  }

  // Generate risk alerts based on feed data
  private async generateRiskAlerts(feedItem: VendorFeedData): Promise<void> {
    if (!feedItem.data_payload.requires_alert) return;

    const alert: Omit<VendorRiskAlert, 'id' | 'created_at'> = {
      vendor_id: feedItem.vendor_id,
      risk_type: feedItem.data_payload.risk_type || 'general',
      severity: this.mapRiskScoreToSeverity(feedItem.data_payload.risk_score),
      alert_data: {
        feed_id: feedItem.id,
        risk_score: feedItem.data_payload.risk_score,
        details: feedItem.data_payload.risk_details
      },
      acknowledged: false
    };

    // Store alert in database
    await this.storeRiskAlert(alert);
  }

  // Calculate risk score from feed data
  private calculateRiskScore(payload: any): number {
    // Simplified risk scoring logic
    let score = 0;
    
    if (payload.financial_impact > 100000) score += 0.3;
    if (payload.regulatory_flags?.length > 0) score += 0.4;
    if (payload.cyber_security_issues) score += 0.5;
    if (payload.operational_disruption) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  // Map risk score to severity level
  private mapRiskScoreToSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.9) return 'critical';
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  // Store feed data in database
  private async storeFeedData(feedItem: VendorFeedData): Promise<void> {
    const { error } = await supabase
      .from('vendor_feed_data')
      .upsert({
        id: feedItem.id,
        vendor_id: feedItem.vendor_id,
        feed_type: feedItem.feed_type,
        data_payload: feedItem.data_payload,
        processed_at: feedItem.processed_at,
        status: feedItem.status,
        processing_time_ms: feedItem.processing_time_ms
      });

    if (error) {
      console.error('Error storing feed data:', error);
      throw error;
    }
  }

  // Store risk alert in database
  private async storeRiskAlert(alert: Omit<VendorRiskAlert, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('vendor_risk_alerts')
      .insert({
        ...alert,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing risk alert:', error);
      throw error;
    }
  }

  // Get real-time feed performance metrics
  async getPerformanceMetrics(): Promise<{
    averageProcessingTime: number;
    throughputPerMinute: number;
    errorRate: number;
    queueSize: number;
  }> {
    const { data: recentFeeds } = await supabase
      .from('vendor_feed_data')
      .select('processing_time_ms, status')
      .gte('processed_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .order('processed_at', { ascending: false });

    const totalFeeds = recentFeeds?.length || 0;
    const completedFeeds = recentFeeds?.filter(f => f.status === 'completed') || [];
    const failedFeeds = recentFeeds?.filter(f => f.status === 'failed') || [];

    const averageProcessingTime = completedFeeds.length > 0 
      ? completedFeeds.reduce((sum, f) => sum + (f.processing_time_ms || 0), 0) / completedFeeds.length
      : 0;

    return {
      averageProcessingTime,
      throughputPerMinute: totalFeeds,
      errorRate: totalFeeds > 0 ? (failedFeeds.length / totalFeeds) * 100 : 0,
      queueSize: this.processingQueue.length
    };
  }

  // Start real-time monitoring
  startRealtimeMonitoring(): void {
    setInterval(async () => {
      const metrics = await this.getPerformanceMetrics();
      
      // Log warnings for performance issues
      if (metrics.averageProcessingTime > 2000) {
        console.warn(`⚠️ Vendor feed processing is slow: ${metrics.averageProcessingTime.toFixed(2)}ms`);
      }
      
      if (metrics.errorRate > 5) {
        console.warn(`⚠️ High error rate in vendor feeds: ${metrics.errorRate.toFixed(2)}%`);
      }
      
      if (metrics.queueSize > 100) {
        console.warn(`⚠️ Vendor feed queue is backing up: ${metrics.queueSize} items`);
      }
    }, 30000); // Check every 30 seconds
  }
}

// Export singleton instance
export const vendorFeedIntegrationService = VendorFeedIntegrationService.getInstance();