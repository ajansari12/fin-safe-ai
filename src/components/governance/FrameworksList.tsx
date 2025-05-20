
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFrameworks } from "@/services/governance-service";
import { GovernanceFramework } from "@/pages/governance/types";
import { PlusCircle, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FrameworkForm from "./FrameworkForm";

export default function FrameworksList() {
  const navigate = useNavigate();
  const [frameworks, setFrameworks] = useState<GovernanceFramework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadFrameworks();
  }, []);

  async function loadFrameworks() {
    setIsLoading(true);
    try {
      const data = await getFrameworks();
      setFrameworks(data);
    } catch (error) {
      console.error("Error loading frameworks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFrameworkCreated(framework: GovernanceFramework) {
    setCreateDialogOpen(false);
    setFrameworks((prev) => [framework, ...prev]);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Governance Frameworks</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Framework
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm animate-pulse">
              <CardHeader className="bg-gray-100 h-24"></CardHeader>
              <CardContent className="pt-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : frameworks.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 mb-4 mx-auto text-gray-400" />
              <h3 className="text-xl font-medium mb-2">No frameworks yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first governance framework to start documenting your operational resilience governance structure.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Framework
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((framework) => (
            <Card key={framework.id} className="shadow-sm hover:shadow transition-shadow cursor-pointer" onClick={() => navigate(`/governance-framework/${framework.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{framework.title}</CardTitle>
                    <CardDescription>Version {framework.version}</CardDescription>
                  </div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                    {framework.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">
                  {framework.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="text-xs text-gray-500 flex justify-between items-center">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {format(new Date(framework.updated_at), 'MMM d, yyyy')}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Framework</DialogTitle>
          </DialogHeader>
          <FrameworkForm onSuccess={handleFrameworkCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
