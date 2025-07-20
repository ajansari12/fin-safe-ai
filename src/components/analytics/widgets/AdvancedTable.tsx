
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface AdvancedTableProps {
  title: string;
  config: {
    columns?: string[];
    sortable?: boolean;
    filterable?: boolean;
    pageSize?: number;
  };
  realTimeEnabled?: boolean;
}

interface TableRow {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'critical' | 'inactive';
  value: number;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

const AdvancedTable: React.FC<AdvancedTableProps> = ({
  title,
  config = {},
  realTimeEnabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Mock data
  const data: TableRow[] = useMemo(() => [
    {
      id: '1',
      name: 'System Availability',
      status: 'active',
      value: 99.2,
      lastUpdate: '2 min ago',
      trend: 'up',
      category: 'Performance'
    },
    {
      id: '2',
      name: 'Transaction Errors',
      status: 'warning',
      value: 15,
      lastUpdate: '5 min ago',
      trend: 'up',
      category: 'Quality'
    },
    {
      id: '3',
      name: 'Security Score',
      status: 'critical',
      value: 68,
      lastUpdate: '1 min ago',
      trend: 'down',
      category: 'Security'
    },
    {
      id: '4',
      name: 'Compliance Rate',
      status: 'active',
      value: 94.5,
      lastUpdate: '3 min ago',
      trend: 'stable',
      category: 'Compliance'
    }
  ], []);

  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof TableRow];
      const bValue = b[sortConfig.key as keyof TableRow];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-3 w-3" /> : 
      <ArrowDown className="h-3 w-3" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      warning: 'secondary',
      critical: 'destructive',
      inactive: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    const className = trend === 'up' ? 'text-green-500' : 
                     trend === 'down' ? 'text-red-500' : 'text-gray-500';
    return trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {realTimeEnabled && (
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
          <Button size="sm" variant="outline">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
          <Button size="sm" variant="outline">
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Metric</span>
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead 
                  className="cursor-pointer text-right"
                  onClick={() => handleSort('value')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Value</span>
                    {getSortIcon('value')}
                  </div>
                </TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell className="text-right">
                    {typeof row.value === 'number' ? row.value.toFixed(1) : row.value}
                    {row.name.includes('Availability') || row.name.includes('Rate') ? '%' : ''}
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${
                      row.trend === 'up' ? 'text-green-500' : 
                      row.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {getTrendIcon(row.trend)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.lastUpdate}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Showing {sortedData.length} of {data.length} metrics</span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedTable;
