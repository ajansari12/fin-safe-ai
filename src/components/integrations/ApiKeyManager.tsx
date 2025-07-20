
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Key, Plus, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { apiKeyService, ApiKey } from "@/services/integrations/api-key-service";

const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({
    name: "",
    type: "api_key",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const data = await apiKeyService.getApiKeys();
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
    if (!newKey.name || !newKey.type) return;

    try {
      await apiKeyService.generateApiKey(
        newKey.name, 
        newKey.type, 
        newKey.description || undefined
      );
      
      await loadApiKeys();
      setNewKey({ name: "", type: "api_key", description: "" });
      setShowAddForm(false);
      
      toast({
        title: "API Key Created",
        description: "New API key has been generated successfully",
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
      await apiKeyService.deactivateApiKey(keyId);
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

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await apiKeyService.deleteApiKey(keyId);
      await loadApiKeys();
      
      toast({
        title: "API Key Deleted",
        description: "API key has been deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
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
    return key.substring(0, 12) + "..." + key.substring(key.length - 8);
  };

  const keyTypes = apiKeyService.getApiKeyTypes();

  if (loading) {
    return <div>Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Generate and manage API keys for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Mobile App API Key"
                    value={newKey.name}
                    onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="key-type">Key Type</Label>
                  <Select
                    value={newKey.type}
                    onValueChange={(value) => setNewKey(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {keyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="key-description">Description</Label>
                <Textarea
                  id="key-description"
                  placeholder="Optional description of what this key will be used for"
                  value={newKey.description}
                  onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateKey}>Generate Key</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current API Keys</CardTitle>
          <CardDescription>
            Manage existing API keys and access tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No API keys generated yet.</p>
              <p className="text-sm mt-2">Click "Generate API Key" to create your first key.</p>
            </div>
          ) : (
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
                    <TableCell>
                      <div>
                        <div className="font-medium">{key.key_name}</div>
                        {key.description && (
                          <div className="text-xs text-muted-foreground">{key.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {key.key_type.replace('_', ' ')}
                      </Badge>
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateKey(key.id)}
                          disabled={!key.is_active}
                          title="Deactivate Key"
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                          title="Delete Key"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
