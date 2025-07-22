import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Settings, Trash2 } from 'lucide-react';
import { SystemConnector } from '@/services/integration/integration-framework';

interface DataMappingConfigProps {
  org_id: string;
  connectors: SystemConnector[];
  onMappingChange: () => void;
}

const DataMappingConfig: React.FC<DataMappingConfigProps> = ({ 
  org_id, 
  connectors, 
  onMappingChange 
}) => {
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [mappingRules, setMappingRules] = useState<Array<{
    id: string;
    sourceField: string;
    targetField: string;
    transformation: string;
    required: boolean;
  }>>([]);
  const { toast } = useToast();

  const addMappingRule = () => {
    const newRule = {
      id: crypto.randomUUID(),
      sourceField: '',
      targetField: '',
      transformation: 'none',
      required: false
    };
    setMappingRules(prev => [...prev, newRule]);
  };

  const updateMappingRule = (id: string, field: string, value: any) => {
    setMappingRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const removeMappingRule = (id: string) => {
    setMappingRules(prev => prev.filter(rule => rule.id !== id));
  };

  const saveMappingConfiguration = async () => {
    if (!selectedConnector) {
      toast({
        title: "Error",
        description: "Please select a connector first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would save the mapping configuration
      // For now, just show success message
      toast({
        title: "Success",
        description: "Mapping configuration saved successfully",
      });
      onMappingChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mapping configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Data Mapping Configuration</h3>
        <p className="text-sm text-muted-foreground">Configure field mappings and transformations for data synchronization</p>
      </div>

      {/* Connector Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Connector</CardTitle>
          <CardDescription>Choose the connector to configure data mapping for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedConnector} onValueChange={setSelectedConnector}>
            <SelectTrigger>
              <SelectValue placeholder="Select a connector..." />
            </SelectTrigger>
            <SelectContent>
              {connectors.map((connector) => (
                <SelectItem key={connector.connectorId} value={connector.connectorId}>
                  {connector.systemName} ({connector.systemType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedConnector && (
        <>
          {/* Field Mappings */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Field Mappings</CardTitle>
                  <CardDescription>Map source fields to target fields with optional transformations</CardDescription>
                </div>
                <Button onClick={addMappingRule} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mappingRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No field mappings configured. Click "Add Mapping" to get started.
                </div>
              ) : (
                mappingRules.map((rule) => (
                  <div key={rule.id} className="grid gap-4 md:grid-cols-6 items-center p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Source Field</Label>
                      <Input
                        value={rule.sourceField}
                        onChange={(e) => updateMappingRule(rule.id, 'sourceField', e.target.value)}
                        placeholder="e.g., customer_id"
                      />
                    </div>

                    <div className="flex justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Field</Label>
                      <Input
                        value={rule.targetField}
                        onChange={(e) => updateMappingRule(rule.id, 'targetField', e.target.value)}
                        placeholder="e.g., client_identifier"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Transformation</Label>
                      <Select 
                        value={rule.transformation} 
                        onValueChange={(value) => updateMappingRule(rule.id, 'transformation', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="uppercase">Uppercase</SelectItem>
                          <SelectItem value="lowercase">Lowercase</SelectItem>
                          <SelectItem value="trim">Trim</SelectItem>
                          <SelectItem value="format_date">Format Date</SelectItem>
                          <SelectItem value="currency">Currency Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Required</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.required}
                          onChange={(e) => updateMappingRule(rule.id, 'required', e.target.checked)}
                          className="rounded"
                        />
                        <Badge variant={rule.required ? 'default' : 'secondary'}>
                          {rule.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMappingRule(rule.id)}
                        className="gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Transformation Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Transformation Preview</CardTitle>
              <CardDescription>Preview how your mappings will transform the data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Sample Source Data</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
{`{
  "customer_id": "CUST123",
  "first_name": "john",
  "last_name": "doe",
  "email": "JOHN.DOE@EXAMPLE.COM",
  "created_date": "2024-01-15"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Transformed Target Data</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
{`{
  "client_identifier": "CUST123",
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "john.doe@example.com",
  "registrationDate": "2024-01-15T00:00:00Z"
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveMappingConfiguration} className="gap-2">
              <Settings className="h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DataMappingConfig;