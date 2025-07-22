
import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default function NotificationsPage() {
  return (
    <AuthenticatedLayout>
      <NotificationCenter />
    </AuthenticatedLayout>
  );
}
