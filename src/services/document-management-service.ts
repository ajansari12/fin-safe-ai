import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface Document {
  id: string;
  org_id: string;
  repository_id?: string;
  parent_document_id?: string;
  title: string;
  description?: string;
  status: string;
  version_number?: number;
  is_current_version?: boolean;
  is_archived?: boolean;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  checksum?: string;
  extraction_status?: string;
  ai_analysis_status?: string;
  extracted_text?: string;
  ai_summary?: string;
  ai_confidence_score?: number;
  key_risk_indicators?: any[];
  compliance_gaps?: any[];
  document_classification?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
  access_count?: number;
  last_accessed_at?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  review_due_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRepository {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  document_type: 'policy' | 'procedure' | 'risk_assessment' | 'audit_report' | 'compliance_doc' | 'contract' | 'other';
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  retention_years: number;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

class DocumentManagementService {
  async uploadDocument(documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'> & { title: string }): Promise<Document> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Prepare the data for database insertion
    const insertData = {
      org_id: profile.organization_id,
      uploaded_by: profile.id,
      uploaded_by_name: profile.full_name,
      title: documentData.title,
      description: documentData.description || null,
      repository_id: documentData.repository_id || null,
      parent_document_id: documentData.parent_document_id || null,
      status: documentData.status || 'draft',
      version_number: documentData.version_number || 1,
      is_current_version: documentData.is_current_version ?? true,
      is_archived: documentData.is_archived ?? false,
      file_path: documentData.file_path || null,
      file_size: documentData.file_size || null,
      mime_type: documentData.mime_type || null,
      checksum: documentData.checksum || null,
      extraction_status: documentData.extraction_status || 'pending',
      ai_analysis_status: documentData.ai_analysis_status || 'pending',
      extracted_text: documentData.extracted_text || null,
      ai_summary: documentData.ai_summary || null,
      ai_confidence_score: documentData.ai_confidence_score || null,
      key_risk_indicators: documentData.key_risk_indicators || [],
      compliance_gaps: documentData.compliance_gaps || [],
      document_classification: documentData.document_classification || {},
      metadata: documentData.metadata || {},
      tags: documentData.tags || [],
      access_count: documentData.access_count || 0,
      last_accessed_at: documentData.last_accessed_at || null,
      review_due_date: documentData.review_due_date || null,
      expiry_date: documentData.expiry_date || null
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  }

  async createRepository(repositoryData: Omit<DocumentRepository, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name'>): Promise<DocumentRepository> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const insertData = {
      org_id: profile.organization_id,
      created_by: profile.id,
      created_by_name: profile.full_name,
      name: repositoryData.name,
      description: repositoryData.description || null,
      document_type: repositoryData.document_type,
      access_level: repositoryData.access_level,
      retention_years: repositoryData.retention_years
    };

    const { data, error } = await supabase
      .from('document_repositories')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data as DocumentRepository;
  }

  async getDocuments(): Promise<Document[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Document[];
  }

  async getRepositories(): Promise<DocumentRepository[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('document_repositories')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (error) return [];
    return (data || []) as DocumentRepository[];
  }

  async getDocumentAnalytics(period: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Mock analytics data for now
    return {
      totalDocuments: 0,
      totalAccesses: 0,
      mostAccessedDocuments: [],
      documentsByStatus: {},
      uploadsOverTime: {}
    };
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', profile.organization_id)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) return [];
    return (data || []) as Document[];
  }

  async getComments(documentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data || [];
  }

  async addComment(documentId: string, commentData: any): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile) throw new Error('No user profile found');

    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        ...commentData,
        document_id: documentId,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDocumentVersions(documentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) return [];
    return data || [];
  }

  async createNewVersion(documentId: string, versionData: any, file?: File): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile) throw new Error('No user profile found');

    // Get the current highest version number
    const { data: versions } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersionNumber = (versions?.[0]?.version_number || 0) + 1;

    // Mark all previous versions as not current
    await supabase
      .from('document_versions')
      .update({ is_current_version: false })
      .eq('document_id', documentId);

    // Create new version
    const newVersion = {
      document_id: documentId,
      version_number: nextVersionNumber,
      is_current_version: true,
      file_path: versionData.file_path,
      file_size: versionData.file_size,
      mime_type: versionData.mime_type,
      checksum: versionData.checksum,
      description: versionData.description || `Version ${nextVersionNumber}`,
      uploaded_by: profile.id,
      uploaded_by_name: profile.full_name,
      org_id: profile.organization_id,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('document_versions')
      .insert(newVersion)
      .select()
      .single();

    if (error) throw error;

    // Update the main document record
    await supabase
      .from('documents')
      .update({
        version_number: nextVersionNumber,
        file_path: versionData.file_path,
        file_size: versionData.file_size,
        mime_type: versionData.mime_type,
        checksum: versionData.checksum,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return data;
  }

  async revertToVersion(documentId: string, versionId: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile) throw new Error('No user profile found');

    // Get the version to revert to
    const { data: targetVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .eq('document_id', documentId)
      .single();

    if (versionError || !targetVersion) throw new Error('Version not found');

    // Mark all versions as not current
    await supabase
      .from('document_versions')
      .update({ is_current_version: false })
      .eq('document_id', documentId);

    // Mark target version as current
    await supabase
      .from('document_versions')
      .update({ is_current_version: true })
      .eq('id', versionId);

    // Update main document
    await supabase
      .from('documents')
      .update({
        version_number: targetVersion.version_number,
        file_path: targetVersion.file_path,
        file_size: targetVersion.file_size,
        mime_type: targetVersion.mime_type,
        checksum: targetVersion.checksum,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return targetVersion;
  }

  async getDocumentRelationships(documentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('document_relationships')
      .select('*, source_document:documents!source_document_id(*), target_document:documents!target_document_id(*)')
      .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);

    if (error) return [];
    return data || [];
  }
}

export const documentManagementService = new DocumentManagementService();
