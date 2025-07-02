
import { supabase } from '@/integrations/supabase/client';

export interface IndustryTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_description?: string;
  industry_sector: string;
  sub_sector?: string;
  template_type: 'governance' | 'risk_management' | 'compliance' | 'operational' | 'cybersecurity';
  complexity_level: 'simple' | 'medium' | 'complex';
  regulatory_basis?: string[];
  template_data: Record<string, any>;
  customization_rules?: Record<string, any>;
  success_metrics?: any[];
  implementation_steps?: any[];
  is_featured: boolean;
  usage_count: number;
  effectiveness_score: number;
  last_updated_date: string;
  created_by?: string;
  created_by_name?: string;
  is_active: boolean;
}

export interface TemplateCategory {
  id: string;
  category_name: string;
  category_description?: string;
  parent_category_id?: string;
  industry_focus?: string[];
  regulatory_frameworks?: string[];
  sort_order: number;
  is_active: boolean;
}

export interface BestPracticeGuide {
  id: string;
  template_id?: string;
  guide_title: string;
  guide_type: 'implementation' | 'customization' | 'troubleshooting' | 'optimization';
  content_sections: any[];
  step_by_step_instructions?: any[];
  common_challenges?: any[];
  troubleshooting_tips?: any[];
  success_factors?: any[];
  case_studies?: any[];
  target_audience?: string[];
  estimated_completion_time?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  tools_required?: string[];
  created_by?: string;
  created_by_name?: string;
  review_status: 'draft' | 'under_review' | 'approved' | 'published';
  is_published: boolean;
}

export interface KnowledgeBaseArticle {
  id: string;
  article_title: string;
  article_type: 'guidance' | 'regulatory' | 'best_practice' | 'case_study' | 'faq';
  content_body: string;
  summary?: string;
  keywords?: string[];
  related_templates?: string[];
  related_regulations?: string[];
  industry_relevance?: string[];
  target_roles?: string[];
  content_format: 'markdown' | 'html' | 'plain_text';
  external_references?: any[];
  view_count: number;
  helpful_votes: number;
  unhelpful_votes: number;
  content_freshness_score: number;
  created_by?: string;
  created_by_name?: string;
  publication_status: 'draft' | 'under_review' | 'published';
}

export interface TemplateCustomizationRequest {
  orgId: string;
  templateId: string;
  organizationalProfile: any;
  customizationPreferences?: any;
}

export class TemplateLibraryService {

  // Industry Template Management
  async getIndustryTemplates(filters?: {
    industry_sector?: string;
    template_type?: string;
    complexity_level?: string;
    is_featured?: boolean;
  }): Promise<IndustryTemplate[]> {
    let query = supabase
      .from('industry_template_libraries')
      .select('*')
      .eq('is_active', true)
      .order('effectiveness_score', { ascending: false });

    if (filters?.industry_sector) {
      query = query.eq('industry_sector', filters.industry_sector);
    }
    if (filters?.template_type) {
      query = query.eq('template_type', filters.template_type);
    }
    if (filters?.complexity_level) {
      query = query.eq('complexity_level', filters.complexity_level);
    }
    if (filters?.is_featured) {
      query = query.eq('is_featured', filters.is_featured);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTemplateById(templateId: string): Promise<IndustryTemplate | null> {
    const { data, error } = await supabase
      .from('industry_template_libraries')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createTemplate(template: Omit<IndustryTemplate, 'id' | 'usage_count' | 'effectiveness_score'>): Promise<IndustryTemplate> {
    const { data, error } = await supabase
      .from('industry_template_libraries')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Template Categories
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  }

  // Best Practice Guides
  async getBestPracticeGuides(templateId?: string): Promise<BestPracticeGuide[]> {
    let query = supabase
      .from('best_practice_guides')
      .select('*')
      .eq('is_published', true);

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createBestPracticeGuide(guide: Omit<BestPracticeGuide, 'id'>): Promise<BestPracticeGuide> {
    const { data, error } = await supabase
      .from('best_practice_guides')
      .insert([guide])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Knowledge Base
  async searchKnowledgeBase(query: string, filters?: {
    article_type?: string;
    industry_relevance?: string;
  }): Promise<KnowledgeBaseArticle[]> {
    let supabaseQuery = supabase
      .from('knowledge_base_articles')
      .select('*')
      .eq('publication_status', 'published')
      .textSearch('search_vector', query);

    if (filters?.article_type) {
      supabaseQuery = supabaseQuery.eq('article_type', filters.article_type);
    }
    if (filters?.industry_relevance) {
      supabaseQuery = supabaseQuery.contains('industry_relevance', [filters.industry_relevance]);
    }

    const { data, error } = await supabaseQuery
      .order('content_freshness_score', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async getKnowledgeBaseArticles(filters?: {
    article_type?: string;
    industry_relevance?: string;
  }): Promise<KnowledgeBaseArticle[]> {
    let query = supabase
      .from('knowledge_base_articles')
      .select('*')
      .eq('publication_status', 'published');

    if (filters?.article_type) {
      query = query.eq('article_type', filters.article_type);
    }
    if (filters?.industry_relevance) {
      query = query.contains('industry_relevance', [filters.industry_relevance]);
    }

    const { data, error } = await query
      .order('view_count', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  async createKnowledgeBaseArticle(article: Omit<KnowledgeBaseArticle, 'id' | 'view_count' | 'helpful_votes' | 'unhelpful_votes'>): Promise<KnowledgeBaseArticle> {
    const { data, error } = await supabase
      .from('knowledge_base_articles')
      .insert([{
        ...article,
        view_count: 0,
        helpful_votes: 0,
        unhelpful_votes: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Template Customization Engine
  async getCustomizedTemplate(request: TemplateCustomizationRequest): Promise<IndustryTemplate> {
    const template = await this.getTemplateById(request.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Get customization rules for this template
    const { data: rules, error } = await supabase
      .from('template_customization_rules')
      .select('*')
      .eq('template_id', request.templateId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;

    let customizedTemplate = { ...template };

    // Apply customization rules
    for (const rule of rules || []) {
      if (this.evaluateRuleConditions(rule.trigger_conditions, request.organizationalProfile)) {
        customizedTemplate = this.applyCustomizationActions(
          customizedTemplate,
          rule.customization_actions,
          rule.parameter_adjustments
        );
      }
    }

    return customizedTemplate;
  }

  private evaluateRuleConditions(conditions: any, orgProfile: any): boolean {
    // Simplified condition evaluation logic
    for (const [key, expectedValue] of Object.entries(conditions)) {
      if (orgProfile[key] !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  private applyCustomizationActions(template: IndustryTemplate, actions: any[], adjustments: any): IndustryTemplate {
    let customized = { ...template };

    // Apply parameter adjustments
    if (adjustments && typeof adjustments === 'object') {
      customized.template_data = {
        ...customized.template_data,
        ...adjustments
      };
    }

    // Apply other customization actions
    for (const action of actions) {
      switch (action.type) {
        case 'modify_threshold':
          if (customized.template_data.thresholds) {
            customized.template_data.thresholds[action.parameter] = action.value;
          }
          break;
        case 'add_section':
          if (!customized.template_data.sections) {
            customized.template_data.sections = [];
          }
          customized.template_data.sections.push(action.section);
          break;
        case 'remove_section':
          if (customized.template_data.sections) {
            customized.template_data.sections = customized.template_data.sections.filter(
              (section: any) => section.id !== action.sectionId
            );
          }
          break;
      }
    }

    return customized;
  }

  // Template Usage Analytics
  async trackTemplateUsage(
    templateId: string,
    orgId: string,
    userId?: string,
    usageType: 'view' | 'download' | 'customize' | 'implement' = 'view',
    customizationDetails?: any
  ): Promise<void> {
    await supabase
      .from('template_usage_analytics')
      .insert([{
        template_id: templateId,
        org_id: orgId,
        user_id: userId,
        usage_type: usageType,
        customization_applied: !!customizationDetails,
        customization_details: customizationDetails || {},
        usage_context: 'framework_generation',
        device_type: 'web',
        access_method: 'direct'
      }]);

    // Update template usage count
    await supabase
      .from('industry_template_libraries')
      .update({ usage_count: supabase.sql`usage_count + 1` })
      .eq('id', templateId);
  }

  // Template Effectiveness Tracking
  async submitTemplateEffectivenessReport(
    templateId: string,
    orgId: string,
    report: {
      implementation_start_date: string;
      implementation_completion_date?: string;
      implementation_success_rate?: number;
      user_satisfaction_score?: number;
      compliance_improvement_score?: number;
      operational_efficiency_gain?: number;
      issues_encountered?: any[];
      lessons_learned?: any[];
      would_recommend?: boolean;
      implementation_notes?: string;
      reported_by?: string;
      reported_by_name?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('template_effectiveness_tracking')
      .insert([{
        template_id: templateId,
        org_id: orgId,
        ...report
      }]);

    if (error) throw error;
  }

  // Industry-Specific Template Generation
  async generateIndustrySpecificTemplates(
    sector: string,
    orgProfile: any
  ): Promise<IndustryTemplate[]> {
    // Get base templates for the sector
    const baseTemplates = await this.getIndustryTemplates({
      industry_sector: sector
    });

    // Customize each template based on org profile
    const customizedTemplates = [];
    for (const template of baseTemplates) {
      try {
        const customized = await this.getCustomizedTemplate({
          orgId: orgProfile.organization_id,
          templateId: template.id,
          organizationalProfile: orgProfile
        });
        customizedTemplates.push(customized);
      } catch (error) {
        console.error(`Failed to customize template ${template.id}:`, error);
        customizedTemplates.push(template); // Fallback to original template
      }
    }

    return customizedTemplates;
  }

  // Regulatory Compliance Integration
  async getTemplatesForRegulation(
    regulation: string,
    jurisdiction: string
  ): Promise<IndustryTemplate[]> {
    const { data: mappings, error } = await supabase
      .from('regulatory_template_mappings')
      .select(`
        template_id,
        industry_template_libraries (*)
      `)
      .eq('regulation_name', regulation)
      .eq('jurisdiction', jurisdiction)
      .eq('is_current', true);

    if (error) throw error;

    return mappings?.map(mapping => mapping.industry_template_libraries).filter(Boolean) || [];
  }

  // Template Dependencies
  async getTemplateDependencies(templateId: string): Promise<IndustryTemplate[]> {
    const { data: dependencies, error } = await supabase
      .from('template_dependencies')
      .select(`
        dependent_template_id,
        industry_template_libraries!template_dependencies_dependent_template_id_fkey (*)
      `)
      .eq('source_template_id', templateId)
      .eq('is_active', true)
      .order('implementation_order');

    if (error) throw error;

    return dependencies?.map(dep => dep.industry_template_libraries).filter(Boolean) || [];
  }
}

export const templateLibraryService = new TemplateLibraryService();
