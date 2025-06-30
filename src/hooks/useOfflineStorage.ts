
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending sync count on load
    updatePendingSyncCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ResilientFI_Offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }, []);

  const saveOfflineData = useCallback(async (type: string, data: any): Promise<string> => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineItem: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      await new Promise((resolve, reject) => {
        const request = store.add(offlineItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      await updatePendingSyncCount();
      
      if (!isOnline) {
        toast.info(`${type} saved offline. Will sync when connection is restored.`);
      }

      return id;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      throw error;
    }
  }, [openDB, isOnline]);

  const getOfflineData = useCallback(async (type?: string): Promise<OfflineData[]> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      return new Promise((resolve, reject) => {
        const request = type ? store.index('type').getAll(IDBKeyRange.only(type)) : store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return [];
    }
  }, [openDB]);

  const markAsSynced = useCallback(async (id: string): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          store.put(data);
        }
      };

      await updatePendingSyncCount();
    } catch (error) {
      console.error('Failed to mark as synced:', error);
    }
  }, [openDB]);

  const deleteOfflineData = useCallback(async (id: string): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      await updatePendingSyncCount();
    } catch (error) {
      console.error('Failed to delete offline data:', error);
    }
  }, [openDB]);

  const updatePendingSyncCount = useCallback(async (): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      const count = await new Promise<number>((resolve, reject) => {
        const request = store.index('synced').count(IDBKeyRange.only(false));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      setPendingSyncCount(count);
    } catch (error) {
      console.error('Failed to update pending sync count:', error);
    }
  }, [openDB]);

  const syncOfflineData = useCallback(async (): Promise<void> => {
    if (!isOnline) return;

    try {
      const unsyncedData = await getOfflineData();
      const toSync = unsyncedData.filter(item => !item.synced);

      if (toSync.length === 0) return;

      toast.info(`Syncing ${toSync.length} offline items...`);

      for (const item of toSync) {
        try {
          await syncDataItem(item);
          await markAsSynced(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      toast.success(`Successfully synced ${toSync.length} items`);
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      toast.error('Failed to sync some offline data');
    }
  }, [isOnline, getOfflineData, markAsSynced]);

  const syncDataItem = async (item: OfflineData): Promise<void> => {
    // This would be implemented based on the specific API endpoints
    // For now, we'll just simulate the sync
    console.log('Syncing item:', item);
    
    // Example implementation for different data types
    switch (item.type) {
      case 'incident':
        // await supabase.from('incidents').insert(item.data);
        break;
      case 'risk_assessment':
        // await supabase.from('risk_assessments').insert(item.data);
        break;
      case 'control_test':
        // await supabase.from('control_tests').insert(item.data);
        break;
      default:
        console.warn('Unknown data type for sync:', item.type);
    }
  };

  const clearSyncedData = useCallback(async (): Promise<void> => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const syncedItems = await new Promise<OfflineData[]>((resolve, reject) => {
        const request = store.index('synced').getAll(IDBKeyRange.only(true));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Only delete items older than 7 days
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const toDelete = syncedItems.filter(item => item.timestamp < weekAgo);

      for (const item of toDelete) {
        await deleteOfflineData(item.id);
      }

      console.log(`Cleaned up ${toDelete.length} old synced items`);
    } catch (error) {
      console.error('Failed to clear synced data:', error);
    }
  }, [openDB, deleteOfflineData]);

  return {
    isOnline,
    pendingSyncCount,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
    clearSyncedData,
    markAsSynced,
    deleteOfflineData
  };
};
