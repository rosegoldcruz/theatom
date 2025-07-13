import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, Home, BarChart3, Network, Bot, Settings, Wallet, HelpCircle } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'arbitrage', label: 'Arbitrage', icon: BarChart3 },
  { id: 'multichain', label: 'Multi-Chain', icon: Network },
  { id: 'copilot', label: 'AI Copilot', icon: Bot }
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <>
      {/* Mobile Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">ArbiBot Pro</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            3 Active
          </Badge>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Navigation</h3>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => onTabChange(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-medium text-foreground">Settings</h3>
                  <Button variant="ghost" className="w-full justify-start">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              size="sm"
              className="flex-col h-12 px-2"
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};