
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User, Clock } from 'lucide-react';

interface RiskAppetiteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  statement: any;
}

const RiskAppetiteDetailModal: React.FC<RiskAppetiteDetailModalProps> = ({
  isOpen,
  onClose,
  statement
}) => {
  if (!statement) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {statement.statement_name}
            <Badge className={getStatusColor(statement.approval_status)}>
              {statement.approval_status.replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Statement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statement.description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                  <p className="text-sm">{statement.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Effective Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(statement.effective_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Review Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(statement.review_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(statement.created_at).toLocaleDateString()} by {statement.created_by}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Categories Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Categories</CardTitle>
              <CardDescription>
                Risk categories and appetite levels defined in this statement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Risk category details will be displayed here</p>
                <p className="text-sm">Integration with risk categories coming soon</p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics</CardTitle>
              <CardDescription>
                Current compliance status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-muted-foreground">Overall Compliance</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <p className="text-sm text-muted-foreground">Risk Categories</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <p className="text-sm text-muted-foreground">Active KRIs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskAppetiteDetailModal;
