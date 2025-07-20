import React from 'react';
import ComplianceDetailModal from '@/components/dashboard/ComplianceDetailModal';
import KRIDetailView from '@/components/dashboard/KRIDetailView';
import ControlDetailView from './ControlDetailView';
import IncidentDetailView from './IncidentDetailView';
import { DetailModalState } from '@/hooks/useDetailModal';

interface DetailViewRouterProps {
  modalState: DetailModalState;
  onClose: () => void;
}

const DetailViewRouter: React.FC<DetailViewRouterProps> = ({ modalState, onClose }) => {
  const { isOpen, entityType, entityId, data } = modalState;

  if (!isOpen || !entityType) return null;

  switch (entityType) {
    case 'compliance':
      return (
        <ComplianceDetailModal
          isOpen={isOpen}
          onClose={onClose}
          complianceType={data?.complianceType || 'OSFI E-21'}
          title={data?.title || 'Compliance'}
        />
      );

    case 'kri':
      return (
        <KRIDetailView
          isOpen={isOpen}
          onClose={onClose}
          kriName={data?.name || 'KRI'}
          kriData={data}
        />
      );

    case 'control':
      return (
        <ControlDetailView
          isOpen={isOpen}
          onClose={onClose}
          controlId={entityId}
          controlData={data}
        />
      );

    case 'incident':
      return (
        <IncidentDetailView
          isOpen={isOpen}
          onClose={onClose}
          incidentId={entityId}
          incidentData={data}
        />
      );

    default:
      return null;
  }
};

export default DetailViewRouter;