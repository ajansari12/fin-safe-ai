
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

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

export interface Document {
  id: string;
  org_id: string;
  repository_id?: string;
  parent_document_id?: string;
  version_number: number;
  title: string;
  description?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  checksum?: string;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_confidence_score?: number;
  extracted_text?: string;
  ai_summary?: string;
  key_risk_indicators: any[];
  compliance_gaps: any[];
  document_classification: any;
  metadata: any;
  tags?: string[];
  status: 'draft' | 'review' | 'approved' | 'archived' | 'obsolete';
  is_current_version: boolean;
  is_archived: boolean;
  uploaded_by?: string;
  uploaded_by_name?: string;
  last_accessed_at?: string;
  access_count: number;
  review_due_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentComment {
  id: string;
  org_id: string;
  document_id: string;
  parent_comment_id?: string;
  comment_text: string;
  comment_type: 'general' | 'review' | 'approval' | 'revision_request';
  is_resolved: boolean;
  resolved_by?: string;
  resolved_by_name?: string;
  resolved_at?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentShare {
  id: string;
  org_id: string;
  document_id: string;
  shared_with_email?: string;
  shared_with_organization?: string;
  access_level: 'view' | 'comment' | 'edit';
  expires_at?: string;
  access_token?: string;
  password_protected: boolean;
  download_allowed: boolean;
  access_count: number;
  last_accessed_at?: string;
  created_by?: string;
  created_by_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class DocumentManagementService {
  // Repository Management
  async createRepository(repository: Omit<DocumentRepository, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentRepository> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('document_repositories')
      .insert({
        ...repository,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentRepository;
  }

  async getRepositories(): Promise<DocumentRepository[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('document_repositories')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('name');

    if (error) throw error;
    return (data || []) as DocumentRepository[];
  }

  // Document Management
  async uploadDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...document,
        org_id: profile.organization_id,
        uploaded_by: profile.id,
        uploaded_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger AI analysis
    await this.triggerAIAnalysis(data.id);
    
    return data as Document;
  }

  async getDocuments(filters?: {
    repository_id?: string;
    status?: string;
    document_type?: string;
    search?: string;
  }): Promise<Document[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('documents')
      .select(`
        *,
        document_repositories(name, document_type)
      `)
      .eq('org_id', profile.organization_id)
      .eq('is_current_version', true);

    if (filters?.repository_id) {
      query = query.eq('repository_id', filters.repository_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.textSearch('title', filters.search);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Document[];
  }

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    // Log access
    await this.logDocumentAccess(id, 'view');
    
    return data as Document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  }

  // AI Analysis
  private async triggerAIAnalysis(documentId: string): Promise<void> {
    // Mark document as processing
    await supabase
      .from('documents')
      .update({ ai_analysis_status: 'processing' })
      .eq('id', documentId);

    try {
      // Simulate AI analysis - in production, this would call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const analysisResults = await this.performAIAnalysis(documentId);

      await supabase
        .from('documents')
        .update({
          ai_analysis_status: 'completed',
          ai_summary: analysisResults.summary,
          key_risk_indicators: analysisResults.keyRiskIndicators,
          compliance_gaps: analysisResults.complianceGaps,
          document_classification: analysisResults.classification,
          ai_confidence_score: analysisResults.confidence
        })
        .eq('id', documentId);
    } catch (error) {
      await supabase
        .from('documents')
        .update({ ai_analysis_status: 'failed' })
        .eq('id', documentId);
      console.error('AI analysis failed:', error);
    }
  }

  private async performAIAnalysis(documentId: string): Promise<{
    summary: string;
    keyRiskIndicators: any[];
    complianceGaps: any[];
    classification: any;
    confidence: number;
  }> {
    // Mock AI analysis - replace with actual OpenAI integration
    return {
      summary: "This document outlines key risk management procedures and compliance requirements. It covers operational risk controls, monitoring procedures, and reporting requirements.",
      keyRiskIndicators: [
        { type: "operational_risk", severity: "medium", description: "Manual process without automation" },
        { type: "compliance_risk", severity: "low", description: "Regular review schedule defined" }
      ],
      complianceGaps: [
        { framework: "ISO 27001", requirement: "Access Control", gap: "Missing role-based access controls", severity: "medium" }
      ],
      classification: {
        document_type: "policy",
        confidentiality: "internal",
        retention_category: "regulatory",
        subject_areas: ["risk_management", "operational_procedures"]
      },
      confidence: 0.85
    };
  }

  // Full-text search
  async searchDocuments(query: string): Promise<Document[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', profile.organization_id)
      .textSearch('extracted_text', query)
      .limit(50);

    if (error) throw error;
    return (data || []) as Document[];
  }

  // Document Relationships
  async createDocumentRelationship(sourceId: string, targetId: string, type: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    await supabase
      .from('document_relationships')
      .insert({
        org_id: profile.organization_id,
        source_document_id: sourceId,
        target_document_id: targetId,
        relationship_type: type,
        created_by: profile.id,
        created_by_name: profile.full_name
      });
  }

  async getDocumentRelationships(documentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('document_relationships')
      .select(`
        *,
        source_document:documents!source_document_id(title, status),
        target_document:documents!target_document_id(title, status)
      `)
      .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`);

    if (error) return [];
    return data || [];
  }

  // Comments and Collaboration
  async addComment(documentId: string, comment: Omit<DocumentComment, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentComment> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        ...comment,
        document_id: documentId,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentComment;
  }

  async getComments(documentId: string): Promise<DocumentComment[]> {
    const { data, error } = await supabase
      .from('document_comments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as DocumentComment[];
  }

  // Document Sharing
  async shareDocument(documentId: string, shareConfig: Omit<DocumentShare, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentShare> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const accessToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from('document_shares')
      .insert({
        ...shareConfig,
        document_id: documentId,
        org_id: profile.organization_id,
        access_token: accessToken,
        created_by: profile.id,
        created_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;
    return data as DocumentShare;
  }

  // Access Logging
  private async logDocumentAccess(documentId: string, accessType: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    
    await supabase
      .from('document_access_logs')
      .insert({
        org_id: profile?.organization_id,
        document_id: documentId,
        user_id: profile?.id,
        user_name: profile?.full_name,
        access_type: accessType,
        success: true
      });

    // Update document last accessed timestamp
    await supabase
      .from('documents')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', documentId);
  }

  // Analytics
  async getDocumentAnalytics(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    const { data: accessLogs } = await supabase
      .from('document_access_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('accessed_at', startDate.toISOString());

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', profile.organization_id);

    return {
      totalDocuments: documents?.length || 0,
      totalAccesses: accessLogs?.length || 0,
      mostAccessedDocuments: this.calculateMostAccessed(accessLogs || []),
      documentsByStatus: this.groupDocumentsByStatus(documents || []),
      uploadsOverTime: this.calculateUploadsOverTime(documents || [], timeframe)
    };
  }

  private calculateMostAccessed(accessLogs: any[]): any[] {
    const documentAccess = accessLogs.reduce((acc, log) => {
      acc[log.document_id] = (acc[log.document_id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(documentAccess)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([documentId, count]) => ({ documentId, accessCount: count }));
  }

  private groupDocumentsByStatus(documents: any[]): any {
    return documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateUploadsOverTime(documents: any[], timeframe: string): any[] {
    const groupBy = timeframe === 'week' ? 'day' : timeframe === 'month' ? 'week' : 'month';
    
    return documents.reduce((acc, doc) => {
      const date = new Date(doc.created_at);
      const key = groupBy === 'day' 
        ? date.toISOString().split('T')[0]
        : groupBy === 'week'
        ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
        : `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // Version Control
  async createDocumentVersion(parentId: string, updates: Partial<Document>): Promise<Document> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get parent document
    const { data: parentDoc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', parentId)
      .single();

    if (!parentDoc) throw new Error('Parent document not found');

    // Create new version
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...parentDoc,
        ...updates,
        id: undefined,
        parent_document_id: parentId,
        version_number: parentDoc.version_number + 1,
        is_current_version: true,
        uploaded_by: profile.id,
        uploaded_by_name: profile.full_name,
        created_at: undefined,
        updated_at: undefined
      })
      .select()
      .single();

    if (error) throw error;
    return data as Document;
  }

  async getDocumentVersions(documentId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`id.eq.${documentId},parent_document_id.eq.${documentId}`)
      .order('version_number', { ascending: false });

    if (error) return [];
    return (data || []) as Document[];
  }
}

export const documentManagementService = new DocumentManagementService();
