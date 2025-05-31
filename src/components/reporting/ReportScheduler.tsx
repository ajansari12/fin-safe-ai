
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduledReport {
  id: string;
  template_name: string;
  frequency: string;
  time: string;
  recipients: string[];
  enabled: boolean;
  next_run: string;
}

const ReportScheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>([
    {
      id: '1',
      template_name: 'Executive Summary',
      frequency: 'monthly',
      time: '09:00',
      recipients: ['ceo@company.com', 'board@company.com'],
      enabled: true,
      next_run: '2024-02-01T09:00:00Z'
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const handleCreateSchedule = () => {
    setShowCreateForm(true);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    toast({ title: "Success", description: "Schedule deleted successfully" });
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
    ));
    toast({ title: "Success", description: "Schedule updated successfully" });
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      default: return frequency;
    }
  };

  if (showCreateForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Scheduled Report</CardTitle>
          <CardDescription>Set up automatic report generation and delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template">Report Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="osfi">OSFI E-21 Audit Pack</SelectItem>
                  <SelectItem value="department">Department Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input type="time" defaultValue="09:00" />
            </div>

            <div>
              <Label htmlFor="recipients">Email Recipients</Label>
              <Input placeholder="email1@company.com, email2@company.com" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="enabled" defaultChecked />
            <Label htmlFor="enabled">Enable Schedule</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowCreateForm(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>
              Manage automated report generation and delivery schedules
            </CardDescription>
          </div>
          <Button onClick={handleCreateSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p>No scheduled reports configured</p>
            <p className="text-sm">Create your first scheduled report to automate delivery</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.template_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getFrequencyLabel(schedule.frequency)}
                    </Badge>
                  </TableCell>
                  <TableCell>{schedule.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-sm">{schedule.recipients.length} recipients</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(schedule.next_run).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={() => handleToggleSchedule(schedule.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportScheduler;
