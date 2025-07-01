
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface DeploymentRecord {
  id: string;
  org_id: string;
  service_name: string;
  deployment_version: string;
  environment: string;
  deployment_strategy: 'rolling' | 'blue_green' | 'canary' | 'recreate';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  deployed_by?: string;
  deployed_by_name?: string;
  rollback_target_version?: string;
  rollback_reason?: string;
  health_check_status: string;
  deployment_config: Record<string, any>;
  deployment_logs: Array<any>;
  artifacts: Array<any>;
  created_at: string;
  updated_at: string;
}

export interface DeploymentConfig {
  replicas?: number;
  resources?: {
    cpu: string;
    memory: string;
  };
  environmentVariables?: Record<string, string>;
  healthCheck?: {
    path: string;
    initialDelaySeconds: number;
  };
  rollbackOnFailure?: boolean;
  progressDeadlineSeconds?: number;
}

class DatabaseDeploymentManager {
  // Start a new deployment
  async startDeployment(deployment: {
    service_name: string;
    deployment_version: string;
    environment: string;
    deployment_strategy: DeploymentRecord['deployment_strategy'];
    deployment_config: DeploymentConfig;
  }): Promise<string> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('deployment_history')
      .insert({
        org_id: profile.organization_id,
        service_name: deployment.service_name,
        deployment_version: deployment.deployment_version,
        environment: deployment.environment,
        deployment_strategy: deployment.deployment_strategy,
        status: 'pending',
        deployed_by: profile.id,
        deployed_by_name: profile.full_name,
        deployment_config: deployment.deployment_config,
        deployment_logs: [],
        artifacts: []
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Update deployment status
  async updateDeploymentStatus(
    deploymentId: string, 
    status: DeploymentRecord['status'],
    logs?: string[],
    healthCheckStatus?: string
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    if (logs) {
      updateData.deployment_logs = logs;
    }
    
    if (healthCheckStatus) {
      updateData.health_check_status = healthCheckStatus;
    }

    const { error } = await supabase
      .from('deployment_history')
      .update(updateData)
      .eq('id', deploymentId);

    if (error) throw error;
  }

  // Get deployment history
  async getDeploymentHistory(serviceName?: string, environment?: string, limit: number = 50): Promise<DeploymentRecord[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('deployment_history')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (serviceName) {
      query = query.eq('service_name', serviceName);
    }

    if (environment) {
      query = query.eq('environment', environment);
    }

    const { data, error } = await query
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get deployment by ID
  async getDeployment(deploymentId: string): Promise<DeploymentRecord | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('deployment_history')
      .select('*')
      .eq('id', deploymentId)
      .eq('org_id', profile.organization_id)
      .single();

    if (error) return null;
    return data;
  }

  // Rollback deployment
  async rollbackDeployment(deploymentId: string, targetVersion: string, reason: string): Promise<string> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get the original deployment
    const originalDeployment = await this.getDeployment(deploymentId);
    if (!originalDeployment) throw new Error('Deployment not found');

    // Create rollback deployment
    const { data, error } = await supabase
      .from('deployment_history')
      .insert({
        org_id: profile.organization_id,
        service_name: originalDeployment.service_name,
        deployment_version: targetVersion,
        environment: originalDeployment.environment,
        deployment_strategy: 'rolling', // Default to rolling for rollbacks
        status: 'pending',
        deployed_by: profile.id,
        deployed_by_name: profile.full_name,
        rollback_target_version: targetVersion,
        rollback_reason: reason,
        deployment_config: originalDeployment.deployment_config,
        deployment_logs: [`Rollback initiated: ${reason}`],
        artifacts: []
      })
      .select('id')
      .single();

    if (error) throw error;

    // Update original deployment as rolled back
    await this.updateDeploymentStatus(deploymentId, 'rolled_back');

    return data.id;
  }

  // Get deployment statistics
  async getDeploymentStats(days: number = 30): Promise<{
    totalDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    rollbacks: number;
    averageDuration: number;
    deploymentsByEnvironment: Record<string, number>;
  }> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return {
      totalDeployments: 0,
      successfulDeployments: 0,
      failedDeployments: 0,
      rollbacks: 0,
      averageDuration: 0,
      deploymentsByEnvironment: {}
    };

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('deployment_history')
      .select('status, environment, duration_seconds, rollback_target_version')
      .eq('org_id', profile.organization_id)
      .gte('started_at', cutoffDate.toISOString());

    if (error) throw error;

    const deployments = data || [];
    const successful = deployments.filter(d => d.status === 'completed').length;
    const failed = deployments.filter(d => d.status === 'failed').length;
    const rollbacks = deployments.filter(d => d.rollback_target_version).length;
    
    const durations = deployments
      .filter(d => d.duration_seconds)
      .map(d => d.duration_seconds!);
    const averageDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    const deploymentsByEnvironment = deployments.reduce((acc, d) => {
      acc[d.environment] = (acc[d.environment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDeployments: deployments.length,
      successfulDeployments: successful,
      failedDeployments: failed,
      rollbacks,
      averageDuration: Math.round(averageDuration),
      deploymentsByEnvironment
    };
  }

  // Get active deployments
  async getActiveDeployments(): Promise<DeploymentRecord[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('deployment_history')
      .select('*')
      .eq('org_id', profile.organization_id)
      .in('status', ['pending', 'in_progress'])
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Clean up old deployment records
  async cleanupOldDeployments(retentionDays: number = 90): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('deployment_history')
      .delete()
      .eq('org_id', profile.organization_id)
      .lt('started_at', cutoffDate.toISOString());

    if (error) throw error;
  }
}

export const databaseDeploymentManager = new DatabaseDeploymentManager();
