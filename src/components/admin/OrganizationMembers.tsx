import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUserProfile } from '@/lib/supabase-utils';
import { UserPlus, Mail, MoreHorizontal, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface OrganizationMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  last_login?: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_by_name: string;
  expires_at: string;
  created_at: string;
}

const OrganizationMembers: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('');

  // Fetch current organization members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['organization-members'],
    queryFn: async () => {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          created_at,
          user_roles!inner(role, created_at)
        `)
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      return data.map(member => ({
        id: member.id,
        full_name: member.full_name || 'Unknown User',
        email: member.email || '',
        role: member.user_roles?.[0]?.role || 'none',
        created_at: member.user_roles?.[0]?.created_at || member.created_at,
      })) as OrganizationMember[];
    }
  });

  // Fetch pending invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: async () => {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('org_id', profile.organization_id)
        .in('status', ['pending']);

      if (error) throw error;
      return data as PendingInvitation[];
    }
  });

  // Send invitation mutation
  const sendInviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // Generate invitation token
      const { data: tokenData, error: tokenError } = await supabase.rpc('generate_invitation_token');
      if (tokenError) throw tokenError;

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          org_id: profile.organization_id,
          email,
          role,
          invitation_token: tokenData,
          invited_by: profile.id,
          invited_by_name: profile.full_name
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email,
          role,
          invitation_token: tokenData,
          invited_by_name: profile.full_name,
          organization_name: 'Your Organization' // Could be fetched from org table
        }
      });

      if (emailError) throw emailError;

      return invitation;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "The user invitation has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to send invitation',
        variant: "destructive",
      });
    }
  });

  // Resend invitation mutation
  const resendInviteMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error('Invitation not found');

      const { error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: invitation.email,
          role: invitation.role,
          invitation_token: invitation.id, // Using invitation ID as token for simplicity
          invited_by_name: invitation.invited_by_name,
          organization_name: 'Your Organization',
          isResend: true
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Resent",
        description: "The invitation has been resent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to resend invitation',
        variant: "destructive",
      });
    }
  });

  // Cancel invitation mutation
  const cancelInviteMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || 'Failed to cancel invitation',
        variant: "destructive",
      });
    }
  });

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and role.",
        variant: "destructive",
      });
      return;
    }

    sendInviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'analyst': return 'default';
      case 'reviewer': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Organization Members
            </CardTitle>
            <CardDescription>
              Manage current members and invite new users to your organization
            </CardDescription>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation email to add a new member to your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvite} disabled={sendInviteMutation.isPending}>
                    {sendInviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading members...
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="h-8 w-8 text-muted-foreground" />
                        <p>No members found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Users who have been invited but haven't accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitationsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading invitations...
                    </TableCell>
                  </TableRow>
                ) : invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Mail className="h-8 w-8 text-muted-foreground" />
                        <p>No pending invitations</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map(invitation => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(invitation.role)}>
                          {invitation.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invitation.invited_by_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invitation.status)}
                          <span className="capitalize">{invitation.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => resendInviteMutation.mutate(invitation.id)}
                              disabled={resendInviteMutation.isPending}
                            >
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => cancelInviteMutation.mutate(invitation.id)}
                              disabled={cancelInviteMutation.isPending}
                            >
                              Cancel Invitation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationMembers;