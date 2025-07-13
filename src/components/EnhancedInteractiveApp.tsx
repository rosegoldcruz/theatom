import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MockRouting } from '@/components/MockRouting';
import { InteractiveModals, AnalyzeModal, ExecuteModal, StrategyModal } from '@/components/InteractiveModals';
import { TooltipWrapper, HelpTooltip, InfoTooltip, ProfitTooltip, SecurityTooltip, TOOLTIP_CONTENT } from '@/components/TooltipWrapper';
import { HelpDocumentation } from '@/components/HelpDocumentation';
import { UIStatesManager } from '@/components/UIStatesManager';
import { Bot, TrendingUp, Shield, Zap, Network, BarChart3, Settings, HelpCircle, Book, Code } from 'lucide-react';

export const EnhancedInteractiveApp = () => {
  const [currentRoute, setCurrentRoute] = useState('main');
  const [showDocs, setShowDocs] = useState(false);
  const [showStates, setShowStates] = useState(false);

  const handleRouteChange = (route: string) => {
    setCurrentRoute(route);
  };

  const mockOpportunities = [
    {
      id: 1,
      pair: 'ETH/USDC',
      exchanges: 'Uniswap → SushiSwap',
      profit: '+2.34%',
      amount: '$450.23',
      risk: 'Low',
      confidence: 95
    },
    {
      id: 2,
      pair: 'WBTC/ETH',
      exchanges: 'Curve → Balancer',
      profit: '+1.87%',
      amount: '$320.15',
      risk: 'Medium',
      confidence: 88
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">THEATOM.AI</h1>
            <p className="text-muted-foreground">AI-Powered Multi-Chain DeFi Arbitrage Terminal</p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipWrapper content="View comprehensive documentation and guides">
              <Button onClick={() => setShowDocs(true)} variant="outline" size="sm">
                <Book className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </TooltipWrapper>
            <TooltipWrapper content="API endpoints and integration guides">
              <Button onClick={() => console.log('API docs')} variant="outline" size="sm">
                <Code className="h-4 w-4 mr-2" />
                API
              </Button>
            </TooltipWrapper>
            <TooltipWrapper content="Demo different UI states and interactions">
              <Button onClick={() => setShowStates(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Demo
              </Button>
            </TooltipWrapper>
          </div>
        </div>

        {/* Main Content with Mock Routing */}
        <MockRouting onNavigate={handleRouteChange} />

        {/* Interactive Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opportunities Feed with Tooltips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Live Opportunities
                <HelpTooltip content={TOOLTIP_CONTENT.PROFIT_POTENTIAL} />
              </CardTitle>
              <CardDescription>
                Real-time arbitrage opportunities with AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockOpportunities.map((opp) => (
                <div key={opp.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {opp.pair}
                        <InfoTooltip content={`Trading pair: ${opp.pair} across multiple exchanges`} />
                      </div>
                      <div className="text-sm text-muted-foreground">{opp.exchanges}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-500 flex items-center gap-1">
                        {opp.profit}
                        <ProfitTooltip content={TOOLTIP_CONTENT.PROFIT_POTENTIAL} />
                      </div>
                      <div className="text-sm text-muted-foreground">{opp.amount}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={opp.risk === 'Low' ? 'secondary' : 'outline'}>
                        {opp.risk} Risk
                      </Badge>
                      <SecurityTooltip content={TOOLTIP_CONTENT.RISK_CALCULATION} />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span>AI Confidence: {opp.confidence}%</span>
                      <InfoTooltip content={TOOLTIP_CONTENT.AI_CONFIDENCE} />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <AnalyzeModal 
                      trigger={
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyze
                        </Button>
                      }
                    />
                    <ExecuteModal 
                      trigger={
                        <Button size="sm" className="flex-1">
                          <Zap className="h-4 w-4 mr-2" />
                          Execute
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trading Controls with Tooltips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Trading Bot
                <HelpTooltip content="AI-powered trading bot with advanced market analysis" />
              </CardTitle>
              <CardDescription>
                Automated arbitrage execution with risk management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">MEV Protection</span>
                    <SecurityTooltip content={TOOLTIP_CONTENT.MEV_PROTECTION} />
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Gas Optimization</span>
                    <InfoTooltip content={TOOLTIP_CONTENT.GAS_OPTIMIZATION} />
                  </div>
                  <Badge variant="outline">Auto</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    Success Rate
                    <InfoTooltip content={TOOLTIP_CONTENT.SUCCESS_RATE} />
                  </span>
                  <span className="text-sm font-bold text-green-500">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    Avg. Execution Time
                    <InfoTooltip content={TOOLTIP_CONTENT.EXECUTION_TIME} />
                  </span>
                  <span className="text-sm font-bold">18.5s</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <StrategyModal 
                  trigger={
                    <Button variant="outline" className="flex-1">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Strategy Tips
                    </Button>
                  }
                />
                <TooltipWrapper content="Configure bot settings and parameters">
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </TooltipWrapper>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Modal */}
        <Dialog open={showDocs} onOpenChange={setShowDocs}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Documentation & Help</DialogTitle>
              <DialogDescription>
                Comprehensive guides and API documentation
              </DialogDescription>
            </DialogHeader>
            <HelpDocumentation />
          </DialogContent>
        </Dialog>

        {/* UI States Demo Modal */}
        <Dialog open={showStates} onOpenChange={setShowStates}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>UI States Demo</DialogTitle>
              <DialogDescription>
                Interactive demo of different application states
              </DialogDescription>
            </DialogHeader>
            <UIStatesManager />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};