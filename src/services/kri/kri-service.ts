
import { KRIValidationService, KRIFormData, KRILogFormData } from "./kri-validation-service";
import { kriDataService, KRI, KRILog } from "./kri-data-service";
import { kriLogsService } from "./kri-logs-service";

export class KRIService {
  async createKRI(data: KRIFormData): Promise<KRI> {
    // Validate input
    const validation = KRIValidationService.validateKRIData(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    return kriDataService.createKRI(validation.data);
  }

  async updateKRI(id: string, updates: Partial<KRIFormData>): Promise<KRI> {
    // Validate updates
    const validation = KRIValidationService.validateKRIForUpdate(updates);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    return kriDataService.updateKRI(id, validation.data);
  }

  async getKRIs(): Promise<KRI[]> {
    return kriDataService.getKRIs();
  }

  async getKRIById(id: string): Promise<KRI | null> {
    return kriDataService.getKRIById(id);
  }

  async createKRILog(data: KRILogFormData): Promise<KRILog> {
    // Validate input
    const validation = KRIValidationService.validateKRILogData(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    return kriLogsService.createKRILog(validation.data);
  }

  async getKRILogs(kriId: string): Promise<KRILog[]> {
    return kriLogsService.getKRILogs(kriId);
  }

  // Static validation methods for backward compatibility
  static validateKRIData = KRIValidationService.validateKRIData;
  static validateKRILogData = KRIValidationService.validateKRILogData;
}

export const kriService = new KRIService();

// Export types for use in components
export type { KRI, KRILog, KRIFormData, KRILogFormData };
