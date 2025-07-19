import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const mockIncidents = [
  {
    id: '1',
    title: 'System Outage - Payment Processing',
    severity: 'high',
    status: 'open',
    reported_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Data Quality Issue - Customer Records',
    severity: 'medium',
    status: 'investigating',
    reported_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Security Alert - Failed Login Attempts',
    severity: 'low',
    status: 'resolved',
    reported_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'destructive';
    case 'investigating':
      return 'default';
    case 'resolved':
      return 'secondary';
    default:
      return 'outline';
  }
};

const RecentIncidents = () => {
  return (
    <div className="space-y-4">
      {mockIncidents.map((incident) => (
        <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-sm">{incident.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(incident.reported_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge variant={getSeverityColor(incident.severity)} className="text-xs">
              {incident.severity}
            </Badge>
            <Badge variant={getStatusColor(incident.status)} className="text-xs">
              {incident.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentIncidents;