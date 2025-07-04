import { supabase } from "@/integrations/supabase/client";
import { getUserOrganization } from "@/lib/supabase-utils";

export interface KnowledgeBaseEntry {
  id: string;
  org_id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  visibility: 'public' | 'internal' | 'private';
  embedding?: number[];
  search_vector?: string;
  created_at: string;
  updated_at: string;
}

export interface VectorSearchResult extends KnowledgeBaseEntry {
  similarity?: number;
}

class KnowledgeBaseService {
  // Create new knowledge base entry
  async createEntry(entry: Omit<KnowledgeBaseEntry, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'search_vector'>): Promise<KnowledgeBaseEntry> {
    const org = await getUserOrganization();
    if (!org) throw new Error('Organization not found');

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([{
        ...entry,
        org_id: org.id
      }])
      .select()
      .single();

    if (error) throw error;

    // Generate embedding for the new entry
    if (data) {
      await this.generateEmbedding(data.id, `${data.title} ${data.content}`);
    }

    return data;
  }

  // Vector search using embeddings
  async vectorSearch(query: string, limit: number = 5, threshold: number = 0.7): Promise<VectorSearchResult[]> {
    try {
      const org = await getUserOrganization();
      if (!org) return [];

      // First, generate embedding for the query
      const queryEmbedding = await this.generateQueryEmbedding(query);
      if (!queryEmbedding) return [];

      // Perform vector similarity search
      const { data, error } = await supabase.rpc('match_knowledge_base', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        org_filter: org.id
      });

      if (error) {
        console.error('Vector search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }

  // Text search fallback
  async textSearch(query: string, limit: number = 5): Promise<KnowledgeBaseEntry[]> {
    try {
      const org = await getUserOrganization();
      if (!org) return [];

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('org_id', org.id)
        .textSearch('search_vector', query)
        .limit(limit);

      if (error) {
        console.error('Text search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Text search failed:', error);
      return [];
    }
  }

  // Hybrid search with vector + text fallback
  async search(query: string, limit: number = 5): Promise<VectorSearchResult[]> {
    // Try vector search first
    let results = await this.vectorSearch(query, limit);
    
    // If vector search returns few results, supplement with text search
    if (results.length < limit) {
      const textResults = await this.textSearch(query, limit - results.length);
      
      // Convert text results to vector search format and add them
      const supplementalResults: VectorSearchResult[] = textResults
        .filter(textResult => !results.some(vectorResult => vectorResult.id === textResult.id))
        .map(textResult => ({ ...textResult, similarity: 0.5 })); // Lower similarity for text matches
      
      results = [...results, ...supplementalResults];
    }

    return results.slice(0, limit);
  }

  // Generate embedding for content
  private async generateEmbedding(knowledgeBaseId: string, text: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { text, knowledgeBaseId }
      });

      if (error) {
        console.error('Embedding generation error:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      return false;
    }
  }

  // Generate embedding for search query
  private async generateQueryEmbedding(query: string): Promise<number[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { text: query }
      });

      if (error) {
        console.error('Query embedding generation error:', error);
        return null;
      }

      return data?.embedding || null;
    } catch (error) {
      console.error('Failed to generate query embedding:', error);
      return null;
    }
  }

  // Get entries by category
  async getByCategory(category: string): Promise<KnowledgeBaseEntry[]> {
    const org = await getUserOrganization();
    if (!org) return [];

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('org_id', org.id)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get all entries for organization
  async getAll(): Promise<KnowledgeBaseEntry[]> {
    const org = await getUserOrganization();
    if (!org) return [];

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Update entry
  async updateEntry(id: string, updates: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry> {
    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Regenerate embedding if content changed
    if (data && (updates.title || updates.content)) {
      await this.generateEmbedding(data.id, `${data.title} ${data.content}`);
    }

    return data;
  }

  // Delete entry
  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();