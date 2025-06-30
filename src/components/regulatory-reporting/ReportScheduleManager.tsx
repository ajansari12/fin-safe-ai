
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { regulatoryReportingService } from "@/services/regulatory-reporting-service";
import { useToast } from "@/hooks/use-toast";

const ReportScheduleManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => regulatoryReportingService.getReportSchedules(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['regulatory-templates'],
    queryFn: () => regulatoryReportingService.getReportTemplates(),
  });

  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData: any) => regulatoryReportingService.createReportSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Schedule created",
        description: "Report schedule has been created successfully.",
      });
    },
  });

  const handleCreateSchedule = (formData: FormData) => {
    const recipients = (formData.get('recipients') as string)
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    const scheduleData = {
      org_id: '', // Will be set by service
      template_id: formData.get('template_id') as string,
      schedule_name: formData.get('schedule_name') as string,
      frequency: formData.get('frequency') as any,
      day_of_week: formData.get('day_of_week') ? parseInt(formData.get('day_of_week') as string) : null,
      day_of_month: formData.get('day_of_month') ? parseInt(formData.get('day_of_month') as string) : null,
      time_of_day: formData.get('time_of_day') as string,
      recipients,
      is_active: true,
      last_run_date: null,
      next_run_date: null, // Will be calculated
      created_by: null,
      created_by_name: null
    };

    createScheduleMutation.mutate(scheduleData);
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'weekly': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'monthly': return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'quarterly': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'annually': return <Calendar className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-orange-100 text-orange-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annually': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNextRun = (schedule: any) => {
    if (!schedule.next_run_date) return 'Not scheduled';
    return new Date(schedule.next_run_date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Schedules</h2>
          <p className="text-muted-foreground">
            Automate report generation and distribution
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Report Schedule</DialogTitle>
              <DialogDescription>
                Set up automated report generation and distribution.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSchedule(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="schedule_name">Schedule Name</Label>
                <Input
                  id="schedule_name"
                  name="schedule_name"
                  placeholder="e.g., Monthly Risk Report"
                  required
                />
              </div>
              <div>
                <Label htmlFor="template_id">Report Template</Label>
                <Select name="template_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time_of_day">Time of Day</Label>
                <Input
                  id="time_of_day"
                  name="time_of_day"
                  type="time"
                  defaultValue="09:00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="day_of_week">Day of Week (for weekly)</Label>
                <Select name="day_of_week">
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="day_of_month">Day of Month (for monthly)</Label>
                <Input
                  id="day_of_month"
                  name="day_of_month"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="e.g., 15"
                />
              </div>
              <div>
                <Label htmlFor="recipients">Email Recipients</Label>
                <Input
                  id="recipients"
                  name="recipients"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createScheduleMutation.isPending}>
                  {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFrequencyIcon(schedule.frequency)}
                  <CardTitle className="text-lg">{schedule.schedule_name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-xs ${getFrequencyColor(schedule.frequency)}`}>
                    {schedule.frequency.toUpperCase()}
                  </Badge>
                  <Badge variant={schedule.is_active ? "default" : "secondary"}>
                    {schedule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{schedule.time_of_day}</span>
                </div>
                {schedule.recipients && schedule.recipients.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Recipients:</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">{schedule.recipients.length}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Run:</span>
                  <span className="font-medium">{formatNextRun(schedule)}</span>
                </div>
                {schedule.last_run_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span className="font-medium">
                      {new Date(schedule.last_run_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    variant={schedule.is_active ? "outline" : "default"}
                  >
                    {schedule.is_active ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Schedules Found</h3>
            <p className="text-muted-foreground mb-4">
              Set up automated report generation by creating your first schedule.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportScheduleManager;
