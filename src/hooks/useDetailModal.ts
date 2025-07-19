
import { useState } from 'react';

export interface DetailModalState {
  isOpen: boolean;
  entityType: 'compliance' | 'kri' | 'control' | 'incident' | 'risk' | null;
  entityId: string | null;
  data: any;
}

export const useDetailModal = () => {
  const [modalState, setModalState] = useState<DetailModalState>({
    isOpen: false,
    entityType: null,
    entityId: null,
    data: null
  });

  const openModal = (
    entityType: DetailModalState['entityType'],
    entityId: string,
    data: any
  ) => {
    setModalState({
      isOpen: true,
      entityType,
      entityId,
      data
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      entityType: null,
      entityId: null,
      data: null
    });
  };

  return {
    modalState,
    openModal,
    closeModal
  };
};
