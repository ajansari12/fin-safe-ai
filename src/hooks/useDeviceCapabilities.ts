
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface DeviceCapabilities {
  hasCamera: boolean;
  hasGeolocation: boolean;
  hasVibration: boolean;
  hasSpeechRecognition: boolean;
  hasNotifications: boolean;
  hasBluetooth: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasCamera: false,
    hasGeolocation: false,
    hasVibration: false,
    hasSpeechRecognition: false,
    hasNotifications: false,
    hasBluetooth: false,
    deviceType: 'desktop',
    orientation: 'landscape'
  });

  const [currentLocation, setCurrentLocation] = useState<GeolocationData | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    detectCapabilities();
    detectDeviceType();
    detectOrientation();

    window.addEventListener('orientationchange', detectOrientation);
    window.addEventListener('resize', detectDeviceType);

    return () => {
      window.removeEventListener('orientationchange', detectOrientation);
      window.removeEventListener('resize', detectDeviceType);
    };
  }, []);

  const detectCapabilities = async () => {
    const newCapabilities = { ...capabilities };

    // Check for camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        newCapabilities.hasCamera = true;
        stream.getTracks().forEach(track => track.stop());
      } catch {
        newCapabilities.hasCamera = false;
      }
    }

    // Check for geolocation
    newCapabilities.hasGeolocation = 'geolocation' in navigator;

    // Check for vibration
    newCapabilities.hasVibration = 'vibrate' in navigator;

    // Check for speech recognition
    newCapabilities.hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    // Check for notifications
    newCapabilities.hasNotifications = 'Notification' in window;

    // Check for Bluetooth
    newCapabilities.hasBluetooth = 'bluetooth' in navigator;

    setCapabilities(newCapabilities);
  };

  const detectDeviceType = () => {
    const width = window.innerWidth;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

    if (width < 768) {
      deviceType = 'mobile';
    } else if (width < 1024) {
      deviceType = 'tablet';
    }

    setCapabilities(prev => ({ ...prev, deviceType }));
  };

  const detectOrientation = () => {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    setCapabilities(prev => ({ ...prev, orientation }));
  };

  const getCurrentLocation = useCallback((): Promise<GeolocationData> => {
    return new Promise((resolve, reject) => {
      if (!capabilities.hasGeolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setCurrentLocation(locationData);
          resolve(locationData);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, [capabilities.hasGeolocation]);

  const watchLocation = useCallback((callback: (location: GeolocationData) => void) => {
    if (!capabilities.hasGeolocation) {
      toast.error('Geolocation not supported on this device');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        setCurrentLocation(locationData);
        callback(locationData);
      },
      (error) => {
        console.error('Geolocation watch error:', error);
        toast.error('Failed to track location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    return watchId;
  }, [capabilities.hasGeolocation]);

  const stopWatchingLocation = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  }, []);

  const capturePhoto = useCallback(async (): Promise<string> => {
    if (!capabilities.hasCamera) {
      throw new Error('Camera not available');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          if (context) {
            context.drawImage(video, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            
            resolve(dataURL);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
      });
    } catch (error) {
      console.error('Camera capture error:', error);
      throw error;
    }
  }, [capabilities.hasCamera]);

  const startVoiceRecognition = useCallback((
    onResult: (transcript: string) => void,
    onError?: (error: any) => void
  ) => {
    if (!capabilities.hasSpeechRecognition) {
      toast.error('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening...');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (onError) {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    return recognition;
  }, [capabilities.hasSpeechRecognition]);

  const stopVoiceRecognition = useCallback((recognition: any) => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (capabilities.hasVibration) {
      navigator.vibrate(pattern);
    }
  }, [capabilities.hasVibration]);

  const scanBarcode = useCallback(async (): Promise<string> => {
    if (!capabilities.hasCamera) {
      throw new Error('Camera not available for barcode scanning');
    }

    // This would integrate with a barcode scanning library like QuaggaJS or ZXing
    // For now, we'll simulate the functionality
    toast.info('Barcode scanning would be implemented here');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('SIMULATED_BARCODE_123456');
      }, 2000);
    });
  }, [capabilities.hasCamera]);

  return {
    capabilities,
    currentLocation,
    isListening,
    getCurrentLocation,
    watchLocation,
    stopWatchingLocation,
    capturePhoto,
    startVoiceRecognition,
    stopVoiceRecognition,
    vibrate,
    scanBarcode
  };
};
