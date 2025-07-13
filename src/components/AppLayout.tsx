import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import WorkingBotDashboard from './WorkingBotDashboard';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen">
      <WorkingBotDashboard />
    </div>
  );
};

export default AppLayout;