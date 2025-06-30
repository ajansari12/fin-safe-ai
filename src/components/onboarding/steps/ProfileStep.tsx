
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, ArrowLeft, User } from "lucide-react";

interface ProfileStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({ onNext, onPrevious }) => {
  const { completeStep } = useOnboarding();
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    department: '',
    jobTitle: '',
    phoneNumber: '',
    timezone: 'EST',
    preferredLanguage: 'English',
  });

  const handleContinue = async () => {
    try {
      // Update profile with additional information
      await updateProfile({
        ...profile,
        full_name: profile?.full_name || '',
      });

      await completeStep('profile', 'Complete Profile', {
        ...formData,
        completedAt: new Date().toISOString()
      });
      
      onNext();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Complete Your Profile
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Help us personalize your experience with some additional details
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g., Risk Management"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Risk Analyst"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              placeholder="+1 (555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EST">Eastern (EST)</SelectItem>
                <SelectItem value="CST">Central (CST)</SelectItem>
                <SelectItem value="MST">Mountain (MST)</SelectItem>
                <SelectItem value="PST">Pacific (PST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
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
