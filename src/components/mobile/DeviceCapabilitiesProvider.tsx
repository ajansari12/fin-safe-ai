
import React, { createContext, useContext } from 'react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

const DeviceCapabilitiesContext = createContext<ReturnType<typeof useDeviceCapabilities> | null>(null);

export const useDeviceCapabilitiesContext = () => {
  const context = useContext(DeviceCapabilitiesContext);
  if (!context) {
    throw new Error('useDeviceCapabilitiesContext must be used within DeviceCapabilitiesProvider');
  }
  return context;
};

export const DeviceCapabilitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceCapabilities = useDeviceCapabilities();

  return (
    <DeviceCapabilitiesContext.Provider value={deviceCapabilities}>
      {children}
    </DeviceCapabilitiesContext.Provider>
  );
};
