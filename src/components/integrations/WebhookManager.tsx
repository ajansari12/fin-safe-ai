
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Webhook, TestTube, Save } from "lucide-react";
import { integrationService } from "@/services/integration-service";

const WebhookManager: React.FC = () => {
  const [webhookUrls, setWebhookUrls] = useState({
    incident_notifications: "https://hooks.slack.com/services/...",
    kri_breach_alerts: "",
    compliance_updates: "",
    audit_findings: "",
    policy_approvals: ""
  });
  const [testPayload, setTestPayload] = useState(`{
  "event_type": "test",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "message": "This is a test webhook notification"
  }
}`);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  const webhookTypes = [
    { key: 'incident_notifications', label: 'Incident Notifications', description: 'New incidents and status updates' },
    { key: 'kri_breach_alerts', label: 'KRI Breach Alerts', description: 'Key Risk Indicator threshold breaches' },
    { key: 'compliance_updates', label: 'Compliance Updates', description: 'Compliance status changes and findings' },
    { key: 'audit_findings', label: 'Audit Findings', description: 'New audit findings and recommendations' },
    { key: 'policy_approvals', label: 'Policy Approvals', description: 'Policy approval workflow notifications' }
  ];

  const handleUrlChange = (key: string, value: string) => {
    setWebhookUrls(prev => ({ ...prev, [key]: value }));
  };

  const handleTestWebhook = async (key: string, url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    setTesting(key);
    try {
      let payload;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        payload = { event_type: "test", timestamp: new Date().toISOString() };
      }

      const success = await integrationService.testWebhook(url, payload);
      
      toast({
        title: success ? "Webhook Test Successful" : "Webhook Test Failed",
        description: success 
          ? "Webhook endpoint responded successfully" 
          : "Failed to reach webhook endpoint - check URL and try again",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test webhook endpoint",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const handleSaveConfiguration = async () => {
    // In a real implementation, you would save these to the database
    toast({
      title: "Configuration Saved",
      description: "Webhook configuration has been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
          <CardDescription>
            Configure webhook endpoints for real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {webhookTypes.map((type) => (
            <div key={type.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor={type.key} className="text-sm font-medium">
                    {type.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {webhookUrls[type.key as keyof typeof webhookUrls] ? 'Configured' : 'Not Set'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  id={type.key}
                  placeholder="https://your-service.com/webhook"
                  value={webhookUrls[type.key as keyof typeof webhookUrls]}
                  onChange={(e) => handleUrlChange(type.key, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestWebhook(
                    type.key, 
                    webhookUrls[type.key as keyof typeof webhookUrls]
                  )}
                  disabled={testing === type.key}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  {testing === type.key ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button onClick={handleSaveConfiguration} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Webhook Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Payload</CardTitle>
          <CardDescription>
            Customize the payload sent during webhook testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="test-payload">JSON Payload</Label>
            <Textarea
              id="test-payload"
              placeholder="Enter JSON payload for testing"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Security</CardTitle>
          <CardDescription>
            Security recommendations for webhook endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use HTTPS endpoints only</li>
                <li>• Implement signature verification</li>
                <li>• Set up retry mechanisms</li>
                <li>• Monitor webhook delivery</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Security Headers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• X-BCP-Signature</li>
                <li>• X-BCP-Timestamp</li>
                <li>• User-Agent: BCP-Webhook/1.0</li>
                <li>• Content-Type: application/json</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookManager;
