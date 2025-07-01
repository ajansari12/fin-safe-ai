
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface PasswordPolicy {
  id: string;
  org_id: string;
  policy_name: string;
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  prevent_password_reuse: number;
  password_expiry_days: number;
  warning_days_before_expiry: number;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  is_active: boolean;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  score: number;
}

export interface PasswordHistoryEntry {
  id: string;
  password_hash: string;
  created_at: string;
}

class PasswordSecurityService {
  // Validate password against policy
  async validatePassword(password: string): Promise<PasswordValidationResult> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return { valid: false, errors: ['Organization not found'], score: 0 };
    }

    const { data: result } = await supabase.rpc('validate_password_strength', {
      password,
      org_id: profile.organization_id
    });

    const score = this.calculatePasswordScore(password);

    return {
      valid: result?.valid || false,
      errors: result?.errors || [],
      score
    };
  }

  // Calculate password strength score (0-100)
  private calculatePasswordScore(password: string): number {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Character variety scoring
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Common sequences
    
    // Entropy bonus
    const entropy = this.calculateEntropy(password);
    if (entropy > 50) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }

  // Calculate password entropy
  private calculateEntropy(password: string): number {
    const charsets = [
      /[a-z]/.test(password) ? 26 : 0,
      /[A-Z]/.test(password) ? 26 : 0,
      /[0-9]/.test(password) ? 10 : 0,
      /[^A-Za-z0-9]/.test(password) ? 32 : 0
    ];
    
    const charsetSize = charsets.reduce((sum, size) => sum + size, 0);
    return password.length * Math.log2(charsetSize);
  }

  // Check password against breach databases (using HaveIBeenPwned)
  async checkPasswordBreach(password: string): Promise<boolean> {
    try {
      const hash = await this.sha1Hash(password);
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5).toUpperCase();
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      
      return text.includes(suffix);
    } catch (error) {
      console.error('Error checking password breach:', error);
      return false;
    }
  }

  // Generate SHA-1 hash of password
  private async sha1Hash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // Store password in history
  async storePasswordHistory(userId: string, passwordHash: string): Promise<void> {
    await supabase
      .from('password_history')
      .insert({
        user_id: userId,
        password_hash: passwordHash
      });

    // Clean up old password history based on policy
    const profile = await getCurrentUserProfile();
    if (profile?.organization_id) {
      const policy = await this.getPasswordPolicy(profile.organization_id);
      if (policy) {
        const { data: historyEntries } = await supabase
          .from('password_history')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(policy.prevent_password_reuse, 1000);

        if (historyEntries && historyEntries.length > 0) {
          const idsToDelete = historyEntries.map(entry => entry.id);
          await supabase
            .from('password_history')
            .delete()
            .in('id', idsToDelete);
        }
      }
    }
  }

  // Check if password was used recently
  async checkPasswordReuse(userId: string, passwordHash: string): Promise<boolean> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return false;

    const policy = await this.getPasswordPolicy(profile.organization_id);
    if (!policy) return false;

    const { data: historyEntries } = await supabase
      .from('password_history')
      .select('password_hash')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(policy.prevent_password_reuse);

    if (!historyEntries) return false;

    return historyEntries.some(entry => entry.password_hash === passwordHash);
  }

  // Get password policy for organization
  async getPasswordPolicy(orgId: string): Promise<PasswordPolicy | null> {
    const { data, error } = await supabase
      .from('password_policies')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  // Create or update password policy
  async upsertPasswordPolicy(policy: Partial<PasswordPolicy>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const policyData = {
      org_id: profile.organization_id,
      ...policy
    };

    const { error } = await supabase
      .from('password_policies')
      .upsert([policyData]);

    if (error) throw error;
  }

  // Generate secure password
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check if password is expired
  async checkPasswordExpiry(userId: string): Promise<{ expired: boolean; daysUntilExpiry: number }> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return { expired: false, daysUntilExpiry: 0 };

    const policy = await this.getPasswordPolicy(profile.organization_id);
    if (!policy || policy.password_expiry_days === 0) {
      return { expired: false, daysUntilExpiry: 0 };
    }

    const { data: lastPassword } = await supabase
      .from('password_history')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!lastPassword) return { expired: false, daysUntilExpiry: 0 };

    const lastPasswordDate = new Date(lastPassword.created_at);
    const expiryDate = new Date(lastPasswordDate.getTime() + policy.password_expiry_days * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      expired: now > expiryDate,
      daysUntilExpiry: Math.max(0, daysUntilExpiry)
    };
  }
}

export const passwordSecurityService = new PasswordSecurityService();
