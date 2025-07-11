import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityState {
  csrfToken: string | null;
  rateLimitRemaining: number | null;
  isSecurityCheckPassed: boolean;
}

export const useSecurity = () => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    csrfToken: null,
    rateLimitRemaining: null,
    isSecurityCheckPassed: false,
  });

  useEffect(() => {
    initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-middleware', {
        body: { action: 'initialize' }
      });

      if (error) throw error;

      setSecurityState({
        csrfToken: data.csrfToken,
        rateLimitRemaining: data.rateLimitRemaining,
        isSecurityCheckPassed: true,
      });
    } catch (error) {
      console.error('Security initialization failed:', error);
      toast.error('Security check failed');
    }
  };

  const getSecureHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (securityState.csrfToken) {
      headers['X-CSRF-Token'] = securityState.csrfToken;
    }

    return headers;
  };

  const makeSecureRequest = async (endpoint: string, options: RequestInit = {}) => {
    const secureHeaders = getSecureHeaders();
    
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...secureHeaders,
        ...options.headers,
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      toast.error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      throw new Error('Rate limit exceeded');
    }

    // Handle CSRF errors
    if (response.status === 403) {
      const data = await response.json();
      if (data.error?.includes('CSRF')) {
        // Refresh CSRF token and retry
        await initializeSecurity();
        toast.error('Security token expired. Please try again.');
        throw new Error('CSRF token invalid');
      }
    }

    return response;
  };

  const encryptSensitiveData = async (
    tableName: string,
    fieldName: string,
    recordId: string,
    value: string,
    orgId: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('data-encryption', {
        body: {
          action: 'encrypt',
          orgId,
          tableName,
          fieldName,
          recordId,
          value,
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Encryption failed:', error);
      toast.error('Failed to encrypt sensitive data');
      throw error;
    }
  };

  const decryptSensitiveData = async (
    tableName: string,
    fieldName: string,
    recordId: string,
    orgId: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('data-encryption', {
        body: {
          action: 'decrypt',
          orgId,
          tableName,
          fieldName,
          recordId,
        }
      });

      if (error) throw error;
      return data.value;
    } catch (error) {
      console.error('Decryption failed:', error);
      toast.error('Failed to decrypt sensitive data');
      throw error;
    }
  };

  const generateMFABackupCodes = async (userId: string, orgId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('data-encryption', {
        body: {
          action: 'generate_mfa_codes',
          userId,
          orgId,
        }
      });

      if (error) throw error;
      return data.codes;
    } catch (error) {
      console.error('MFA backup code generation failed:', error);
      toast.error('Failed to generate MFA backup codes');
      throw error;
    }
  };

  const verifyMFABackupCode = async (
    userId: string,
    orgId: string,
    code: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('data-encryption', {
        body: {
          action: 'verify_mfa_code',
          userId,
          orgId,
          code,
        }
      });

      if (error) throw error;
      return data.valid;
    } catch (error) {
      console.error('MFA backup code verification failed:', error);
      toast.error('Failed to verify MFA backup code');
      throw error;
    }
  };

  const triggerDataRetentionCleanup = async (orgId?: string, dryRun = true) => {
    try {
      const { data, error } = await supabase.functions.invoke('data-retention-cleanup', {
        body: {
          orgId,
          dryRun,
        }
      });

      if (error) throw error;
      return data.results;
    } catch (error) {
      console.error('Data retention cleanup failed:', error);
      toast.error('Failed to perform data retention cleanup');
      throw error;
    }
  };

  return {
    ...securityState,
    initializeSecurity,
    getSecureHeaders,
    makeSecureRequest,
    encryptSensitiveData,
    decryptSensitiveData,
    generateMFABackupCodes,
    verifyMFABackupCode,
    triggerDataRetentionCleanup,
  };
};