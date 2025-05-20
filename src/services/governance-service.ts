
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  GovernanceFramework, 
  GovernanceStructure, 
  GovernanceRole, 
  GovernancePolicy,
  GovernanceReviewSchedule,
  GovernanceChangeLog
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
    return data;
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

    return data || null;
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
    return data;
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
