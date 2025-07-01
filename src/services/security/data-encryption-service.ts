
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface EncryptionKey {
  id: string;
  org_id: string;
  key_name: string;
  key_version: number;
  key_purpose: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface EncryptedField {
  id: string;
  org_id: string;
  table_name: string;
  field_name: string;
  record_id: string;
  encrypted_value: string;
  encryption_key_id: string;
}

class DataEncryptionService {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256;

  // Generate new encryption key
  async generateEncryptionKey(keyName: string, keyPurpose: string): Promise<string> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Generate AES-256 key
    const key = await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export key to store (encrypted with master key in real implementation)
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Store key in database
    const { data, error } = await supabase
      .from('encryption_keys')
      .insert({
        org_id: profile.organization_id,
        key_name: keyName,
        encrypted_key: keyBase64, // In production, this should be encrypted with a master key
        key_purpose: keyPurpose
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  // Get encryption key
  async getEncryptionKey(keyId: string): Promise<CryptoKey> {
    const { data, error } = await supabase
      .from('encryption_keys')
      .select('encrypted_key')
      .eq('id', keyId)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // In production, decrypt the key using master key
    const keyBuffer = Uint8Array.from(atob(data.encrypted_key), c => c.charCodeAt(0));
    
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: this.algorithm },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data
  async encryptData(data: string, keyId: string): Promise<string> {
    const key = await this.getEncryptionKey(keyId);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    
    const encodedData = new TextEncoder().encode(data);
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data
  async decryptData(encryptedData: string, keyId: string): Promise<string> {
    const key = await this.getEncryptionKey(keyId);
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  }

  // Store encrypted field
  async storeEncryptedField(
    tableName: string,
    fieldName: string,
    recordId: string,
    value: string,
    keyPurpose: string = 'field_encryption'
  ): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get or create encryption key for this purpose
    let keyId = await this.getOrCreateKey(`${tableName}_${fieldName}`, keyPurpose);
    
    // Encrypt the value
    const encryptedValue = await this.encryptData(value, keyId);

    // Store encrypted field
    const { error } = await supabase
      .from('encrypted_data_fields')
      .upsert({
        org_id: profile.organization_id,
        table_name: tableName,
        field_name: fieldName,
        record_id: recordId,
        encrypted_value: encryptedValue,
        encryption_key_id: keyId
      });

    if (error) throw error;
  }

  // Retrieve encrypted field
  async retrieveEncryptedField(
    tableName: string,
    fieldName: string,
    recordId: string
  ): Promise<string | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('encrypted_data_fields')
      .select('encrypted_value, encryption_key_id')
      .eq('org_id', profile.organization_id)
      .eq('table_name', tableName)
      .eq('field_name', fieldName)
      .eq('record_id', recordId)
      .single();

    if (error) return null;

    return await this.decryptData(data.encrypted_value, data.encryption_key_id);
  }

  // Batch encrypt multiple fields
  async batchEncryptFields(fields: Array<{
    tableName: string;
    fieldName: string;
    recordId: string;
    value: string;
  }>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const encryptedFields = [];

    for (const field of fields) {
      const keyId = await this.getOrCreateKey(`${field.tableName}_${field.fieldName}`, 'field_encryption');
      const encryptedValue = await this.encryptData(field.value, keyId);

      encryptedFields.push({
        org_id: profile.organization_id,
        table_name: field.tableName,
        field_name: field.fieldName,
        record_id: field.recordId,
        encrypted_value: encryptedValue,
        encryption_key_id: keyId
      });
    }

    const { error } = await supabase
      .from('encrypted_data_fields')
      .upsert(encryptedFields);

    if (error) throw error;
  }

  // Get or create encryption key
  private async getOrCreateKey(keyName: string, keyPurpose: string): Promise<string> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Try to get existing key
    const { data: existingKey } = await supabase
      .from('encryption_keys')
      .select('id')
      .eq('org_id', profile.organization_id)
      .eq('key_name', keyName)
      .eq('is_active', true)
      .single();

    if (existingKey) {
      return existingKey.id;
    }

    // Create new key
    return await this.generateEncryptionKey(keyName, keyPurpose);
  }

  // Rotate encryption key
  async rotateEncryptionKey(keyName: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get current key
    const { data: currentKey } = await supabase
      .from('encryption_keys')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('key_name', keyName)
      .eq('is_active', true)
      .single();

    if (!currentKey) throw new Error('Key not found');

    // Create new key version
    const newKeyId = await this.generateEncryptionKey(keyName, currentKey.key_purpose);

    // Get all data encrypted with old key
    const { data: encryptedFields } = await supabase
      .from('encrypted_data_fields')
      .select('*')
      .eq('encryption_key_id', currentKey.id);

    if (encryptedFields) {
      // Re-encrypt all data with new key
      for (const field of encryptedFields) {
        const decryptedValue = await this.decryptData(field.encrypted_value, currentKey.id);
        const newEncryptedValue = await this.encryptData(decryptedValue, newKeyId);

        await supabase
          .from('encrypted_data_fields')
          .update({
            encrypted_value: newEncryptedValue,
            encryption_key_id: newKeyId
          })
          .eq('id', field.id);
      }
    }

    // Deactivate old key
    await supabase
      .from('encryption_keys')
      .update({ 
        is_active: false,
        rotated_at: new Date().toISOString()
      })
      .eq('id', currentKey.id);
  }

  // List encryption keys
  async listEncryptionKeys(): Promise<EncryptionKey[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('encryption_keys')
      .select('id, org_id, key_name, key_version, key_purpose, is_active, expires_at, created_at')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Delete encryption key (and associated encrypted data)
  async deleteEncryptionKey(keyId: string): Promise<void> {
    // First delete all encrypted data using this key
    await supabase
      .from('encrypted_data_fields')
      .delete()
      .eq('encryption_key_id', keyId);

    // Then delete the key
    await supabase
      .from('encryption_keys')
      .delete()
      .eq('id', keyId);
  }

  // Encrypt PII fields commonly used in financial applications
  async encryptPIIField(fieldType: 'ssn' | 'credit_card' | 'bank_account' | 'phone' | 'email', value: string, recordId: string): Promise<void> {
    await this.storeEncryptedField('pii_data', fieldType, recordId, value, 'pii_encryption');
  }

  // Decrypt PII field
  async decryptPIIField(fieldType: 'ssn' | 'credit_card' | 'bank_account' | 'phone' | 'email', recordId: string): Promise<string | null> {
    return await this.retrieveEncryptedField('pii_data', fieldType, recordId);
  }
}

export const dataEncryptionService = new DataEncryptionService();
