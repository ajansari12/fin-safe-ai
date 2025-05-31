
import { roleManagementService, UserRole } from "./admin/role-management-service";
import { moduleSettingsService, ModuleSetting } from "./admin/module-settings-service";
import { dataRetentionService } from "./admin/data-retention-service";
import { adminLoggingService, AdminLog } from "./admin/admin-logging-service";
import { securityLoggingService } from "./security/security-logging-service";

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
    await Promise.all([
      adminLoggingService.logAdminAction(
        'create',
        'role',
        undefined,
        roleData.role_name,
        { permissions: roleData.permissions }
      ),
      securityLoggingService.logSecurityAction(
        'role_created',
        'user_role',
        {
          resourceName: roleData.role_name,
          actionDetails: { permissions: roleData.permissions },
          riskScore: 3
        }
      )
    ]);
  }

  async updateRole(roleId: string, updates: {
    role_name?: string;
    permissions?: string[];
    description?: string;
    is_active?: boolean;
  }): Promise<void> {
    await roleManagementService.updateRole(roleId, updates);
    await Promise.all([
      adminLoggingService.logAdminAction(
        'update',
        'role',
        roleId,
        updates.role_name,
        updates
      ),
      securityLoggingService.logSecurityAction(
        'role_updated',
        'user_role',
        {
          resourceId: roleId,
          resourceName: updates.role_name,
          actionDetails: updates,
          riskScore: updates.is_active === false ? 5 : 3
        }
      )
    ]);
  }

  async deleteRole(roleId: string, roleName: string): Promise<void> {
    await roleManagementService.deleteRole(roleId);
    await Promise.all([
      adminLoggingService.logAdminAction('delete', 'role', roleId, roleName),
      securityLoggingService.logSecurityAction(
        'role_deleted',
        'user_role',
        {
          resourceId: roleId,
          resourceName: roleName,
          riskScore: 6
        }
      )
    ]);
  }

  // Module Settings Management
  async getModuleSettings(): Promise<ModuleSetting[]> {
    return moduleSettingsService.getModuleSettings();
  }

  async updateModuleSetting(settingKey: string, enabled: boolean): Promise<void> {
    await moduleSettingsService.updateModuleSetting(settingKey, enabled);
    await Promise.all([
      adminLoggingService.logAdminAction(
        'update',
        'module_setting',
        undefined,
        settingKey,
        { enabled }
      ),
      securityLoggingService.logSecurityAction(
        'module_setting_updated',
        'system_setting',
        {
          resourceName: settingKey,
          actionDetails: { enabled },
          riskScore: 2
        }
      )
    ]);
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
    await Promise.all([
      adminLoggingService.logAdminAction(
        'update',
        'data_retention_setting',
        undefined,
        `${module}_retention`,
        { retention_days: retentionDays, auto_delete: autoDelete }
      ),
      securityLoggingService.logSecurityAction(
        'data_retention_updated',
        'data_policy',
        {
          resourceName: `${module}_retention`,
          actionDetails: { retention_days: retentionDays, auto_delete: autoDelete },
          riskScore: autoDelete ? 4 : 2
        }
      )
    ]);
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
