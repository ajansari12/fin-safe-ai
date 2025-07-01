
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import * as crypto from "crypto";

export interface MFASetupData {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface MFASettings {
  id: string;
  user_id: string;
  org_id: string;
  mfa_enabled: boolean;
  totp_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  phone_number?: string;
  last_mfa_verification?: string;
}

export interface BackupCode {
  id: string;
  code_hash: string;
  used_at?: string;
}

class EnhancedMFAService {
  // Generate TOTP secret
  private generateSecret(): string {
    return crypto.randomBytes(20).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  // Generate backup codes
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Hash backup code for storage
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  // Setup MFA for user
  async setupMFA(): Promise<MFASetupData> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();
    
    // Create QR code URL for TOTP apps
    const qrCode = `otpauth://totp/ResilientFI:${profile.full_name}?secret=${secret}&issuer=ResilientFI`;
    
    // Store TOTP secret in MFA settings
    const { error: mfaError } = await supabase
      .from('user_mfa_settings')
      .upsert({
        user_id: profile.id,
        org_id: profile.organization_id,
        totp_secret: secret,
        backup_codes_generated_at: new Date().toISOString()
      });

    if (mfaError) throw mfaError;

    // Store hashed backup codes
    const backupCodeRecords = backupCodes.map(code => ({
      user_id: profile.id,
      code_hash: this.hashBackupCode(code)
    }));

    const { error: codesError } = await supabase
      .from('mfa_backup_codes')
      .insert(backupCodeRecords);

    if (codesError) throw codesError;

    return {
      qrCode,
      secret,
      backupCodes
    };
  }

  // Verify TOTP code
  async verifyTOTP(token: string): Promise<boolean> {
    const profile = await getCurrentUserProfile();
    if (!profile) return false;

    // Log verification attempt
    await this.logVerificationAttempt(profile.id, 'totp', false);

    // Get user's TOTP secret
    const { data: mfaSettings } = await supabase
      .from('user_mfa_settings')
      .select('totp_secret')
      .eq('user_id', profile.id)
      .single();

    if (!mfaSettings?.totp_secret) return false;

    // In a real implementation, you would use a TOTP library like 'otplib'
    // For now, we'll simulate verification
    const isValid = token.length === 6 && /^\d{6}$/.test(token);
    
    if (isValid) {
      // Update last verification time
      await supabase
        .from('user_mfa_settings')
        .update({ last_mfa_verification: new Date().toISOString() })
        .eq('user_id', profile.id);

      // Log successful verification
      await this.logVerificationAttempt(profile.id, 'totp', true);
    }

    return isValid;
  }

  // Verify backup code
  async verifyBackupCode(code: string): Promise<boolean> {
    const profile = await getCurrentUserProfile();
    if (!profile) return false;

    const codeHash = this.hashBackupCode(code);

    // Check if backup code exists and hasn't been used
    const { data: backupCode, error } = await supabase
      .from('mfa_backup_codes')
      .select('*')
      .eq('user_id', profile.id)
      .eq('code_hash', codeHash)
      .is('used_at', null)
      .single();

    if (error || !backupCode) {
      await this.logVerificationAttempt(profile.id, 'backup_code', false);
      return false;
    }

    // Mark backup code as used
    await supabase
      .from('mfa_backup_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', backupCode.id);

    // Update last verification time
    await supabase
      .from('user_mfa_settings')
      .update({ last_mfa_verification: new Date().toISOString() })
      .eq('user_id', profile.id);

    await this.logVerificationAttempt(profile.id, 'backup_code', true);
    return true;
  }

  // Enable MFA for user
  async enableMFA(): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) throw new Error('User not found');

    await supabase
      .from('user_mfa_settings')
      .update({ 
        mfa_enabled: true,
        totp_enabled: true 
      })
      .eq('user_id', profile.id);
  }

  // Disable MFA for user
  async disableMFA(): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile) throw new Error('User not found');

    await supabase
      .from('user_mfa_settings')
      .update({ 
        mfa_enabled: false,
        totp_enabled: false,
        sms_enabled: false,
        email_enabled: false 
      })
      .eq('user_id', profile.id);
  }

  // Get user's MFA settings
  async getMFASettings(): Promise<MFASettings | null> {
    const profile = await getCurrentUserProfile();
    if (!profile) return null;

    const { data, error } = await supabase
      .from('user_mfa_settings')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (error) return null;
    return data;
  }

  // Get user's backup codes
  async getBackupCodes(): Promise<BackupCode[]> {
    const profile = await getCurrentUserProfile();
    if (!profile) return [];

    const { data, error } = await supabase
      .from('mfa_backup_codes')
      .select('id, code_hash, used_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data || [];
  }

  // Log verification attempt
  private async logVerificationAttempt(userId: string, attemptType: string, success: boolean): Promise<void> {
    await supabase
      .from('mfa_verification_attempts')
      .insert({
        user_id: userId,
        attempt_type: attemptType,
        success,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      });
  }

  // Get client IP (simplified)
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const enhancedMFAService = new EnhancedMFAService();
