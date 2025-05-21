
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  RiskCategory, 
  RiskAppetiteStatement, 
  RiskThreshold,
  KRIDefinition,
  RiskAppetiteFormData,
  RiskAppetiteComplete 
} from "@/pages/risk-management/types";
import { useAuth } from "@/contexts/AuthContext";

// Risk Categories
export async function getRiskCategories(): Promise<RiskCategory[]> {
  try {
    const { data, error } = await supabase
      .from('risk_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as RiskCategory[];
  } catch (error) {
    console.error('Error fetching risk categories:', error);
    toast.error("Failed to load risk categories");
    return [];
  }
}

// Risk Appetite Statements
export async function createRiskAppetiteStatement(
  statement: Omit<RiskAppetiteStatement, 'id' | 'created_at' | 'updated_at'>
): Promise<RiskAppetiteStatement | null> {
  try {
    const { data, error } = await supabase
      .from('risk_appetite_statements')
      .insert(statement)
      .select('*')
      .single();

    if (error) throw error;

    toast.success("Risk appetite statement created successfully");
    return data as RiskAppetiteStatement;
  } catch (error) {
    console.error('Error creating risk appetite statement:', error);
    toast.error("Failed to create risk appetite statement");
    return null;
  }
}

export async function getRiskAppetiteStatements(orgId: string): Promise<RiskAppetiteStatement[]> {
  try {
    const { data, error } = await supabase
      .from('risk_appetite_statements')
      .select('*')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as RiskAppetiteStatement[];
  } catch (error) {
    console.error('Error fetching risk appetite statements:', error);
    toast.error("Failed to load risk appetite statements");
    return [];
  }
}

export async function getRiskAppetiteStatementById(id: string): Promise<RiskAppetiteComplete | null> {
  try {
    // Get the statement
    const { data: statement, error: statementError } = await supabase
      .from('risk_appetite_statements')
      .select('*')
      .eq('id', id)
      .single();

    if (statementError) throw statementError;
    
    // Get thresholds with categories
    const { data: thresholds, error: thresholdsError } = await supabase
      .from('risk_thresholds')
      .select(`
        *,
        category:risk_categories(*)
      `)
      .eq('statement_id', id);
      
    if (thresholdsError) throw thresholdsError;
    
    // Get KRIs for each threshold
    const thresholdsWithKRIs = await Promise.all(thresholds.map(async (threshold) => {
      const { data: kris, error: krisError } = await supabase
        .from('kri_definitions')
        .select('*')
        .eq('threshold_id', threshold.id);
        
      if (krisError) throw krisError;
      
      return {
        ...threshold,
        kris: kris || []
      };
    }));
    
    return {
      ...statement,
      thresholds: thresholdsWithKRIs
    } as RiskAppetiteComplete;
  } catch (error) {
    console.error(`Error fetching risk appetite statement with ID ${id}:`, error);
    toast.error("Failed to load risk appetite statement");
    return null;
  }
}

export async function updateRiskAppetiteStatement(
  id: string, 
  updates: Partial<RiskAppetiteStatement>
): Promise<RiskAppetiteStatement | null> {
  try {
    // Get current version
    const { data: current } = await supabase
      .from('risk_appetite_statements')
      .select('version')
      .eq('id', id)
      .single();

    const newVersion = current ? current.version + 1 : 1;
    
    const { data, error } = await supabase
      .from('risk_appetite_statements')
      .update({ 
        ...updates, 
        version: newVersion,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    toast.success("Risk appetite statement updated successfully");
    return data as RiskAppetiteStatement;
  } catch (error) {
    console.error(`Error updating risk appetite statement with ID ${id}:`, error);
    toast.error("Failed to update risk appetite statement");
    return null;
  }
}

// Risk Thresholds
export async function createRiskThreshold(
  threshold: Omit<RiskThreshold, 'id' | 'created_at' | 'updated_at'>
): Promise<RiskThreshold | null> {
  try {
    const { data, error } = await supabase
      .from('risk_thresholds')
      .insert(threshold)
      .select('*')
      .single();

    if (error) throw error;

    return data as RiskThreshold;
  } catch (error) {
    console.error('Error creating risk threshold:', error);
    return null;
  }
}

export async function updateRiskThreshold(
  id: string, 
  updates: Partial<RiskThreshold>
): Promise<RiskThreshold | null> {
  try {
    const { data, error } = await supabase
      .from('risk_thresholds')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return data as RiskThreshold;
  } catch (error) {
    console.error(`Error updating risk threshold with ID ${id}:`, error);
    return null;
  }
}

// KRI Definitions
export async function createKRIDefinition(
  kri: Omit<KRIDefinition, 'id' | 'created_at' | 'updated_at'>
): Promise<KRIDefinition | null> {
  try {
    const { data, error } = await supabase
      .from('kri_definitions')
      .insert(kri)
      .select('*')
      .single();

    if (error) throw error;

    return data as KRIDefinition;
  } catch (error) {
    console.error('Error creating KRI definition:', error);
    return null;
  }
}

export async function updateKRIDefinition(
  id: string, 
  updates: Partial<KRIDefinition>
): Promise<KRIDefinition | null> {
  try {
    const { data, error } = await supabase
      .from('kri_definitions')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return data as KRIDefinition;
  } catch (error) {
    console.error(`Error updating KRI definition with ID ${id}:`, error);
    return null;
  }
}

// Complex operations
export async function saveRiskAppetiteWorkflow(formData: RiskAppetiteFormData, orgId: string, userId: string | null): Promise<string | null> {
  try {
    // Start a transaction
    let statementId = formData.statement.id;
    
    // Create or update the statement
    if (!statementId) {
      const newStatement = await createRiskAppetiteStatement({
        ...formData.statement,
        org_id: orgId,
        created_by: userId,
        updated_by: userId
      } as RiskAppetiteStatement);
      
      if (!newStatement) throw new Error("Failed to create risk appetite statement");
      statementId = newStatement.id;
    } else {
      await updateRiskAppetiteStatement(statementId, {
        ...formData.statement,
        updated_by: userId
      });
    }
    
    // Create or update thresholds
    for (const threshold of formData.thresholds) {
      let thresholdId = threshold.id;
      
      if (!thresholdId) {
        const newThreshold = await createRiskThreshold({
          ...threshold,
          statement_id: statementId
        } as RiskThreshold);
        
        if (!newThreshold) continue;
        thresholdId = newThreshold.id;
      } else {
        await updateRiskThreshold(thresholdId, threshold);
      }
      
      // Create or update KRIs for this threshold
      const kris = formData.kris[thresholdId] || [];
      for (const kri of kris) {
        if (kri.id) {
          await updateKRIDefinition(kri.id, kri);
        } else {
          await createKRIDefinition({
            ...kri,
            threshold_id: thresholdId
          } as KRIDefinition);
        }
      }
    }
    
    toast.success("Risk appetite workflow saved successfully");
    return statementId;
  } catch (error) {
    console.error('Error saving risk appetite workflow:', error);
    toast.error("Failed to save risk appetite workflow");
    return null;
  }
}

// Publish the risk appetite statement
export async function publishRiskAppetiteStatement(
  id: string, 
  userId: string | null
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('risk_appetite_statements')
      .update({ 
        status: 'active',
        updated_by: userId,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;

    toast.success("Risk appetite statement published successfully");
    return true;
  } catch (error) {
    console.error(`Error publishing risk appetite statement with ID ${id}:`, error);
    toast.error("Failed to publish risk appetite statement");
    return false;
  }
}
