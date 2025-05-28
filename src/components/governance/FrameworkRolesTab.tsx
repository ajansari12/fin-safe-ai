
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GovernanceRole } from "@/pages/governance/types";
import { UserCheck, PlusCircle } from "lucide-react";

interface FrameworkRolesTabProps {
  roles: GovernanceRole[];
  onAddRole: () => void;
}

export default function FrameworkRolesTab({ roles, onAddRole }: FrameworkRolesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Accountability Roles</h2>
        <Button onClick={onAddRole} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>
      
      {roles.length === 0 ? (
        <div className="text-center p-8 border rounded border-dashed">
          <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">No accountability roles defined</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Define key roles and responsibilities for operational resilience governance.
          </p>
          <Button onClick={onAddRole}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Accountability Role
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{role.title}</CardTitle>
                {role.assigned_to && (
                  <CardDescription>Assigned to: {role.assigned_to}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {role.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-gray-700">{role.description}</p>
                  </div>
                )}
                {role.responsibilities && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Key Responsibilities</h4>
                    <p className="text-sm text-gray-700">{role.responsibilities}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
