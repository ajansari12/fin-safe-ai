
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '@/lib/error-handling';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle Error objects correctly', () => {
    const error = new Error('Test error message');
    const result = ErrorHandler.handle(error, 'test context');

    expect(result).toEqual({
      message: 'Test error message',
      context: 'test context'
    });
  });

  it('should handle string errors', () => {
    const result = ErrorHandler.handle('String error', 'test context');

    expect(result).toEqual({
      message: 'String error',
      context: 'test context'
    });
  });

  it('should handle Supabase errors with codes', () => {
    const supabaseError = {
      message: 'Database error',
      code: 'PGRST116',
      details: 'No rows found'
    };
    
    const result = ErrorHandler.handle(supabaseError, 'database query');

    expect(result.message).toBe('No data found for the requested operation');
    expect(result.code).toBe('PGRST116');
    expect(result.context).toBe('database query');
  });

  it('should handle unknown error types', () => {
    const result = ErrorHandler.handle({ unknown: 'error' }, 'test context');

    expect(result.message).toBe('An unexpected error occurred');
    expect(result.context).toBe('test context');
  });
});
