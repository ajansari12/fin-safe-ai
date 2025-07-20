import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, BookOpen, ExternalLink, Brain, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  similarity: number;
  created_at: string;
}

export const AIKnowledgeSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('No organization found');
      }

      const { data, error } = await supabase.functions.invoke('match-knowledge-base', {
        body: {
          query: searchQuery,
          orgId: profile.organization_id,
          matchThreshold: 0.7,
          matchCount: 10
        }
      });

      if (error) {
        console.error('Knowledge search error:', error);
        setSearchResults([]);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const suggestedSearches = [
    "OSFI E-21 risk appetite requirements",
    "KRI threshold setting best practices",
    "Operational risk incident reporting",
    "Business continuity planning OSFI",
    "Third party risk management"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg">AI Knowledge Search</CardTitle>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          Search through OSFI E-21 guidance and best practices
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search OSFI E-21 knowledge base..."
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Suggested Searches */}
        {searchResults.length === 0 && !isSearching && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Popular searches:
            </div>
            <div className="space-y-2">
              {suggestedSearches.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-2 text-wrap w-full"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch();
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {searchResults.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {Math.round(item.similarity * 100)}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.content.substring(0, 200)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Full
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {searchResults.length === 0 && isSearching && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground">Searching knowledge base...</p>
              </div>
            )}
            
            {searchResults.length === 0 && !isSearching && searchQuery && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or check the suggested searches above
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center">
          AI-powered semantic search across OSFI E-21 compliance documentation
        </div>
      </CardContent>
    </Card>
  );
};