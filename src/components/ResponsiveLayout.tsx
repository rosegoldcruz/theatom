import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavigation } from './MobileNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Bot, Network, Home, Settings, Wallet, HelpCircle } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const desktopTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'arbitrage', label: 'Arbitrage', icon: BarChart3 },
  { id: 'multichain', label: 'Multi-Chain', icon: Network },
  { id: 'copilot', label: 'AI Copilot', icon: Bot }
];

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <MobileNavigation activeTab={activeTab} onTabChange={onTabChange} />
        <div className="pb-20 px-4 py-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ArbiBot Pro</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Arbitrage Trading</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              3 Bots Active
            </Badge>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            {desktopTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mt-6">
            {children}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {children}
    </div>
  );
};

// Responsive Card Component
export const ResponsiveCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={`${isMobile ? 'mx-0' : ''} ${className}`}>
      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
        {children}
      </CardContent>
    </Card>
  );
};