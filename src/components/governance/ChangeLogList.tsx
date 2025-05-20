
import { useState, useEffect } from "react";
import { getChangeLogsByFrameworkId } from "@/services/governance-service";
import { GovernanceChangeLog } from "@/pages/governance/types";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChangeLogListProps {
  frameworkId: string;
}

export default function ChangeLogList({ frameworkId }: ChangeLogListProps) {
  const [logs, setLogs] = useState<GovernanceChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChangeLogs();
  }, [frameworkId]);

  async function loadChangeLogs() {
    setIsLoading(true);
    try {
      const data = await getChangeLogsByFrameworkId(frameworkId);
      setLogs(data);
    } catch (error) {
      console.error("Error loading change logs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function getChangeTypeDisplay(type: string) {
    switch (type) {
      case 'created':
        return { label: 'Created', color: 'bg-green-100 text-green-800' };
      case 'updated':
        return { label: 'Updated', color: 'bg-blue-100 text-blue-800' };
      case 'reviewed':
        return { label: 'Reviewed', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Change Log</h3>
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center p-4 border rounded border-dashed">
          <p className="text-gray-500">No changes have been logged yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] border rounded p-2">
          <div className="space-y-2">
            {logs.map((log) => {
              const changeType = getChangeTypeDisplay(log.change_type);
              return (
                <div key={log.id} className="p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${changeType.color}`}>
                        {changeType.label}
                      </span>
                      {log.new_version && log.previous_version && (
                        <span className="text-xs text-gray-500 ml-2">
                          v{log.previous_version} → v{log.new_version}
                        </span>
                      )}
                      {log.new_version && !log.previous_version && (
                        <span className="text-xs text-gray-500 ml-2">
                          v{log.new_version}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm">
                    {log.description || "No description provided"}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
