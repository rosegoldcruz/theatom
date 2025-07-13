import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Network, BarChart3, Zap, TrendingUp } from 'lucide-react';

interface MockRoutingProps {
  onNavigate?: (route: string) => void;
}

export const MockRouting = ({ onNavigate }: MockRoutingProps) => {
  const [currentRoute, setCurrentRoute] = useState('main');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    onNavigate?.(route);
  };

  const routes = {
    main: {
      title: 'Main Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Overview of all trading activities and performance'
    },
    arbitrage: {
      title: 'Arbitrage Bot',
      icon: <Bot className="h-5 w-5" />,
      description: 'AI-powered arbitrage opportunities and execution'
    },
    multichain: {
      title: 'Multi-Chain',
      icon: <Network className="h-5 w-5" />,
      description: 'Cross-chain trading and network management'
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={currentRoute} onValueChange={handleNavigate} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Main
          </TabsTrigger>
          <TabsTrigger value="arbitrage" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Arbitrage
          </TabsTrigger>
          <TabsTrigger value="multichain" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Multi-Chain
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {routes.main.icon}
                {routes.main.title}
                <Badge variant="secondary">Active</Badge>
              </CardTitle>
              <CardDescription>{routes.main.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-500">$12,450</div>
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">847</div>
                  <div className="text-sm text-muted-foreground">Successful Trades</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => handleNavigate('arbitrage')} className="flex-1">
                  <Bot className="h-4 w-4 mr-2" />
                  Launch Arbitrage Bot
                </Button>
                <Button onClick={() => handleNavigate('multichain')} variant="outline" className="flex-1">
                  <Network className="h-4 w-4 mr-2" />
                  Multi-Chain View
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arbitrage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {routes.arbitrage.icon}
                {routes.arbitrage.title}
                <Badge variant="default">AI Powered</Badge>
              </CardTitle>
              <CardDescription>{routes.arbitrage.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-semibold">ETH/USDC Opportunity</div>
                    <div className="text-sm text-muted-foreground">Uniswap → SushiSwap</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">+2.3%</div>
                    <div className="text-sm text-muted-foreground">$450 profit</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Execute Trade
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multichain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {routes.multichain.icon}
                {routes.multichain.title}
                <Badge variant="outline">Cross-Chain</Badge>
              </CardTitle>
              <CardDescription>{routes.multichain.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">Ethereum</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">5 active positions</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-semibold text-purple-700 dark:text-purple-300">Base</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">3 active positions</div>
                  </div>
                </div>
                <Button className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Bridge Assets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};