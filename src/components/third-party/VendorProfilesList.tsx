
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FileText, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { VendorProfile } from "@/services/third-party-service";

interface VendorProfilesListProps {
  vendors: VendorProfile[];
  onEdit: (vendor: VendorProfile) => void;
  onDelete: (id: string) => void;
  onViewDetails: (vendor: VendorProfile) => void;
}

const VendorProfilesList: React.FC<VendorProfilesListProps> = ({
  vendors,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'under_review': return 'outline';
      case 'terminated': return 'destructive';
      default: return 'default';
    }
  };

  const getRiskBadgeProps = (vendor: VendorProfile) => {
    if (vendor.calculated_risk_level) {
      const level = vendor.calculated_risk_level;
      return {
        variant: (level === 'Critical' || level === 'High' ? 'destructive' : 
                level === 'Medium' ? 'default' : 'secondary') as "destructive" | "default" | "secondary" | "outline",
        className: vendor.calculated_risk_color || ''
      };
    }
    
    // Fallback to manual risk rating
    if (vendor.risk_rating) {
      switch (vendor.risk_rating) {
        case 'critical': return { variant: 'destructive' as const, className: 'text-red-600 bg-red-100' };
        case 'high': return { variant: 'destructive' as const, className: 'text-orange-600 bg-orange-100' };
        case 'medium': return { variant: 'default' as const, className: 'text-yellow-600 bg-yellow-100' };
        case 'low': return { variant: 'secondary' as const, className: 'text-green-600 bg-green-100' };
        default: return { variant: 'outline' as const, className: '' };
      }
    }
    
    return { variant: 'outline' as const, className: 'text-gray-600 bg-gray-100' };
  };

  const isExpiringSource = (vendor: VendorProfile) => {
    if (!vendor.sla_expiry_date && !vendor.contract_end_date) return false;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const slaExpiry = vendor.sla_expiry_date ? new Date(vendor.sla_expiry_date) : null;
    const contractEnd = vendor.contract_end_date ? new Date(vendor.contract_end_date) : null;
    
    return (slaExpiry && slaExpiry <= thirtyDaysFromNow) || 
           (contractEnd && contractEnd <= thirtyDaysFromNow);
  };

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No vendors found. Add your first vendor to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {vendors.map((vendor) => {
        const riskBadgeProps = getRiskBadgeProps(vendor);
        
        return (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {vendor.vendor_name}
                    {isExpiringSource(vendor) && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {vendor.calculated_risk_score && vendor.calculated_risk_score >= 4 && (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                  <CardDescription>{vendor.service_provided}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(vendor)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(vendor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(vendor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Criticality</p>
                  <Badge variant={getCriticalityColor(vendor.criticality) as "destructive" | "default" | "secondary" | "outline"}>
                    {vendor.criticality}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={getStatusColor(vendor.status) as "destructive" | "default" | "secondary" | "outline"}>
                    {vendor.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={riskBadgeProps.variant} className={riskBadgeProps.className}>
                      {vendor.calculated_risk_level || vendor.risk_rating || 'Not Assessed'}
                    </Badge>
                    {vendor.calculated_risk_score && (
                      <span className="text-xs text-muted-foreground">
                        {vendor.calculated_risk_score}/5
                      </span>
                    )}
                  </div>
                </div>
                {vendor.annual_spend && (
                  <div>
                    <p className="text-sm font-medium">Annual Spend</p>
                    <p className="text-sm">${vendor.annual_spend.toLocaleString()}</p>
                  </div>
                )}
                {vendor.last_assessment_date && (
                  <div>
                    <p className="text-sm font-medium">Last Assessment</p>
                    <p className="text-sm">{new Date(vendor.last_assessment_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {(vendor.sla_expiry_date || vendor.contract_end_date) && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {vendor.sla_expiry_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      SLA Expires: {new Date(vendor.sla_expiry_date).toLocaleDateString()}
                    </div>
                  )}
                  {vendor.contract_end_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Contract Ends: {new Date(vendor.contract_end_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              {vendor.contact_email && (
                <p className="text-sm text-muted-foreground mt-2">
                  Contact: {vendor.contact_email}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VendorProfilesList;
