
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import DocumentList from '@/components/documents/DocumentList';

const mockDocuments = [
  {
    id: '1',
    org_id: 'test-org',
    repository_id: 'repo-1',
    title: 'Test Document',
    description: 'Test description',
    status: 'approved' as const,
    ai_analysis_status: 'completed' as const,
    version_number: 1,
    is_current_version: true,
    is_archived: false,
    access_count: 5,
    uploaded_by: 'user-1',
    uploaded_by_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('DocumentList', () => {
  it('renders document list correctly', () => {
    render(<DocumentList documents={mockDocuments} loading={false} />);
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<DocumentList documents={[]} loading={true} />);
    
    expect(screen.getByText('Loading documents...')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<DocumentList documents={[]} loading={false} />);
    
    expect(screen.getByText('No documents found')).toBeInTheDocument();
  });

  it('displays document metadata correctly', () => {
    render(<DocumentList documents={mockDocuments} loading={false} />);
    
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('5 views')).toBeInTheDocument();
  });
});
