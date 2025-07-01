
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  Edit,
  Star,
  Calendar,
  Users,
  Target,
  Shield,
  CheckCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FrameworkLibraryProps {
  orgId: string;
}

const FrameworkLibrary: React.FC<FrameworkLibraryProps> = ({ orgId }) => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadFrameworks();
  }, [orgId]);

  const loadFrameworks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('generated_frameworks')
        .select(`
          *,
          framework_components(*)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFrameworks(data || []);
    } catch (error) {
      console.error('Error loading frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'governance': return Users;
      case 'risk_appetite': return Target;
      case 'impact_tolerance': return Shield;
      case 'control': return CheckCircle;
      case 'compliance': return FileText;
      case 'scenario_testing': return TrendingUp;
      default: return BookOpen;
    }
  };

  const getFrameworkColor = (type: string) => {
    switch (type) {
      case 'governance': return 'text-blue-500';
      case 'risk_appetite': return 'text-red-500';
      case 'impact_tolerance': return 'text-green-500';
      case 'control': return 'text-purple-500';
      case 'compliance': return 'text-orange-500';
      case 'scenario_testing': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'customized': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'implemented': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.framework_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.framework_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || framework.framework_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const frameworkTypes = [
    { value: 'all', label: 'All Frameworks' },
    { value: 'governance', label: 'Governance' },
    { value: 'risk_appetite', label: 'Risk Appetite' },
    { value: 'impact_tolerance', label: 'Impact Tolerance' },
    { value: 'control', label: 'Control' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'scenario_testing', label: 'Scenario Testing' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Framework Library</h2>
            <p className="text-muted-foreground">Loading your generated frameworks...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Framework Library</h2>
            <p className="text-muted-foreground">
              Manage and access your generated risk management frameworks
            </p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {frameworks.length} Framework{frameworks.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search frameworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                {frameworkTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredFrameworks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Frameworks Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'No frameworks match your search criteria.' 
                : 'You haven\'t generated any frameworks yet.'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Generate Your First Framework
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFrameworks.map((framework) => {
            const IconComponent = getFrameworkIcon(framework.framework_type);
            
            return (
              <Card key={framework.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-6 w-6 ${getFrameworkColor(framework.framework_type)} mt-0.5`} />
                      <div className="flex-1">
                        <CardTitle className="text-base leading-tight">
                          {framework.framework_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {framework.framework_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={getStatusColor(framework.implementation_status)}
                    >
                      {framework.implementation_status}
                    </Badge>
                    {framework.effectiveness_score && (
                      <Badge variant="outline">
                        Score: {Math.round(framework.effectiveness_score)}%
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(framework.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {framework.framework_components && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{framework.framework_components.length} components</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Version {framework.framework_version}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      {frameworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Library Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {frameworks.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Frameworks</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {frameworks.filter(f => f.implementation_status === 'implemented').length}
                </div>
                <div className="text-sm text-muted-foreground">Implemented</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {frameworks.filter(f => f.implementation_status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(frameworks.reduce((sum, f) => sum + (f.effectiveness_score || 0), 0) / frameworks.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg. Effectiveness</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FrameworkLibrary;
