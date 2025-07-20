import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Users, Shield, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DefenseLine {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  roles: DefenseRole[];
  effectiveness: number;
  independenceScore: number;
  lastAssessment: Date;
}

interface DefenseRole {
  id: string;
  title: string;
  department: string;
  responsibilities: string[];
  reportingLine: string;
  skillRequirements: string[];
  performanceMetrics: string[];
  status: 'active' | 'vacant' | 'under_review';
}

const ThreeLinesDefense = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState<DefenseLine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [defenseLines, setDefenseLines] = useState<DefenseLine[]>([
    {
      id: '1',
      name: 'First Line - Business Operations',
      description: 'Business units that own and manage risks in their day-to-day operations',
      responsibilities: [
        'Risk ownership and management',
        'Implementation of controls',
        'Day-to-day risk monitoring',
        'Incident reporting and response',
        'Customer protection measures'
      ],
      roles: [
        {
          id: '1-1',
          title: 'Business Unit Manager',
          department: 'Retail Banking',
          responsibilities: ['Operational risk management', 'Staff supervision', 'Customer service delivery'],
          reportingLine: 'Regional Director',
          skillRequirements: ['Risk management', 'Leadership', 'Regulatory knowledge'],
          performanceMetrics: ['Risk incident frequency', 'Control effectiveness', 'Customer satisfaction'],
          status: 'active'
        },
        {
          id: '1-2',
          title: 'Branch Manager',
          department: 'Branch Operations',
          responsibilities: ['Daily operations oversight', 'Compliance monitoring', 'Staff training'],
          reportingLine: 'Area Manager',
          skillRequirements: ['Operations management', 'Compliance', 'Customer relations'],
          performanceMetrics: ['Operational losses', 'Audit findings', 'Service quality'],
          status: 'active'
        }
      ],
      effectiveness: 85,
      independenceScore: 100,
      lastAssessment: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Second Line - Risk Management & Compliance',
      description: 'Functions that provide oversight, monitoring, and challenge of first line activities',
      responsibilities: [
        'Risk framework development',
        'Policy creation and maintenance',
        'Independent monitoring and testing',
        'Risk reporting and escalation',
        'Regulatory compliance oversight'
      ],
      roles: [
        {
          id: '2-1',
          title: 'Chief Risk Officer',
          department: 'Risk Management',
          responsibilities: ['Enterprise risk oversight', 'Risk strategy development', 'Board reporting'],
          reportingLine: 'CEO',
          skillRequirements: ['Advanced risk management', 'Strategic planning', 'Board communication'],
          performanceMetrics: ['Risk appetite adherence', 'Framework effectiveness', 'Regulatory compliance'],
          status: 'active'
        },
        {
          id: '2-2',
          title: 'Compliance Officer',
          department: 'Compliance',
          responsibilities: ['Regulatory monitoring', 'Policy implementation', 'Training coordination'],
          reportingLine: 'Chief Risk Officer',
          skillRequirements: ['Regulatory expertise', 'Policy development', 'Training delivery'],
          performanceMetrics: ['Compliance rating', 'Policy adherence', 'Training completion'],
          status: 'active'
        }
      ],
      effectiveness: 78,
      independenceScore: 90,
      lastAssessment: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Third Line - Internal Audit',
      description: 'Independent assurance function that provides objective assessment of risk management',
      responsibilities: [
        'Independent assurance activities',
        'Audit planning and execution',
        'Effectiveness assessment of first and second lines',
        'Board and audit committee reporting',
        'Follow-up on remediation actions'
      ],
      roles: [
        {
          id: '3-1',
          title: 'Chief Audit Executive',
          department: 'Internal Audit',
          responsibilities: ['Audit strategy', 'Board reporting', 'Audit team leadership'],
          reportingLine: 'Board Audit Committee',
          skillRequirements: ['Audit leadership', 'Risk assessment', 'Board communication'],
          performanceMetrics: ['Audit coverage', 'Finding significance', 'Stakeholder satisfaction'],
          status: 'active'
        },
        {
          id: '3-2',
          title: 'Senior Auditor',
          department: 'Internal Audit',
          responsibilities: ['Audit execution', 'Risk assessment', 'Report preparation'],
          reportingLine: 'Audit Manager',
          skillRequirements: ['Audit techniques', 'Risk analysis', 'Report writing'],
          performanceMetrics: ['Audit quality', 'Timeliness', 'Finding accuracy'],
          status: 'vacant'
        }
      ],
      effectiveness: 82,
      independenceScore: 95,
      lastAssessment: new Date('2024-02-01')
    }
  ]);

  const getEffectivenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'vacant':
        return <Badge variant="destructive">Vacant</Badge>;
      case 'under_review':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredRoles = selectedLine?.roles.filter(role =>
    role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Three Lines of Defense</h2>
          <p className="text-muted-foreground">
            Manage governance structure with clear accountability and independence
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="independence">Independence Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {defenseLines.map((line) => (
              <Card key={line.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLine(line)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {line.id === '1' && <Users className="h-5 w-5 text-blue-600" />}
                      {line.id === '2' && <Shield className="h-5 w-5 text-orange-600" />}
                      {line.id === '3' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {line.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getEffectivenessColor(line.effectiveness)}`}>
                        {line.effectiveness}% Effective
                      </span>
                    </div>
                  </div>
                  <CardDescription>{line.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {line.responsibilities.slice(0, 4).map((resp, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {resp}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        {line.roles.length} roles defined
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Last assessed: {line.lastAssessment.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defenseLines.map((line) => (
              <Card key={line.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{line.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Effectiveness</span>
                      <span className={getEffectivenessColor(line.effectiveness)}>
                        {line.effectiveness}%
                      </span>
                    </div>
                    <Progress value={line.effectiveness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Independence</span>
                      <span className={getEffectivenessColor(line.independenceScore)}>
                        {line.independenceScore}%
                      </span>
                    </div>
                    <Progress value={line.independenceScore} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Active Roles</span>
                      <span>{line.roles.filter(r => r.status === 'active').length}/{line.roles.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {selectedLine && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedLine.name} - Roles</CardTitle>
                <CardDescription>
                  Manage roles and responsibilities within this defense line
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRoles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{role.title}</h4>
                          {getStatusBadge(role.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Department:</span> {role.department}
                        </div>
                        <div>
                          <span className="font-medium">Reports to:</span> {role.reportingLine}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="font-medium text-sm">Key Responsibilities:</span>
                        <ul className="mt-1 text-sm text-muted-foreground">
                          {role.responsibilities.map((resp, index) => (
                            <li key={index}>• {resp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="independence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Independence Assessment</CardTitle>
              <CardDescription>
                Evaluate the independence and objectivity of each defense line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {defenseLines.map((line) => (
                  <div key={line.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{line.name}</h4>
                      <Badge variant={line.independenceScore >= 90 ? "default" : "secondary"}>
                        {line.independenceScore}% Independent
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Clear reporting lines established</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>No conflicting responsibilities identified</span>
                      </div>
                      {line.id === '3' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Reports directly to Board Audit Committee</span>
                        </div>
                      )}
                      {line.id === '2' && line.independenceScore < 100 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <span>Some operational involvement may affect independence</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Role Title</Label>
                <Input id="title" placeholder="Enter role title" />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="Enter department" />
              </div>
            </div>
            <div>
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea id="responsibilities" placeholder="Enter key responsibilities..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Role added successfully",
                  description: "The new role has been added to the defense structure."
                });
                setIsDialogOpen(false);
              }}>
                Add Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThreeLinesDefense;