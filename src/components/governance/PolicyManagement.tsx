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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Policy {
  id: string;
  title: string;
  type: 'board' | 'executive' | 'operational' | 'technical';
  category: string;
  description: string;
  version: string;
  status: 'draft' | 'under_review' | 'approved' | 'expired' | 'archived';
  effectiveDate: Date;
  expiryDate: Date;
  lastReviewDate: Date;
  nextReviewDate: Date;
  owner: string;
  approver: string;
  reviewers: string[];
  relatedPolicies: string[];
  attachments: string[];
  changeHistory: PolicyChange[];
  approvalWorkflow: ApprovalStep[];
  compliance: boolean;
  tags: string[];
}

interface PolicyChange {
  id: string;
  version: string;
  changeType: 'major' | 'minor' | 'editorial';
  description: string;
  changedBy: string;
  changeDate: Date;
  approvedBy?: string;
  approvalDate?: Date;
}

interface ApprovalStep {
  id: string;
  stepNumber: number;
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  actionDate?: Date;
  required: boolean;
}

interface PolicyReview {
  id: string;
  policyId: string;
  reviewType: 'scheduled' | 'triggered' | 'annual';
  reviewer: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  findings: string[];
  recommendations: string[];
  actionItems: string[];
}

const PolicyManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'review' | 'approve'>('create');

  const [policies] = useState<Policy[]>([
    {
      id: '1',
      title: 'Enterprise Risk Management Policy',
      type: 'board',
      category: 'Risk Management',
      description: 'Comprehensive policy governing enterprise-wide risk management framework',
      version: '2.1',
      status: 'approved',
      effectiveDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-12-31'),
      lastReviewDate: new Date('2024-01-15'),
      nextReviewDate: new Date('2024-07-15'),
      owner: 'Chief Risk Officer',
      approver: 'Board Risk Committee',
      reviewers: ['CRO', 'Legal', 'Compliance'],
      relatedPolicies: ['Operational Risk Policy', 'Credit Risk Policy'],
      attachments: ['ERM_Framework.pdf', 'Risk_Appetite_Statement.pdf'],
      changeHistory: [
        {
          id: '1-1',
          version: '2.1',
          changeType: 'minor',
          description: 'Updated OSFI E-21 compliance requirements',
          changedBy: 'Risk Management Team',
          changeDate: new Date('2024-01-01'),
          approvedBy: 'Board Risk Committee',
          approvalDate: new Date('2024-01-05')
        }
      ],
      approvalWorkflow: [
        {
          id: '1-1',
          stepNumber: 1,
          approver: 'Chief Risk Officer',
          role: 'Policy Owner',
          status: 'approved',
          actionDate: new Date('2024-01-02'),
          required: true
        },
        {
          id: '1-2',
          stepNumber: 2,
          approver: 'Legal Department',
          role: 'Legal Review',
          status: 'approved',
          actionDate: new Date('2024-01-03'),
          required: true
        },
        {
          id: '1-3',
          stepNumber: 3,
          approver: 'Board Risk Committee',
          role: 'Final Approval',
          status: 'approved',
          actionDate: new Date('2024-01-05'),
          required: true
        }
      ],
      compliance: true,
      tags: ['OSFI E-21', 'Enterprise Risk', 'Board Policy']
    },
    {
      id: '2',
      title: 'Operational Resilience Framework',
      type: 'executive',
      category: 'Operational Resilience',
      description: 'Framework for managing operational resilience and business continuity',
      version: '1.3',
      status: 'under_review',
      effectiveDate: new Date('2024-02-01'),
      expiryDate: new Date('2025-01-31'),
      lastReviewDate: new Date('2023-12-01'),
      nextReviewDate: new Date('2024-03-01'),
      owner: 'Chief Operating Officer',
      approver: 'Executive Committee',
      reviewers: ['COO', 'CRO', 'IT Director'],
      relatedPolicies: ['Business Continuity Policy', 'Cyber Security Policy'],
      attachments: ['OR_Framework.pdf', 'Impact_Tolerances.xlsx'],
      changeHistory: [
        {
          id: '2-1',
          version: '1.3',
          changeType: 'major',
          description: 'Added scenario testing requirements',
          changedBy: 'Operations Team',
          changeDate: new Date('2024-02-15'),
        }
      ],
      approvalWorkflow: [
        {
          id: '2-1',
          stepNumber: 1,
          approver: 'Chief Operating Officer',
          role: 'Policy Owner',
          status: 'approved',
          actionDate: new Date('2024-02-16'),
          required: true
        },
        {
          id: '2-2',
          stepNumber: 2,
          approver: 'Chief Risk Officer',
          role: 'Risk Review',
          status: 'pending',
          required: true
        },
        {
          id: '2-3',
          stepNumber: 3,
          approver: 'Executive Committee',
          role: 'Final Approval',
          status: 'pending',
          required: true
        }
      ],
      compliance: true,
      tags: ['Operational Resilience', 'Business Continuity', 'OSFI E-21']
    },
    {
      id: '3',
      title: 'Data Governance Policy',
      type: 'operational',
      category: 'Data Management',
      description: 'Guidelines for data quality, privacy, and security management',
      version: '1.0',
      status: 'draft',
      effectiveDate: new Date('2024-04-01'),
      expiryDate: new Date('2025-03-31'),
      lastReviewDate: new Date('2024-02-01'),
      nextReviewDate: new Date('2024-08-01'),
      owner: 'Chief Data Officer',
      approver: 'Technology Committee',
      reviewers: ['CDO', 'CISO', 'Legal'],
      relatedPolicies: ['Privacy Policy', 'Information Security Policy'],
      attachments: ['Data_Classification.pdf'],
      changeHistory: [],
      approvalWorkflow: [
        {
          id: '3-1',
          stepNumber: 1,
          approver: 'Chief Data Officer',
          role: 'Policy Owner',
          status: 'pending',
          required: true
        },
        {
          id: '3-2',
          stepNumber: 2,
          approver: 'Legal Department',
          role: 'Legal Review',
          status: 'pending',
          required: true
        }
      ],
      compliance: true,
      tags: ['Data Governance', 'Privacy', 'Security']
    }
  ]);

  const [reviews] = useState<PolicyReview[]>([
    {
      id: '1',
      policyId: '1',
      reviewType: 'scheduled',
      reviewer: 'Chief Risk Officer',
      dueDate: new Date('2024-07-15'),
      status: 'pending',
      findings: [],
      recommendations: [],
      actionItems: []
    },
    {
      id: '2',
      policyId: '2',
      reviewType: 'triggered',
      reviewer: 'Chief Operating Officer',
      dueDate: new Date('2024-03-01'),
      status: 'in_progress',
      findings: ['Scenario testing requirements need clarification'],
      recommendations: ['Add specific testing frequencies'],
      actionItems: ['Update section 4.2 with testing schedule']
    }
  ]);

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      under_review: { label: 'Under Review', variant: 'default' as const },
      approved: { label: 'Approved', variant: 'default' as const },
      expired: { label: 'Expired', variant: 'destructive' as const },
      archived: { label: 'Archived', variant: 'outline' as const }
    };
    const item = config[status as keyof typeof config] || config.draft;
    const className = status === 'approved' ? 'bg-green-100 text-green-800' : '';
    return <Badge variant={item.variant} className={className}>{item.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      board: { label: 'Board', variant: 'default' as const },
      executive: { label: 'Executive', variant: 'secondary' as const },
      operational: { label: 'Operational', variant: 'outline' as const },
      technical: { label: 'Technical', variant: 'outline' as const }
    };
    const item = config[type as keyof typeof config] || config.operational;
    return <Badge variant={item.variant}>{item.label}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getApprovalProgress = (workflow: ApprovalStep[]) => {
    const completed = workflow.filter(step => step.status === 'approved').length;
    return (completed / workflow.length) * 100;
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    const matchesType = filterType === 'all' || policy.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openDialog = (mode: typeof dialogMode, policy?: Policy) => {
    setDialogMode(mode);
    setSelectedPolicy(policy || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Policy Management</h2>
          <p className="text-muted-foreground">
            Manage policy lifecycle with approval workflows and compliance tracking
          </p>
        </div>
        <Button onClick={() => openDialog('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                    <p className="text-2xl font-bold">{policies.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                    <p className="text-2xl font-bold">
                      {policies.filter(p => p.status === 'under_review').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">
                      {policies.filter(p => p.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue Reviews</p>
                    <p className="text-2xl font-bold">
                      {reviews.filter(r => r.status === 'overdue').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Status Distribution</CardTitle>
                <CardDescription>Current status of all policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['approved', 'under_review', 'draft', 'expired'].map((status) => {
                  const count = policies.filter(p => p.status === status).length;
                  const percentage = (count / policies.length) * 100;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <span>{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reviews</CardTitle>
                <CardDescription>Policies requiring review soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policies
                    .filter(p => p.nextReviewDate > new Date())
                    .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
                    .slice(0, 5)
                    .map((policy) => {
                      const daysUntil = getDaysUntilExpiry(policy.nextReviewDate);
                      return (
                        <div key={policy.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium text-sm">{policy.title}</p>
                            <p className="text-xs text-muted-foreground">Owner: {policy.owner}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={daysUntil <= 30 ? "destructive" : "outline"} className="text-xs">
                              {daysUntil} days
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="board">Board</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{policy.title}</h3>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(policy.status)}
                          {getTypeBadge(policy.type)}
                          <Badge variant="outline">v{policy.version}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openDialog('review', policy)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDialog('edit', policy)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Owner:</span>
                      <p className="text-muted-foreground">{policy.owner}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground">{policy.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Next Review:</span>
                      <p className="text-muted-foreground">{policy.nextReviewDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Approval:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={getApprovalProgress(policy.approvalWorkflow)} className="h-2 flex-1" />
                        <span className="text-xs">{getApprovalProgress(policy.approvalWorkflow).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {policy.tags.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tags:</span>
                        {policy.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflows</CardTitle>
              <CardDescription>Track policy approval status and workflow progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {policies.filter(p => p.status !== 'approved').map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{policy.title}</h4>
                        <p className="text-sm text-muted-foreground">Version {policy.version}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(policy.status)}
                        <Button variant="outline" size="sm" onClick={() => openDialog('approve', policy)}>
                          <Send className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {policy.approvalWorkflow.map((step) => (
                        <div key={step.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300">
                            {step.status === 'approved' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                            {step.status === 'rejected' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                            {step.status === 'pending' && <Clock className="h-5 w-5 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{step.role}</span>
                              <Badge variant={
                                step.status === 'approved' ? 'default' :
                                step.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {step.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.approver}</p>
                            {step.actionDate && (
                              <p className="text-xs text-muted-foreground">
                                {step.status} on {step.actionDate.toLocaleDateString()}
                              </p>
                            )}
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

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Reviews</CardTitle>
              <CardDescription>Manage scheduled and triggered policy reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Review Type</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => {
                    const policy = policies.find(p => p.id === review.policyId);
                    return (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{policy?.title}</p>
                            <p className="text-sm text-muted-foreground">{policy?.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {review.reviewType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{review.reviewer}</TableCell>
                        <TableCell>{review.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            review.status === 'completed' ? 'default' :
                            review.status === 'overdue' ? 'destructive' : 'secondary'
                          }>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Overall policy compliance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compliant Policies</span>
                    <span className="text-green-600">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Up-to-date Reviews</span>
                    <span className="text-green-600">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Approved Policies</span>
                    <span className="text-yellow-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regulatory Mapping</CardTitle>
                <CardDescription>Policy coverage by regulation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['OSFI E-21', 'PIPEDA', 'Basel III', 'PCAOB'].map((regulation) => (
                  <div key={regulation} className="flex items-center justify-between py-2">
                    <span className="text-sm">{regulation}</span>
                    <Badge variant="outline">
                      {Math.floor(Math.random() * 10 + 3)} policies
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Gaps</CardTitle>
                <CardDescription>Areas requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 py-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">2 policies overdue for review</span>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">3 policies pending approval</span>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">1 reviewer assignment needed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Create New Policy'}
              {dialogMode === 'edit' && 'Edit Policy'}
              {dialogMode === 'review' && 'Review Policy'}
              {dialogMode === 'approve' && 'Approve Policy'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dialogMode === 'create' || dialogMode === 'edit' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Policy Title</Label>
                    <Input id="title" placeholder="Enter policy title" defaultValue={selectedPolicy?.title} />
                  </div>
                  <div>
                    <Label htmlFor="type">Policy Type</Label>
                    <Select defaultValue={selectedPolicy?.type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="board">Board</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" placeholder="Enter category" defaultValue={selectedPolicy?.category} />
                  </div>
                  <div>
                    <Label htmlFor="owner">Policy Owner</Label>
                    <Input id="owner" placeholder="Enter owner" defaultValue={selectedPolicy?.owner} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter policy description" defaultValue={selectedPolicy?.description} />
                </div>
              </>
            ) : dialogMode === 'review' && selectedPolicy ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Title:</span> {selectedPolicy.title}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span> {selectedPolicy.version}
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span> {selectedPolicy.owner}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {getStatusBadge(selectedPolicy.status)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-muted-foreground">{selectedPolicy.description}</p>
                </div>
                <div>
                  <span className="font-medium">Attachments:</span>
                  <div className="mt-1 space-y-1">
                    {selectedPolicy.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        {attachment}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : dialogMode === 'approve' && selectedPolicy ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Approval Workflow Progress</h4>
                  <div className="space-y-2">
                    {selectedPolicy.approvalWorkflow.map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{step.role}</span>
                          <p className="text-sm text-muted-foreground">{step.approver}</p>
                        </div>
                        <Badge variant={
                          step.status === 'approved' ? 'default' :
                          step.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="comments">Review Comments</Label>
                  <Textarea id="comments" placeholder="Enter your review comments..." />
                </div>
              </div>
            ) : null}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: `Policy ${dialogMode}d successfully`,
                  description: `The policy has been ${dialogMode}d.`
                });
                setIsDialogOpen(false);
              }}>
                {dialogMode === 'create' && 'Create Policy'}
                {dialogMode === 'edit' && 'Save Changes'}
                {dialogMode === 'review' && 'Close'}
                {dialogMode === 'approve' && 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyManagement;