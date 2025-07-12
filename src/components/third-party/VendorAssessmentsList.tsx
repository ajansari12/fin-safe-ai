import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Plus, 
  Calendar, 
  User, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { getVendorProfiles } from '@/services/third-party-service';
import VendorAssessmentForm from './VendorAssessmentForm';
import { toast } from 'sonner';

interface VendorAssessment {
  id: string;
  vendor_profile_id: string;
  vendor_name: string;
  assessment_type: string;
  assessment_date: string;
  overall_risk_score: number;
  status: string;
  assessor_name: string;
  last_updated: string;
  financial_score?: number;
  operational_score?: number;
  security_score?: number;
  compliance_score?: number;
}

const VendorAssessmentsList: React.FC = () => {
  const { profile } = useAuth();
  const [assessments, setAssessments] = useState<VendorAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();

  useEffect(() => {
    if (profile?.organization_id) {
      loadAssessments();
    }
  }, [profile?.organization_id]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await getVendorProfiles();
      setAssessments(data.map(vendor => ({
        id: vendor.id,
        vendor_profile_id: vendor.id,
        org_id: vendor.org_id,
        vendor_name: vendor.vendor_name,
        assessment_type: 'Risk Assessment',
        assessment_date: vendor.last_assessment_date || vendor.created_at,
        overall_risk_score: vendor.calculated_risk_score || 0,
        status: 'completed',
        last_updated: vendor.updated_at,
        assessor_name: 'System',
        created_at: vendor.created_at,
        updated_at: vendor.updated_at,
        assessment_methodology: {},
        risk_factors: {},
        mitigation_recommendations: {}
      })));
    } catch (error) {
      console.error('Error loading vendor assessments:', error);
      toast.error('Failed to load vendor assessments');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'high_risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNewAssessment = () => {
    setSelectedVendor(undefined);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    loadAssessments();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedVendor(undefined);
  };

  if (showForm) {
    return (
      <VendorAssessmentForm
        vendorId={selectedVendor}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Vendor Assessments
        </CardTitle>
        <Button onClick={handleNewAssessment} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Found</h3>
            <p className="text-gray-500 mb-4">Start by creating your first vendor assessment.</p>
            <Button onClick={handleNewAssessment}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const riskLevel = getRiskLevel(assessment.overall_risk_score);
              
              return (
                <div key={assessment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{assessment.vendor_name}</h3>
                      <Badge className={getRiskColor(riskLevel)}>
                        {riskLevel.toUpperCase()} ({assessment.overall_risk_score})
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assessment.status)}
                      <span className="text-sm font-medium capitalize">
                        {assessment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Assessment Type:</span>
                      <p className="font-medium capitalize">{assessment.assessment_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Assessment Date:</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <p className="font-medium">{formatDate(assessment.assessment_date)}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Reviewer:</span>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <p className="font-medium">{assessment.assessor_name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <p className="font-medium">{formatDate(assessment.last_updated)}</p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  {(assessment.financial_score || assessment.operational_score || assessment.security_score || assessment.compliance_score) && (
                    <div className="border-t pt-3 mb-3">
                      <span className="text-sm text-gray-500 mb-2 block">Score Breakdown:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {assessment.financial_score && (
                          <div className="text-center">
                            <div className="font-medium">Financial</div>
                            <div className="text-blue-600">{assessment.financial_score}</div>
                          </div>
                        )}
                        {assessment.operational_score && (
                          <div className="text-center">
                            <div className="font-medium">Operational</div>
                            <div className="text-green-600">{assessment.operational_score}</div>
                          </div>
                        )}
                        {assessment.security_score && (
                          <div className="text-center">
                            <div className="font-medium">Security</div>
                            <div className="text-orange-600">{assessment.security_score}</div>
                          </div>
                        )}
                        {assessment.compliance_score && (
                          <div className="text-center">
                            <div className="font-medium">Compliance</div>
                            <div className="text-purple-600">{assessment.compliance_score}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      ID: {assessment.id.slice(0, 8)}...
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Report
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorAssessmentsList;