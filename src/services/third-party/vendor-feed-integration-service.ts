import { supabase } from "@/integrations/supabase/client";

export interface VendorFeedData {
  id: string;
  vendor_profile_id: string;
  feed_type: 'credit_rating' | 'news_sentiment' | 'cybersecurity' | 'financial' | 'regulatory';
  feed_source: string;
  monitoring_frequency: 'hourly' | 'daily' | 'weekly';
  alert_thresholds: {
    credit_rating_threshold?: number;
    sentiment_threshold?: number;
    cyber_risk_threshold?: number;
    financial_health_threshold?: number;
  };
  current_status: 'active' | 'inactive' | 'error';
  last_feed_data: {
    credit_rating?: number;
    sentiment_score?: number;
    cyber_risk_score?: number;
    financial_health_score?: number;
    news_summary?: string;
    risk_indicators?: string[];
    last_updated?: string;
  };
  last_check_at?: string;
}

export interface VendorRiskAlert {
  id: string;
  vendor_profile_id: string;
  vendor_name: string;
  alert_type: 'concentration_risk' | 'service_disruption' | 'credit_downgrade' | 'cyber_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  current_value: any;
  threshold_value: any;
  variance_percentage: number;
  osfi_principle: 'principle_6' | 'b_10';
  regulatory_citation: string;
  disclaimer: string;
  triggered_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

class VendorFeedIntegrationService {
  
  // Get all vendor monitoring feeds for organization
  async getVendorMonitoringFeeds(orgId: string): Promise<VendorFeedData[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_monitoring_feeds')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vendor monitoring feeds:', error);
      return [];
    }
  }

  // Create new monitoring feed for a vendor
  async createVendorMonitoringFeed(
    orgId: string,
    vendorProfileId: string,
    feedConfig: {
      feed_type: string;
      feed_source: string;
      monitoring_frequency: string;
      alert_thresholds: any;
    }
  ): Promise<VendorFeedData | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_monitoring_feeds')
        .insert({
          org_id: orgId,
          vendor_profile_id: vendorProfileId,
          ...feedConfig,
          current_status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vendor monitoring feed:', error);
      return null;
    }
  }

  // Update feed data (simulated for demo, would integrate with real APIs)
  async updateVendorFeedData(feedId: string, newData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vendor_monitoring_feeds')
        .update({
          last_feed_data: newData,
          last_check_at: new Date().toISOString()
        })
        .eq('id', feedId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating vendor feed data:', error);
      return false;
    }
  }

  // Simulate real-time feed updates (in production, this would connect to actual APIs)
  async simulateVendorFeedUpdates(): Promise<VendorFeedData[]> {
    const mockFeedUpdates: VendorFeedData[] = [
      {
        id: 'feed-1',
        vendor_profile_id: 'vendor-1',
        feed_type: 'credit_rating',
        feed_source: 'Moody\'s Analytics',
        monitoring_frequency: 'daily',
        alert_thresholds: { credit_rating_threshold: 70 },
        current_status: 'active',
        last_feed_data: {
          credit_rating: 65, // Below threshold
          risk_indicators: ['Rating downgraded', 'Financial stress indicators'],
          last_updated: new Date().toISOString()
        },
        last_check_at: new Date().toISOString()
      },
      {
        id: 'feed-2',
        vendor_profile_id: 'vendor-2',
        feed_type: 'cybersecurity',
        feed_source: 'CyberRisk Intelligence',
        monitoring_frequency: 'hourly',
        alert_thresholds: { cyber_risk_threshold: 80 },
        current_status: 'active',
        last_feed_data: {
          cyber_risk_score: 85, // Above threshold
          risk_indicators: ['New vulnerabilities detected', 'Suspicious network activity'],
          last_updated: new Date().toISOString()
        },
        last_check_at: new Date().toISOString()
      },
      {
        id: 'feed-3',
        vendor_profile_id: 'vendor-3',
        feed_type: 'news_sentiment',
        feed_source: 'Thomson Reuters News Analytics',
        monitoring_frequency: 'daily',
        alert_thresholds: { sentiment_threshold: -0.5 },
        current_status: 'active',
        last_feed_data: {
          sentiment_score: -0.7, // Below threshold (negative sentiment)
          news_summary: 'Regulatory scrutiny increased, customer complaints rising',
          risk_indicators: ['Regulatory investigation', 'Reputation risk'],
          last_updated: new Date().toISOString()
        },
        last_check_at: new Date().toISOString()
      }
    ];

    return mockFeedUpdates;
  }

  // Check for threshold breaches and create alerts
  async checkThresholdBreaches(feedData: VendorFeedData): Promise<VendorRiskAlert | null> {
    try {
      let breachDetected = false;
      let alertType: VendorRiskAlert['alert_type'] = 'service_disruption';
      let severity: VendorRiskAlert['severity'] = 'medium';
      let variance = 0;

      // Check different feed types for breaches
      if (feedData.feed_type === 'credit_rating' && feedData.last_feed_data.credit_rating) {
        const threshold = feedData.alert_thresholds.credit_rating_threshold || 70;
        if (feedData.last_feed_data.credit_rating < threshold) {
          breachDetected = true;
          alertType = 'credit_downgrade';
          severity = feedData.last_feed_data.credit_rating < threshold - 20 ? 'critical' : 'high';
          variance = ((threshold - feedData.last_feed_data.credit_rating) / threshold) * 100;
        }
      } else if (feedData.feed_type === 'cybersecurity' && feedData.last_feed_data.cyber_risk_score) {
        const threshold = feedData.alert_thresholds.cyber_risk_threshold || 80;
        if (feedData.last_feed_data.cyber_risk_score > threshold) {
          breachDetected = true;
          alertType = 'cyber_incident';
          severity = feedData.last_feed_data.cyber_risk_score > threshold + 15 ? 'critical' : 'high';
          variance = ((feedData.last_feed_data.cyber_risk_score - threshold) / threshold) * 100;
        }
      } else if (feedData.feed_type === 'news_sentiment' && feedData.last_feed_data.sentiment_score) {
        const threshold = feedData.alert_thresholds.sentiment_threshold || -0.5;
        if (feedData.last_feed_data.sentiment_score < threshold) {
          breachDetected = true;
          alertType = 'service_disruption'; // Reputation risk can lead to service disruption
          severity = feedData.last_feed_data.sentiment_score < threshold - 0.3 ? 'high' : 'medium';
          variance = Math.abs(((feedData.last_feed_data.sentiment_score - threshold) / threshold) * 100);
        }
      }

      if (!breachDetected) return null;

      // Create risk alert with OSFI E-21 compliance
      const riskAlert: VendorRiskAlert = {
        id: `alert-${Date.now()}`,
        vendor_profile_id: feedData.vendor_profile_id,
        vendor_name: `Vendor ${feedData.vendor_profile_id}`, // Would get real name
        alert_type: alertType,
        severity,
        current_value: feedData.last_feed_data,
        threshold_value: feedData.alert_thresholds,
        variance_percentage: variance,
        osfi_principle: 'principle_6',
        regulatory_citation: 'Per OSFI E-21 Principle 6 and B-10, vendor concentration risk and critical operations dependencies must be continuously monitored. Third-party operational disruptions exceeding tolerance thresholds require immediate assessment and mitigation.',
        disclaimer: 'This automated analysis is based on OSFI E-21 and B-10 guidelines. This is not regulatory advice. Consult OSFI or qualified compliance professionals for your institution\'s specific regulatory requirements.',
        triggered_at: new Date().toISOString(),
        status: 'active'
      };

      return riskAlert;
    } catch (error) {
      console.error('Error checking threshold breaches:', error);
      return null;
    }
  }

  // Get active vendor risk alerts
  async getVendorRiskAlerts(orgId: string): Promise<VendorRiskAlert[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_risk_alerts')
        .select(`
          *,
          vendor_profile:third_party_profiles(vendor_name)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('triggered_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(alert => ({
        ...alert,
        vendor_name: alert.vendor_profile?.vendor_name || 'Unknown Vendor'
      }));
    } catch (error) {
      console.error('Error fetching vendor risk alerts:', error);
      return [];
    }
  }

  // Create risk alert in database
  async createVendorRiskAlert(orgId: string, alert: Omit<VendorRiskAlert, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vendor_risk_alerts')
        .insert({
          org_id: orgId,
          ...alert
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating vendor risk alert:', error);
      return false;
    }
  }

  // Get proportional monitoring configuration based on organization size
  getProportionalConfig(orgProfile: any): {
    monitoring_frequency: string;
    alert_sensitivity: 'basic' | 'enhanced';
    ai_analysis_enabled: boolean;
    escalation_channels: string[];
  } {
    const employeeCount = orgProfile?.employee_count || 0;
    
    if (employeeCount < 100) {
      // Small FRFI
      return {
        monitoring_frequency: 'daily',
        alert_sensitivity: 'basic',
        ai_analysis_enabled: false,
        escalation_channels: ['email']
      };
    } else if (employeeCount < 500) {
      // Medium FRFI
      return {
        monitoring_frequency: 'daily',
        alert_sensitivity: 'enhanced',
        ai_analysis_enabled: true,
        escalation_channels: ['email', 'dashboard']
      };
    } else {
      // Large Bank
      return {
        monitoring_frequency: 'hourly',
        alert_sensitivity: 'enhanced',
        ai_analysis_enabled: true,
        escalation_channels: ['priority_email', 'dashboard']
      };
    }
  }

  // Calculate vendor concentration risk (for OSFI E-21 Principle 6)
  async calculateConcentrationRisk(orgId: string): Promise<{
    total_vendors: number;
    high_concentration_vendors: Array<{
      vendor_name: string;
      concentration_percentage: number;
      critical_operations_count: number;
      risk_level: 'low' | 'medium' | 'high' | 'critical';
    }>;
    concentration_risk_score: number;
    osfi_compliance_status: 'compliant' | 'needs_attention' | 'critical';
  }> {
    try {
      const { data: vendors, error } = await supabase
        .from('third_party_profiles')
        .select('*')
        .eq('org_id', orgId);

      if (error) throw error;

      const totalVendors = vendors?.length || 0;
      const concentrationThreshold = 20; // 20% concentration threshold per OSFI best practices

      // Simulate concentration analysis (in real implementation, would calculate based on actual business function mapping)
      const highConcentrationVendors = [
        {
          vendor_name: 'FIS Global Banking Solutions',
          concentration_percentage: 35,
          critical_operations_count: 5,
          risk_level: 'critical' as const
        },
        {
          vendor_name: 'Thomson Reuters Risk Solutions',
          concentration_percentage: 25,
          critical_operations_count: 3,
          risk_level: 'high' as const
        },
        {
          vendor_name: 'IBM Cloud Services',
          concentration_percentage: 22,
          critical_operations_count: 4,
          risk_level: 'high' as const
        }
      ];

      const concentrationRiskScore = Math.min(100, 
        highConcentrationVendors.reduce((sum, vendor) => 
          sum + (vendor.concentration_percentage > concentrationThreshold ? vendor.concentration_percentage : 0), 0
        )
      );

      const complianceStatus = concentrationRiskScore > 50 ? 'critical' :
                              concentrationRiskScore > 25 ? 'needs_attention' : 'compliant';

      return {
        total_vendors: totalVendors,
        high_concentration_vendors: highConcentrationVendors,
        concentration_risk_score: concentrationRiskScore,
        osfi_compliance_status: complianceStatus
      };
    } catch (error) {
      console.error('Error calculating concentration risk:', error);
      return {
        total_vendors: 0,
        high_concentration_vendors: [],
        concentration_risk_score: 0,
        osfi_compliance_status: 'compliant'
      };
    }
  }

  // Send vendor risk alert notification via priority email
  async sendVendorRiskAlertNotification(
    orgId: string,
    alert: VendorRiskAlert,
    recipients: string[],
    orgProfile?: any
  ): Promise<boolean> {
    try {
      const config = this.getProportionalConfig(orgProfile);
      
      // Determine email priority based on alert severity
      const emailPriority = {
        'low': 'normal',
        'medium': 'normal', 
        'high': 'high',
        'critical': 'critical'
      }[alert.severity] as 'normal' | 'high' | 'urgent' | 'critical';

      const subject = `Third-Party Risk Alert - ${alert.vendor_name}`;
      
      const htmlContent = `
        <div style="margin-bottom: 24px;">
          <h2 style="color: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ea580c' : '#d97706'}; margin-bottom: 16px;">
            Vendor Risk Alert: ${alert.vendor_name}
          </h2>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Alert Type:</strong> ${alert.alert_type.replace(/_/g, ' ').toUpperCase()}</p>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Variance:</strong> ${alert.variance_percentage.toFixed(2)}%</p>
            <p><strong>Triggered:</strong> ${new Date(alert.triggered_at).toLocaleString()}</p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-bottom: 8px;">OSFI E-21 & B-10 Compliance</h3>
            <p style="margin-bottom: 12px;"><strong>Regulatory Citation:</strong></p>
            <p style="font-style: italic; margin-bottom: 12px;">${alert.regulatory_citation}</p>
            <p style="font-size: 12px; color: #92400e;"><strong>Disclaimer:</strong> ${alert.disclaimer}</p>
          </div>

          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px;">
            <h3 style="color: #047857; margin-bottom: 8px;">Recommended Actions</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review vendor concentration risk exposure</li>
              <li>Assess impact on critical business operations</li>
              <li>Consider backup vendor activation if available</li>
              <li>Document remediation steps per OSFI E-21 Principle 6</li>
            </ul>
          </div>
        </div>
      `;

      // Send via enhanced email notification system
      await supabase.functions.invoke('send-email-notification', {
        body: {
          to: recipients,
          subject,
          html: htmlContent,
          priority: emailPriority
        }
      });

      console.log(`Vendor risk alert notification sent for ${alert.vendor_name} with ${emailPriority} priority`);
      return true;

    } catch (error) {
      console.error('Error sending vendor risk alert notification:', error);
      return false;
    }
  }
}

export const vendorFeedIntegrationService = new VendorFeedIntegrationService();