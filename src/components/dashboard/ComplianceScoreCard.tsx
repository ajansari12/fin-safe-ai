
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import ComplianceDetailModal from './ComplianceDetailModal';

interface ComplianceScoreCardProps {
  title: string;
  score: number;
  totalRequirements: number;
  compliantCount: number;
  trend: 'up' | 'down' | 'stable';
  complianceType: string;
  lastAssessment?: string;
}

const ComplianceScoreCard: React.FC<ComplianceScoreCardProps> = ({
  title,
  score,
  totalRequirements,
  compliantCount,
  trend,
  complianceType,
  lastAssessment
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            {title}
          </CardTitle>
          {getTrendIcon(trend)}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span className="text-sm text-muted-foreground">compliance</span>
            </div>
            
            <Progress value={score} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {compliantCount}/{totalRequirements} requirements
              </span>
              <Badge variant={score >= 85 ? 'default' : score >= 70 ? 'secondary' : 'destructive'}>
                {score >= 85 ? 'Good' : score >= 70 ? 'Fair' : 'Needs Work'}
              </Badge>
            </div>
            
            {lastAssessment && (
              <div className="text-xs text-muted-foreground">
                Last assessed: {lastAssessment}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowDetailModal(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <ComplianceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        complianceType={complianceType}
        title={title}
      />
    </>
  );
};

export default ComplianceScoreCard;
