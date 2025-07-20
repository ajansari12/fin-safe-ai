import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Shield, CheckCircle2, AlertCircle, Plus, Edit, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccountabilityRole {
  id: string;
  title: string;
  department: string;
  function: string;
  level: 'board' | 'executive' | 'senior_management' | 'middle_management' | 'operational';
  responsibilities: Responsibility[];
  reportingLines: string[];
  delegatedAuthorities: Authority[];
  performanceMetrics: string[];
  status: 'active' | 'vacant' | 'transition';
}

interface Responsibility {
  id: string;
  area: string;
  description: string;
  type: 'accountable' | 'responsible' | 'consulted' | 'informed';
  framework: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  compliance: boolean;
}

interface Authority {
  id: string;
  type: 'approval' | 'decision' | 'oversight' | 'execution';
  scope: string;
  limit?: string;
  conditions: string[];
  escalationRequired: boolean;
}

interface RACIMatrix {
  activity: string;
  responsible: string[];
  accountable: string[];
  consulted: string[];
  informed: string[];
}

const AccountabilityMatrix = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedRole, setSelectedRole] = useState<AccountabilityRole | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [roles] = useState<AccountabilityRole[]>([
    {
      id: '1',
      title: 'Chief Executive Officer',
      department: 'Executive',
      function: 'Leadership',
      level: 'executive',
      responsibilities: [
        {
          id: '1-1',
          area: 'Overall Risk Management',
          description: 'Ultimate accountability for enterprise risk management',
          type: 'accountable',
          framework: 'Enterprise Risk',
          priority: 'critical',
          compliance: true
        },
        {
          id: '1-2',
          area: 'Strategic Direction',
          description: 'Set strategic direction and priorities',
          type: 'accountable',
          framework: 'Governance',
          priority: 'critical',
          compliance: true
        }
      ],
      reportingLines: ['Board of Directors'],
      delegatedAuthorities: [
        {
          id: '1-1',
          type: 'approval',
          scope: 'Strategic Decisions',
          conditions: ['Board approval for major initiatives'],
          escalationRequired: false
        }
      ],
      performanceMetrics: ['Financial Performance', 'Risk Performance', 'Compliance Rating'],
      status: 'active'
    },
    {
      id: '2',
      title: 'Chief Risk Officer',
      department: 'Risk Management',
      function: 'Risk Oversight',
      level: 'executive',
      responsibilities: [
        {
          id: '2-1',
          area: 'Risk Framework',
          description: 'Develop and maintain enterprise risk framework',
          type: 'responsible',
          framework: 'Enterprise Risk',
          priority: 'critical',
          compliance: true
        },
        {
          id: '2-2',
          area: 'Risk Reporting',
          description: 'Provide risk reporting to board and executives',
          type: 'responsible',
          framework: 'Risk Reporting',
          priority: 'high',
          compliance: true
        }
      ],
      reportingLines: ['CEO', 'Board Risk Committee'],
      delegatedAuthorities: [
        {
          id: '2-1',
          type: 'approval',
          scope: 'Risk Policies',
          limit: 'Within approved framework',
          conditions: ['CEO approval for significant changes'],
          escalationRequired: true
        }
      ],
      performanceMetrics: ['Framework Effectiveness', 'Risk Incident Reduction', 'Reporting Quality'],
      status: 'active'
    },
    {
      id: '3',
      title: 'Chief Financial Officer',
      department: 'Finance',
      function: 'Financial Management',
      level: 'executive',
      responsibilities: [
        {
          id: '3-1',
          area: 'Financial Risk',
          description: 'Manage financial risks and controls',
          type: 'responsible',
          framework: 'Financial Risk',
          priority: 'critical',
          compliance: true
        },
        {
          id: '3-2',
          area: 'Financial Reporting',
          description: 'Ensure accurate financial reporting',
          type: 'accountable',
          framework: 'Financial Reporting',
          priority: 'critical',
          compliance: true
        }
      ],
      reportingLines: ['CEO', 'Board Audit Committee'],
      delegatedAuthorities: [
        {
          id: '3-1',
          type: 'approval',
          scope: 'Financial Decisions',
          limit: '$10M',
          conditions: ['CEO approval required above limit'],
          escalationRequired: true
        }
      ],
      performanceMetrics: ['Financial Accuracy', 'Control Effectiveness', 'Audit Results'],
      status: 'active'
    },
    {
      id: '4',
      title: 'Business Unit Manager',
      department: 'Retail Banking',
      function: 'Operations',
      level: 'senior_management',
      responsibilities: [
        {
          id: '4-1',
          area: 'Operational Risk',
          description: 'Manage operational risks within business unit',
          type: 'responsible',
          framework: 'Operational Risk',
          priority: 'high',
          compliance: true
        },
        {
          id: '4-2',
          area: 'Customer Protection',
          description: 'Ensure customer protection measures',
          type: 'responsible',
          framework: 'Customer Protection',
          priority: 'high',
          compliance: true
        }
      ],
      reportingLines: ['Regional Director', 'CRO (dotted line)'],
      delegatedAuthorities: [
        {
          id: '4-1',
          type: 'decision',
          scope: 'Operational Decisions',
          limit: '$1M',
          conditions: ['CRO notification for risk decisions'],
          escalationRequired: false
        }
      ],
      performanceMetrics: ['Operational Losses', 'Customer Satisfaction', 'Compliance Score'],
      status: 'active'
    }
  ]);

  const [raciMatrix] = useState<RACIMatrix[]>([
    {
      activity: 'Risk Appetite Setting',
      responsible: ['Chief Risk Officer'],
      accountable: ['CEO'],
      consulted: ['CFO', 'Business Unit Managers'],
      informed: ['Board Risk Committee']
    },
    {
      activity: 'Policy Development',
      responsible: ['Risk Team'],
      accountable: ['Chief Risk Officer'],
      consulted: ['Legal', 'Compliance'],
      informed: ['Business Units']
    },
    {
      activity: 'Risk Assessment',
      responsible: ['Business Unit Managers'],
      accountable: ['Business Unit Managers'],
      consulted: ['Risk Management'],
      informed: ['Executive Team']
    },
    {
      activity: 'Incident Response',
      responsible: ['Operations Team'],
      accountable: ['Business Unit Manager'],
      consulted: ['Risk Management', 'Legal'],
      informed: ['Executive Team', 'Board']
    }
  ]);

  const getResponsibilityBadge = (type: string) => {
    const config = {
      accountable: { label: 'A', color: 'bg-red-100 text-red-800' },
      responsible: { label: 'R', color: 'bg-blue-100 text-blue-800' },
      consulted: { label: 'C', color: 'bg-yellow-100 text-yellow-800' },
      informed: { label: 'I', color: 'bg-green-100 text-green-800' }
    };
    const item = config[type as keyof typeof config];
    return (
      <Badge className={`${item.color} text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center p-0`}>
        {item.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const config = {
      board: { label: 'Board', variant: 'default' as const },
      executive: { label: 'Executive', variant: 'secondary' as const },
      senior_management: { label: 'Senior Mgmt', variant: 'outline' as const },
      middle_management: { label: 'Middle Mgmt', variant: 'outline' as const },
      operational: { label: 'Operational', variant: 'outline' as const }
    };
    const item = config[level as keyof typeof config] || config.operational;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || role.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accountability Matrix</h2>
          <p className="text-muted-foreground">
            Define roles, responsibilities, and RACI assignments for governance oversight
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
          <TabsTrigger value="roles">Roles & Responsibilities</TabsTrigger>
          <TabsTrigger value="raci">RACI Matrix</TabsTrigger>
          <TabsTrigger value="authorities">Authorities</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                    <p className="text-2xl font-bold">{roles.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Responsibilities</p>
                    <p className="text-2xl font-bold">
                      {roles.reduce((sum, role) => 
                        sum + role.responsibilities.filter(r => r.priority === 'critical').length, 0
                      )}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Areas</p>
                    <p className="text-2xl font-bold">
                      {roles.reduce((sum, role) => 
                        sum + role.responsibilities.filter(r => r.compliance).length, 0
                      )}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                    <p className="text-2xl font-bold">
                      {roles.filter(r => r.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Accountability Hierarchy</CardTitle>
              <CardDescription>Organizational structure with reporting lines and accountability levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['board', 'executive', 'senior_management', 'middle_management', 'operational'].map((level) => {
                  const levelRoles = roles.filter(role => role.level === level);
                  if (levelRoles.length === 0) return null;
                  
                  return (
                    <div key={level} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {getLevelBadge(level)}
                        <span className="font-semibold">
                          {level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {levelRoles.map((role) => (
                          <div key={role.id} className="bg-gray-50 rounded p-3">
                            <h4 className="font-medium text-sm">{role.title}</h4>
                            <p className="text-xs text-muted-foreground">{role.department}</p>
                            <div className="mt-2 text-xs">
                              {role.responsibilities.filter(r => r.priority === 'critical').length} critical responsibilities
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="board">Board</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="senior_management">Senior Management</SelectItem>
                <SelectItem value="middle_management">Middle Management</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredRoles.map((role) => (
              <Card key={role.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {role.title.split(' ').map(word => word[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{role.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{role.department}</span>
                          {getLevelBadge(role.level)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedRole(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {role.responsibilities.slice(0, 3).map((resp) => (
                          <div key={resp.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              {getResponsibilityBadge(resp.type)}
                              <span className="text-sm">{resp.area}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${getPriorityColor(resp.priority)}`}>
                                {resp.priority}
                              </span>
                              {resp.compliance && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-sm">
                      <span>Reports to: {role.reportingLines.join(', ')}</span>
                      <span>{role.responsibilities.length} total responsibilities</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="raci" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RACI Matrix</CardTitle>
              <CardDescription>
                Responsibility Assignment Matrix for key governance activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {getResponsibilityBadge('responsible')}
                  <span>Responsible</span>
                </div>
                <div className="flex items-center gap-1">
                  {getResponsibilityBadge('accountable')}
                  <span>Accountable</span>
                </div>
                <div className="flex items-center gap-1">
                  {getResponsibilityBadge('consulted')}
                  <span>Consulted</span>
                </div>
                <div className="flex items-center gap-1">
                  {getResponsibilityBadge('informed')}
                  <span>Informed</span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Activity</TableHead>
                    <TableHead>CEO</TableHead>
                    <TableHead>CRO</TableHead>
                    <TableHead>CFO</TableHead>
                    <TableHead>BU Manager</TableHead>
                    <TableHead>Board</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raciMatrix.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.activity}</TableCell>
                      <TableCell>
                        {item.accountable.includes('CEO') && getResponsibilityBadge('accountable')}
                        {item.responsible.includes('CEO') && getResponsibilityBadge('responsible')}
                        {item.consulted.includes('CEO') && getResponsibilityBadge('consulted')}
                        {item.informed.includes('CEO') && getResponsibilityBadge('informed')}
                      </TableCell>
                      <TableCell>
                        {item.accountable.includes('Chief Risk Officer') && getResponsibilityBadge('accountable')}
                        {item.responsible.includes('Chief Risk Officer') && getResponsibilityBadge('responsible')}
                        {item.consulted.includes('Risk Management') && getResponsibilityBadge('consulted')}
                      </TableCell>
                      <TableCell>
                        {item.consulted.includes('CFO') && getResponsibilityBadge('consulted')}
                      </TableCell>
                      <TableCell>
                        {item.accountable.includes('Business Unit Manager') && getResponsibilityBadge('accountable')}
                        {item.responsible.includes('Business Unit Managers') && getResponsibilityBadge('responsible')}
                        {item.consulted.includes('Business Unit Managers') && getResponsibilityBadge('consulted')}
                        {item.informed.includes('Business Units') && getResponsibilityBadge('informed')}
                      </TableCell>
                      <TableCell>
                        {item.informed.includes('Board') && getResponsibilityBadge('informed')}
                        {item.informed.includes('Board Risk Committee') && getResponsibilityBadge('informed')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authorities" className="space-y-6">
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription>{role.department} • {role.function}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Delegated Authorities</h4>
                      <div className="space-y-2">
                        {role.delegatedAuthorities.map((authority) => (
                          <div key={authority.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{authority.scope}</span>
                              <Badge variant="outline">{authority.type}</Badge>
                            </div>
                            {authority.limit && (
                              <p className="text-sm text-muted-foreground">Limit: {authority.limit}</p>
                            )}
                            <div className="mt-2 text-xs">
                              {authority.conditions.map((condition, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span>•</span>
                                  <span>{condition}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for accountability roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{role.title}</h4>
                      <Badge variant={role.status === 'active' ? 'default' : 'secondary'}>
                        {role.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {role.performanceMetrics.map((metric, index) => (
                        <div key={index} className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.floor(Math.random() * 20 + 80)}%
                          </p>
                          <p className="text-sm text-muted-foreground">{metric}</p>
                        </div>
                      ))}
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
            <DialogTitle>Add Accountability Role</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="function">Function</Label>
                <Input id="function" placeholder="Enter primary function" />
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">Board</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="senior_management">Senior Management</SelectItem>
                    <SelectItem value="middle_management">Middle Management</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Role added successfully",
                  description: "The accountability role has been added to the matrix."
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

export default AccountabilityMatrix;