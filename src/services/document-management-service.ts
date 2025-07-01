
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
  async uploadDocument(documentData: Partial<Document>): Promise<Document> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const completeDocumentData = {
      ...documentData,
      org_id: profile.organization_id,
      uploaded_by: profile.id,
      uploaded_by_name: profile.full_name,
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(completeDocumentData)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  }

  async createRepository(repositoryData: Omit<DocumentRepository, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name'>): Promise<DocumentRepository> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const completeRepositoryData = {
      ...repositoryData,
      org_id: profile.organization_id,
      created_by: profile.id,
      created_by_name: profile.full_name,
    };

    const { data, error } = await supabase
      .from('document_repositories')
      .insert(completeRepositoryData)
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
      .from('documents')
      .select('*')
      .or(`id.eq.${documentId},parent_document_id.eq.${documentId}`)
      .order('version_number', { ascending: false });

    if (error) return [];
    return data || [];
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
