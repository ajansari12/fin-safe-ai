
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface UserBehaviorProfile {
  userId: string;
  typingPattern: {
    averageSpeed: number;
    keystrokeInterval: number[];
    dwellTime: number[];
  };
  mouseMovements: {
    averageSpeed: number;
    clickPatterns: any[];
    scrollBehavior: any;
  };
  navigationPatterns: {
    commonPaths: string[];
    sessionDuration: number;
    activityTimes: string[];
  };
  devicePreferences: {
    screenResolution: string;
    timezone: string;
    browserFeatures: string[];
  };
}

export interface BehaviorEvent {
  eventType: 'keystroke' | 'mouse_move' | 'click' | 'scroll' | 'navigation' | 'idle';
  timestamp: number;
  data: any;
  pageUrl?: string;
  elementType?: string;
}

class BehavioralAnalyticsService {
  private behaviorBuffer: BehaviorEvent[] = [];
  private isCollecting = false;
  private anomalyThreshold = 0.7;

  // Behavior Collection
  startBehaviorCollection(): void {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.setupEventListeners();
    
    // Process collected data every 30 seconds
    setInterval(() => {
      this.processBehaviorData();
    }, 30000);
  }

  stopBehaviorCollection(): void {
    this.isCollecting = false;
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    // Keystroke dynamics
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse dynamics
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleMouseClick.bind(this));
    document.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Navigation patterns
    window.addEventListener('beforeunload', this.handleNavigation.bind(this));
    window.addEventListener('focus', this.handleFocus.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('click', this.handleMouseClick.bind(this));
    document.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('beforeunload', this.handleNavigation.bind(this));
    window.removeEventListener('focus', this.handleFocus.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isCollecting) return;
    
    this.behaviorBuffer.push({
      eventType: 'keystroke',
      timestamp: Date.now(),
      data: {
        key: event.key,
        keyCode: event.keyCode,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        dwellTimeStart: Date.now()
      },
      pageUrl: window.location.href
    });
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.isCollecting) return;
    
    // Find corresponding keydown event
    const keydownEvent = this.behaviorBuffer
      .reverse()
      .find(e => e.eventType === 'keystroke' && e.data.key === event.key && !e.data.dwellTime);
    
    if (keydownEvent) {
      keydownEvent.data.dwellTime = Date.now() - keydownEvent.data.dwellTimeStart;
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isCollecting) return;
    
    // Throttle mouse move events
    if (this.behaviorBuffer.length > 0) {
      const lastEvent = this.behaviorBuffer[this.behaviorBuffer.length - 1];
      if (lastEvent.eventType === 'mouse_move' && Date.now() - lastEvent.timestamp < 100) {
        return;
      }
    }
    
    this.behaviorBuffer.push({
      eventType: 'mouse_move',
      timestamp: Date.now(),
      data: {
        x: event.clientX,
        y: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        movementX: event.movementX,
        movementY: event.movementY
      },
      pageUrl: window.location.href
    });
  }

  private handleMouseClick(event: MouseEvent): void {
    if (!this.isCollecting) return;
    
    this.behaviorBuffer.push({
      eventType: 'click',
      timestamp: Date.now(),
      data: {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        detail: event.detail,
        target: event.target ? (event.target as Element).tagName : null
      },
      pageUrl: window.location.href,
      elementType: event.target ? (event.target as Element).tagName : undefined
    });
  }

  private handleScroll(event: Event): void {
    if (!this.isCollecting) return;
    
    this.behaviorBuffer.push({
      eventType: 'scroll',
      timestamp: Date.now(),
      data: {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        deltaY: (event as WheelEvent).deltaY,
        deltaMode: (event as WheelEvent).deltaMode
      },
      pageUrl: window.location.href
    });
  }

  private handleNavigation(): void {
    if (!this.isCollecting) return;
    
    this.behaviorBuffer.push({
      eventType: 'navigation',
      timestamp: Date.now(),
      data: {
        from: document.referrer,
        to: window.location.href,
        sessionDuration: Date.now() - (performance.timing?.navigationStart || Date.now())
      }
    });
  }

  private handleFocus(): void {
    this.behaviorBuffer.push({
      eventType: 'navigation',
      timestamp: Date.now(),
      data: { event: 'focus' }
    });
  }

  private handleBlur(): void {
    this.behaviorBuffer.push({
      eventType: 'navigation',
      timestamp: Date.now(),
      data: { event: 'blur' }
    });
  }

  // Behavior Analysis
  private async processBehaviorData(): Promise<void> {
    if (this.behaviorBuffer.length === 0) return;

    const profile = await getCurrentUserProfile();
    if (!profile) return;

    try {
      // Analyze current behavior
      const currentProfile = this.buildBehaviorProfile(this.behaviorBuffer);
      
      // Get user's baseline behavior
      const baselineProfile = await this.getUserBaselineProfile(profile.id);
      
      // Calculate anomaly score
      const anomalyScore = await this.calculateAnomalyScore(currentProfile, baselineProfile);
      
      // Store behavior analytics
      await supabase.from('behavioral_analytics').insert({
        user_id: profile.id,
        org_id: profile.organization_id,
        activity_type: 'continuous_monitoring',
        activity_data: {
          profile: currentProfile,
          eventCount: this.behaviorBuffer.length,
          timeWindow: 30
        },
        risk_indicators: this.identifyRiskIndicators(currentProfile, baselineProfile),
        anomaly_score: Math.round(anomalyScore * 100)
      });

      // Update baseline profile if behavior is normal
      if (anomalyScore < this.anomalyThreshold) {
        await this.updateBaselineProfile(profile.id, currentProfile);
      }

      // Clear buffer
      this.behaviorBuffer = [];

    } catch (error) {
      console.error('Error processing behavior data:', error);
    }
  }

  private buildBehaviorProfile(events: BehaviorEvent[]): Partial<UserBehaviorProfile> {
    const keystrokeEvents = events.filter(e => e.eventType === 'keystroke');
    const mouseEvents = events.filter(e => e.eventType === 'mouse_move');
    const clickEvents = events.filter(e => e.eventType === 'click');
    const scrollEvents = events.filter(e => e.eventType === 'scroll');
    const navigationEvents = events.filter(e => e.eventType === 'navigation');

    return {
      typingPattern: this.analyzeTypingPattern(keystrokeEvents),
      mouseMovements: this.analyzeMouseMovements(mouseEvents, clickEvents),
      navigationPatterns: this.analyzeNavigationPatterns(navigationEvents),
      devicePreferences: this.analyzeDevicePreferences()
    };
  }

  private analyzeTypingPattern(keystrokeEvents: BehaviorEvent[]): any {
    if (keystrokeEvents.length < 2) return null;

    const intervals: number[] = [];
    const dwellTimes: number[] = [];

    for (let i = 1; i < keystrokeEvents.length; i++) {
      intervals.push(keystrokeEvents[i].timestamp - keystrokeEvents[i-1].timestamp);
    }

    keystrokeEvents.forEach(event => {
      if (event.data.dwellTime) {
        dwellTimes.push(event.data.dwellTime);
      }
    });

    return {
      averageSpeed: intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0,
      keystrokeInterval: intervals,
      dwellTime: dwellTimes
    };
  }

  private analyzeMouseMovements(mouseEvents: BehaviorEvent[], clickEvents: BehaviorEvent[]): any {
    if (mouseEvents.length < 2) return null;

    const distances: number[] = [];
    for (let i = 1; i < mouseEvents.length; i++) {
      const prev = mouseEvents[i-1].data;
      const curr = mouseEvents[i].data;
      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
      distances.push(distance);
    }

    const speeds = distances.map((distance, i) => {
      const timeDiff = mouseEvents[i+1].timestamp - mouseEvents[i].timestamp;
      return timeDiff > 0 ? distance / timeDiff : 0;
    });

    return {
      averageSpeed: speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0,
      clickPatterns: clickEvents.map(e => ({
        timestamp: e.timestamp,
        x: e.data.x,
        y: e.data.y,
        button: e.data.button
      })),
      scrollBehavior: this.analyzeScrollBehavior(mouseEvents)
    };
  }

  private analyzeScrollBehavior(events: BehaviorEvent[]): any {
    const scrollEvents = events.filter(e => e.eventType === 'scroll');
    return {
      frequency: scrollEvents.length,
      averageSpeed: scrollEvents.length > 0 ? 
        scrollEvents.reduce((sum, e) => sum + Math.abs(e.data.deltaY || 0), 0) / scrollEvents.length : 0
    };
  }

  private analyzeNavigationPatterns(navigationEvents: BehaviorEvent[]): any {
    const urls = navigationEvents.map(e => e.data.to || e.pageUrl).filter(Boolean);
    const uniqueUrls = [...new Set(urls)];

    return {
      commonPaths: uniqueUrls,
      sessionDuration: navigationEvents.length > 0 ? 
        navigationEvents[navigationEvents.length - 1].timestamp - navigationEvents[0].timestamp : 0,
      activityTimes: navigationEvents.map(e => new Date(e.timestamp).toISOString())
    };
  }

  private analyzeDevicePreferences(): any {
    return {
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browserFeatures: this.getBrowserFeatures()
    };
  }

  private getBrowserFeatures(): string[] {
    const features: string[] = [];
    
    if ('geolocation' in navigator) features.push('geolocation');
    if ('webkitSpeechRecognition' in window) features.push('speech-recognition');
    if ('serviceWorker' in navigator) features.push('service-worker');
    if ('PushManager' in window) features.push('push-notifications');
    if ('Notification' in window) features.push('notifications');
    
    return features;
  }

  private async getUserBaselineProfile(userId: string): Promise<Partial<UserBehaviorProfile> | null> {
    const { data } = await supabase
      .from('behavioral_analytics')
      .select('activity_data')
      .eq('user_id', userId)
      .eq('activity_type', 'baseline_profile')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data?.activity_data?.profile || null;
  }

  private async calculateAnomalyScore(current: Partial<UserBehaviorProfile>, baseline: Partial<UserBehaviorProfile> | null): Promise<number> {
    if (!baseline) return 0.5; // No baseline means moderate risk

    let totalScore = 0;
    let comparisons = 0;

    // Compare typing patterns
    if (current.typingPattern && baseline.typingPattern) {
      const typingScore = this.compareTypingPatterns(current.typingPattern, baseline.typingPattern);
      totalScore += typingScore;
      comparisons++;
    }

    // Compare mouse movements
    if (current.mouseMovements && baseline.mouseMovements) {
      const mouseScore = this.compareMouseMovements(current.mouseMovements, baseline.mouseMovements);
      totalScore += mouseScore;
      comparisons++;
    }

    // Compare navigation patterns
    if (current.navigationPatterns && baseline.navigationPatterns) {
      const navScore = this.compareNavigationPatterns(current.navigationPatterns, baseline.navigationPatterns);
      totalScore += navScore;
      comparisons++;
    }

    return comparisons > 0 ? totalScore / comparisons : 0.5;
  }

  private compareTypingPatterns(current: any, baseline: any): number {
    if (!current || !baseline) return 0.5;

    // Compare average typing speed
    const speedDifference = Math.abs(current.averageSpeed - baseline.averageSpeed) / baseline.averageSpeed;
    
    // Compare keystroke intervals (simplified)
    let intervalScore = 0;
    if (current.keystrokeInterval.length > 0 && baseline.keystrokeInterval.length > 0) {
      const currentAvg = current.keystrokeInterval.reduce((a: number, b: number) => a + b, 0) / current.keystrokeInterval.length;
      const baselineAvg = baseline.keystrokeInterval.reduce((a: number, b: number) => a + b, 0) / baseline.keystrokeInterval.length;
      intervalScore = Math.abs(currentAvg - baselineAvg) / baselineAvg;
    }

    // Average the scores
    return (speedDifference + intervalScore) / 2;
  }

  private compareMouseMovements(current: any, baseline: any): number {
    if (!current || !baseline) return 0.5;

    const speedDifference = Math.abs(current.averageSpeed - baseline.averageSpeed) / baseline.averageSpeed;
    return Math.min(speedDifference, 1);
  }

  private compareNavigationPatterns(current: any, baseline: any): number {
    if (!current || !baseline) return 0.5;

    // Compare common paths
    const currentPaths = new Set(current.commonPaths);
    const baselinePaths = new Set(baseline.commonPaths);
    const intersection = new Set([...currentPaths].filter(x => baselinePaths.has(x)));
    const union = new Set([...currentPaths, ...baselinePaths]);
    
    const pathSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    return 1 - pathSimilarity; // Higher score means more different
  }

  private identifyRiskIndicators(current: Partial<UserBehaviorProfile>, baseline: Partial<UserBehaviorProfile> | null): any[] {
    const indicators: any[] = [];

    if (!baseline) {
      indicators.push({
        type: 'no_baseline',
        severity: 'medium',
        description: 'No baseline behavior profile available'
      });
      return indicators;
    }

    // Check for significant typing pattern changes
    if (current.typingPattern && baseline.typingPattern) {
      const speedDiff = Math.abs(current.typingPattern.averageSpeed - baseline.typingPattern.averageSpeed);
      if (speedDiff > baseline.typingPattern.averageSpeed * 0.5) {
        indicators.push({
          type: 'typing_pattern_anomaly',
          severity: 'high',
          description: 'Significant change in typing speed detected'
        });
      }
    }

    // Check for unusual navigation patterns
    if (current.navigationPatterns && baseline.navigationPatterns) {
      const newPaths = current.navigationPatterns.commonPaths.filter(
        path => !baseline.navigationPatterns.commonPaths.includes(path)
      );
      
      if (newPaths.length > baseline.navigationPatterns.commonPaths.length * 0.5) {
        indicators.push({
          type: 'navigation_anomaly',
          severity: 'medium',
          description: 'Unusual navigation patterns detected'
        });
      }
    }

    return indicators;
  }

  private async updateBaselineProfile(userId: string, profile: Partial<UserBehaviorProfile>): Promise<void> {
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) return;

    // Store or update baseline profile
    await supabase.from('behavioral_analytics').upsert({
      user_id: userId,
      org_id: userProfile.organization_id,
      activity_type: 'baseline_profile',
      activity_data: { profile },
      anomaly_score: 0
    });
  }

  // Public methods for risk assessment
  async getCurrentUserAnomalyScore(): Promise<number> {
    const profile = await getCurrentUserProfile();
    if (!profile) return 50;

    const { data } = await supabase
      .from('behavioral_analytics')
      .select('anomaly_score')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!data || data.length === 0) return 50;

    // Return average of recent scores
    const avgScore = data.reduce((sum, record) => sum + record.anomaly_score, 0) / data.length;
    return avgScore;
  }

  async getBehaviorAnalytics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile) return null;

    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 1);
    }

    const { data } = await supabase
      .from('behavioral_analytics')
      .select('*')
      .eq('user_id', profile.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    return {
      totalEvents: data?.length || 0,
      averageAnomalyScore: data?.length ? 
        data.reduce((sum, record) => sum + record.anomaly_score, 0) / data.length : 0,
      riskIndicators: data?.flatMap(record => record.risk_indicators || []) || [],
      timeline: data?.map(record => ({
        timestamp: record.created_at,
        anomalyScore: record.anomaly_score,
        activityType: record.activity_type
      })) || []
    };
  }
}

export const behavioralAnalyticsService = new BehavioralAnalyticsService();
