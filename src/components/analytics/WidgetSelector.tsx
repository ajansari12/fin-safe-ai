import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  AlertTriangle,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

interface WidgetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widgetType: string, config: any) => void;
}

const availableWidgets = [
  {
    type: 'kri_chart',
    name: 'KRI Chart',
    description: 'Key Risk Indicator trends and thresholds',
    icon: BarChart3,
    category: 'Risk Management',
    defaultConfig: {
      title: 'KRI Dashboard',
      chartType: 'line',
      timeRange: '3m'
    }
  },
  {
    type: 'incident_trends',
    name: 'Incident Trends',
    description: 'Track incident volume and resolution times',
    icon: TrendingUp,
    category: 'Operations',
    defaultConfig: {
      title: 'Incident Trends',
      groupBy: 'week',
      showResolutionTime: true
    }
  },
  {
    type: 'vendor_risk',
    name: 'Vendor Risk Bubble',
    description: 'Vendor risk assessment visualization',
    icon: Users,
    category: 'Third Party Risk',
    defaultConfig: {
      title: 'Vendor Risk Overview',
      xAxis: 'risk_score',
      yAxis: 'contract_value'
    }
  },
  {
    type: 'compliance_score',
    name: 'Compliance Score',
    description: 'Overall compliance health metrics',
    icon: Shield,
    category: 'Compliance',
    defaultConfig: {
      title: 'Compliance Health',
      showBreakdown: true
    }
  },
  {
    type: 'metric_card',
    name: 'Metric Card',
    description: 'Single key metric with trend',
    icon: PieChart,
    category: 'General',
    defaultConfig: {
      title: 'Key Metric',
      metric: 'total_incidents',
      showTrend: true
    }
  }
];

const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  open,
  onOpenChange,
  onAddWidget
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(availableWidgets.map(w => w.category)))];
  
  const filteredWidgets = selectedCategory === 'all' 
    ? availableWidgets 
    : availableWidgets.filter(w => w.category === selectedCategory);

  const handleAddWidget = (widget: typeof availableWidgets[0]) => {
    onAddWidget(widget.type, widget.defaultConfig);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Widget to Dashboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>

          {/* Widget Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWidgets.map((widget) => {
              const IconComponent = widget.icon;
              
              return (
                <Card key={widget.type} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <Badge variant="secondary" className="text-xs">
                        {widget.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{widget.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {widget.description}
                    </p>
                    
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleAddWidget(widget)}
                    >
                      Add Widget
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredWidgets.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No widgets found</h3>
              <p className="text-muted-foreground">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSelector;