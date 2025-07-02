
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, ThumbsUp, ThumbsDown, Eye, Filter, Star, FileText } from 'lucide-react';
import { templateLibraryService, KnowledgeBaseArticle } from '@/services/template-library-service';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeBaseHubProps {
  orgId: string;
}

const KnowledgeBaseHub: React.FC<KnowledgeBaseHubProps> = ({ orgId }) => {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<KnowledgeBaseArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadArticles();
  }, [selectedType, selectedIndustry]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await templateLibraryService.getKnowledgeBaseArticles({
        article_type: selectedType === 'all' ? undefined : selectedType,
        industry_relevance: selectedIndustry === 'all' ? undefined : selectedIndustry
      });
      setArticles(data);
    } catch (error) {
      console.error('Error loading knowledge base articles:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await templateLibraryService.searchKnowledgeBase(searchQuery, {
        article_type: selectedType === 'all' ? undefined : selectedType,
        industry_relevance: selectedIndustry === 'all' ? undefined : selectedIndustry
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      toast({
        title: "Search Error",
        description: "Failed to search knowledge base",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const displayedArticles = searchQuery.trim() ? searchResults : articles;

  const getArticleTypeColor = (type: string) => {
    switch (type) {
      case 'guidance': return 'bg-blue-100 text-blue-800';
      case 'regulatory': return 'bg-red-100 text-red-800';
      case 'best_practice': return 'bg-green-100 text-green-800';
      case 'case_study': return 'bg-purple-100 text-purple-800';
      case 'faq': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFreshnessColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleArticleView = (article: KnowledgeBaseArticle) => {
    // Here you would typically open the full article view
    toast({
      title: "Article Opened",
      description: `Reading: ${article.article_title}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive guidance, regulations, and best practices
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Contribute Article
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Article Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="guidance">Guidance</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="best_practice">Best Practice</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
                <SelectItem value="faq">FAQ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="banking">Banking</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="investment_management">Investment Management</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {searchQuery.trim() && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isSearching ? 'Searching...' : `${displayedArticles.length} results for "${searchQuery}"`}
            </p>
            {searchQuery.trim() && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedArticles.map((article) => (
            <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleView(article)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">
                    {article.article_title}
                  </CardTitle>
                  <Badge className={getArticleTypeColor(article.article_type)}>
                    {article.article_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {article.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.summary}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {article.keywords?.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {article.keywords && article.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{article.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.helpful_votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" />
                        {article.unhelpful_votes}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${getFreshnessColor(article.content_freshness_score)}`}>
                      <Star className="h-3 w-3" />
                      {(article.content_freshness_score * 100).toFixed(0)}% fresh
                    </div>
                  </div>

                  {article.industry_relevance && article.industry_relevance.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.industry_relevance.slice(0, 2).map((industry, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayedArticles.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms or filters'
                  : 'No articles match your current filters'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseHub;
