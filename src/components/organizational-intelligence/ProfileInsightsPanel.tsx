
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { organizationalIntelligenceService } from '@/services/organizational-intelligence-service';
import type { OrganizationalProfile } from '@/types/organizational-intelligence';

interface ProfileInsightsPanelProps {
  profile: OrganizationalProfile;
}

const ProfileInsightsPanel: React.FC<ProfileInsightsPanelProps> = ({ profile }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    generateInsights();
  }, [profile]);

  const generateInsights = () => {
    const newInsights = [];
    const newTrends = [];

    // Risk maturity insights
    if (profile.risk_maturity === 'basic') {
      newInsights.push({
        type: 'warning',
        title: 'Risk Management Enhancement Needed',
        description: 'Your organization would benefit from implementing a more structured risk management framework.',
        priority: 'high',
        icon: AlertTriangle
      });
    }

    // Compliance insights
    if (profile.compliance_maturity === 'basic' && profile.regulatory_history !== 'clean') {
      newInsights.push({
        type: 'critical',
        title: 'Compliance Risk Elevated',
        description: 'Combined basic compliance maturity with regulatory issues requires immediate attention.',
        priority: 'critical',
        icon: AlertTriangle
      });
    }

    // Technology modernization
    if (profile.technology_maturity === 'basic' && profile.digital_transformation === 'early') {
      newInsights.push({
        type: 'opportunity',
        title: 'Digital Transformation Opportunity',
        description: 'Investing in technology modernization could significantly improve operational efficiency.',
        priority: 'medium',
        icon: TrendingUp
      });
    }

    // Third-party dependencies
    if (profile.third_party_dependencies && profile.third_party_dependencies > 20) {
      newInsights.push({
        type: 'warning',
        title: 'High Third-Party Exposure',
        description: 'Consider implementing enhanced vendor risk management processes.',
        priority: 'medium',
        icon: AlertTriangle
      });
    }

    // Positive insights
    if (profile.regulatory_history === 'clean' && profile.compliance_maturity !== 'basic') {
      newInsights.push({
        type: 'positive',
        title: 'Strong Compliance Posture',
        description: 'Your clean regulatory history and compliance maturity are organizational strengths.',
        priority: 'info',
        icon: CheckCircle2
      });
    }

    // Generate trends based on profile completeness and scores
    if (profile.profile_score && profile.profile_score > 70) {
      newTrends.push({
        metric: 'Overall Maturity',
        value: profile.profile_score,
        trend: 'up',
        change: '+5%',
        description: 'Strong organizational maturity score'
      });
    }

    setInsights(newInsights);
    setTrends(newTrends);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      case 'positive': return CheckCircle2;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'opportunity': return 'border-blue-500 bg-blue-50';
      case 'positive': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'info': return <Badge variant="outline">Info</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <IconComponent className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    {getPriorityBadge(insight.priority)}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Complete your profile assessment to receive personalized insights.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trends.length > 0 ? (
            trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {trend.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{trend.metric}</div>
                    <div className="text-xs text-gray-600">{trend.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{trend.value}</div>
                  <div className={`text-xs ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.change}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Trends will appear as your profile data evolves over time.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.completeness_percentage && profile.completeness_percentage < 80 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Complete Profile Assessment</span>
                <Badge variant="outline">Priority</Badge>
              </div>
              <Progress value={profile.completeness_percentage} className="mb-2" />
              <p className="text-xs text-gray-600">
                {100 - profile.completeness_percentage}% remaining to complete your organizational profile
              </p>
            </div>
          )}
          
          {profile.risk_maturity === 'basic' && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Enhance Risk Management</span>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Consider implementing a formal risk management framework
              </p>
            </div>
          )}

          {profile.technology_maturity === 'basic' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Technology Modernization</span>
                <Badge variant="outline">Opportunity</Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Explore digital transformation initiatives to improve efficiency
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInsightsPanel;
