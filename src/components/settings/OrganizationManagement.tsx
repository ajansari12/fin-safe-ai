
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { Building, Users, Shield, Settings, Mail, Phone, MapPin, Globe } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  settings: {
    risk_appetite_framework?: string;
    regulatory_requirements?: string[];
    business_continuity_rto?: number;
    compliance_frameworks?: string[];
  };
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  last_login?: string;
  status: 'active' | 'inactive' | 'pending';
}

const OrganizationManagement: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrganizationData();
  }, [profile]);

  const loadOrganizationData = async () => {
    if (!profile?.organization_id) {
      // Mock organization data
      setOrganization({
        id: '1',
        name: 'Sample Organization',
        description: 'A sample organization for demonstration purposes',
        industry: 'technology',
        size: 'medium',
        website: 'https://example.com',
        phone: '+1 (555) 123-4567',
        email: 'contact@example.com',
        address: '123 Business St, City, State 12345',
        settings: {
          risk_appetite_framework: 'iso_31000',
          regulatory_requirements: ['SOX', 'GDPR'],
          business_continuity_rto: 24,
          compliance_frameworks: ['ISO 27001', 'SOC 2']
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      });

      // Mock team members
      setTeamMembers([
        {
          id: '1',
          full_name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'admin',
          department: 'IT',
          last_login: '2024-01-15T10:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          full_name: 'Jane Doe',
          email: 'jane.doe@example.com',
          role: 'manager',
          department: 'Risk Management',
          last_login: '2024-01-14T14:20:00Z',
          status: 'active'
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Try to load from organizations table
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();

      if (orgError) throw orgError;

      // Convert organizations table data to Organization interface
      if (orgData) {
        setOrganization({
          ...orgData,
          settings: {
            risk_appetite_framework: 'iso_31000',
            regulatory_requirements: orgData.regulatory_guidelines || [],
            business_continuity_rto: 24,
            compliance_frameworks: []
          }
        });
      }

      // Load team members from profiles
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, full_name, role, organization_id, created_at, updated_at')
        .eq('organization_id', profile.organization_id);

      if (membersError) throw membersError;

      // Convert profiles data to TeamMember interface
      const teamMembersData = (membersData || []).map(member => ({
        id: member.id,
        full_name: member.full_name || 'Unknown User',
        email: `${member.full_name?.toLowerCase().replace(' ', '.')}@company.com` || 'user@company.com',
        role: member.role || 'user',
        department: 'Unknown',
        last_login: member.updated_at,
        status: 'active' as const
      }));

      setTeamMembers(teamMembersData);
    } catch (error) {
      console.error('Error loading organization data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;

    setSaving(true);
    try {
      if (profile?.organization_id) {
        const { error } = await supabase
          .from('organizations')
          .update({
            name: updates.name,
            description: updates.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', organization.id);

        if (error) throw error;
      }

      setOrganization(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Organization Updated",
        description: "Organization details have been saved successfully"
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const inviteTeamMember = async (email: string, role: string, department?: string) => {
    if (!organization) return;

    try {
      // Mock invitation - in real implementation, would send an invitation email
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email}`
      });

      // Add to mock team members
      const newMember: TeamMember = {
        id: `temp-${Date.now()}`,
        full_name: email.split('@')[0],
        email,
        role,
        department,
        status: 'pending'
      };

      setTeamMembers(prev => [...prev, newMember]);
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      if (profile?.organization_id) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', memberId);

        if (error) throw error;
      }

      setTeamMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));

      toast({
        title: "Role Updated",
        description: "Team member role has been updated"
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'analyst': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading organization data...</div>;
  }

  if (!organization) {
    return <div>No organization data found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Profile
          </CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={organization.name}
                onChange={(e) => setOrganization(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={organization.industry || ''} 
                onValueChange={(value) => setOrganization(prev => prev ? { ...prev, industry: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial_services">Financial Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={organization.description || ''}
              onChange={(e) => setOrganization(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="Brief description of your organization"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex">
                <Globe className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                <Input
                  id="website"
                  value={organization.website || ''}
                  onChange={(e) => setOrganization(prev => prev ? { ...prev, website: e.target.value } : null)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex">
                <Phone className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={organization.phone || ''}
                  onChange={(e) => setOrganization(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="flex">
              <MapPin className="h-4 w-4 mt-3 mr-2 text-muted-foreground" />
              <Textarea
                id="address"
                value={organization.address || ''}
                onChange={(e) => setOrganization(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="Organization address"
              />
            </div>
          </div>

          <Button onClick={() => updateOrganization(organization)} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>
            Manage team members, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Team Members ({teamMembers.length})</h3>
            <Button size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.department && (
                      <p className="text-xs text-muted-foreground">{member.department}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>
                  <Badge variant={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                  <Select
                    value={member.role}
                    onValueChange={(newRole) => updateMemberRole(member.id, newRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Configure organization-wide settings and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Risk Appetite Framework</Label>
              <Select 
                value={organization.settings?.risk_appetite_framework || ''} 
                onValueChange={(value) => setOrganization(prev => prev ? {
                  ...prev,
                  settings: { ...prev.settings, risk_appetite_framework: value }
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iso_31000">ISO 31000</SelectItem>
                  <SelectItem value="coso_erm">COSO ERM</SelectItem>
                  <SelectItem value="basel_iii">Basel III</SelectItem>
                  <SelectItem value="custom">Custom Framework</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Business Continuity RTO (hours)</Label>
              <Input
                type="number"
                value={organization.settings?.business_continuity_rto || ''}
                onChange={(e) => setOrganization(prev => prev ? {
                  ...prev,
                  settings: { ...prev.settings, business_continuity_rto: parseInt(e.target.value) }
                } : null)}
                placeholder="24"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationManagement;
