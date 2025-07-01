
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Calendar, 
  Video, 
  Users, 
  Clock, 
  Plus,
  Play,
  Square,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  Settings,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collaborationService } from '@/services/collaboration-service';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  organizer_id: string;
  organizer_name: string;
  attendees: string[];
  agenda: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_type: 'virtual' | 'in_person' | 'hybrid';
  meeting_url?: string;
  recording_url?: string;
  transcript?: string;
  action_items?: string[];
}

const MeetingCenter: React.FC = () => {
  const { profile } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [meetingControls, setMeetingControls] = useState({
    audioEnabled: true,
    videoEnabled: true,
    isRecording: false
  });

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: [] as string[],
    attendeeInput: '',
    agenda: [] as string[],
    agendaInput: ''
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const data = await collaborationService.getMeetings(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Mock data for demonstration
      const mockMeetings: Meeting[] = [
        {
          id: '1',
          title: 'Q4 Risk Review',
          description: 'Quarterly risk assessment review with all department heads',
          start_time: new Date(Date.now() + 86400000).toISOString(),
          end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
          organizer_id: profile?.id || '',
          organizer_name: profile?.full_name || 'You',
          attendees: ['user1', 'user2', 'user3'],
          agenda: [
            'Review Q4 risk metrics',
            'Discuss emerging risks',
            'Action items for Q1'
          ],
          status: 'scheduled',
          meeting_type: 'virtual'
        },
        {
          id: '2',
          title: 'Vendor Risk Assessment',
          description: 'Monthly vendor risk assessment meeting',
          start_time: new Date(Date.now() + 172800000).toISOString(),
          end_time: new Date(Date.now() + 172800000 + 1800000).toISOString(),
          organizer_id: 'other_user',
          organizer_name: 'Sarah Johnson',
          attendees: [profile?.id || '', 'user2'],
          agenda: [
            'Review new vendor assessments',
            'Update risk ratings'
          ],
          status: 'scheduled',
          meeting_type: 'virtual'
        }
      ];

      setMeetings(mockMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error('Failed to load meetings');
    }
  };

  const scheduleMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.startTime || !newMeeting.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const startTime = new Date(`${newMeeting.date}T${newMeeting.startTime}`);
      const endTime = new Date(`${newMeeting.date}T${newMeeting.endTime}`);

      await collaborationService.scheduleMeeting(
        newMeeting.title,
        newMeeting.description,
        startTime.toISOString(),
        endTime.toISOString(),
        newMeeting.attendees,
        newMeeting.agenda
      );

      setNewMeeting({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        attendees: [],
        attendeeInput: '',
        agenda: [],
        agendaInput: ''
      });

      setShowScheduleDialog(false);
      loadMeetings();
      toast.success('Meeting scheduled successfully');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting');
    }
  };

  const joinMeeting = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    setIsInMeeting(true);
    toast.success(`Joined meeting: ${meeting.title}`);
  };

  const leaveMeeting = () => {
    setCurrentMeeting(null);
    setIsInMeeting(false);
    setMeetingControls({
      audioEnabled: true,
      videoEnabled: true,
      isRecording: false
    });
    toast.info('Left the meeting');
  };

  const toggleAudio = () => {
    setMeetingControls(prev => ({
      ...prev,
      audioEnabled: !prev.audioEnabled
    }));
  };

  const toggleVideo = () => {
    setMeetingControls(prev => ({
      ...prev,
      videoEnabled: !prev.videoEnabled
    }));
  };

  const toggleRecording = () => {
    setMeetingControls(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
    toast.info(meetingControls.isRecording ? 'Recording stopped' : 'Recording started');
  };

  const addAttendee = () => {
    if (newMeeting.attendeeInput.trim() && !newMeeting.attendees.includes(newMeeting.attendeeInput.trim())) {
      setNewMeeting(prev => ({
        ...prev,
        attendees: [...prev.attendees, prev.attendeeInput.trim()],
        attendeeInput: ''
      }));
    }
  };

  const removeAttendee = (attendee: string) => {
    setNewMeeting(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }));
  };

  const addAgendaItem = () => {
    if (newMeeting.agendaInput.trim()) {
      setNewMeeting(prev => ({
        ...prev,
        agenda: [...prev.agenda, prev.agendaInput.trim()],
        agendaInput: ''
      }));
    }
  };

  const removeAgendaItem = (index: number) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSelectedDateMeetings = () => {
    if (!selectedDate) return [];
    const selectedDateStr = selectedDate.toDateString();
    return meetings.filter(meeting => 
      new Date(meeting.start_time).toDateString() === selectedDateStr
    );
  };

  if (isInMeeting && currentMeeting) {
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col">
        {/* Meeting Header */}
        <div className="p-4 bg-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{currentMeeting.title}</h2>
            <p className="text-gray-300">{currentMeeting.attendees.length + 1} participants</p>
          </div>
          <div className="flex items-center gap-2">
            {meetingControls.isRecording && (
              <Badge className="bg-red-600">● Recording</Badge>
            )}
            <Button variant="destructive" onClick={leaveMeeting}>
              Leave Meeting
            </Button>
          </div>
        </div>

        {/* Meeting Content */}
        <div className="flex-1 flex">
          {/* Video Grid */}
          <div className="flex-1 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <Video className="h-24 w-24 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">Video conference would be displayed here</p>
              <p className="text-sm text-gray-500">Integration with video platforms like Zoom, Teams, etc.</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-700 p-4">
            <h3 className="font-semibold mb-4">Meeting Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Agenda</h4>
                <ul className="space-y-1 text-sm">
                  {currentMeeting.agenda.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Participants</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    {currentMeeting.organizer_name} (Host)
                  </div>
                  {currentMeeting.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      Attendee {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Controls */}
        <div className="p-4 bg-gray-800 flex items-center justify-center gap-4">
          <Button
            variant={meetingControls.audioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full"
          >
            {meetingControls.audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={meetingControls.videoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full"
          >
            {meetingControls.videoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={meetingControls.isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={toggleRecording}
            className="rounded-full"
          >
            {meetingControls.isRecording ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button variant="outline" size="lg" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meeting Center</h2>
          <p className="text-muted-foreground">
            Schedule, host, and manage meetings with integrated collaboration tools
          </p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Meeting Title *</label>
                <Input
                  placeholder="Enter meeting title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Meeting description and objectives"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date *</label>
                  <Input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Time *</label>
                  <Input
                    type="time"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Time *</label>
                  <Input
                    type="time"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Attendees</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Enter user ID or email"
                    value={newMeeting.attendeeInput}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, attendeeInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                  />
                  <Button size="sm" onClick={addAttendee}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {newMeeting.attendees.map((attendee) => (
                    <Badge key={attendee} variant="outline" className="text-xs">
                      {attendee}
                      <button
                        onClick={() => removeAttendee(attendee)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Agenda</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add agenda item"
                    value={newMeeting.agendaInput}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, agendaInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addAgendaItem()}
                  />
                  <Button size="sm" onClick={addAgendaItem}>Add</Button>
                </div>
                <div className="space-y-1">
                  {newMeeting.agenda.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{index + 1}. {item}</span>
                      <button
                        onClick={() => removeAgendaItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={scheduleMeeting}>
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Selected Date Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedDate ? selectedDate.toDateString() : 'Select a date'} Meetings
          </h3>
          
          {getSelectedDateMeetings().length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No meetings scheduled for this date</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {getSelectedDateMeetings().map((meeting) => (
                <Card key={meeting.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <Badge className={getStatusColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {meeting.meeting_type}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {meeting.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(meeting.start_time).toLocaleTimeString()} - {new Date(meeting.end_time).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {meeting.attendees.length + 1} participants
                          </div>
                        </div>

                        {meeting.agenda.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium mb-1">Agenda:</p>
                            <ul className="text-xs text-muted-foreground">
                              {meeting.agenda.slice(0, 2).map((item, index) => (
                                <li key={index}>• {item}</li>
                              ))}
                              {meeting.agenda.length > 2 && (
                                <li>• ... and {meeting.agenda.length - 2} more items</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {meeting.status === 'scheduled' && (
                          <Button size="sm" onClick={() => joinMeeting(meeting)}>
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                        {meeting.recording_url && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {meeting.transcript && (
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{meetings.length}</div>
              <div className="text-sm text-muted-foreground">Total Meetings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {meetings.filter(m => m.status === 'scheduled').length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {meetings.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {meetings.filter(m => m.recording_url).length}
              </div>
              <div className="text-sm text-muted-foreground">Recorded</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingCenter;
