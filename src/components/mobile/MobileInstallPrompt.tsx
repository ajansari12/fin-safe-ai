
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  Bell, 
  Camera, 
  MapPin,
  X
} from 'lucide-react';

interface MobileInstallPromptProps {
  onDismiss: () => void;
}

export const MobileInstallPrompt: React.FC<MobileInstallPromptProps> = ({ onDismiss }) => {
  const { canInstall, showInstallPrompt } = usePWA();

  if (!canInstall) return null;

  const features = [
    { icon: Wifi, text: 'Work offline anywhere' },
    { icon: Bell, text: 'Get instant notifications' },
    { icon: Camera, text: 'Quick photo capture' },
    { icon: MapPin, text: 'Location-based features' }
  ];

  const handleInstall = async () => {
    await showInstallPrompt();
    onDismiss();
  };

  return (
    <Card className="m-4 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="relative pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute right-2 top-2 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Install ResilientFI</CardTitle>
            <p className="text-sm text-muted-foreground">
              Get the full mobile experience
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">{feature.text}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Native-like experience
          </Badge>
          <Badge variant="secondary" className="text-xs">
            No app store needed
          </Badge>
        </div>

        <Button 
          onClick={handleInstall}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Installs directly from your browser - no app store required
        </p>
      </CardContent>
    </Card>
  );
};
