import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();

    switch (action) {
      case 'encrypt':
        return await encryptData(supabase, params);
      case 'decrypt':
        return await decryptData(supabase, params);
      case 'rotate_key':
        return await rotateKey(supabase, params);
      case 'generate_mfa_codes':
        return await generateMFABackupCodes(supabase, params);
      case 'verify_mfa_code':
        return await verifyMFABackupCode(supabase, params);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error('Data encryption error:', error);
    return new Response(
      JSON.stringify({ error: 'Encryption operation failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function encryptData(supabase: any, params: any) {
  const { orgId, tableName, fieldName, recordId, value, keyPurpose = 'field_encryption' } = params;

  // Get or create encryption key
  let { data: keyData } = await supabase
    .from('encryption_keys')
    .select('*')
    .eq('org_id', orgId)
    .eq('key_purpose', keyPurpose)
    .eq('is_active', true)
    .single();

  if (!keyData) {
    keyData = await createEncryptionKey(supabase, orgId, keyPurpose);
  }

  // Encrypt the value using Web Crypto API
  const encryptedValue = await encryptValue(value, keyData.key_data);

  // Store encrypted data
  const { error: insertError } = await supabase
    .from('encrypted_data_fields')
    .upsert({
      org_id: orgId,
      table_name: tableName,
      field_name: fieldName,
      record_id: recordId,
      encrypted_value: encryptedValue,
      encryption_key_id: keyData.id
    });

  if (insertError) throw insertError;

  return new Response(
    JSON.stringify({ success: true, encrypted: true }),
    { headers: corsHeaders }
  );
}

async function decryptData(supabase: any, params: any) {
  const { orgId, tableName, fieldName, recordId } = params;

  // Get encrypted data and key
  const { data: encryptedData, error } = await supabase
    .from('encrypted_data_fields')
    .select(`
      *,
      encryption_keys!inner(key_data)
    `)
    .eq('org_id', orgId)
    .eq('table_name', tableName)
    .eq('field_name', fieldName)
    .eq('record_id', recordId)
    .single();

  if (error || !encryptedData) {
    return new Response(
      JSON.stringify({ error: 'Encrypted data not found' }),
      { status: 404, headers: corsHeaders }
    );
  }

  // Decrypt the value
  const decryptedValue = await decryptValue(
    encryptedData.encrypted_value,
    encryptedData.encryption_keys.key_data
  );

  return new Response(
    JSON.stringify({ success: true, value: decryptedValue }),
    { headers: corsHeaders }
  );
}

async function rotateKey(supabase: any, params: any) {
  const { orgId, keyPurpose } = params;

  // Create new key version
  const newKey = await createEncryptionKey(supabase, orgId, keyPurpose);

  // Get all data encrypted with old keys
  const { data: oldData } = await supabase
    .from('encrypted_data_fields')
    .select(`
      *,
      encryption_keys!inner(key_data, key_purpose)
    `)
    .eq('org_id', orgId)
    .eq('encryption_keys.key_purpose', keyPurpose)
    .eq('encryption_keys.is_active', true)
    .neq('encryption_key_id', newKey.id);

  // Re-encrypt all data with new key
  for (const dataRecord of oldData || []) {
    const decryptedValue = await decryptValue(
      dataRecord.encrypted_value,
      dataRecord.encryption_keys.key_data
    );
    const newEncryptedValue = await encryptValue(decryptedValue, newKey.key_data);

    await supabase
      .from('encrypted_data_fields')
      .update({
        encrypted_value: newEncryptedValue,
        encryption_key_id: newKey.id
      })
      .eq('id', dataRecord.id);
  }

  // Deactivate old keys
  await supabase
    .from('encryption_keys')
    .update({ is_active: false })
    .eq('org_id', orgId)
    .eq('key_purpose', keyPurpose)
    .neq('id', newKey.id);

  return new Response(
    JSON.stringify({ success: true, newKeyId: newKey.id }),
    { headers: corsHeaders }
  );
}

async function generateMFABackupCodes(supabase: any, params: any) {
  const { userId, orgId } = params;

  // Generate 10 backup codes
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < 10; i++) {
    const code = generateSecureCode();
    codes.push(code);
    hashedCodes.push(await hashCode(code));
  }

  // Delete existing codes
  await supabase
    .from('mfa_backup_codes')
    .delete()
    .eq('user_id', userId)
    .eq('org_id', orgId);

  // Insert new codes
  const { error } = await supabase
    .from('mfa_backup_codes')
    .insert(
      hashedCodes.map(hash => ({
        user_id: userId,
        org_id: orgId,
        code_hash: hash
      }))
    );

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, codes }),
    { headers: corsHeaders }
  );
}

async function verifyMFABackupCode(supabase: any, params: any) {
  const { userId, orgId, code } = params;

  const codeHash = await hashCode(code);

  // Find and mark code as used
  const { data: backupCode, error } = await supabase
    .from('mfa_backup_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .eq('code_hash', codeHash)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !backupCode) {
    return new Response(
      JSON.stringify({ success: false, valid: false }),
      { headers: corsHeaders }
    );
  }

  // Mark as used
  await supabase
    .from('mfa_backup_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', backupCode.id);

  return new Response(
    JSON.stringify({ success: true, valid: true }),
    { headers: corsHeaders }
  );
}

async function createEncryptionKey(supabase: any, orgId: string, keyPurpose: string) {
  // Generate AES-256 key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const keyData = await crypto.subtle.exportKey('raw', key);
  const keyDataBase64 = btoa(String.fromCharCode(...new Uint8Array(keyData)));

  // Get next version number
  const { data: existingKeys } = await supabase
    .from('encryption_keys')
    .select('key_version')
    .eq('org_id', orgId)
    .eq('key_purpose', keyPurpose)
    .order('key_version', { ascending: false })
    .limit(1);

  const nextVersion = existingKeys?.length ? existingKeys[0].key_version + 1 : 1;

  const { data: newKey, error } = await supabase
    .from('encryption_keys')
    .insert({
      org_id: orgId,
      key_name: `${keyPurpose}_key_v${nextVersion}`,
      key_version: nextVersion,
      key_purpose: keyPurpose,
      key_data: keyDataBase64,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return newKey;
}

async function encryptValue(value: string, keyDataBase64: string): Promise<string> {
  const keyData = Uint8Array.from(atob(keyDataBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt']);
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(value)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decryptValue(encryptedBase64: string, keyDataBase64: string): Promise<string> {
  const keyData = Uint8Array.from(atob(keyDataBase64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['decrypt']);
  
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

function generateSecureCode(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const values = crypto.getRandomValues(new Uint8Array(8));
  
  for (let i = 0; i < 8; i++) {
    code += charset[values[i] % charset.length];
  }
  
  return code;
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}