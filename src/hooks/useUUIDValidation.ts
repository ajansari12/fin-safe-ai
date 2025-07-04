import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { parseUUIDFromQuery, validateUUID, normalizeUUID, isValidUUID } from '@/lib/uuid-validation';
import { getCurrentOrgId, getCurrentUserId } from '@/lib/organization-context';
import { useToast } from '@/hooks/use-toast';

// Hook for validating and managing UUID parameters from URL
export function useUUIDParams() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const getUUIDParam = useCallback((paramName: string, required: boolean = false): string | null => {
    try {
      const value = parseUUIDFromQuery(searchParams.get(paramName));
      
      if (!value && required) {
        toast({
          title: "Invalid URL",
          description: `Missing required parameter: ${paramName}`,
          variant: "destructive"
        });
        return null;
      }
      
      return value;
    } catch (error) {
      toast({
        title: "Invalid URL Parameter",
        description: `Invalid ${paramName}: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  }, [searchParams, toast]);

  const validateCurrentOrgAccess = useCallback(async (providedOrgId?: string): Promise<string | null> => {
    try {
      const currentOrgId = await getCurrentOrgId();
      
      if (providedOrgId) {
        const normalized = normalizeUUID(providedOrgId);
        if (normalized !== currentOrgId) {
          toast({
            title: "Access Denied",
            description: "You don't have access to this organization's data",
            variant: "destructive"
          });
          return null;
        }
        return normalized;
      }
      
      return currentOrgId;
    } catch (error) {
      toast({
        title: "Authorization Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    getUUIDParam,
    validateCurrentOrgAccess
  };
}

// Hook for organization context validation
export function useOrgContext() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadContext = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [currentOrgId, currentUserId] = await Promise.all([
          getCurrentOrgId(),
          getCurrentUserId()
        ]);
        
        setOrgId(currentOrgId);
        setUserId(currentUserId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load organization context';
        setError(errorMessage);
        toast({
          title: "Context Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, [toast]);

  const requireOrgId = useCallback((): string => {
    if (!orgId) {
      throw new Error('Organization ID not available');
    }
    return orgId;
  }, [orgId]);

  const requireUserId = useCallback((): string => {
    if (!userId) {
      throw new Error('User ID not available');
    }
    return userId;
  }, [userId]);

  return {
    orgId,
    userId,
    isLoading,
    error,
    requireOrgId,
    requireUserId,
    hasContext: !!(orgId && userId)
  };
}

// Hook for validating form UUIDs
export function useUUIDValidation() {
  const { toast } = useToast();

  const validateUUIDField = useCallback((value: string, fieldName: string): string | null => {
    if (!value?.trim()) return null;
    
    try {
      return normalizeUUID(value);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: `Invalid ${fieldName}: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const validateRequiredUUID = useCallback((value: string, fieldName: string): string | null => {
    if (!value?.trim()) {
      toast({
        title: "Validation Error",
        description: `${fieldName} is required`,
        variant: "destructive"
      });
      return null;
    }
    
    return validateUUIDField(value, fieldName);
  }, [validateUUIDField, toast]);

  const isValidUUIDValue = useCallback((value: string): boolean => {
    return isValidUUID(value);
  }, []);

  return {
    validateUUIDField,
    validateRequiredUUID,
    isValidUUIDValue,
    normalizeUUID
  };
}

// Hook for URL-based entity loading with UUID validation
export function useEntityFromURL<T>(
  entityType: string,
  loadEntity: (id: string) => Promise<T>,
  paramName: string = 'id'
) {
  const [entity, setEntity] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getUUIDParam } = useUUIDParams();
  const { toast } = useToast();

  useEffect(() => {
    const loadEntityFromURL = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const entityId = getUUIDParam(paramName, true);
        if (!entityId) {
          setError(`Invalid ${entityType} ID in URL`);
          return;
        }

        const loadedEntity = await loadEntity(entityId);
        setEntity(loadedEntity);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to load ${entityType}`;
        setError(errorMessage);
        toast({
          title: "Loading Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEntityFromURL();
  }, [entityType, loadEntity, paramName, getUUIDParam, toast]);

  return {
    entity,
    isLoading,
    error,
    reload: () => {
      setEntity(null);
      setIsLoading(true);
      setError(null);
    }
  };
}