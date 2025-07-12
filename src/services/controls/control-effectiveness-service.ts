
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface ControlEffectivenessMetrics {
  totalControls: number;
  activeControls: number;
  testedControls: number;
  effectiveControls: number;
  passRate: number;
  failRate: number;
  avgTestInterval: number;
  avgEffectivenessScore: number;
  overdueTests: number;
}

export interface ControlTestMetrics {
  controlId: string;
  controlTitle: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  partialTests: number;
  passRate: number;
  lastTestDate?: string;
  avgEffectivenessScore?: number;
  testInterval?: number;
}

export class ControlEffectivenessService {
  async getControlEffectivenessMetrics(): Promise<ControlEffectivenessMetrics> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // Get controls data
    const { data: controls, error: controlsError } = await supabase
      .from('controls')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (controlsError) {
      logger.error('Failed to fetch controls for effectiveness metrics', {
        module: 'controls'
      }, controlsError);
      throw new Error('Failed to fetch controls');
    }

    // Get control tests data
    const { data: tests, error: testsError } = await supabase
      .from('control_tests')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (testsError) {
      logger.error('Failed to fetch control tests for effectiveness metrics', {
        module: 'controls'
      }, testsError);
      throw new Error('Failed to fetch control tests');
    }

    const totalControls = controls?.length || 0;
    const activeControls = controls?.filter(c => c.status === 'active').length || 0;
    const testedControls = controls?.filter(c => c.last_test_date).length || 0;
    const effectiveControls = controls?.filter(c => c.effectiveness_score && c.effectiveness_score >= 4).length || 0;

    const totalTests = tests?.length || 0;
    const passedTests = tests?.filter(t => t.test_result === 'pass').length || 0;
    const failedTests = tests?.filter(t => t.test_result === 'fail').length || 0;

    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const failRate = totalTests > 0 ? (failedTests / totalTests) * 100 : 0;

    // Calculate average test interval
    const controlsWithIntervals = controls?.filter(c => c.test_frequency_days) || [];
    const avgTestInterval = controlsWithIntervals.length > 0 
      ? controlsWithIntervals.reduce((sum, c) => sum + (c.test_frequency_days || 0), 0) / controlsWithIntervals.length
      : 0;

    // Calculate average effectiveness score
    const controlsWithScores = controls?.filter(c => c.effectiveness_score) || [];
    const avgEffectivenessScore = controlsWithScores.length > 0
      ? controlsWithScores.reduce((sum, c) => sum + (c.effectiveness_score || 0), 0) / controlsWithScores.length
      : 0;

    // Calculate overdue tests
    const now = new Date();
    const overdueTests = controls?.filter(c => 
      c.next_test_due_date && new Date(c.next_test_due_date) < now
    ).length || 0;

    return {
      totalControls,
      activeControls,
      testedControls,
      effectiveControls,
      passRate: Math.round(passRate * 100) / 100,
      failRate: Math.round(failRate * 100) / 100,
      avgTestInterval: Math.round(avgTestInterval),
      avgEffectivenessScore: Math.round(avgEffectivenessScore * 100) / 100,
      overdueTests,
    };
  }

  async getControlTestMetrics(): Promise<ControlTestMetrics[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    const { data: controls, error: controlsError } = await supabase
      .from('controls')
      .select(`
        id,
        title,
        last_test_date,
        effectiveness_score,
        test_frequency_days
      `)
      .eq('org_id', profile.organization_id);

    if (controlsError) {
      logger.error('Failed to fetch controls for test metrics', {
        module: 'controls'
      }, controlsError);
      throw new Error('Failed to fetch controls');
    }

    const { data: tests, error: testsError } = await supabase
      .from('control_tests')
      .select('control_id, test_result, effectiveness_rating')
      .eq('org_id', profile.organization_id);

    if (testsError) {
      logger.error('Failed to fetch tests for metrics', {
        module: 'controls'
      }, testsError);
      throw new Error('Failed to fetch tests');
    }

    const controlMetrics: ControlTestMetrics[] = [];

    controls?.forEach(control => {
      const controlTests = tests?.filter(t => t.control_id === control.id) || [];
      const totalTests = controlTests.length;
      const passedTests = controlTests.filter(t => t.test_result === 'pass').length;
      const failedTests = controlTests.filter(t => t.test_result === 'fail').length;
      const partialTests = controlTests.filter(t => t.test_result === 'partial').length;
      const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

      const avgEffectiveness = controlTests.length > 0
        ? controlTests
            .filter(t => t.effectiveness_rating)
            .reduce((sum, t) => sum + (t.effectiveness_rating || 0), 0) / 
            controlTests.filter(t => t.effectiveness_rating).length
        : undefined;

      controlMetrics.push({
        controlId: control.id,
        controlTitle: control.title,
        totalTests,
        passedTests,
        failedTests,
        partialTests,
        passRate: Math.round(passRate * 100) / 100,
        lastTestDate: control.last_test_date,
        avgEffectivenessScore: avgEffectiveness ? Math.round(avgEffectiveness * 100) / 100 : undefined,
        testInterval: control.test_frequency_days,
      });
    });

    return controlMetrics.sort((a, b) => b.totalTests - a.totalTests);
  }
}

export const controlEffectivenessService = new ControlEffectivenessService();
