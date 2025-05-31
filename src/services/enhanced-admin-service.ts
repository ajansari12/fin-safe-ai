
import { roleManagementService, UserRole } from "./admin/role-management-service";
import { moduleSettingsService, ModuleSetting } from "./admin/module-settings-service";
import { dataRetentionService } from "./admin/data-retention-service";
import { adminLoggingService, AdminLog } from "./admin/admin-logging-service";

class EnhancedAdminService {
  // Role Management
  async getRoles(): Promise<UserRole[]> {
    return roleManagementService.getRoles();
  }

  async createRole(roleData: {
    role_name: string;
    permissions: string[];
    description?: string;
  }): Promise<void> {
    await roleManagementService.createRole(roleData);
    await adminLoggingService.logAdminAction(
      'create',
      'role',
      undefined,
      roleData.role_name,
      { permissions: roleData.permissions }
    );
  }

  async updateRole(roleId: string, updates: {
    role_name?: string;
    permissions?: string[];
    description?: string;
    is_active?: boolean;
  }): Promise<void> {
    await roleManagementService.updateRole(roleId, updates);
    await adminLoggingService.logAdminAction(
      'update',
      'role',
      roleId,
      updates.role_name,
      updates
    );
  }

  async deleteRole(roleId: string, roleName: string): Promise<void> {
    await roleManagementService.deleteRole(roleId);
    await adminLoggingService.logAdminAction('delete', 'role', roleId, roleName);
  }

  // Module Settings Management
  async getModuleSettings(): Promise<ModuleSetting[]> {
    return moduleSettingsService.getModuleSettings();
  }

  async updateModuleSetting(settingKey: string, enabled: boolean): Promise<void> {
    await moduleSettingsService.updateModuleSetting(settingKey, enabled);
    await adminLoggingService.logAdminAction(
      'update',
      'module_setting',
      undefined,
      settingKey,
      { enabled }
    );
  }

  // Data Retention Settings
  async getDataRetentionSettings(): Promise<ModuleSetting[]> {
    return dataRetentionService.getDataRetentionSettings();
  }

  async updateDataRetentionSetting(
    module: string,
    retentionDays: number,
    autoDelete: boolean
  ): Promise<void> {
    await dataRetentionService.updateDataRetentionSetting(module, retentionDays, autoDelete);
    await adminLoggingService.logAdminAction(
      'update',
      'data_retention_setting',
      undefined,
      `${module}_retention`,
      { retention_days: retentionDays, auto_delete: autoDelete }
    );
  }

  // Admin Audit Logs
  async getAdminLogs(limit: number = 100): Promise<AdminLog[]> {
    return adminLoggingService.getAdminLogs(limit);
  }

  // Available permissions and modules
  getAvailablePermissions(): string[] {
    return roleManagementService.getAvailablePermissions();
  }

  getAvailableModules(): Array<{ key: string; name: string; description: string }> {
    return moduleSettingsService.getAvailableModules();
  }
}

export const enhancedAdminService = new EnhancedAdminService();

// Re-export types for backward compatibility
export type { UserRole, ModuleSetting, AdminLog };
