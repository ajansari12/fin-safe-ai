// UI Optimization Test Suite for Mobile and Accessibility
import { accessibilityTester, AccessibilityTestResult } from './accessibility-test';
import { measurePerformance } from './mobile-optimization';

interface UIOptimizationTestResult {
  category: string;
  testName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
  wcagCriterion?: string;
}

export class UIOptimizationTester {
  private results: UIOptimizationTestResult[] = [];

  // Test mobile responsiveness
  testMobileResponsiveness(): UIOptimizationTestResult[] {
    const startTime = performance.now();
    const results: UIOptimizationTestResult[] = [];

    // Test sidebar responsiveness
    const sidebar = document.querySelector('#sidebar-navigation') as HTMLElement;
    if (sidebar) {
      // Check if sidebar has proper mobile classes
      const hasResponsiveClasses = sidebar.className.includes('lg:static') && 
                                  sidebar.className.includes('fixed');
      
      results.push({
        category: 'Mobile Responsiveness',
        testName: 'Sidebar Mobile Classes',
        status: hasResponsiveClasses ? 'pass' : 'fail',
        message: `Sidebar has responsive positioning classes: ${hasResponsiveClasses}`,
        duration: performance.now() - startTime
      });

      // Test if sidebar collapses on mobile
      const hasCollapsibleWidth = sidebar.className.includes('w-0') || 
                                  sidebar.className.includes('translate-x');
      
      results.push({
        category: 'Mobile Responsiveness',
        testName: 'Sidebar Collapse Functionality',
        status: hasCollapsibleWidth ? 'pass' : 'fail',
        message: `Sidebar has collapsible width classes: ${hasCollapsibleWidth}`,
        duration: performance.now() - startTime
      });
    }

    // Test tab responsiveness in analytics
    const tabsList = document.querySelector('[role="tablist"]') as HTMLElement;
    if (tabsList) {
      const hasResponsiveGrid = tabsList.className.includes('grid-cols-2') && 
                                tabsList.className.includes('sm:grid-cols-3');
      
      results.push({
        category: 'Mobile Responsiveness',
        testName: 'Analytics Tabs Mobile Layout',
        status: hasResponsiveGrid ? 'pass' : 'fail',
        message: `Analytics tabs have responsive grid layout: ${hasResponsiveGrid}`,
        duration: performance.now() - startTime
      });
    }

    return results;
  }

  // Test touch target sizes
  testTouchTargets(): UIOptimizationTestResult[] {
    const results: UIOptimizationTestResult[] = [];
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="tab"]'
    );

    let passCount = 0;
    let failCount = 0;

    interactiveElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // WCAG AAA requirement
      
      const meetsSize = rect.width >= minSize && rect.height >= minSize;
      const hasMinHeightClass = element.className.includes('min-h-[44px]');
      
      // Pass if either actual size or CSS class indicates proper sizing
      const passes = meetsSize || hasMinHeightClass;
      
      if (passes) passCount++;
      else failCount++;

      if (!passes) {
        results.push({
          category: 'Touch Targets',
          testName: `Element ${index + 1} Touch Target Size`,
          status: 'fail',
          message: `Touch target too small: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px (required: ${minSize}x${minSize}px)`,
          wcagCriterion: 'WCAG 2.1 AAA 2.5.5'
        });
      }
    });

    // Summary result
    results.unshift({
      category: 'Touch Targets',
      testName: 'Overall Touch Target Compliance',
      status: failCount === 0 ? 'pass' : failCount < passCount ? 'warning' : 'fail',
      message: `Touch targets: ${passCount} pass, ${failCount} fail out of ${interactiveElements.length} total`,
      wcagCriterion: 'WCAG 2.1 AAA 2.5.5'
    });

    return results;
  }

  // Test ARIA labels and accessibility
  testAccessibilityLabels(): UIOptimizationTestResult[] {
    const results: UIOptimizationTestResult[] = [];

    // Test navigation ARIA
    const nav = document.querySelector('#sidebar-navigation');
    if (nav) {
      const hasAriaLabel = nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby');
      const hasRole = nav.hasAttribute('role');
      
      results.push({
        category: 'ARIA Labels',
        testName: 'Navigation ARIA Support',
        status: hasAriaLabel && hasRole ? 'pass' : 'fail',
        message: `Navigation has proper ARIA labels and role: ${hasAriaLabel && hasRole}`,
        wcagCriterion: 'WCAG 2.1 AA 4.1.2'
      });
    }

    // Test menu button ARIA
    const menuButtons = document.querySelectorAll('button[aria-expanded]');
    results.push({
      category: 'ARIA Labels',
      testName: 'Menu Button ARIA Expanded',
      status: menuButtons.length > 0 ? 'pass' : 'fail',
      message: `Menu buttons with aria-expanded found: ${menuButtons.length}`,
      wcagCriterion: 'WCAG 2.1 AA 4.1.2'
    });

    // Test tab ARIA labels
    const tabs = document.querySelectorAll('[role="tab"]');
    let tabsWithLabels = 0;
    tabs.forEach(tab => {
      if (tab.hasAttribute('aria-label')) {
        tabsWithLabels++;
      }
    });

    results.push({
      category: 'ARIA Labels',
      testName: 'Tab ARIA Labels',
      status: tabsWithLabels === tabs.length ? 'pass' : tabs.length === 0 ? 'warning' : 'fail',
      message: `Tabs with ARIA labels: ${tabsWithLabels}/${tabs.length}`,
      wcagCriterion: 'WCAG 2.1 AA 4.1.2'
    });

    return results;
  }

  // Test chart accessibility
  testChartAccessibility(): UIOptimizationTestResult[] {
    const results: UIOptimizationTestResult[] = [];

    // Look for chart containers
    const chartContainers = document.querySelectorAll(
      '[role="img"], .recharts-wrapper, svg[role="img"], canvas[role="img"]'
    );

    let accessibleCharts = 0;
    chartContainers.forEach((chart, index) => {
      const hasAriaLabel = chart.hasAttribute('aria-label');
      const hasAriaDescription = chart.hasAttribute('aria-describedby');
      const isFocusable = chart.hasAttribute('tabindex') || chart.getAttribute('tabindex') === '0';
      
      const isAccessible = hasAriaLabel && (hasAriaDescription || isFocusable);
      
      if (isAccessible) accessibleCharts++;
      
      results.push({
        category: 'Chart Accessibility',
        testName: `Chart ${index + 1} Accessibility`,
        status: isAccessible ? 'pass' : 'fail',
        message: `Chart has aria-label: ${hasAriaLabel}, aria-describedby: ${hasAriaDescription}, focusable: ${isFocusable}`,
        wcagCriterion: 'WCAG 2.1 AA 1.1.1'
      });
    });

    if (chartContainers.length === 0) {
      results.push({
        category: 'Chart Accessibility',
        testName: 'Chart Detection',
        status: 'warning',
        message: 'No charts found on current page',
        wcagCriterion: 'WCAG 2.1 AA 1.1.1'
      });
    }

    return results;
  }

  // Test performance
  testMobilePerformance(): Promise<UIOptimizationTestResult[]> {
    return new Promise((resolve) => {
      const results: UIOptimizationTestResult[] = [];
      const startTime = performance.now();

      // Test page load performance
      const loadTime = performance.now() - performance.timeOrigin;
      results.push({
        category: 'Performance',
        testName: 'Page Load Time',
        status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
        message: `Page loaded in ${loadTime.toFixed(2)}ms (target: <3000ms)`,
        duration: loadTime
      });

      // Test DOM manipulation performance
      const domManipulationTest = measurePerformance('DOM Manipulation Test');
      
      // Simulate some DOM operations
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '<p>Performance test</p>';
      document.body.appendChild(testDiv);
      document.body.removeChild(testDiv);
      
      const domTime = performance.now() - startTime;
      domManipulationTest();

      results.push({
        category: 'Performance',
        testName: 'DOM Manipulation Speed',
        status: domTime < 100 ? 'pass' : domTime < 200 ? 'warning' : 'fail',
        message: `DOM operations completed in ${domTime.toFixed(2)}ms (target: <100ms)`,
        duration: domTime
      });

      // Test memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        
        results.push({
          category: 'Performance',
          testName: 'Memory Usage',
          status: memoryUsage < 50 ? 'pass' : memoryUsage < 100 ? 'warning' : 'fail',
          message: `Memory usage: ${memoryUsage.toFixed(2)}MB (target: <50MB)`,
          duration: memoryUsage
        });
      }

      resolve(results);
    });
  }

  // Run comprehensive UI optimization test
  async runFullTest(): Promise<{
    overall: 'pass' | 'warning' | 'fail';
    results: UIOptimizationTestResult[];
    summary: {
      total: number;
      passed: number;
      warnings: number;
      failed: number;
      score: number;
    };
    categories: {
      [key: string]: {
        passed: number;
        warnings: number;
        failed: number;
        score: number;
      };
    };
  }> {
    console.log('🚀 Starting UI Optimization Test Suite...');
    
    const allResults: UIOptimizationTestResult[] = [
      ...this.testMobileResponsiveness(),
      ...this.testTouchTargets(),
      ...this.testAccessibilityLabels(),
      ...this.testChartAccessibility(),
      ...(await this.testMobilePerformance())
    ];

    // Calculate summary statistics
    const passed = allResults.filter(r => r.status === 'pass').length;
    const warnings = allResults.filter(r => r.status === 'warning').length;
    const failed = allResults.filter(r => r.status === 'fail').length;
    const total = allResults.length;
    
    const score = Math.round(((passed + warnings * 0.5) / total) * 100);
    
    // Calculate category breakdowns
    const categories: { [key: string]: any } = {};
    allResults.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = { passed: 0, warnings: 0, failed: 0, score: 0 };
      }
      categories[result.category][result.status === 'pass' ? 'passed' : result.status === 'warning' ? 'warnings' : 'failed']++;
    });

    // Calculate category scores
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      const catTotal = cat.passed + cat.warnings + cat.failed;
      cat.score = Math.round(((cat.passed + cat.warnings * 0.5) / catTotal) * 100);
    });

    const overall = failed === 0 ? (warnings === 0 ? 'pass' : 'warning') : 'fail';

    console.log(`✅ UI Optimization Test Complete: ${overall.toUpperCase()}`);
    console.log(`📊 Score: ${score}% (${passed} passed, ${warnings} warnings, ${failed} failed)`);

    return {
      overall,
      results: allResults,
      summary: { total, passed, warnings, failed, score },
      categories
    };
  }
}

export const uiOptimizationTester = new UIOptimizationTester();