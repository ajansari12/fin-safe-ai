
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GovernanceFramework, GovernanceStructure, GovernanceRole, GovernancePolicy } from "@/pages/governance/types";
import { Users, UserCheck, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

interface FrameworkOverviewProps {
  framework: GovernanceFramework;
  structures: GovernanceStructure[];
  roles: GovernanceRole[];
  policies: GovernancePolicy[];
}

export default function FrameworkOverview({ framework, structures, roles, policies }: FrameworkOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Framework Overview</CardTitle>
        <CardDescription>
          {framework.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-blue-100">
              <Users className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <div className="text-sm font-medium">Governance Structure</div>
              <div className="text-2xl font-bold">{structures.length}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-green-100">
              <UserCheck className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <div className="text-sm font-medium">Accountability Roles</div>
              <div className="text-2xl font-bold">{roles.length}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-purple-100">
              <FileText className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <div className="text-sm font-medium">Governance Policies</div>
              <div className="text-2xl font-bold">{policies.length}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-amber-100">
              <Clock className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-2xl font-bold capitalize">{framework.status}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
