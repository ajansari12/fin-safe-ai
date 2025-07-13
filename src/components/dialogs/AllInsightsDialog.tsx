import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';

interface AnalyticsInsight {
  id: string;
  insight_type: string;
  insight_data: any;
  confidence_score: number;
  generated_at: string;
  valid_until: string | null;
  tags: string[] | null;
}

interface AllInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AllInsightsDialog: React.FC<AllInsightsDialogProps> = ({ open, onOpenChange }) => {
  const { profile } = useAuth();
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');

  useEffect(() => {
    if (open && profile?.organization_id) {
      loadInsights();
    }
  }, [open, profile?.organization_id]);

  useEffect(() => {
    filterInsights();
  }, [insights, searchTerm, typeFilter, confidenceFilter]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', profile!.organization_id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      toast.error('Failed to load insights');
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInsights = () => {
    let filtered = insights;

    if (searchTerm) {
      filtered = filtered.filter(insight =>
        insight.insight_data?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.insight_data?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.insight_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(insight => insight.insight_type === typeFilter);
    }

    if (confidenceFilter !== 'all') {
      const threshold = parseFloat(confidenceFilter);
      filtered = filtered.filter(insight => insight.confidence_score >= threshold);
    }

    setFilteredInsights(filtered);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'correlation': return <Target className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'recommendation': return <Zap className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportInsights = () => {
    const csvContent = [
      ['Type', 'Title', 'Description', 'Impact', 'Confidence', 'Generated At'],
      ...filteredInsights.map(insight => [
        insight.insight_type,
        insight.insight_data?.title || 'N/A',
        insight.insight_data?.description || 'N/A',
        insight.insight_data?.impact || 'N/A',
        Math.round(insight.confidence_score * 100) + '%',
        new Date(insight.generated_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-insights.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueTypes = [...new Set(insights.map(insight => insight.insight_type))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            All Analytics Insights
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of all AI-generated insights for your organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="0.8">High (80%+)</SelectItem>
                <SelectItem value="0.6">Medium (60%+)</SelectItem>
                <SelectItem value="0.4">Low (40%+)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={loadInsights} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="outline" size="sm" onClick={exportInsights}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Insights List */}
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="text-center py-8">
                <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading insights...</p>
              </div>
            ) : filteredInsights.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {insights.length === 0 ? 'No insights available' : 'No insights match your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInsights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getInsightIcon(insight.insight_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">
                            {insight.insight_data?.title || `${insight.insight_type} Insight`}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.insight_type}
                          </Badge>
                          {insight.insight_data?.impact && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getImpactColor(insight.insight_data.impact)}`}
                            >
                              {insight.insight_data.impact}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(insight.confidence_score * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.insight_data?.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Generated: {new Date(insight.generated_at).toLocaleDateString()}</span>
                          {insight.valid_until && (
                            <span>Expires: {new Date(insight.valid_until).toLocaleDateString()}</span>
                          )}
                        </div>
                        {insight.tags && insight.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {insight.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
            <span>
              Showing {filteredInsights.length} of {insights.length} insights
            </span>
            <span>
              Average confidence: {insights.length > 0 ? Math.round((insights.reduce((sum, insight) => sum + insight.confidence_score, 0) / insights.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllInsightsDialog;