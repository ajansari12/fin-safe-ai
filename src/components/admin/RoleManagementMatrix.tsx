
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedAdminService, UserRole } from "@/services/enhanced-admin-service";

const RoleManagementMatrix: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await enhancedAdminService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast({ title: "Error", description: "Failed to load roles", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (formData: FormData) => {
    try {
      const roleName = formData.get('role_name') as string;
      const description = formData.get('description') as string;
      const permissions = enhancedAdminService.getAvailablePermissions().filter(
        permission => formData.get(`permission_${permission}`) === 'on'
      );

      await enhancedAdminService.createRole({
        role_name: roleName,
        permissions,
        description
      });

      toast({ title: "Success", description: "Role created successfully" });
      setIsCreateDialogOpen(false);
      loadRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast({ title: "Error", description: "Failed to create role", variant: "destructive" });
    }
  };

  const handleUpdateRole = async (formData: FormData) => {
    if (!selectedRole) return;

    try {
      const roleName = formData.get('role_name') as string;
      const description = formData.get('description') as string;
      const isActive = formData.get('is_active') === 'on';
      const permissions = enhancedAdminService.getAvailablePermissions().filter(
        permission => formData.get(`permission_${permission}`) === 'on'
      );

      await enhancedAdminService.updateRole(selectedRole.id, {
        role_name: roleName,
        permissions,
        description,
        is_active: isActive
      });

      toast({ title: "Success", description: "Role updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  const handleDeleteRole = async (role: UserRole) => {
    if (!confirm(`Are you sure you want to delete the role "${role.role_name}"?`)) return;

    try {
      await enhancedAdminService.deleteRole(role.id, role.role_name);
      toast({ title: "Success", description: "Role deleted successfully" });
      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({ title: "Error", description: "Failed to delete role", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading roles...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role Management Matrix</CardTitle>
            <CardDescription>Create and manage user roles with granular permissions</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form action={handleCreateRole}>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>Define a new role with specific permissions</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role_name">Role Name</Label>
                    <Input id="role_name" name="role_name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {enhancedAdminService.getAvailablePermissions().map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox id={`permission_${permission}`} name={`permission_${permission}`} />
                          <Label htmlFor={`permission_${permission}`} className="text-sm">
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Role</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.role_name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.is_active ? "default" : "secondary"}>
                    {role.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Role Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedRole && (
              <form action={handleUpdateRole}>
                <DialogHeader>
                  <DialogTitle>Edit Role</DialogTitle>
                  <DialogDescription>Update role permissions and settings</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_role_name">Role Name</Label>
                    <Input id="edit_role_name" name="role_name" defaultValue={selectedRole.role_name} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_description">Description</Label>
                    <Textarea id="edit_description" name="description" defaultValue={selectedRole.description || ''} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_active" name="is_active" defaultChecked={selectedRole.is_active} />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {enhancedAdminService.getAvailablePermissions().map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit_permission_${permission}`} 
                            name={`permission_${permission}`}
                            defaultChecked={selectedRole.permissions.includes(permission)}
                          />
                          <Label htmlFor={`edit_permission_${permission}`} className="text-sm">
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Update Role</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RoleManagementMatrix;
