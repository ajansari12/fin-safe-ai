
import { z } from "zod";
import { validateWithSchema } from "@/lib/validation-utils";

// KRI validation schemas
export const kriSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  measurement_frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually"]),
  target_value: z.string().optional(),
  warning_threshold: z.string().optional(),
  critical_threshold: z.string().optional(),
  control_id: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
});

export const kriLogSchema = z.object({
  kri_id: z.string().min(1, "KRI ID is required"),
  measurement_date: z.date(),
  actual_value: z.number().min(0, "Actual value must be positive"),
  target_value: z.number().optional(),
  notes: z.string().optional(),
});

export type KRIFormData = z.infer<typeof kriSchema>;
export type KRILogFormData = z.infer<typeof kriLogSchema>;

export class KRIValidationService {
  static validateKRIData(data: unknown): { isValid: boolean; errors?: string[]; data?: KRIFormData } {
    const validation = validateWithSchema(kriSchema, data);
    if (validation.success) {
      return { isValid: true, data: validation.data };
    }
    return { isValid: false, errors: validation.errors };
  }

  static validateKRILogData(data: unknown): { isValid: boolean; errors?: string[]; data?: KRILogFormData } {
    const validation = validateWithSchema(kriLogSchema, data);
    if (validation.success) {
      return { isValid: true, data: validation.data };
    }
    return { isValid: false, errors: validation.errors };
  }

  static validateKRIForUpdate(data: unknown): { isValid: boolean; errors?: string[]; data?: Partial<KRIFormData> } {
    const updateSchema = kriSchema.partial();
    const validation = validateWithSchema(updateSchema, data);
    if (validation.success) {
      return { isValid: true, data: validation.data };
    }
    return { isValid: false, errors: validation.errors };
  }
}
