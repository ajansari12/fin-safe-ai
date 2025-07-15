// Accessibility testing utilities for WCAG compliance

export interface AccessibilityTestResult {
  pass: boolean;
  message: string;
  element?: HTMLElement;
  wcagCriterion?: string;
}

export class AccessibilityTester {
  private results: AccessibilityTestResult[] = [];

  // Test color contrast ratios
  testColorContrast(
    foregroundColor: string, 
    backgroundColor: string, 
    isLargeText: boolean = false
  ): AccessibilityTestResult {
    const requiredRatio = isLargeText ? 3 : 4.5; // WCAG AA standards
    const ratio = this.calculateContrastRatio(foregroundColor, backgroundColor);
    
    return {
      pass: ratio >= requiredRatio,
      message: `Color contrast ratio: ${ratio.toFixed(2)} (required: ${requiredRatio})`,
      wcagCriterion: 'WCAG 2.1 AA 1.4.3'
    };
  }

  // Test touch target sizes
  testTouchTargets(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"]'
    );

    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // WCAG minimum touch target size
      
      const sizeTest = rect.width >= minSize && rect.height >= minSize;
      
      results.push({
        pass: sizeTest,
        message: `Touch target size: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px (minimum: ${minSize}x${minSize}px)`,
        element: element as HTMLElement,
        wcagCriterion: 'WCAG 2.1 AAA 2.5.5'
      });
    });

    return results;
  }

  // Test keyboard navigation
  testKeyboardNavigation(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    // Test if all interactive elements are focusable
    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute('tabindex');
      const isNaturallyFocusable = ['button', 'a', 'input', 'select', 'textarea'].includes(
        element.tagName.toLowerCase()
      );
      
      results.push({
        pass: isNaturallyFocusable || (tabIndex !== null && parseInt(tabIndex) >= 0),
        message: `Element ${index + 1} (${element.tagName.toLowerCase()}) is keyboard accessible`,
        element: element as HTMLElement,
        wcagCriterion: 'WCAG 2.1 AA 2.1.1'
      });
    });

    return results;
  }

  // Test ARIA labels and descriptions
  testAriaLabels(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    
    // Charts and complex widgets should have aria-label
    const charts = container.querySelectorAll('[role="img"], svg, canvas');
    charts.forEach((chart) => {
      const hasAriaLabel = chart.hasAttribute('aria-label') || chart.hasAttribute('aria-labelledby');
      
      results.push({
        pass: hasAriaLabel,
        message: `Chart/image has accessible label: ${hasAriaLabel}`,
        element: chart as HTMLElement,
        wcagCriterion: 'WCAG 2.1 AA 1.1.1'
      });
    });

    // Interactive elements should have accessible names
    const interactiveElements = container.querySelectorAll('button, a, input');
    interactiveElements.forEach((element) => {
      const hasAccessibleName = !!(
        element.hasAttribute('aria-label') ||
        element.hasAttribute('aria-labelledby') ||
        element.textContent?.trim() ||
        (element as HTMLInputElement).value ||
        element.hasAttribute('title')
      );
      
      results.push({
        pass: hasAccessibleName,
        message: `Interactive element has accessible name: ${hasAccessibleName}`,
        element: element as HTMLElement,
        wcagCriterion: 'WCAG 2.1 AA 4.1.2'
      });
    });

    return results;
  }

  // Test mobile responsiveness
  testMobileResponsiveness(container: HTMLElement): AccessibilityTestResult[] {
    const results: AccessibilityTestResult[] = [];
    
    // Test viewport responsiveness
    const hasViewportMeta = document.querySelector('meta[name="viewport"]');
    results.push({
      pass: !!hasViewportMeta,
      message: `Viewport meta tag present: ${!!hasViewportMeta}`,
      wcagCriterion: 'WCAG 2.1 AA 1.4.10'
    });

    // Test for horizontal scrolling at mobile widths
    const originalWidth = window.innerWidth;
    const mobileWidth = 375; // iPhone SE width
    
    // Simulate mobile width (this is a simplified test)
    const hasHorizontalScroll = document.body.scrollWidth > mobileWidth;
    results.push({
      pass: !hasHorizontalScroll,
      message: `No horizontal scrolling at mobile width: ${!hasHorizontalScroll}`,
      wcagCriterion: 'WCAG 2.1 AA 1.4.10'
    });

    return results;
  }

  // Run comprehensive accessibility test
  runFullTest(container: HTMLElement = document.body): {
    overall: boolean;
    results: AccessibilityTestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      score: number;
    };
  } {
    const allResults: AccessibilityTestResult[] = [
      ...this.testTouchTargets(container),
      ...this.testKeyboardNavigation(container),
      ...this.testAriaLabels(container),
      ...this.testMobileResponsiveness(container)
    ];

    const passed = allResults.filter(result => result.pass).length;
    const failed = allResults.filter(result => !result.pass).length;
    const total = allResults.length;
    const score = Math.round((passed / total) * 100);

    return {
      overall: failed === 0,
      results: allResults,
      summary: {
        total,
        passed,
        failed,
        score
      }
    };
  }

  private calculateContrastRatio(foreground: string, background: string): number {
    // Simplified contrast calculation - in a real implementation,
    // you'd parse CSS colors and calculate luminance properly
    const fg = this.hexToRgb(foreground);
    const bg = this.hexToRgb(background);
    
    if (!fg || !bg) return 1; // Fallback if colors can't be parsed
    
    const fgLum = this.getLuminance(fg);
    const bgLum = this.getLuminance(bg);
    
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
}

export const accessibilityTester = new AccessibilityTester();