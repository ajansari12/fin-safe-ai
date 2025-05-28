import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  GovernanceFramework, 
  GovernanceStructure, 
  GovernanceRole, 
  GovernancePolicy,
  GovernanceReviewSchedule,
  GovernanceChangeLog,
  PolicyReviewStatus,
  PolicyApproval,
  ComplianceMetric,
  OverduePolicyReview
} from "@/pages/governance/types";

// Framework CRUD operations
export async function createFramework(framework: Omit<GovernanceFramework, 'id' | 'created_at' | 'updated_at'>): Promise<GovernanceFramework | null> {
  try {
    const { data, error } = await supabase
      .from('governance_frameworks')
      .insert(framework)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Log the creation in the change log
    await createChangeLog({
      framework_id: data.id,
      policy_id: null,
      change_type: 'created',
      description: `Created framework: ${framework.title}`,
      previous_version: null,
      new_version: 1,
      changed_by: framework.created_by
    });

    toast.success("Framework created successfully");
    return data as GovernanceFramework;
  } catch (error) {
    console.error('Error creating framework:', error);
    toast.error("Failed to create framework");
    return null;
  }
}

export async function getFrameworks(): Promise<GovernanceFramework[]> {
  try {
    const { data, error } = await supabase
      .from('governance_frameworks')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as GovernanceFramework[];
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    toast.error("Failed to load frameworks");
    return [];
  }
}

export async function getFrameworkById(id: string): Promise<GovernanceFramework | null> {
  try {
    const { data, error } = await supabase
      .from('governance_frameworks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as GovernanceFramework;
  } catch (error) {
    console.error(`Error fetching framework with ID ${id}:`, error);
    toast.error("Failed to load framework");
    return null;
  }
}

export async function updateFramework(id: string, updates: Partial<GovernanceFramework>): Promise<GovernanceFramework | null> {
  try {
    // Get current version before update
    const { data: currentFrame } = await supabase
      .from('governance_frameworks')
      .select('version')
      .eq('id', id)
      .single();

    const newVersion = currentFrame ? currentFrame.version + 1 : 1;
    
    // Update with new version
    const { data, error } = await supabase
      .from('governance_frameworks')
      .update({ ...updates, version: newVersion, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Log the update in the change log
    await createChangeLog({
      framework_id: id,
      policy_id: null,
      change_type: 'updated',
      description: `Updated framework: ${data.title}`,
      previous_version: currentFrame?.version || 0,
      new_version: newVersion,
      changed_by: updates.updated_by
    });

    toast.success("Framework updated successfully");
    return data as GovernanceFramework;
  } catch (error) {
    console.error(`Error updating framework with ID ${id}:`, error);
    toast.error("Failed to update framework");
    return null;
  }
}

export async function deleteFramework(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('governance_frameworks')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting framework with ID ${id}:`, error);
    return false;
  }
}

// Structure CRUD operations
export async function createStructure(structure: Omit<GovernanceStructure, 'id' | 'created_at' | 'updated_at'>): Promise<GovernanceStructure | null> {
  try {
    const { data, error } = await supabase
      .from('governance_structure')
      .insert(structure)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    toast.success(`${structure.type === 'committee' ? 'Committee' : 'Sponsor'} added successfully`);
    return data as GovernanceStructure;
  } catch (error) {
    console.error('Error creating structure:', error);
    toast.error(`Failed to add ${structure.type === 'committee' ? 'committee' : 'sponsor'}`);
    return null;
  }
}

export async function getStructuresByFrameworkId(frameworkId: string): Promise<GovernanceStructure[]> {
  try {
    const { data, error } = await supabase
      .from('governance_structure')
      .select('*')
      .eq('framework_id', frameworkId);

    if (error) {
      throw error;
    }

    return data as GovernanceStructure[];
  } catch (error) {
    console.error(`Error fetching structures for framework ${frameworkId}:`, error);
    toast.error("Failed to load governance structure");
    return [];
  }
}

// Role CRUD operations
export async function createRole(role: Omit<GovernanceRole, 'id' | 'created_at' | 'updated_at'>): Promise<GovernanceRole | null> {
  try {
    const { data, error } = await supabase
      .from('governance_roles')
      .insert(role)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    toast.success("Role added successfully");
    return data;
  } catch (error) {
    console.error('Error creating role:', error);
    toast.error("Failed to add role");
    return null;
  }
}

export async function getRolesByFrameworkId(frameworkId: string): Promise<GovernanceRole[]> {
  try {
    const { data, error } = await supabase
      .from('governance_roles')
      .select('*')
      .eq('framework_id', frameworkId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error fetching roles for framework ${frameworkId}:`, error);
    toast.error("Failed to load governance roles");
    return [];
  }
}

// Policy CRUD operations
export async function createPolicy(
  policy: Omit<GovernancePolicy, 'id' | 'created_at' | 'updated_at' | 'file_path' | 'file_type'>, 
  file?: File
): Promise<GovernancePolicy | null> {
  try {
    let filePath = null;
    let fileType = null;

    // Upload file if provided
    if (file) {
      const fileName = `${policy.framework_id}/${Date.now()}-${file.name}`;
      fileType = file.type;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('governance_documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      filePath = uploadData?.path || null;
    }

    // Create policy record
    const { data, error } = await supabase
      .from('governance_policies')
      .insert({
        ...policy,
        file_path: filePath,
        file_type: fileType
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Add change log entry
    await createChangeLog({
      framework_id: policy.framework_id,
      policy_id: data.id,
      change_type: 'created',
      description: `Created policy: ${policy.title}`,
      previous_version: null,
      new_version: 1,
      changed_by: null
    });

    toast.success("Policy created successfully");
    return data as GovernancePolicy;
  } catch (error) {
    console.error('Error creating policy:', error);
    toast.error("Failed to create policy");
    return null;
  }
}

export async function getPoliciesByFrameworkId(frameworkId: string): Promise<GovernancePolicy[]> {
  try {
    const { data, error } = await supabase
      .from('governance_policies')
      .select('*')
      .eq('framework_id', frameworkId);

    if (error) {
      throw error;
    }

    return data as GovernancePolicy[];
  } catch (error) {
    console.error(`Error fetching policies for framework ${frameworkId}:`, error);
    toast.error("Failed to load governance policies");
    return [];
  }
}

export async function updatePolicy(id: string, updates: Partial<GovernancePolicy>, file?: File): Promise<GovernancePolicy | null> {
  try {
    // Get current policy to track version
    const { data: currentPolicy } = await supabase
      .from('governance_policies')
      .select('version, title, file_path')
      .eq('id', id)
      .single();

    if (!currentPolicy) {
      throw new Error('Policy not found');
    }

    const newVersion = currentPolicy.version + 1;
    let filePath = currentPolicy.file_path;
    let fileType = updates.file_type;

    // Upload new file if provided
    if (file) {
      // Delete old file if it exists
      if (filePath) {
        await supabase
          .storage
          .from('governance_documents')
          .remove([filePath]);
      }

      // Upload new file
      const fileName = `${updates.framework_id}/${Date.now()}-${file.name}`;
      fileType = file.type;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('governance_documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      filePath = uploadData?.path || null;
    }

    // Update the policy
    const { data, error } = await supabase
      .from('governance_policies')
      .update({ 
        ...updates, 
        version: newVersion,
        file_path: filePath,
        file_type: fileType,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Log the update in the change log
    await createChangeLog({
      framework_id: data.framework_id,
      policy_id: id,
      change_type: 'updated',
      description: `Updated policy: ${data.title}`,
      previous_version: currentPolicy.version,
      new_version: newVersion,
      changed_by: null
    });

    toast.success("Policy updated successfully");
    return data as GovernancePolicy;
  } catch (error) {
    console.error(`Error updating policy with ID ${id}:`, error);
    toast.error("Failed to update policy");
    return null;
  }
}

// Review Schedule operations
export async function createReviewSchedule(schedule: Omit<GovernanceReviewSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<GovernanceReviewSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('governance_review_schedule')
      .insert(schedule)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    toast.success("Review schedule set successfully");
    return data as GovernanceReviewSchedule;
  } catch (error) {
    console.error('Error creating review schedule:', error);
    toast.error("Failed to set review schedule");
    return null;
  }
}

export async function getReviewScheduleByPolicyId(policyId: string): Promise<GovernanceReviewSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('governance_review_schedule')
      .select('*')
      .eq('policy_id', policyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw error;
    }

    return data as GovernanceReviewSchedule || null;
  } catch (error) {
    console.error(`Error fetching review schedule for policy ${policyId}:`, error);
    toast.error("Failed to load review schedule");
    return null;
  }
}

export async function updateReviewSchedule(id: string, updates: Partial<GovernanceReviewSchedule>): Promise<GovernanceReviewSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('governance_review_schedule')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    toast.success("Review schedule updated successfully");
    return data as GovernanceReviewSchedule;
  } catch (error) {
    console.error(`Error updating review schedule with ID ${id}:`, error);
    toast.error("Failed to update review schedule");
    return null;
  }
}

export async function completeReview(policyId: string, reviewId: string): Promise<void> {
  try {
    // Get policy and current version
    const { data: policy } = await supabase
      .from('governance_policies')
      .select('version, framework_id')
      .eq('id', policyId)
      .single();

    if (!policy) {
      throw new Error('Policy not found');
    }

    // Update last review date and set next review date
    const { data: schedule } = await supabase
      .from('governance_review_schedule')
      .select('review_frequency_months')
      .eq('id', reviewId)
      .single();

    if (!schedule) {
      throw new Error('Review schedule not found');
    }

    const lastReviewDate = new Date();
    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + schedule.review_frequency_months);

    // Update the review schedule
    await supabase
      .from('governance_review_schedule')
      .update({ 
        last_review_date: lastReviewDate.toISOString(),
        next_review_date: nextReviewDate.toISOString(),
        reminder_sent: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    // Create a change log entry
    await createChangeLog({
      framework_id: policy.framework_id,
      policy_id: policyId,
      change_type: 'reviewed',
      description: `Policy review completed`,
      previous_version: policy.version,
      new_version: policy.version,
      changed_by: null
    });

    toast.success("Review completed successfully");
  } catch (error) {
    console.error(`Error completing review for policy ${policyId}:`, error);
    toast.error("Failed to complete review");
  }
}

// New function for batch policy review
export async function batchCompleteReviews(policyIds: string[]): Promise<number> {
  try {
    let successCount = 0;

    // Get all related review schedules 
    const { data: schedules, error: schedulesError } = await supabase
      .from('governance_review_schedule')
      .select('id, policy_id')
      .in('policy_id', policyIds);

    if (schedulesError) {
      throw schedulesError;
    }
    
    // Process each policy and its review schedule
    for (const schedule of schedules || []) {
      try {
        await completeReview(schedule.policy_id, schedule.id);
        successCount++;
      } catch (error) {
        console.error(`Error completing review for policy ${schedule.policy_id}:`, error);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully completed ${successCount} policy reviews`);
    }
    
    return successCount;
  } catch (error) {
    console.error('Error in batch review completion:', error);
    toast.error("Failed to complete batch reviews");
    return 0;
  }
}

// Policy Review and Approval functions
export async function createPolicyReview(review: Omit<PolicyReviewStatus, 'id' | 'created_at' | 'updated_at'>): Promise<PolicyReviewStatus | null> {
  try {
    const { data, error } = await supabase
      .from('governance_policy_reviews')
      .insert(review)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    toast.success("Review status recorded successfully");
    return data as PolicyReviewStatus;
  } catch (error) {
    console.error('Error creating policy review status:', error);
    toast.error("Failed to record review status");
    return null;
  }
}

export async function getPolicyReviewsByPolicyId(policyId: string): Promise<PolicyReviewStatus[]> {
  try {
    const { data, error } = await supabase
      .from('governance_policy_reviews')
      .select('*')
      .eq('policy_id', policyId);

    if (error) {
      throw error;
    }

    return data as PolicyReviewStatus[] || [];
  } catch (error) {
    console.error(`Error fetching reviews for policy ${policyId}:`, error);
    toast.error("Failed to load policy reviews");
    return [];
  }
}

export async function createPolicyApproval(approval: Omit<PolicyApproval, 'id' | 'created_at' | 'updated_at'>): Promise<PolicyApproval | null> {
  try {
    const { data, error } = await supabase
      .from('governance_policy_approvals')
      .insert(approval)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    toast.success("Policy approval recorded successfully");
    return data as PolicyApproval;
  } catch (error) {
    console.error('Error recording policy approval:', error);
    toast.error("Failed to record policy approval");
    return null;
  }
}

export async function getPolicyApprovalsByPolicyId(policyId: string): Promise<PolicyApproval[]> {
  try {
    const { data, error } = await supabase
      .from('governance_policy_approvals')
      .select('*')
      .eq('policy_id', policyId);

    if (error) {
      throw error;
    }

    return data as PolicyApproval[] || [];
  } catch (error) {
    console.error(`Error fetching approvals for policy ${policyId}:`, error);
    toast.error("Failed to load policy approvals");
    return [];
  }
}

// Compliance metrics function
export async function getComplianceMetricsByOrgId(orgId: string): Promise<ComplianceMetric[]> {
  try {
    const now = new Date();
    
    // Get all frameworks for this org
    const { data: frameworks, error: frameworksError } = await supabase
      .from('governance_frameworks')
      .select('id, title')
      .eq('org_id', orgId);
      
    if (frameworksError) {
      throw frameworksError;
    }
    
    const metrics: ComplianceMetric[] = [];
    
    // Calculate metrics for each framework
    for (const framework of frameworks || []) {
      // Get all policies for this framework
      const { data: policies, error: policiesError } = await supabase
        .from('governance_policies')
        .select(`
          id, 
          status,
          governance_review_schedule (
            next_review_date
          )
        `)
        .eq('framework_id', framework.id);
        
      if (policiesError) {
        throw policiesError;
      }
      
      const totalPolicies = policies?.length || 0;
      const activePolicies = policies?.filter(p => p.status === 'active').length || 0;
      
      // Count policies needing review
      let policiesNeedingReview = 0;
      let policiesUpToDate = 0;
      
      for (const policy of policies || []) {
        if (!policy.governance_review_schedule) {
          // If no review schedule, it needs review
          policiesNeedingReview++;
        } else {
          // Fix: Handle the review schedule data properly
          const scheduleData = Array.isArray(policy.governance_review_schedule) 
            ? policy.governance_review_schedule[0] 
            : policy.governance_review_schedule;
            
          if (scheduleData && scheduleData.next_review_date) {
            const nextReviewDate = new Date(scheduleData.next_review_date);
            if (nextReviewDate < now) {
              policiesNeedingReview++;
            } else {
              policiesUpToDate++;
            }
          } else {
            policiesNeedingReview++;
          }
        }
      }
      
      metrics.push({
        framework_id: framework.id,
        framework_title: framework.title,
        total_policies: totalPolicies,
        active_policies: activePolicies,
        policies_needing_review: policiesNeedingReview,
        policies_up_to_date: policiesUpToDate,
        last_updated: new Date().toISOString()
      });
    }
    
    return metrics;
  } catch (error) {
    console.error(`Error calculating compliance metrics:`, error);
    toast.error("Failed to load compliance metrics");
    return [];
  }
}

// Change Log operations
export async function createChangeLog(logEntry: Omit<GovernanceChangeLog, 'id' | 'created_at'>): Promise<GovernanceChangeLog | null> {
  try {
    const { data, error } = await supabase
      .from('governance_change_logs')
      .insert(logEntry)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as GovernanceChangeLog;
  } catch (error) {
    console.error('Error creating change log:', error);
    return null;
  }
}

export async function getChangeLogsByFrameworkId(frameworkId: string): Promise<GovernanceChangeLog[]> {
  try {
    const { data, error } = await supabase
      .from('governance_change_logs')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as GovernanceChangeLog[];
  } catch (error) {
    console.error(`Error fetching change logs for framework ${frameworkId}:`, error);
    toast.error("Failed to load change logs");
    return [];
  }
}

// File download
export async function getFileUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from('governance_documents')
      .createSignedUrl(filePath, 60); // 60 seconds expiry

    if (error) {
      throw error;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error getting file URL:', error);
    toast.error("Failed to get file download link");
    return null;
  }
}

// Get overdue policy reviews for dashboard
export async function getOverduePolicyReviews(): Promise<OverduePolicyReview[]> {
  try {
    // Get current user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    // Query overdue reviews directly instead of using RPC
    const { data: overdueReviews, error } = await supabase
      .from('governance_review_schedule')
      .select(`
        id,
        policy_id,
        next_review_date,
        governance_policies!inner (
          id,
          title,
          framework_id,
          status,
          governance_frameworks!inner (
            title,
            org_id
          )
        )
      `)
      .eq('governance_policies.governance_frameworks.org_id', profile.organization_id)
      .lt('next_review_date', new Date().toISOString())
      .in('governance_policies.status', ['active', 'approved']);

    if (error) {
      throw error;
    }

    const formatted = (overdueReviews || []).map(review => ({
      id: review.id,
      policy_id: review.policy_id,
      policy_title: review.governance_policies.title,
      framework_id: review.governance_policies.framework_id,
      framework_title: review.governance_policies.governance_frameworks.title,
      next_review_date: review.next_review_date,
      days_overdue: Math.floor((new Date().getTime() - new Date(review.next_review_date).getTime()) / (1000 * 60 * 60 * 24))
    }));

    return formatted;
  } catch (error) {
    console.error('Error fetching overdue policy reviews:', error);
    toast.error("Failed to load overdue policy reviews");
    return [];
  }
}

// Enhanced review deadline logic
export async function checkReviewDeadlines(orgId: string): Promise<void> {
  try {
    const overdueReviews = await getOverduePolicyReviews();

    console.log(`Found ${overdueReviews?.length || 0} overdue policy reviews`);

    // Trigger email reminders for overdue reviews
    if (overdueReviews && overdueReviews.length > 0) {
      // Call the edge function to send reminders
      const { error: reminderError } = await supabase.functions.invoke('governance-review-reminder', {
        body: { overdueReviews }
      });

      if (reminderError) {
        console.error('Error triggering review reminders:', reminderError);
      }
    }
  } catch (error) {
    console.error('Error checking review deadlines:', error);
    toast.error("Failed to check review deadlines");
  }
}

// Enhanced policy status management
export async function updatePolicyStatus(
  policyId: string, 
  newStatus: 'draft' | 'under_review' | 'approved' | 'active' | 'archived',
  comments?: string
): Promise<GovernancePolicy | null> {
  try {
    const { data: policy, error: policyError } = await supabase
      .from('governance_policies')
      .select('*')
      .eq('id', policyId)
      .single();

    if (policyError || !policy) {
      throw new Error('Policy not found');
    }

    const { data: updatedPolicy, error } = await supabase
      .from('governance_policies')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', policyId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Log the status change
    await createChangeLog({
      framework_id: policy.framework_id,
      policy_id: policyId,
      change_type: 'updated',
      description: `Policy status changed from ${policy.status} to ${newStatus}${comments ? `: ${comments}` : ''}`,
      previous_version: policy.version,
      new_version: policy.version,
      changed_by: null
    });

    toast.success(`Policy status updated to ${newStatus}`);
    return updatedPolicy as GovernancePolicy;
  } catch (error) {
    console.error(`Error updating policy status:`, error);
    toast.error("Failed to update policy status");
    return null;
  }
}

// Bulk policy operations
export async function bulkUpdatePolicyStatus(
  policyIds: string[], 
  newStatus: 'draft' | 'under_review' | 'approved' | 'active' | 'archived'
): Promise<number> {
  try {
    let successCount = 0;

    for (const policyId of policyIds) {
      const result = await updatePolicyStatus(policyId, newStatus);
      if (result) {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully updated ${successCount} policies to ${newStatus}`);
    }

    return successCount;
  } catch (error) {
    console.error('Error in bulk policy status update:', error);
    toast.error("Failed to update policy statuses");
    return 0;
  }
}

// Bulk role operations
export async function bulkDeleteRoles(roleIds: string[]): Promise<number> {
  try {
    const { error } = await supabase
      .from('governance_roles')
      .delete()
      .in('id', roleIds);

    if (error) {
      throw error;
    }

    toast.success(`Successfully deleted ${roleIds.length} roles`);
    return roleIds.length;
  } catch (error) {
    console.error('Error in bulk role deletion:', error);
    toast.error("Failed to delete roles");
    return 0;
  }
}

// Enhanced review schedule with automatic reminders
export async function scheduleAutomaticReminders(policyId: string): Promise<void> {
  try {
    const { data: schedule } = await supabase
      .from('governance_review_schedule')
      .select('*')
      .eq('policy_id', policyId)
      .single();

    if (!schedule) {
      console.warn(`No review schedule found for policy ${policyId}`);
      return;
    }

    const nextReviewDate = new Date(schedule.next_review_date);
    const reminderDate = new Date(nextReviewDate);
    reminderDate.setDate(reminderDate.getDate() - (schedule.reminder_days_before || 14));

    // In a production environment, you would set up a cron job or scheduled task
    // For now, we'll log the reminder schedule
    console.log(`Reminder scheduled for policy ${policyId} on ${reminderDate.toISOString()}`);

  } catch (error) {
    console.error('Error scheduling automatic reminders:', error);
  }
}
