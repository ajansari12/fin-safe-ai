import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { toast } from 'sonner';

export interface RiskAppetiteStatement {
  id: string;
  org_id: string;
  statement_name: string;
  description?: string;
  effective_date: string;
  review_date: string;
  next_review_date: string;
  approval_status: 'draft' | 'pending' | 'approved' | 'expired';
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskCategory {
  id: string;
  statement_id: string;
  category_name: string;
  category_type: 'operational' | 'financial' | 'compliance' | 'strategic';
  appetite_level: 'averse' | 'minimal' | 'cautious' | 'open' | 'seeking';
  description: string;
  rationale?: string;
  created_at: string;
  updated_at: string;
}

export interface QuantitativeLimit {
  id: string;
  statement_id: string;
  category_id: string;
  metric_name: string;
  limit_value: number;
  limit_unit: string;
  warning_threshold: number;
  critical_threshold: number;
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data_source: string;
  calculation_method?: string;
  created_at: string;
  updated_at: string;
}

export interface QualitativeStatement {
  id: string;
  statement_id: string;
  category: 'culture' | 'conduct' | 'compliance' | 'reputation';
  statement_text: string;
  acceptance_criteria: string[];
  rationale?: string;
  created_at: string;
  updated_at: string;
}

export const useRiskAppetite = () => {
  const { profile } = useAuth();
  const [statements, setStatements] = useState<RiskAppetiteStatement[]>([]);
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [quantitativeLimits, setQuantitativeLimits] = useState<QuantitativeLimit[]>([]);
  const [qualitativeStatements, setQualitativeStatements] = useState<QualitativeStatement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatements = async () => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('risk_appetite_statements')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatements(data || []);
    } catch (error) {
      console.error('Error loading risk appetite statements:', error);
      toast.error('Failed to load risk appetite statements');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async (statementId: string) => {
    try {
      const { data, error } = await supabase
        .from('risk_categories')
        .select('*')
        .eq('statement_id', statementId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading risk categories:', error);
      toast.error('Failed to load risk categories');
    }
  };

  const createStatement = async (statementData: {
    statement_name: string;
    description?: string;
    effective_date: string;
    review_date: string;
    riskCategories: {
      category_name: string;
      category_type: 'operational' | 'financial' | 'compliance' | 'strategic';
      appetite_level: 'averse' | 'minimal' | 'cautious' | 'open' | 'seeking';
      description: string;
      rationale?: string;
    }[];
    quantitativeLimits: {
      category_name: string;
      metric_name: string;
      limit_value: number;
      limit_unit: string;
      warning_threshold: number;
      critical_threshold: number;
      measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      data_source: string;
      calculation_method?: string;
    }[];
    qualitativeStatements: {
      category: 'culture' | 'conduct' | 'compliance' | 'reputation';
      statement_text: string;
      acceptance_criteria: string[];
      rationale?: string;
    }[];
  }) => {
    if (!profile?.organization_id || !profile.id) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      // Calculate next review date (typically 1 year from effective date)
      const nextReviewDate = new Date(statementData.effective_date);
      nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

      // Create the risk appetite statement
      const { data: statement, error: statementError } = await supabase
        .from('risk_appetite_statements')
        .insert({
          org_id: profile.organization_id,
          statement_name: statementData.statement_name,
          description: statementData.description,
          effective_date: statementData.effective_date,
          review_date: statementData.review_date,
          next_review_date: nextReviewDate.toISOString().split('T')[0],
          approval_status: 'draft',
          created_by: profile.id
        })
        .select()
        .single();

      if (statementError) throw statementError;

      toast.success('Risk appetite statement created successfully');
      await loadStatements();
      return statement;
    } catch (error) {
      console.error('Error creating risk appetite statement:', error);
      toast.error('Failed to create risk appetite statement');
      return null;
    }
  };

  const updateStatementStatus = async (statementId: string, status: 'draft' | 'pending' | 'approved' | 'expired') => {
    try {
      const updateData: any = { approval_status: status };
      
      if (status === 'approved') {
        updateData.approved_by = profile?.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('risk_appetite_statements')
        .update(updateData)
        .eq('id', statementId);

      if (error) throw error;

      toast.success(`Statement ${status} successfully`);
      await loadStatements();
    } catch (error) {
      console.error('Error updating statement status:', error);
      toast.error('Failed to update statement status');
    }
  };

  const deleteStatement = async (statementId: string) => {
    try {
      const { error } = await supabase
        .from('risk_appetite_statements')
        .delete()
        .eq('id', statementId);

      if (error) throw error;

      toast.success('Statement deleted successfully');
      await loadStatements();
    } catch (error) {
      console.error('Error deleting statement:', error);
      toast.error('Failed to delete statement');
    }
  };

  useEffect(() => {
    if (profile?.organization_id) {
      loadStatements();
    }
  }, [profile?.organization_id]);

  return {
    statements,
    categories,
    quantitativeLimits,
    qualitativeStatements,
    isLoading,
    loadStatements,
    loadCategories,
    createStatement,
    updateStatementStatus,
    deleteStatement
  };
};