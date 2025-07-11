import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface FixPlanStatusProps {
  className?: string;
}

export const FixPlanStatus: React.FC<FixPlanStatusProps> = ({ className }) => {
  const phases = [
    {
      id: 1,
      name: "Immediate Error Handling Fix",
      status: "completed",
      description: "Enhanced error resilience, fallback contexts, graceful degradation",
      completedActions: [
        "✅ Wrapped profile fetching in better try-catch blocks",
        "✅ Added fallback states for missing organization or profile data", 
        "✅ Prevented authentication errors from bubbling up to global error boundary"
      ]
    },
    {
      id: 2,
      name: "Organization Data Validation",
      status: "completed",
      description: "Database validation functions and automated repair mechanisms",
      completedActions: [
        "✅ Added validation for user-organization relationships",
        "✅ Created data repair mechanism for orphaned users",
        "✅ Added debugging tools to identify data inconsistencies"
      ]
    },
    {
      id: 3,
      name: "Authentication Flow Optimization",
      status: "completed",
      description: "Progressive authentication and retry mechanisms",
      completedActions: [
        "✅ Added progressive authentication (partial login allowed)",
        "✅ Added retry mechanisms for failed data fetches",
        "✅ Improved error messaging and recovery options"
      ]
    },
    {
      id: 4,
      name: "Debug Dashboard Enhancement",
      status: "completed",
      description: "Real-time monitoring and debugging tools",
      completedActions: [
        "✅ Added real-time auth state monitoring",
        "✅ Created user data validation tools",
        "✅ Added authentication flow visualization"
      ]
    },
    {
      id: 5,
      name: "Data Consistency Checks",
      status: "completed",
      description: "Database integrity validation and cleanup",
      completedActions: [
        "✅ Ran database consistency checks",
        "✅ Fixed orphaned and malformed user records",
        "✅ Added data validation triggers"
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary" className="bg-yellow-500">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const totalPhases = phases.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Critical Error Fix Plan Status
          <Badge variant="default" className="bg-green-500">
            {completedPhases}/{totalPhases} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(phase.status)}
                <h3 className="font-medium">Phase {phase.id}: {phase.name}</h3>
              </div>
              {getStatusBadge(phase.status)}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
            <div className="space-y-1">
              {phase.completedActions.map((action, index) => (
                <p key={index} className="text-xs text-green-600">{action}</p>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-medium text-green-800">All Phases Complete!</h3>
          </div>
          <p className="text-sm text-green-700">
            The critical error fix plan has been fully implemented. The application now has:
          </p>
          <ul className="text-xs text-green-600 mt-2 space-y-1">
            <li>• Resilient authentication context with fallback mechanisms</li>
            <li>• Automatic retry logic for failed data fetches</li>
            <li>• Progressive authentication allowing partial access</li>
            <li>• Real-time debugging and monitoring tools</li>
            <li>• Database validation and auto-repair functions</li>
            <li>• Enhanced error handling preventing cascade failures</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};