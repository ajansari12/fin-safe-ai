
import { supabase } from "@/integrations/supabase/client";

export interface AuditUpload {
  id: string;
  org_id: string;
  document_name: string;
  document_type: string;
  file_path: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  upload_date: string;
  audit_type: string;
  audit_period: string | null;
  status: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFinding {
  id: string;
  org_id: string;
  audit_upload_id: string | null;
  finding_reference: string;
  finding_title: string;
  finding_description: string;
  severity: string;
  module_affected: string;
  regulator_comments: string | null;
  internal_response: string | null;
  corrective_actions: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  due_date: string | null;
  status: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditTask {
  id: string;
  org_id: string;
  finding_id: string | null;
  task_title: string;
  task_description: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  priority: string;
  due_date: string;
  completion_date: string | null;
  status: string;
  progress_notes: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export const auditService = {
  async getAuditUploads(orgId: string): Promise<AuditUpload[]> {
    const { data, error } = await supabase
      .from('audit_uploads')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async uploadAuditDocument(file: File, metadata: {
    org_id: string;
    audit_type: string;
    audit_period?: string;
    description?: string;
    tags?: string[];
  }): Promise<AuditUpload> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${metadata.org_id}/${Date.now()}-${file.name}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('audit-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    // Create audit upload record
    const { data, error } = await supabase
      .from('audit_uploads')
      .insert({
        ...metadata,
        document_name: file.name,
        document_type: fileExt || 'unknown',
        file_path: fileName,
        file_size: file.size,
        uploaded_by: user?.id,
        uploaded_by_name: profile?.full_name || 'Unknown User'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getComplianceFindings(orgId: string): Promise<ComplianceFinding[]> {
    const { data, error } = await supabase
      .from('compliance_findings')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createComplianceFinding(finding: Omit<ComplianceFinding, 'id' | 'created_at' | 'updated_at'>): Promise<ComplianceFinding> {
    const { data, error } = await supabase
      .from('compliance_findings')
      .insert(finding)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateComplianceFinding(id: string, updates: Partial<ComplianceFinding>): Promise<ComplianceFinding> {
    const { data, error } = await supabase
      .from('compliance_findings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAuditTasks(orgId: string): Promise<AuditTask[]> {
    const { data, error } = await supabase
      .from('audit_tasks')
      .select('*')
      .eq('org_id', orgId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createAuditTask(task: Omit<AuditTask, 'id' | 'created_at' | 'updated_at'>): Promise<AuditTask> {
    const { data, error } = await supabase
      .from('audit_tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAuditTask(id: string, updates: Partial<AuditTask>): Promise<AuditTask> {
    const { data, error } = await supabase
      .from('audit_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAuditTrailByModule(orgId: string, module?: string) {
    let query = supabase
      .from('compliance_findings')
      .select(`
        *,
        audit_uploads:audit_upload_id(document_name, audit_type, audit_period),
        audit_tasks(*)
      `)
      .eq('org_id', orgId);

    if (module) {
      query = query.eq('module_affected', module);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
