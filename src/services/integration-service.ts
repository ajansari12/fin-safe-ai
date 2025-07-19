
import { osfiIntegrationService } from "./osfi-integration-service";

class IntegrationService {
  private static instance: IntegrationService;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('Initializing integration service...');
      
      // Wait for auth context to be ready
      await this.waitForAuthContext();
      
      // Initialize OSFI integration
      await this.initializeOSFIIntegration();
      
      this.isInitialized = true;
      console.log('Integration service initialized successfully');
    } catch (error) {
      console.warn('Integration service initialization failed:', error);
      // Don't throw - allow app to continue without enhanced features
    }
  }

  private async waitForAuthContext(): Promise<void> {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (typeof window !== 'undefined' && window.document && window.document.readyState === 'complete') {
          // Give React a moment to initialize
          setTimeout(resolve, 100);
        } else {
          setTimeout(checkAuth, 50);
        }
      };
      checkAuth();
    });
  }

  private async initializeOSFIIntegration(): Promise<void> {
    try {
      // Only initialize if we have a valid organization context
      const { getCurrentOrgId } = await import("@/lib/organization-context");
      
      const orgId = await getCurrentOrgId().catch(() => null);
      if (!orgId) {
        console.log('No organization context available, skipping OSFI integration');
        return;
      }

      // Initialize OSFI integration data
      await osfiIntegrationService.getOSFIIntegrationData(orgId);
      console.log('OSFI integration initialized for org:', orgId);
    } catch (error) {
      console.warn('OSFI integration initialization failed:', error);
    }
  }

  // Public method to trigger initialization from components
  static async initializeAsync(): Promise<void> {
    const service = IntegrationService.getInstance();
    await service.initialize();
  }

  // Check if service is ready
  static isReady(): boolean {
    return IntegrationService.getInstance().isInitialized;
  }
}

// Export the service instance
export const integrationService = IntegrationService.getInstance();

// Auto-initialize when imported, but don't block
if (typeof window !== 'undefined') {
  // Initialize asynchronously without blocking
  setTimeout(() => {
    integrationService.initialize().catch(console.warn);
  }, 1000);
}
