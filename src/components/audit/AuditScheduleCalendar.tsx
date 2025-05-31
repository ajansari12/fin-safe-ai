
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedAuditService, AuditSchedule } from "@/services/enhanced-audit-service";
import AuditScheduleForm from "./AuditScheduleForm";
import { format } from "date-fns";

interface AuditScheduleCalendarProps {
  orgId: string;
}

const AuditScheduleCalendar: React.FC<AuditScheduleCalendarProps> = ({ orgId }) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<AuditSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AuditSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, [orgId]);

  const loadSchedules = async () => {
    try {
      const data = await enhancedAuditService.getAuditSchedules(orgId);
      setSchedules(data);
    } catch (error) {
      console.error('Error loading audit schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load audit schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSuccess = () => {
    setShowForm(false);
    setSelectedSchedule(null);
    loadSchedules();
    toast({
      title: "Success",
      description: "Audit schedule saved successfully"
    });
  };

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const startDate = new Date(schedule.scheduled_start_date);
      const endDate = new Date(schedule.scheduled_end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading audit calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Audit Schedule Calendar</h3>
          <p className="text-sm text-muted-foreground">
            View and manage audit schedules
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedSchedule(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedSchedule ? 'Edit Audit Schedule' : 'Schedule New Audit'}
              </DialogTitle>
              <DialogDescription>
                Create or update an audit schedule with regulatory framework mapping.
              </DialogDescription>
            </DialogHeader>
            <AuditScheduleForm
              orgId={orgId}
              schedule={selectedSchedule}
              onSuccess={handleScheduleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Audit Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                modifiers={{
                  hasAudit: (date) => getSchedulesForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasAudit: { 
                    backgroundColor: '#3b82f6', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? `Audits for ${format(selectedDate, 'MMM dd, yyyy')}` : 'Upcoming Audits'}
              </CardTitle>
              <CardDescription>
                {selectedDate ? 'Scheduled audits for selected date' : 'Next 5 upcoming audits'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDate ? (
                  getSchedulesForDate(selectedDate).length > 0 ? (
                    getSchedulesForDate(selectedDate).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowForm(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{schedule.audit_name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {schedule.assigned_auditor_name || 'Unassigned'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {schedule.estimated_hours ? `${schedule.estimated_hours}h` : 'TBD'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Badge variant={getPriorityColor(schedule.priority)} className="text-xs">
                              {schedule.priority}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(schedule.status)}`} />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No audits scheduled for this date</p>
                  )
                ) : (
                  schedules
                    .filter(s => new Date(s.scheduled_start_date) >= new Date())
                    .slice(0, 5)
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowForm(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{schedule.audit_name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(schedule.scheduled_start_date), 'MMM dd')} - 
                              {format(new Date(schedule.scheduled_end_date), 'MMM dd')}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {schedule.assigned_auditor_name || 'Unassigned'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Badge variant={getPriorityColor(schedule.priority)} className="text-xs">
                              {schedule.priority}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(schedule.status)}`} />
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditScheduleCalendar;
