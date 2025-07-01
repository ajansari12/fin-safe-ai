import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Warning, CheckCircle, HelpCircle } from 'lucide-react';
import type { OrganizationalProfile } from '@/types/organizational-intelligence';

interface ProfileInsightsPanelProps {
  profile: OrganizationalProfile;
}

interface ProfileInsight {
  type: 'risk' | 'opportunity' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionable: boolean;
  recommendations: string[];
}

const ProfileInsightsPanel: React.FC<ProfileInsightsPanelProps> = ({ profile }) => {
  const insights = generateInsights(profile);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <Warning className="h-4 w-4 text-red-500" />;
      case 'opportunity': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <Warning className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const generateInsights = (profile: OrganizationalProfile): ProfileInsight[] => {
    const insights: ProfileInsight[] = [];

    // Risk Maturity Insights
    if (profile.risk_maturity === 'basic') {
      insights.push({
        type: 'risk',
        severity: 'high',
        title: 'Risk Management Enhancement Needed',
        description: 'Your organization shows basic risk maturity. Consider implementing comprehensive risk frameworks.',
        actionable: true,
        recommendations: [
          'Establish risk committee',
          'Define risk appetite statements',
          'Implement risk assessment processes'
        ]
      });
    }

    // Technology Insights
    if (profile.technology_maturity === 'basic' && profile.digital_transformation === 'basic') {
      insights.push({
        type: 'opportunity',
        severity: 'medium',
        title: 'Digital Transformation Opportunity',
        description: 'Significant potential for efficiency gains through technology modernization.',
        actionable: true,
        recommendations: [
          'Assess current technology stack',
          'Develop digital roadmap',
          'Pilot automation initiatives'
        ]
      });
    }

    // Compliance Insights
    if (profile.compliance_maturity === 'basic') {
      insights.push({
        type: 'warning',
        severity: 'high',
        title: 'Compliance Framework Gap',
        description: 'Enhanced compliance management systems recommended for regulatory adherence.',
        actionable: true,
        recommendations: [
          'Implement compliance monitoring tools',
          'Establish regular audit schedules',
          'Train staff on regulatory requirements'
        ]
      });
    }

    // Asset Size Insights
    if (profile.asset_size > 1000000000) { // $1B+
      insights.push({
        type: 'info',
        severity: 'medium',
        title: 'Enterprise-Scale Considerations',
        description: 'Your organization size requires enterprise-grade risk and compliance frameworks.',
        actionable: true,
        recommendations: [
          'Consider advanced risk modeling',
          'Implement automated compliance reporting',
          'Establish board-level risk oversight'
        ]
      });
    }

    return insights;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Alert key={index} variant="default">
              {getInsightIcon(insight.type)}
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{insight.title}</div>
                  <Badge variant="secondary">{insight.severity}</Badge>
                </div>
                <p className="text-sm mt-1">{insight.description}</p>
                {insight.actionable && (
                  <div className="mt-2 space-y-1">
                    <h4 className="text-xs font-medium">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm">
                      {insight.recommendations.map((recommendation, i) => (
                        <li key={i}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="h-6 w-6 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No specific insights available for this profile.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileInsightsPanel;
