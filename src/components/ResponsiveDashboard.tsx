import React, { useState } from 'react';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveCard } from './ResponsiveLayout';
import { EnhancedCopilotChat } from './EnhancedCopilotChat';
import { EnhancedBotDashboard } from './EnhancedBotDashboard';
import { NetworkSelector } from './NetworkSelector';
import { ThemeCustomizer } from './ThemeCustomizer';
import { useAuth, usePermissions } from './auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, DollarSign, Activity, Shield, Zap, BarChart3, Network, Bot, User, Settings, LogOut, Crown, Eye } from 'lucide-react';

const NavigationHeader = () => {
  const { user, profile, signOut } = useAuth();
  const { role, canTrade, canAdmin } = usePermissions();
  const isMobile = useIsMobile();

  const getRoleIcon = () => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'trader': return <Zap className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'trader': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isMobile && (
            <div>
              <h1 className="text-lg font-semibold">ATOM Arbitrage</h1>
              <p className="text-xs text-muted-foreground">Professional Trading Platform</p>
            </div>
          )}
        </div>

        <Badge className={`${getRoleColor()} flex items-center gap-1`}>
          {getRoleIcon()}
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className="text-right">
            <p className="text-sm font-medium">{profile?.full_name || 'Anonymous Trader'}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'Anonymous Trader'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            {canAdmin && (
              <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                <Crown className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const QuickStats = () => {
  const isMobile = useIsMobile();
  
  const stats = [
    { label: '24h Profit', value: '+$1,234.56', change: '+12.3%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Trades', value: '8', change: '+2', icon: Activity, color: 'text-blue-600' },
    { label: 'Success Rate', value: '94.2%', change: '+1.8%', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Risk Level', value: 'Low', change: 'Stable', icon: Shield, color: 'text-yellow-600' }
  ];

  return (
    <ResponsiveGrid className={isMobile ? 'grid-cols-2' : 'grid-cols-4'}>
      {stats.map((stat, index) => (
        <ResponsiveCard key={index}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-sm ${stat.color}`}>{stat.change}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </div>
        </ResponsiveCard>
      ))}
    </ResponsiveGrid>
  );
};

const ArbitrageDashboard = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Arbitrage Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex items-center justify-between p-3 bg-muted rounded-lg ${isMobile ? 'flex-col space-y-2' : ''}`}>
                <div className={isMobile ? 'w-full' : ''}>
                  <p className="font-medium text-foreground">ETH/USDC #{i}</p>
                  <p className="text-sm text-muted-foreground">Uniswap → Sushiswap</p>
                </div>
                <div className={`text-right ${isMobile ? 'w-full flex justify-between' : ''}`}>
                  <div>
                    <p className="font-medium text-green-600">+{(Math.random() * 3 + 0.5).toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">${(Math.random() * 5000 + 1000).toFixed(0)} volume</p>
                  </div>
                  <Button size="sm" className={isMobile ? 'ml-4' : 'ml-2'}>Execute</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MultiChainDashboard = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Multi-Chain Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid className={isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}>
            {['Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Optimism'].map((network) => (
              <div key={network} className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{network}</h3>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit:</span>
                    <span className="text-green-600">+${(Math.random() * 500 + 50).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gas:</span>
                    <span className="text-foreground">{Math.floor(Math.random() * 30 + 15)} gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trades:</span>
                    <span className="text-foreground">{Math.floor(Math.random() * 20 + 5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        </CardContent>
      </Card>
    </div>
  );
};

export const ResponsiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [colorTheme, setColorTheme] = useState('blue');
  const [brandingMode, setBrandingMode] = useState('arbitrage');
  const isMobile = useIsMobile();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <QuickStats />
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
              <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                <EnhancedBotDashboard />
              </div>
              <div className="col-span-1">
                <div className="space-y-4">
                  <NetworkSelector />
                  <ThemeCustomizer 
                    colorTheme={colorTheme}
                    onColorThemeChange={setColorTheme}
                    brandingMode={brandingMode}
                    onBrandingChange={setBrandingMode}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'arbitrage':
        return <ArbitrageDashboard />;
      case 'multichain':
        return <MultiChainDashboard />;
      case 'copilot':
        return (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            <div className={isMobile ? 'col-span-1' : 'col-span-1'}>
              <EnhancedCopilotChat />
            </div>
            <div className={isMobile ? 'col-span-1' : 'col-span-1'}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Market Alert</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">High volatility detected. Consider reducing position sizes.</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">Opportunity</p>
                      <p className="text-sm text-green-700 dark:text-green-300">ETH/USDC spread widening on Base network.</p>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Gas Optimization</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">Wait 30 minutes for optimal gas prices.</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Strategy Tip</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Focus on stablecoin pairs during high volatility periods.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <ResponsiveLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </ResponsiveLayout>
    </div>
  );
};