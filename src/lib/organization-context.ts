import { getCurrentUserProfile, getUserOrganization } from "@/lib/supabase-utils";
import { validateOrgId, isNotPlaceholderUUID } from "@/lib/uuid-validation";

export interface OrganizationContext {
  orgId: string;
  userId: string;
  profile: any;
  organization: any;
}

class OrganizationContextService {
  private static instance: OrganizationContextService;
  private cachedContext: OrganizationContext | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): OrganizationContextService {
    if (!OrganizationContextService.instance) {
      OrganizationContextService.instance = new OrganizationContextService();
    }
    return OrganizationContextService.instance;
  }

  // Get current organization context with validation
  async getCurrentOrgContext(): Promise<OrganizationContext> {
    const now = Date.now();
    
    // Return cached context if still valid
    if (this.cachedContext && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedContext;
    }

    try {
      const [profile, organization] = await Promise.all([
        getCurrentUserProfile(),
        getUserOrganization()
      ]);

      if (!profile) {
        throw new Error("User profile not found. Please ensure you are logged in.");
      }

      if (!organization) {
        throw new Error("Organization not found. Please ensure your profile is associated with an organization.");
      }

      // Validate the organization ID
      const validatedOrgId = validateOrgId(organization.id);
      
      // Ensure it's not a placeholder
      if (!isNotPlaceholderUUID(validatedOrgId)) {
        throw new Error("Invalid organization ID - cannot use placeholder values");
      }

      const context: OrganizationContext = {
        orgId: validatedOrgId,
        userId: profile.id,
        profile,
        organization
      };

      // Cache the context
      this.cachedContext = context;
      this.lastFetch = now;

      return context;
    } catch (error) {
      console.error("Error getting organization context:", error);
      this.clearCache(); // Clear invalid cache
      throw error;
    }
  }

  // Get organization ID safely
  async getOrgId(): Promise<string> {
    const context = await this.getCurrentOrgContext();
    return context.orgId;
  }

  // Get user ID safely
  async getUserId(): Promise<string> {
    const context = await this.getCurrentOrgContext();
    return context.userId;
  }

  // Clear cached context (useful when user changes organization)
  clearCache(): void {
    this.cachedContext = null;
    this.lastFetch = 0;
  }

  // Check if context is available without throwing
  async hasValidContext(): Promise<boolean> {
    try {
      await this.getCurrentOrgContext();
      return true;
    } catch {
      return false;
    }
  }

  // Get organization context for a specific operation with validation
  async getContextForOperation(operationName: string): Promise<OrganizationContext> {
    try {
      const context = await this.getCurrentOrgContext();
      console.log(`Using organization context for ${operationName}:`, {
        orgId: context.orgId,
        userId: context.userId,
        orgName: context.organization.name
      });
      return context;
    } catch (error) {
      console.error(`Failed to get organization context for ${operationName}:`, error);
      throw new Error(`Cannot perform ${operationName}: ${error.message}`);
    }
  }
}

// Export singleton instance
export const orgContextService = OrganizationContextService.getInstance();

// Convenience functions
export async function getCurrentOrgId(): Promise<string> {
  return await orgContextService.getOrgId();
}

export async function getCurrentUserId(): Promise<string> {
  return await orgContextService.getUserId();
}

export async function requireOrgContext(operationName: string): Promise<OrganizationContext> {
  return await orgContextService.getContextForOperation(operationName);
}