
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeviceCapabilitiesContext } from './DeviceCapabilitiesProvider';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Download,
  ScanLine,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface MobileCameraProps {
  onPhotoCapture: (dataUrl: string, metadata?: any) => void;
  onBarcodeScanned?: (code: string) => void;
  mode?: 'photo' | 'barcode';
  onClose: () => void;
}

export const MobileCamera: React.FC<MobileCameraProps> = ({
  onPhotoCapture,
  onBarcodeScanned,
  mode = 'photo',
  onClose
}) => {
  const { capabilities, capturePhoto, scanBarcode, getCurrentLocation } = useDeviceCapabilitiesContext();
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  const handleCapture = async () => {
    if (!capabilities.hasCamera) {
      toast.error('Camera not available on this device');
      return;
    }

    setIsCapturing(true);
    try {
      if (mode === 'photo') {
        const photoData = await capturePhoto();
        
        // Get location metadata if available
        let metadata = {};
        if (capabilities.hasGeolocation) {
          try {
            const location = await getCurrentLocation();
            metadata = {
              location,
              timestamp: Date.now(),
              device: navigator.userAgent
            };
          } catch (error) {
            console.log('Could not get location for photo metadata');
          }
        }

        setLastPhoto(photoData);
        onPhotoCapture(photoData, metadata);
        toast.success('Photo captured successfully');
      } else if (mode === 'barcode' && onBarcodeScanned) {
        const barcodeData = await scanBarcode();
        onBarcodeScanned(barcodeData);
        toast.success('Barcode scanned successfully');
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadPhoto = () => {
    if (lastPhoto) {
      const link = document.createElement('a');
      link.download = `resilientfi-photo-${Date.now()}.jpg`;
      link.href = lastPhoto;
      link.click();
    }
  };

  if (!capabilities.hasCamera) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Camera access is not available on this device or browser.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mode === 'photo' ? (
            <Camera className="h-6 w-6" />
          ) : (
            <ScanLine className="h-6 w-6" />
          )}
          <div>
            <h2 className="font-semibold">
              {mode === 'photo' ? 'Capture Photo' : 'Scan Barcode'}
            </h2>
            <p className="text-sm text-gray-300">
              {mode === 'photo' ? 'Take a photo for evidence' : 'Scan asset barcode'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-4">
            {mode === 'photo' ? (
              <Camera className="h-24 w-24 mx-auto mb-4 opacity-50" />
            ) : (
              <ScanLine className="h-24 w-24 mx-auto mb-4 opacity-50" />
            )}
          </div>
          <p className="text-lg mb-2">
            {mode === 'photo' ? 'Camera Ready' : 'Barcode Scanner Ready'}
          </p>
          <p className="text-sm text-gray-300 mb-6">
            {mode === 'photo' 
              ? 'Tap the capture button to take a photo'
              : 'Tap the scan button to scan a barcode'
            }
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleCapture}
              disabled={isCapturing}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCapturing ? (
                <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
              ) : mode === 'photo' ? (
                <Camera className="h-5 w-5 mr-2" />
              ) : (
                <ScanLine className="h-5 w-5 mr-2" />
              )}
              {isCapturing ? 'Processing...' : mode === 'photo' ? 'Capture' : 'Scan'}
            </Button>
          </div>
        </div>

        {/* Location indicator */}
        {capabilities.hasGeolocation && mode === 'photo' && (
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-black/50 text-white border-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              GPS
            </Badge>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {lastPhoto && mode === 'photo' && (
        <div className="bg-black/80 p-4 text-white">
          <div className="flex items-center gap-3">
            <img 
              src={lastPhoto} 
              alt="Last captured" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Photo captured</p>
              <p className="text-xs text-gray-300">Ready for upload</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPhoto}
              className="text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
