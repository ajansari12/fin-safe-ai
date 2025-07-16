import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Star, 
  Layout, 
  Palette,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardPreferences {
  defaultTab: string;
  enableAutoRefresh: boolean;
  autoRefreshInterval: number;
  visibleWidgets: string[];
  compactMode: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  priority: number;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  defaultTab: 'executive',
  enableAutoRefresh: true,
  autoRefreshInterval: 30000,
  visibleWidgets: ['health-check', 'insights', 'compliance'],
  compactMode: false,
  theme: 'auto'
};

const AVAILABLE_WIDGETS: WidgetConfig[] = [
  {
    id: 'health-check',
    name: 'Health Check',
    description: 'System health monitoring',
    category: 'monitoring',
    enabled: true,
    priority: 1
  },
  {
    id: 'insights',
    name: 'AI Insights',
    description: 'AI-generated analytics insights',
    category: 'analytics',
    enabled: true,
    priority: 2
  },
  {
    id: 'compliance',
    name: 'OSFI Compliance',
    description: 'Regulatory compliance status',
    category: 'compliance',
    enabled: true,
    priority: 3
  },
  {
    id: 'connection-diagnostics',
    name: 'Connection Diagnostics',
    description: 'Network connectivity monitoring',
    category: 'monitoring',
    enabled: false,
    priority: 4
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'System performance indicators',
    category: 'monitoring',
    enabled: false,
    priority: 5
  }
];

interface DashboardPersonalizationProps {
  userRole?: string;
  settings?: any;
  onSettingsChange?: (settings: any) => void;
  onClose?: () => void;
}

export const DashboardPersonalization: React.FC<DashboardPersonalizationProps> = ({
  userRole,
  settings: externalSettings,
  onSettingsChange,
  onClose
}) => {
  const { profile } = useAuth();
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(AVAILABLE_WIDGETS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, [profile?.id]);

  const loadUserPreferences = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', profile.id)
        .eq('preference_type', 'dashboard')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      toast.error('Failed to load dashboard preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!profile?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          preference_type: 'dashboard',
          preferences: preferences
        });

      if (error) throw error;

      toast.success('Dashboard preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save dashboard preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );

    setPreferences(prev => ({
      ...prev,
      visibleWidgets: widgets
        .map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w)
        .filter(w => w.enabled)
        .map(w => w.id)
    }));
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setWidgets(AVAILABLE_WIDGETS);
    toast.info('Dashboard preferences reset to defaults');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Dashboard Personalization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto-refresh dashboard</Label>
                <Switch
                  id="auto-refresh"
                  checked={preferences.enableAutoRefresh}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, enableAutoRefresh: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Compact mode</Label>
                <Switch
                  id="compact-mode"
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, compactMode: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Default dashboard tab</Label>
                <div className="flex gap-2">
                  {['executive', 'operational', 'controls', 'advanced'].map((tab) => (
                    <Button
                      key={tab}
                      variant={preferences.defaultTab === tab ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, defaultTab: tab }))}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="widgets" className="space-y-4">
            <div className="grid gap-3">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget(widget.id)}
                    >
                      {widget.enabled ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <div>
                      <p className="font-medium">{widget.name}</p>
                      <p className="text-sm text-muted-foreground">{widget.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{widget.category}</Badge>
                    <Badge variant="outline">Priority {widget.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme preference</Label>
                <div className="flex gap-2">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <Button
                      key={theme}
                      variant={preferences.theme === theme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, theme: theme as any }))}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={savePreferences} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};