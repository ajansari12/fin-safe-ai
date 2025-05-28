
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GovernanceStructure } from "@/pages/governance/types";
import { Users, PlusCircle } from "lucide-react";

interface FrameworkStructuresTabProps {
  structures: GovernanceStructure[];
  onAddStructure: () => void;
}

export default function FrameworkStructuresTab({ structures, onAddStructure }: FrameworkStructuresTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Governance Structure</h2>
        <Button onClick={onAddStructure} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Structure
        </Button>
      </div>
      
      {structures.length === 0 ? (
        <div className="text-center p-8 border rounded border-dashed">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">No governance structure defined</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Define your governance structure, including committees and executive sponsors.
          </p>
          <Button onClick={onAddStructure}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Governance Structure
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {structures.map((structure) => (
            <Card key={structure.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{structure.name}</CardTitle>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                    {structure.type}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {structure.description || "No description provided"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
