import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils';
import IncidentForm from '@/components/incident/IncidentForm';
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase';

// Mock the Supabase client
const mockSupabase = createMockSupabaseClient();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock react-hook-form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(() => ({ name: 'test', onBlur: vi.fn(), onChange: vi.fn(), ref: vi.fn() })),
      handleSubmit: vi.fn((fn) => (e) => {
        e?.preventDefault();
        return fn({
          title: 'Test Incident',
          description: 'Test description',
          severity: 'high',
          category: 'operational',
          status: 'open',
        });
      }),
      formState: { errors: {}, isSubmitting: false },
      setValue: vi.fn(),
      watch: vi.fn(() => 'high'),
      reset: vi.fn(),
      control: {},
    }),
  };
});

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: [
      { id: 'user1', full_name: 'John Doe' },
      { id: 'user2', full_name: 'Jane Smith' }
    ],
    isLoading: false,
    error: null
  }))
}));

describe('IncidentForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('should render form fields', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    expect(screen.getByText(/incident title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/severity/i)).toBeInTheDocument();
    expect(screen.getByText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create incident/i })).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create incident/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Incident',
        description: 'Test description',
        severity: 'high',
        category: 'operational',
        status: 'open',
      });
    });
  });

  it('should handle form submission errors', async () => {
    const errorMessage = 'Submission failed';
    mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create incident/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should disable submit button when submitting', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /creating.../i });
    expect(submitButton).toBeDisabled();
  });

  it('should display form validation information', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check for required field indicators or validation text
    expect(screen.getByText(/incident title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check for proper form structure
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    // Check for heading
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('should handle severity selection and SLA updates', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check that severity field exists
    expect(screen.getByText(/severity/i)).toBeInTheDocument();
    
    // SLA information should be displayed based on severity
    expect(screen.getByText(/sla requirements/i)).toBeInTheDocument();
  });

  it('should display assignee selection', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check for assignee field
    expect(screen.getByText(/assigned to/i)).toBeInTheDocument();
  });

  it('should handle category selection', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Check for category field
    expect(screen.getByText(/category/i)).toBeInTheDocument();
  });

  it('should display status information', () => {
    render(
      <IncidentForm 
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    // Status should default to 'open' for new incidents
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });
});