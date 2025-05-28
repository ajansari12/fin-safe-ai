import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getFrameworks,
  getStructuresByFrameworkId,
  getRolesByFrameworkId,
  getPoliciesByFrameworkId,
  deleteFramework,
} from "@/services/governance-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { GovernanceFramework } from "@/pages/governance/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BulkGovernanceOperations from "./BulkGovernanceOperations";
import ComplianceReportGenerator from "./ComplianceReportGenerator";

export default function FrameworksList() {
  const [frameworks, setFrameworks] = useState<GovernanceFramework[]>([]);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["frameworks"],
    queryFn: getFrameworks,
  });
  const [allPolicies, setAllPolicies] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  useEffect(() => {
    if (data) {
      setFrameworks(data);
    }
  }, [data]);

  useEffect(() => {
    const loadData = async () => {
      if (data) {
        const policies = await Promise.all(
          data.map(async (framework) => {
            const policies = await getPoliciesByFrameworkId(framework.id);
            return policies;
          })
        );
        const roles = await Promise.all(
          data.map(async (framework) => {
            const roles = await getRolesByFrameworkId(framework.id);
            return roles;
          })
        );
        const flattenedPolicies = policies.flat();
        const flattenedRoles = roles.flat();
        setAllPolicies(flattenedPolicies);
        setAllRoles(flattenedRoles);
      }
    };
    loadData();
  }, [data]);

  const handleDelete = async (id: string) => {
    try {
      await deleteFramework(id);
      toast.success("Framework deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting framework:", error);
      toast.error("Failed to delete framework");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced features section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BulkGovernanceOperations 
          policies={allPolicies}
          roles={allRoles}
          onRefresh={refetch}
        />
        <ComplianceReportGenerator />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Governance Frameworks</CardTitle>
          <CardDescription>
            A list of all governance frameworks in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {frameworks.map((framework) => (
                <TableRow key={framework.id}>
                  <TableCell>{framework.title}</TableCell>
                  <TableCell>{framework.status}</TableCell>
                  <TableCell className="text-right font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mr-2"
                      >
                        <Link to={`/governance-framework/${framework.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Manage
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete your framework and remove your data from our
                              servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(framework.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button asChild>
        <Link to="/governance-framework/new">
          <Plus className="h-4 w-4 mr-2" />
          Add Framework
        </Link>
      </Button>
    </div>
  );
}
