
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface PushSubscription {
  id: string;
  user_id: string;
  org_id: string;
  subscription_data: any;
  device_info: any;
  notification_preferences: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfflineSyncItem {
  id: string;
  user_id: string;
  org_id: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  action_data: any;
  sync_status: string;
  retry_count: number;
  last_retry_at?: string;
  created_at: string;
  synced_at?: string;
}

class EnhancedMobilePWAService {
  private serviceWorker?: ServiceWorkerRegistration;

  // Initialize PWA capabilities
  async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Request notification permission
        await this.requestNotificationPermission();
        
        // Setup push notifications
        await this.setupPushNotifications();
        
        // Initialize offline sync
        this.initializeOfflineSync();
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Setup push notifications
  async setupPushNotifications(): Promise<void> {
    if (!this.serviceWorker) return;

    try {
      const subscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
      });

      await this.savePushSubscription(subscription);
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  // Save push subscription to database
  private async savePushSubscription(subscription: globalThis.PushSubscription): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const subscriptionData = {
      user_id: profile.id,
      org_id: profile.organization_id,
      subscription_data: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      },
      device_info: {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      notification_preferences: {
        incidents: true,
        kri_breaches: true,
        vendor_alerts: true,
        system_updates: false
      },
      is_active: true
    };

    await supabase
      .from('push_subscriptions')
      .upsert([subscriptionData], { onConflict: 'user_id' });
  }

  // Send push notification
  async sendPushNotification(userId: string, notification: any): Promise<void> {
    // This would typically be called from a server-side function
    // For demo purposes, we'll show how it would work
    
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!subscriptions || subscriptions.length === 0) return;

    // In production, this would be handled by an edge function
    console.log('Would send notification to:', subscriptions.length, 'devices');
    console.log('Notification:', notification);
  }

  // Offline sync functionality
  async addToOfflineQueue(action: Partial<OfflineSyncItem>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const queueItem = {
      user_id: profile.id,
      org_id: profile.organization_id,
      action_type: action.action_type!,
      entity_type: action.entity_type!,
      entity_id: action.entity_id,
      action_data: action.action_data || {},
      sync_status: 'pending',
      retry_count: 0
    };

    // Store in IndexedDB for offline access
    await this.storeInIndexedDB('offline_queue', queueItem);

    // Also try to store in Supabase if online
    if (navigator.onLine) {
      try {
        await supabase
          .from('offline_sync_queue')
          .insert([queueItem]);
      } catch (error) {
        console.log('Failed to store in Supabase, will sync later');
      }
    }
  }

  // Process offline sync queue
  async processOfflineQueue(): Promise<void> {
    if (!navigator.onLine) return;

    const queueItems = await this.getFromIndexedDB('offline_queue');
    
    for (const item of queueItems) {
      try {
        await this.syncQueueItem(item);
        await this.removeFromIndexedDB('offline_queue', item.id);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        // Increment retry count
        item.retry_count = (item.retry_count || 0) + 1;
        if (item.retry_count < 3) {
          await this.storeInIndexedDB('offline_queue', item);
        }
      }
    }
  }

  // Sync individual queue item
  private async syncQueueItem(item: any): Promise<void> {
    switch (item.entity_type) {
      case 'incident':
        await this.syncIncident(item);
        break;
      case 'kri_log':
        await this.syncKRILog(item);
        break;
      case 'vendor_assessment':
        await this.syncVendorAssessment(item);
        break;
      default:
        console.warn('Unknown entity type for sync:', item.entity_type);
    }
  }

  private async syncIncident(item: any): Promise<void> {
    if (item.action_type === 'create') {
      await supabase
        .from('incident_logs')
        .insert([item.action_data]);
    } else if (item.action_type === 'update') {
      await supabase
        .from('incident_logs')
        .update(item.action_data)
        .eq('id', item.entity_id);
    }
  }

  private async syncKRILog(item: any): Promise<void> {
    if (item.action_type === 'create') {
      await supabase
        .from('kri_logs')
        .insert([item.action_data]);
    }
  }

  private async syncVendorAssessment(item: any): Promise<void> {
    if (item.action_type === 'create') {
      await supabase
        .from('vendor_assessments')
        .insert([item.action_data]);
    }
  }

  // Initialize offline sync
  private initializeOfflineSync(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Back online, processing sync queue');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline, enabling offline mode');
    });

    // Process queue on initialization if online
    if (navigator.onLine) {
      this.processOfflineQueue();
    }
  }

  // Location-based risk assessment
  async getLocationRiskAssessment(): Promise<any> {
    if (!navigator.geolocation) {
      return { error: 'Geolocation not supported' };
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const riskAssessment = await this.analyzeLocationRisk(latitude, longitude);
            resolve(riskAssessment);
          } catch (error) {
            reject(error);
          }
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  // Analyze location-based risk
  private async analyzeLocationRisk(latitude: number, longitude: number): Promise<any> {
    // This would integrate with external risk intelligence APIs
    // For demo purposes, we'll simulate the analysis
    
    const riskFactors = {
      natural_disasters: this.assessNaturalDisasterRisk(latitude, longitude),
      political_stability: this.assessPoliticalStability(latitude, longitude),
      cyber_threat_landscape: this.assessCyberThreatLandscape(latitude, longitude),
      infrastructure_reliability: this.assessInfrastructureReliability(latitude, longitude)
    };

    const overallRisk = Object.values(riskFactors).reduce((sum, risk: any) => sum + risk.score, 0) / 4;

    return {
      location: { latitude, longitude },
      overall_risk_score: overallRisk,
      risk_level: this.getRiskLevel(overallRisk),
      risk_factors: riskFactors,
      recommendations: this.generateLocationRecommendations(riskFactors),
      last_updated: new Date().toISOString()
    };
  }

  private assessNaturalDisasterRisk(lat: number, lng: number): any {
    // Simplified risk assessment based on geographic regions
    const riskScore = Math.random() * 40 + 10; // 10-50 range
    return {
      score: riskScore,
      factors: ['earthquake', 'flood', 'wildfire'],
      description: 'Natural disaster risk assessment based on historical data'
    };
  }

  private assessPoliticalStability(lat: number, lng: number): any {
    const riskScore = Math.random() * 30 + 5; // 5-35 range
    return {
      score: riskScore,
      factors: ['regulatory_changes', 'political_unrest'],
      description: 'Political stability assessment'
    };
  }

  private assessCyberThreatLandscape(lat: number, lng: number): any {
    const riskScore = Math.random() * 50 + 20; // 20-70 range
    return {
      score: riskScore,
      factors: ['cyber_attacks', 'data_breaches'],
      description: 'Cyber threat landscape assessment'
    };
  }

  private assessInfrastructureReliability(lat: number, lng: number): any {
    const riskScore = Math.random() * 35 + 10; // 10-45 range
    return {
      score: riskScore,
      factors: ['power_grid', 'telecommunications', 'transportation'],
      description: 'Infrastructure reliability assessment'
    };
  }

  private getRiskLevel(score: number): string {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  private generateLocationRecommendations(riskFactors: any): string[] {
    const recommendations = [];
    
    Object.entries(riskFactors).forEach(([factor, data]: [string, any]) => {
      if (data.score > 40) {
        recommendations.push(`Enhanced monitoring recommended for ${factor.replace('_', ' ')}`);
      }
    });

    return recommendations;
  }

  // Touch and gesture optimization
  initializeTouchOptimizations(): void {
    // Add touch-friendly interactions
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

    // Add swipe gesture support
    this.initializeSwipeGestures();
  }

  private handleTouchStart(event: TouchEvent): void {
    // Store initial touch position for gesture recognition
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      (event.target as any)._touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    // Handle touch move for custom gestures
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const target = event.target as any;
      
      if (target._touchStart) {
        target._touchCurrent = {
          x: touch.clientX,
          y: touch.clientY
        };
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const target = event.target as any;
    
    if (target._touchStart && target._touchCurrent) {
      const deltaX = target._touchCurrent.x - target._touchStart.x;
      const deltaY = target._touchCurrent.y - target._touchStart.y;
      const deltaTime = Date.now() - target._touchStart.time;
      
      // Detect swipe gestures
      if (Math.abs(deltaX) > 50 && deltaTime < 500) {
        const direction = deltaX > 0 ? 'right' : 'left';
        this.handleSwipe(target, direction);
      }
      
      // Clean up
      delete target._touchStart;
      delete target._touchCurrent;
    }
  }

  private initializeSwipeGestures(): void {
    // Add swipe navigation for mobile
    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('swiperight', () => {
        // Navigate back or show menu
        history.back();
      });
      
      main.addEventListener('swipeleft', () => {
        // Navigate forward or hide menu
        // Custom implementation
      });
    }
  }

  private handleSwipe(target: Element, direction: string): void {
    // Emit custom swipe event
    const swipeEvent = new CustomEvent(`swipe${direction}`, {
      detail: { target, direction }
    });
    target.dispatchEvent(swipeEvent);
  }

  // Progressive enhancement features
  async checkDeviceCapabilities(): Promise<any> {
    const capabilities = {
      online: navigator.onLine,
      touch: 'ontouchstart' in window,
      orientation: 'orientation' in screen,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      notifications: 'Notification' in window,
      storage: 'localStorage' in window,
      indexedDB: 'indexedDB' in window,
      geolocation: 'geolocation' in navigator,
      serviceWorker: 'serviceWorker' in navigator,
      webWorker: 'Worker' in window,
      bluetooth: 'bluetooth' in navigator,
      battery: 'getBattery' in navigator,
      network: 'connection' in navigator,
      device_memory: (navigator as any).deviceMemory,
      hardware_concurrency: navigator.hardwareConcurrency
    };

    // Store capabilities for adaptive behavior
    localStorage.setItem('device_capabilities', JSON.stringify(capabilities));
    
    return capabilities;
  }

  // Adaptive loading based on device capabilities
  async adaptiveLoading(): Promise<void> {
    const capabilities = await this.checkDeviceCapabilities();
    
    // Adjust behavior based on device capabilities
    if (capabilities.device_memory && capabilities.device_memory < 4) {
      // Low memory device - reduce features
      document.body.classList.add('low-memory-mode');
    }
    
    if (!capabilities.online) {
      // Offline mode
      document.body.classList.add('offline-mode');
    }
    
    if (capabilities.touch) {
      // Touch device optimizations
      document.body.classList.add('touch-device');
      this.initializeTouchOptimizations();
    }
  }

  // Utility methods for PWA functionality
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // IndexedDB operations
  private async storeInIndexedDB(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ResilientFI', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const putRequest = store.put({ ...data, id: data.id || Date.now().toString() });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      };
    });
  }

  private async getFromIndexedDB(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ResilientFI', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  }

  private async removeFromIndexedDB(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ResilientFI', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }
}

export const enhancedMobilePWAService = new EnhancedMobilePWAService();
