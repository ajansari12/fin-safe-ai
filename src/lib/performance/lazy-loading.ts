// Lazy loading utilities for performance optimization
import { lazy } from 'react';

// Chart.js heavy components - lazy load these
export const LazyChartComponents = {
  PredictiveAnalyticsChart: lazy(() => import('@/components/analytics/PredictiveAnalyticsChart')),
  ExecutiveDashboard: lazy(() => import('@/components/analytics/ExecutiveDashboard')),
  OperationalDashboard: lazy(() => import('@/components/analytics/OperationalDashboard')),
  AnalyticsHub: lazy(() => import('@/components/analytics/AnalyticsHub')),
  LightweightAnalyticsHub: lazy(() => import('@/components/analytics/LightweightAnalyticsHub')),
};

// Admin/Settings components - low priority
export const LazyAdminComponents = {
  AdminInterface: lazy(() => import('@/components/admin/AdminInterface')),
  SampleDataManager: lazy(() => import('@/components/admin/SampleDataManager')),
  UserManagement: lazy(() => import('@/components/admin/UserManagement')),
  SecuritySettings: lazy(() => import('@/components/security/SecuritySettings')),
  EnterpriseSecurityDashboard: lazy(() => import('@/components/security/EnterpriseSecurityDashboard')),
};

// Reporting components - PDF generation heavy
export const LazyReportingComponents = {
  PDFReportGenerator: lazy(() => import('@/components/reporting/PDFReportGenerator')),
  RegulatoryReportingDashboard: lazy(() => import('@/components/regulatory-reporting/RegulatoryReportingDashboard')),
};

// Preload critical routes during idle time
export const preloadCriticalRoutes = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload dashboard analytics
      import('@/components/analytics/UnifiedAnalyticsDashboard');
      
      // Preload commonly used chart components
      import('@/components/analytics/ExecutiveDashboard');
      import('@/components/analytics/OperationalDashboard');
    });
  }
};

// Intersection Observer for lazy loading non-critical sections
export const createLazyLoader = (callback: () => void, rootMargin = '100px') => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    },
    { rootMargin }
  );

  return observer;
};