
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import DocumentList from '@/components/documents/DocumentList';
import { Document } from '@/services/document-management-service';

const mockDocuments: Document[] = [
  {
    id: '1',
    org_id: 'test-org',
    repository_id: 'repo-1',
    title: 'Test Document',
    description: 'Test description',
    status: 'approved',
    ai_analysis_status: 'completed',
    version_number: 1,
    is_current_version: true,
    is_archived: false,
    access_count: 5,
    uploaded_by: 'user-1',
    uploaded_by_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    extraction_status: 'completed',
    key_risk_indicators: [],
    compliance_gaps: [],
    document_classification: {},
    metadata: {},
    file_path: null,
    mime_type: null,
    checksum: null,
    ai_summary: null,
    tags: [],
    review_due_date: null,
    expiry_date: null,
    parent_document_id: null,
    file_size: null,
    ai_confidence_score: null,
    last_accessed_at: null,
    extracted_text: null,
  },
];

// Mock functions for required props
const mockOnDocumentSelect = vi.fn();

describe('DocumentList', () => {
  it('renders document list correctly', () => {
    render(
      <DocumentList 
        documents={mockDocuments} 
        isLoading={false}
        onDocumentSelect={mockOnDocumentSelect}
        selectedDocument={null}
      />
    );
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <DocumentList 
        documents={[]} 
        isLoading={false}
        onDocumentSelect={mockOnDocumentSelect}
        selectedDocument={null}
      />
    );
    
    expect(screen.getByText('No Documents Found')).toBeInTheDocument();
  });

  it('displays document metadata correctly', () => {
    render(
      <DocumentList 
        documents={mockDocuments} 
        isLoading={false}
        onDocumentSelect={mockOnDocumentSelect}
        selectedDocument={null}
      />
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('5 views')).toBeInTheDocument();
  });
});
