
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Edit
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { regulatoryReportingService } from "@/services/regulatory-reporting-service";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, addDays } from "date-fns";

const RegulatoryCalendar: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: calendarEntries = [], isLoading } = useQuery({
    queryKey: ['regulatory-calendar'],
    queryFn: () => regulatoryReportingService.getRegulatoryCalendar(),
  });

  const createEntryMutation = useMutation({
    mutationFn: (entryData: any) => regulatoryReportingService.createRegulatoryEntry(entryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-calendar'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Calendar entry created",
        description: "Regulatory calendar entry has been created successfully.",
      });
    },
  });

  const handleCreateEntry = (formData: FormData) => {
    const entryData = {
      org_id: '', // Will be set by service
      regulation_name: formData.get('regulation_name') as string,
      report_type: formData.get('report_type') as string,
      due_date: formData.get('due_date') as string,
      filing_frequency: formData.get('filing_frequency') as any,
      regulatory_body: formData.get('regulatory_body') as string || 'OSFI',
      description: formData.get('description') as string,
      reminder_days_before: parseInt(formData.get('reminder_days_before') as string) || 14,
      status: 'upcoming' as const,
      submitted_date: null,
      submitted_by: null,
      submitted_by_name: null
    };

    createEntryMutation.mutate(entryData);
  };

  const getStatusColor = (entry: any) => {
    const dueDate = new Date(entry.due_date);
    const now = new Date();
    const warningDate = addDays(now, entry.reminder_days_before);

    if (entry.status === 'submitted') return 'bg-green-100 text-green-800';
    if (entry.status === 'overdue' || isAfter(now, dueDate)) return 'bg-red-100 text-red-800';
    if (entry.status === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (isAfter(dueDate, now) && isBefore(dueDate, warningDate)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (entry: any) => {
    const dueDate = new Date(entry.due_date);
    const now = new Date();

    if (entry.status === 'submitted') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (entry.status === 'overdue' || isAfter(now, dueDate)) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (entry.status === 'in_progress') return <Clock className="h-4 w-4 text-blue-500" />;
    return <Calendar className="h-4 w-4 text-gray-500" />;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedEntries = [...calendarEntries].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
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
          <h2 className="text-2xl font-bold">Regulatory Calendar</h2>
          <p className="text-muted-foreground">
            Track regulatory reporting deadlines and requirements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Regulatory Entry</DialogTitle>
              <DialogDescription>
                Add a new regulatory reporting deadline to your calendar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateEntry(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="regulation_name">Regulation Name</Label>
                <Input
                  id="regulation_name"
                  name="regulation_name"
                  placeholder="e.g., OSFI E-21 Operational Risk"
                  required
                />
              </div>
              <div>
                <Label htmlFor="report_type">Report Type</Label>
                <Input
                  id="report_type"
                  name="report_type"
                  placeholder="e.g., Quarterly Risk Report"
                  required
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="filing_frequency">Filing Frequency</Label>
                <Select name="filing_frequency" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="ad_hoc">Ad Hoc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="regulatory_body">Regulatory Body</Label>
                <Input
                  id="regulatory_body"
                  name="regulatory_body"
                  placeholder="OSFI"
                  defaultValue="OSFI"
                />
              </div>
              <div>
                <Label htmlFor="reminder_days_before">Reminder Days Before</Label>
                <Input
                  id="reminder_days_before"
                  name="reminder_days_before"
                  type="number"
                  defaultValue="14"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Additional details about this requirement"
                  rows={3}
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
                <Button type="submit" disabled={createEntryMutation.isPending}>
                  {createEntryMutation.isPending ? "Creating..." : "Create Entry"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedEntries.map((entry) => {
          const daysUntilDue = getDaysUntilDue(entry.due_date);
          return (
            <Card key={entry.id} className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(entry)}
                    <div>
                      <h3 className="font-semibold">{entry.regulation_name}</h3>
                      <p className="text-sm text-muted-foreground">{entry.report_type}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Due: {format(new Date(entry.due_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.regulatory_body}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {entry.filing_frequency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <Badge className={getStatusColor(entry)}>
                        {entry.status === 'upcoming' && daysUntilDue > 0 
                          ? `${daysUntilDue} days left`
                          : entry.status === 'upcoming' && daysUntilDue <= 0
                          ? 'Overdue'
                          : entry.status.replace('_', ' ').toUpperCase()
                        }
                      </Badge>
                      {daysUntilDue <= entry.reminder_days_before && daysUntilDue > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Reminder: Due soon
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {entry.description && (
                  <p className="text-sm text-muted-foreground mt-2 pl-8">
                    {entry.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Calendar Entries</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your regulatory deadlines by adding calendar entries.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegulatoryCalendar;
