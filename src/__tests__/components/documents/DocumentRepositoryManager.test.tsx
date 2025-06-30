
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils';
import DocumentRepositoryManager from '@/components/documents/DocumentRepositoryManager';
import { DocumentRepository } from '@/services/document-management-service';

const mockRepositories: DocumentRepository[] = [
  {
    id: '1',
    org_id: 'test-org',
    name: 'Test Repository',
    description: 'Test description',
    document_type: 'policy',
    access_level: 'internal',
    retention_years: 7,
    created_by: 'user-1',
    created_by_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('DocumentRepositoryManager', () => {
  it('renders repository list correctly', () => {
    render(<DocumentRepositoryManager repositories={mockRepositories} />);
    
    expect(screen.getByText('Document Repositories')).toBeInTheDocument();
    expect(screen.getByText('Test Repository')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders empty state when no repositories', () => {
    render(<DocumentRepositoryManager repositories={[]} />);
    
    expect(screen.getByText('No repositories found')).toBeInTheDocument();
    expect(screen.getByText('Create your first document repository to get started')).toBeInTheDocument();
  });

  it('opens create repository dialog', async () => {
    render(<DocumentRepositoryManager repositories={[]} />);
    
    const createButton = screen.getByText('Create Repository');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create Document Repository')).toBeInTheDocument();
    });
  });

  it('validates repository form fields', async () => {
    render(<DocumentRepositoryManager repositories={[]} />);
    
    const createButton = screen.getByText('Create Repository');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create repository/i });
      fireEvent.click(submitButton);
    });
    
    // Should show validation error for empty name
    expect(screen.getByText('Name required')).toBeInTheDocument();
  });
});
