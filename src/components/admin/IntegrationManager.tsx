import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Key, Plus, Eye, EyeOff, Trash2, Copy } from "lucide-react";
import {
  getApiKeys,
  createApiKey,
  deactivateApiKey,
  type ApiKey
} from "@/services/admin-service";

const IntegrationManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({
    keyName: "",
    keyType: "api_key",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const data = await getApiKeys();
      setApiKeys(data);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKey.keyName || !newKey.keyType) return;

    try {
      await createApiKey(newKey.keyName, newKey.keyType, newKey.description || undefined);
      await loadApiKeys();
      setNewKey({
        keyName: "",
        keyType: "api_key",
        description: ""
      });
      setShowAddForm(false);
      toast({
        title: "API Key Created",
        description: "New API key has been created successfully",
      });
    } catch (error) {
      console.error("Failed to create API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateKey = async (keyId: string) => {
    try {
      await deactivateApiKey(keyId);
      await loadApiKeys();
      toast({
        title: "API Key Deactivated",
        description: "API key has been deactivated successfully",
      });
    } catch (error) {
      console.error("Failed to deactivate API key:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate API key",
        variant: "destructive",
      });
    }
  };

  const handleCopyKey = (keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    toast({
      title: "Copied",
      description: "API key has been copied to clipboard",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + "..." + key.substring(key.length - 4);
  };

  if (loading) {
    return <div>Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys & Integration Setup
          </CardTitle>
          <CardDescription>
            Manage API keys for external integrations and webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Slack Integration"
                    value={newKey.keyName}
                    onChange={(e) => setNewKey(prev => ({ ...prev, keyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="key-type">Key Type</Label>
                  <Select
                    value={newKey.keyType}
                    onValueChange={(value) => setNewKey(prev => ({ ...prev, keyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="webhook">Webhook Token</SelectItem>
                      <SelectItem value="oauth">OAuth Token</SelectItem>
                      <SelectItem value="integration">Integration Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="key-description">Description</Label>
                <Input
                  id="key-description"
                  placeholder="Optional description"
                  value={newKey.description}
                  onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateKey}>Create Key</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Current API Keys</CardTitle>
          <CardDescription>
            Manage existing API keys and integration tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Key Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.key_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.key_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {showKeys[key.id] ? key.key_value : maskKey(key.key_value)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyKey(key.key_value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {key.last_used_at 
                      ? new Date(key.last_used_at).toLocaleDateString()
                      : "Never"
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivateKey(key.id)}
                      disabled={!key.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Configure webhook endpoints for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="incident-webhook">Incident Notifications Webhook</Label>
            <Input
              id="incident-webhook"
              placeholder="https://your-service.com/webhooks/incidents"
              defaultValue="https://hooks.slack.com/services/..."
            />
          </div>
          <div>
            <Label htmlFor="kri-webhook">KRI Breach Webhook</Label>
            <Input
              id="kri-webhook"
              placeholder="https://your-service.com/webhooks/kri-breach"
            />
          </div>
          <div>
            <Label htmlFor="compliance-webhook">Compliance Updates Webhook</Label>
            <Input
              id="compliance-webhook"
              placeholder="https://your-service.com/webhooks/compliance"
            />
          </div>
          <Button>Save Webhook Configuration</Button>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Overview of external integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {apiKeys.filter(k => k.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {apiKeys.filter(k => !k.last_used_at).length}
              </div>
              <div className="text-sm text-muted-foreground">Unused Keys</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {apiKeys.filter(k => !k.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">Inactive Keys</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationManager;
