
// This file is kept for backward compatibility
// New code should use the refactored services in ./kri-service.ts

export { 
  kriService as validatedKRIService,
  type KRI,
  type KRILog,
  type KRIFormData,
  type KRILogFormData
} from "./kri-service";

// Re-export validation service for components that need it
export { KRIValidationService as ValidatedKRIService } from "./kri-validation-service";
