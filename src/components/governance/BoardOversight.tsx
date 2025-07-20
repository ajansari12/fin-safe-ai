import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, FileText, Clock, Star, Plus, Edit, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BoardMember {
  id: string;
  name: string;
  role: 'chair' | 'independent_director' | 'executive_director' | 'member';
  expertise: string[];
  joinDate: Date;
  termEnd: Date;
  committees: string[];
  attendanceRate: number;
  status: 'active' | 'inactive';
}

interface Committee {
  id: string;
  name: string;
  type: 'audit' | 'risk' | 'governance' | 'compensation' | 'technology';
  chairperson: string;
  members: string[];
  meetingFrequency: 'monthly' | 'quarterly' | 'biannual';
  lastMeeting: Date;
  nextMeeting: Date;
  charter: string;
  responsibilities: string[];
  performance: number;
}

interface BoardMeeting {
  id: string;
  date: Date;
  type: 'regular' | 'special' | 'annual';
  agenda: AgendaItem[];
  attendance: string[];
  decisions: Decision[];
  status: 'scheduled' | 'completed' | 'cancelled';
  minutes?: string;
}

interface AgendaItem {
  id: string;
  title: string;
  presenter: string;
  duration: number;
  type: 'presentation' | 'decision' | 'discussion' | 'information';
  documents: string[];
}

interface Decision {
  id: string;
  title: string;
  description: string;
  decision: 'approved' | 'rejected' | 'deferred';
  votingResults: {
    for: number;
    against: number;
    abstain: number;
  };
  followUpActions: string[];
  responsibleParty: string;
  dueDate: Date;
}

const BoardOversight = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [boardMembers] = useState<BoardMember[]>([
    {
      id: '1',
      name: 'Sarah Thompson',
      role: 'chair',
      expertise: ['Financial Services', 'Risk Management', 'Corporate Governance'],
      joinDate: new Date('2020-01-15'),
      termEnd: new Date('2025-01-15'),
      committees: ['audit', 'risk'],
      attendanceRate: 95,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'independent_director',
      expertise: ['Technology', 'Cybersecurity', 'Digital Transformation'],
      joinDate: new Date('2021-03-01'),
      termEnd: new Date('2026-03-01'),
      committees: ['technology', 'audit'],
      attendanceRate: 88,
      status: 'active'
    },
    {
      id: '3',
      name: 'Jennifer Martinez',
      role: 'independent_director',
      expertise: ['Legal', 'Compliance', 'Regulatory Affairs'],
      joinDate: new Date('2019-06-01'),
      termEnd: new Date('2024-06-01'),
      committees: ['governance', 'risk'],
      attendanceRate: 92,
      status: 'active'
    }
  ]);

  const [committees] = useState<Committee[]>([
    {
      id: 'audit',
      name: 'Audit Committee',
      type: 'audit',
      chairperson: 'Sarah Thompson',
      members: ['Sarah Thompson', 'Michael Chen', 'David Wilson'],
      meetingFrequency: 'quarterly',
      lastMeeting: new Date('2024-01-15'),
      nextMeeting: new Date('2024-04-15'),
      charter: 'Oversight of financial reporting, internal controls, and audit functions',
      responsibilities: [
        'Review financial statements and reporting processes',
        'Oversee internal and external audit functions',
        'Monitor compliance with legal and regulatory requirements',
        'Assess effectiveness of internal controls'
      ],
      performance: 87
    },
    {
      id: 'risk',
      name: 'Risk Committee',
      type: 'risk',
      chairperson: 'Jennifer Martinez',
      members: ['Jennifer Martinez', 'Sarah Thompson', 'Robert Kim'],
      meetingFrequency: 'quarterly',
      lastMeeting: new Date('2024-02-01'),
      nextMeeting: new Date('2024-05-01'),
      charter: 'Oversight of enterprise risk management and operational resilience',
      responsibilities: [
        'Review risk appetite and tolerance statements',
        'Monitor risk management framework effectiveness',
        'Oversee operational resilience programs',
        'Review significant risk exposures and mitigation strategies'
      ],
      performance: 91
    },
    {
      id: 'technology',
      name: 'Technology Committee',
      type: 'technology',
      chairperson: 'Michael Chen',
      members: ['Michael Chen', 'Lisa Park', 'James Rodriguez'],
      meetingFrequency: 'quarterly',
      lastMeeting: new Date('2024-01-20'),
      nextMeeting: new Date('2024-04-20'),
      charter: 'Oversight of technology strategy, cybersecurity, and digital initiatives',
      responsibilities: [
        'Review technology strategy and investments',
        'Monitor cybersecurity risks and controls',
        'Oversee digital transformation initiatives',
        'Assess technology-related operational risks'
      ],
      performance: 83
    }
  ]);

  const [upcomingMeetings] = useState<BoardMeeting[]>([
    {
      id: '1',
      date: new Date('2024-03-15'),
      type: 'regular',
      agenda: [
        {
          id: '1',
          title: 'Q4 Financial Results',
          presenter: 'CFO',
          duration: 30,
          type: 'presentation',
          documents: ['Q4_Financial_Report.pdf']
        },
        {
          id: '2',
          title: 'Risk Appetite Review',
          presenter: 'CRO',
          duration: 45,
          type: 'decision',
          documents: ['Risk_Appetite_Statement.pdf']
        }
      ],
      attendance: [],
      decisions: [],
      status: 'scheduled'
    }
  ]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      chair: { label: 'Chair', variant: 'default' as const },
      independent_director: { label: 'Independent', variant: 'secondary' as const },
      executive_director: { label: 'Executive', variant: 'outline' as const },
      member: { label: 'Member', variant: 'outline' as const }
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Board Oversight</h2>
          <p className="text-muted-foreground">
            Manage board composition, committees, and governance oversight
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="members">Board Members</TabsTrigger>
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Board Members</p>
                    <p className="text-2xl font-bold">{boardMembers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Committees</p>
                    <p className="text-2xl font-bold">{committees.length}</p>
                  </div>
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming Meetings</p>
                    <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                    <p className="text-2xl font-bold">
                      {Math.round(boardMembers.reduce((sum, member) => sum + member.attendanceRate, 0) / boardMembers.length)}%
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Committee Performance</CardTitle>
                <CardDescription>Current committee effectiveness ratings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {committees.map((committee) => (
                  <div key={committee.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{committee.name}</span>
                      <span className={getPerformanceColor(committee.performance)}>
                        {committee.performance}%
                      </span>
                    </div>
                    <Progress value={committee.performance} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Board Activities</CardTitle>
                <CardDescription>Next meetings and key agenda items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Board Meeting
                        </h4>
                        <Badge variant="outline">
                          {meeting.date.toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {meeting.agenda.length} agenda items
                      </div>
                    </div>
                  ))}
                  {committees.filter(c => c.nextMeeting > new Date()).map((committee) => (
                    <div key={`committee-${committee.id}`} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{committee.name}</h4>
                        <Badge variant="secondary">
                          {committee.nextMeeting.toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {committee.meetingFrequency} meeting
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="grid gap-4">
            {boardMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(member.role)}
                          <Badge variant="outline" className="text-green-600">
                            {member.attendanceRate}% Attendance
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Expertise:</span>
                      <div className="mt-1 space-x-1">
                        {member.expertise.map((exp, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Committees:</span>
                      <div className="mt-1 space-x-1">
                        {member.committees.map((committee, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {committees.find(c => c.id === committee)?.name || committee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Term:</span>
                      <div className="mt-1 text-muted-foreground">
                        {member.joinDate.toLocaleDateString()} - {member.termEnd.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="committees" className="space-y-6">
          <div className="grid gap-6">
            {committees.map((committee) => (
              <Card key={committee.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-orange-600" />
                        {committee.name}
                      </CardTitle>
                      <CardDescription>{committee.charter}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Performance: {committee.performance}%
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Members</h4>
                      <div className="space-y-1">
                        {committee.members.map((memberName, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {memberName.split(' ').map(n => n[0]).join('')}
                            </div>
                            {memberName}
                            {memberName === committee.chairperson && (
                              <Badge variant="secondary" className="text-xs">Chair</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {committee.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index}>• {resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <span>Meeting Frequency: {committee.meetingFrequency}</span>
                    <span>Next Meeting: {committee.nextMeeting.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Calendar</CardTitle>
              <CardDescription>Board and committee meeting schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Board Meeting
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {meeting.date.toLocaleDateString()}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Agenda Items</h5>
                      {meeting.agenda.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.presenter}</span>
                            <span>•</span>
                            <span>{item.duration}min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Board Effectiveness Metrics</CardTitle>
                <CardDescription>Key performance indicators for board governance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Board Effectiveness</span>
                    <span className="text-green-600">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Decision-Making Quality</span>
                    <span className="text-green-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Strategic Oversight</span>
                    <span className="text-yellow-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Risk Oversight</span>
                    <span className="text-green-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>Meeting attendance trends and patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {boardMembers.map((member) => (
                  <div key={member.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{member.name}</span>
                      <span className={getPerformanceColor(member.attendanceRate)}>
                        {member.attendanceRate}%
                      </span>
                    </div>
                    <Progress value={member.attendanceRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Board Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chair">Chair</SelectItem>
                    <SelectItem value="independent_director">Independent Director</SelectItem>
                    <SelectItem value="executive_director">Executive Director</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <Input id="expertise" placeholder="e.g., Financial Services, Risk Management" />
            </div>
            <div>
              <Label htmlFor="committees">Committee Assignments</Label>
              <Input id="committees" placeholder="e.g., Audit, Risk, Technology" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Board member added",
                  description: "The new board member has been added successfully."
                });
                setIsDialogOpen(false);
              }}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardOversight;