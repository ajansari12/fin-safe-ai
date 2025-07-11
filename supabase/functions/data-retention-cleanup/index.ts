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

    const { orgId, dryRun = false } = await req.json();

    console.log(`Starting data retention cleanup${dryRun ? ' (DRY RUN)' : ''} for org: ${orgId || 'all'}`);

    const results = await performDataRetentionCleanup(supabase, orgId, dryRun);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        dryRun
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Data retention cleanup error:', error);
    return new Response(
      JSON.stringify({ error: 'Cleanup operation failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function performDataRetentionCleanup(supabase: any, orgId?: string, dryRun = false) {
  const results: any[] = [];

  // Get retention policies
  let query = supabase
    .from('data_retention_policies')
    .select('*')
    .eq('is_active', true);

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data: policies, error: policiesError } = await query;

  if (policiesError) {
    throw new Error(`Failed to get retention policies: ${policiesError.message}`);
  }

  console.log(`Found ${policies?.length || 0} active retention policies`);

  // Process each policy
  for (const policy of policies || []) {
    try {
      const result = await cleanupTableData(supabase, policy, dryRun);
      results.push(result);

      // Update last cleanup time if not dry run
      if (!dryRun) {
        await supabase
          .from('data_retention_policies')
          .update({ last_cleanup_at: new Date().toISOString() })
          .eq('id', policy.id);
      }
    } catch (error) {
      console.error(`Error cleaning up table ${policy.table_name}:`, error);
      results.push({
        table_name: policy.table_name,
        org_id: policy.org_id,
        error: error.message,
        deleted_count: 0
      });
    }
  }

  // Cleanup system tables
  const systemCleanup = await cleanupSystemTables(supabase, dryRun);
  results.push(...systemCleanup);

  return results;
}

async function cleanupTableData(supabase: any, policy: any, dryRun: boolean) {
  const { table_name, retention_days, org_id } = policy;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retention_days);

  console.log(`Processing table: ${table_name}, org: ${org_id}, retention: ${retention_days} days`);

  // Get count of records to be deleted
  const { count: recordCount, error: countError } = await supabase
    .from(table_name)
    .select('*', { count: 'exact', head: true })
    .eq('org_id', org_id)
    .lt('created_at', cutoffDate.toISOString());

  if (countError) {
    throw new Error(`Failed to count records in ${table_name}: ${countError.message}`);
  }

  console.log(`Found ${recordCount || 0} records to delete in ${table_name}`);

  let deletedCount = 0;

  if (!dryRun && recordCount && recordCount > 0) {
    // Delete in batches to avoid timeout
    const batchSize = 1000;
    let totalDeleted = 0;

    while (totalDeleted < recordCount) {
      const { data: recordsToDelete, error: selectError } = await supabase
        .from(table_name)
        .select('id')
        .eq('org_id', org_id)
        .lt('created_at', cutoffDate.toISOString())
        .limit(batchSize);

      if (selectError) {
        throw new Error(`Failed to select records from ${table_name}: ${selectError.message}`);
      }

      if (!recordsToDelete || recordsToDelete.length === 0) {
        break;
      }

      const ids = recordsToDelete.map(r => r.id);
      const { error: deleteError } = await supabase
        .from(table_name)
        .delete()
        .in('id', ids);

      if (deleteError) {
        throw new Error(`Failed to delete records from ${table_name}: ${deleteError.message}`);
      }

      totalDeleted += recordsToDelete.length;
      deletedCount = totalDeleted;

      console.log(`Deleted ${totalDeleted}/${recordCount} records from ${table_name}`);
    }
  }

  return {
    table_name,
    org_id,
    retention_days,
    cutoff_date: cutoffDate.toISOString(),
    records_found: recordCount || 0,
    deleted_count: deletedCount
  };
}

async function cleanupSystemTables(supabase: any, dryRun: boolean) {
  const results = [];

  // Cleanup expired CSRF tokens
  const { count: csrfCount } = await supabase
    .from('csrf_tokens')
    .select('*', { count: 'exact', head: true })
    .lt('expires_at', new Date().toISOString());

  if (!dryRun && csrfCount && csrfCount > 0) {
    const { error: csrfError } = await supabase
      .from('csrf_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (csrfError) {
      console.error('Failed to cleanup CSRF tokens:', csrfError);
    }
  }

  results.push({
    table_name: 'csrf_tokens',
    org_id: 'system',
    retention_days: 'expired',
    records_found: csrfCount || 0,
    deleted_count: dryRun ? 0 : (csrfCount || 0)
  });

  // Cleanup expired MFA backup codes
  const { count: mfaCount } = await supabase
    .from('mfa_backup_codes')
    .select('*', { count: 'exact', head: true })
    .lt('expires_at', new Date().toISOString());

  if (!dryRun && mfaCount && mfaCount > 0) {
    const { error: mfaError } = await supabase
      .from('mfa_backup_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (mfaError) {
      console.error('Failed to cleanup MFA backup codes:', mfaError);
    }
  }

  results.push({
    table_name: 'mfa_backup_codes',
    org_id: 'system',
    retention_days: 'expired',
    records_found: mfaCount || 0,
    deleted_count: dryRun ? 0 : (mfaCount || 0)
  });

  // Cleanup old rate limit records (older than 24 hours)
  const rateLimitCutoff = new Date();
  rateLimitCutoff.setHours(rateLimitCutoff.getHours() - 24);

  const { count: rateLimitCount } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', rateLimitCutoff.toISOString());

  if (!dryRun && rateLimitCount && rateLimitCount > 0) {
    const { error: rateLimitError } = await supabase
      .from('rate_limits')
      .delete()
      .lt('created_at', rateLimitCutoff.toISOString());

    if (rateLimitError) {
      console.error('Failed to cleanup rate limits:', rateLimitError);
    }
  }

  results.push({
    table_name: 'rate_limits',
    org_id: 'system',
    retention_days: 1,
    records_found: rateLimitCount || 0,
    deleted_count: dryRun ? 0 : (rateLimitCount || 0)
  });

  // Cleanup old admin logs (older than 2 years)
  const adminLogCutoff = new Date();
  adminLogCutoff.setFullYear(adminLogCutoff.getFullYear() - 2);

  const { count: adminLogCount } = await supabase
    .from('admin_logs')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', adminLogCutoff.toISOString());

  if (!dryRun && adminLogCount && adminLogCount > 0) {
    const { error: adminLogError } = await supabase
      .from('admin_logs')
      .delete()
      .lt('created_at', adminLogCutoff.toISOString());

    if (adminLogError) {
      console.error('Failed to cleanup admin logs:', adminLogError);
    }
  }

  results.push({
    table_name: 'admin_logs',
    org_id: 'system',
    retention_days: 730,
    records_found: adminLogCount || 0,
    deleted_count: dryRun ? 0 : (adminLogCount || 0)
  });

  // Cleanup old AI chat logs (older than 1 year)
  const aiLogCutoff = new Date();
  aiLogCutoff.setFullYear(aiLogCutoff.getFullYear() - 1);

  const { count: aiLogCount } = await supabase
    .from('ai_chat_logs')
    .select('*', { count: 'exact', head: true })
    .lt('created_at', aiLogCutoff.toISOString());

  if (!dryRun && aiLogCount && aiLogCount > 0) {
    const { error: aiLogError } = await supabase
      .from('ai_chat_logs')
      .delete()
      .lt('created_at', aiLogCutoff.toISOString());

    if (aiLogError) {
      console.error('Failed to cleanup AI chat logs:', aiLogError);
    }
  }

  results.push({
    table_name: 'ai_chat_logs',
    org_id: 'system',
    retention_days: 365,
    records_found: aiLogCount || 0,
    deleted_count: dryRun ? 0 : (aiLogCount || 0)
  });

  return results;
}