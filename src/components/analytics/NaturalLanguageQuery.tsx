
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Brain, 
  Lightbulb, 
  Clock, 
  BarChart3,
  Table,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { advancedAnalyticsService, type QueryResult } from '@/services/advanced-analytics-service';
import { toast } from 'sonner';

const NaturalLanguageQuery: React.FC = () => {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  // Sample queries for inspiration
  const sampleQueries = [
    "Show me critical incidents from this month",
    "What are our top risk indicators?",
    "How many vendor assessments are overdue?",
    "Compare incident trends between quarters",
    "Which controls have the lowest effectiveness?",
    "Show me all high-risk third parties"
  ];

  const handleSubmitQuery = async () => {
    if (!query.trim() || !profile?.organization_id) return;

    setIsProcessing(true);
    try {
      const result = await advancedAnalyticsService.processNaturalLanguageQuery(
        query,
        profile.organization_id
      );
      
      setQueryResult(result);
      setQueryHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 queries
      toast.success('Query processed successfully');
    } catch (error) {
      console.error('Error processing query:', error);
      toast.error('Failed to process query');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const exportResults = () => {
    if (!queryResult?.data) return;

    const csv = [
      queryResult.metadata.columns.join(','),
      ...queryResult.data.map(row => 
        queryResult.metadata.columns.map(col => row[col] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Natural Language Query
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions about your data in plain English
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your risk data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuery()}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmitQuery}
                disabled={!query.trim() || isProcessing}
              >
                <Search className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Ask'}
              </Button>
            </div>

            {/* Sample Queries */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                Try these sample queries:
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sample, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSampleQuery(sample)}
                  >
                    {sample}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Query History */}
            {queryHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Recent queries:
                </div>
                <div className="space-y-1">
                  {queryHistory.slice(0, 3).map((historyQuery, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setQuery(historyQuery)}
                    >
                      {historyQuery}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Query Results */}
      {queryResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Query Results
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {queryResult.metadata.total_rows} rows
                </Badge>
                <Badge variant="secondary">
                  {queryResult.metadata.execution_time}ms
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportResults}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {queryResult.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {queryResult.metadata.columns.map((column) => (
                        <th key={column} className="text-left p-2 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b">
                        {queryResult.metadata.columns.map((column) => (
                          <td key={column} className="p-2">
                            {typeof row[column] === 'object' 
                              ? JSON.stringify(row[column])
                              : String(row[column] || '-')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {queryResult.data.length > 10 && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Showing first 10 of {queryResult.data.length} results
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results found for your query</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NaturalLanguageQuery;
