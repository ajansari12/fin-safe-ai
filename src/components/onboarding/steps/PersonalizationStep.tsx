
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ArrowRight, ArrowLeft, Settings, Bell, Palette, Monitor } from "lucide-react";

interface PersonalizationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const PersonalizationStep: React.FC<PersonalizationStepProps> = ({ onNext, onPrevious }) => {
  const { completeStep } = useOnboarding();
  const [preferences, setPreferences] = useState({
    notifications: {
      riskAlerts: true,
      weeklyReports: true,
      systemUpdates: false,
      trainingReminders: true,
    },
    dashboard: {
      darkMode: false,
      compactView: false,
      showWelcomeWidget: true,
    },
    email: {
      dailyDigest: true,
      monthlyReport: true,
      emergencyAlerts: true,
    }
  });

  const handleContinue = async () => {
    await completeStep('personalization', 'Personalization', {
      preferences,
      completedAt: new Date().toISOString()
    });
    onNext();
  };

  const updateNotification = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updateDashboard = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      dashboard: {
        ...prev.dashboard,
        [key]: value
      }
    }));
  };

  const updateEmail = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Personalize Your Experience
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Configure your preferences to make the platform work best for you
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Notification Preferences */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="risk-alerts" className="text-sm">Risk Alerts</Label>
              <Switch
                id="risk-alerts"
                checked={preferences.notifications.riskAlerts}
                onCheckedChange={(checked) => updateNotification('riskAlerts', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-reports" className="text-sm">Weekly Reports</Label>
              <Switch
                id="weekly-reports"
                checked={preferences.notifications.weeklyReports}
                onCheckedChange={(checked) => updateNotification('weeklyReports', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="system-updates" className="text-sm">System Updates</Label>
              <Switch
                id="system-updates"
                checked={preferences.notifications.systemUpdates}
                onCheckedChange={(checked) => updateNotification('systemUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="training-reminders" className="text-sm">Training Reminders</Label>
              <Switch
                id="training-reminders"
                checked={preferences.notifications.trainingReminders}
                onCheckedChange={(checked) => updateNotification('trainingReminders', checked)}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Preferences */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Monitor className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Dashboard Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={preferences.dashboard.darkMode}
                onCheckedChange={(checked) => updateDashboard('darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-view" className="text-sm">Compact View</Label>
              <Switch
                id="compact-view"
                checked={preferences.dashboard.compactView}
                onCheckedChange={(checked) => updateDashboard('compactView', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="welcome-widget" className="text-sm">Show Welcome Widget</Label>
              <Switch
                id="welcome-widget"
                checked={preferences.dashboard.showWelcomeWidget}
                onCheckedChange={(checked) => updateDashboard('showWelcomeWidget', checked)}
              />
            </div>
          </div>
        </div>

        {/* Email Preferences */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Email Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-digest" className="text-sm">Daily Digest</Label>
              <Switch
                id="daily-digest"
                checked={preferences.email.dailyDigest}
                onCheckedChange={(checked) => updateEmail('dailyDigest', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="monthly-report" className="text-sm">Monthly Report</Label>
              <Switch
                id="monthly-report"
                checked={preferences.email.monthlyReport}
                onCheckedChange={(checked) => updateEmail('monthlyReport', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emergency-alerts" className="text-sm">Emergency Alerts</Label>
              <Switch
                id="emergency-alerts"
                checked={preferences.email.emergencyAlerts}
                onCheckedChange={(checked) => updateEmail('emergencyAlerts', checked)}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          <Button onClick={handleContinue}>
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
