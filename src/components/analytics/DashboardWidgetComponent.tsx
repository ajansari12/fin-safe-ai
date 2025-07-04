import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Trash2, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  AlertTriangle,
  PieChart
} from 'lucide-react';
import { DashboardWidget } from '@/services/custom-dashboard-service';
import KRIChart from './widgets/KRIChart';
import IncidentTrends from './widgets/IncidentTrends';
import VendorRiskBubble from './widgets/VendorRiskBubble';
import ComplianceScore from './widgets/ComplianceScore';
import MetricCard from './widgets/MetricCard';

interface DashboardWidgetComponentProps {
  widget: DashboardWidget;
  editMode: boolean;
  onDelete: () => void;
}

const DashboardWidgetComponent: React.FC<DashboardWidgetComponentProps> = ({
  widget,
  editMode,
  onDelete
}) => {
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'kri_chart':
        return BarChart3;
      case 'incident_trends':
        return TrendingUp;
      case 'vendor_risk':
        return Users;
      case 'compliance_score':
        return Shield;
      case 'metric_card':
        return PieChart;
      default:
        return BarChart3;
    }
  };

  const renderWidgetContent = () => {
    switch (widget.widget_type) {
      case 'kri_chart':
        return <KRIChart config={widget.widget_config} filters={widget.filters} />;
      case 'incident_trends':
        return <IncidentTrends config={widget.widget_config} filters={widget.filters} />;
      case 'vendor_risk':
        return <VendorRiskBubble config={widget.widget_config} filters={widget.filters} />;
      case 'compliance_score':
        return <ComplianceScore config={widget.widget_config} filters={widget.filters} />;
      case 'metric_card':
        return <MetricCard config={widget.widget_config} filters={widget.filters} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Widget type: {widget.widget_type}</p>
            </div>
          </div>
        );
    }
  };

  const IconComponent = getWidgetIcon(widget.widget_type);

  return (
    <Card className="h-full relative">
      {editMode && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Open widget settings dialog
            }}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <IconComponent className="h-4 w-4" />
          {widget.widget_config.title || widget.widget_type.replace('_', ' ').toUpperCase()}
        </CardTitle>
        {widget.widget_config.subtitle && (
          <p className="text-xs text-muted-foreground">{widget.widget_config.subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 h-full">
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};

export default DashboardWidgetComponent;