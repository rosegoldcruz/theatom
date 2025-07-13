import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Book, ExternalLink, Code, Shield, Zap, TrendingUp, Network, Bot, HelpCircle } from 'lucide-react';

export const HelpDocumentation = () => {
  const handleExternalLink = (url: string) => {
    console.log(`Opening external link: ${url}`);
    // In a real app, this would open the URL
  };

  return (
    <div className="space-y-6">
      {/* Quick Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Quick Help
          </CardTitle>
          <CardDescription>
            Essential information for getting started with arbitrage trading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                What is MEV Protection?
              </h4>
              <p className="text-sm text-muted-foreground">
                MEV (Maximum Extractable Value) protection prevents other bots from front-running your trades by using private mempools and optimized transaction ordering.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                How is Risk Calculated?
              </h4>
              <p className="text-sm text-muted-foreground">
                Risk assessment considers liquidity depth, slippage tolerance, gas price volatility, and current market conditions to provide a comprehensive risk score.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Gas Optimization
              </h4>
              <p className="text-sm text-muted-foreground">
                Our system automatically optimizes gas prices and transaction timing to maximize profit margins while ensuring successful execution.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-500" />
                AI Trading Bot
              </h4>
              <p className="text-sm text-muted-foreground">
                The AI analyzes market patterns, liquidity flows, and historical data to identify profitable arbitrage opportunities in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Documentation
          </CardTitle>
          <CardDescription>
            Comprehensive guides and API documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handleExternalLink('/docs/getting-started')}
            >
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span className="font-semibold">Getting Started Guide</span>
                <ExternalLink className="h-3 w-3" />
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Complete walkthrough for new users
              </p>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handleExternalLink('/docs/api')}
            >
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="font-semibold">API Documentation</span>
                <ExternalLink className="h-3 w-3" />
              </div>
              <p className="text-xs text-muted-foreground text-left">
                REST API and WebSocket endpoints
              </p>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handleExternalLink('/docs/strategies')}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">Trading Strategies</span>
                <ExternalLink className="h-3 w-3" />
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Advanced arbitrage techniques
              </p>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => handleExternalLink('/docs/security')}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Security Guide</span>
                <ExternalLink className="h-3 w-3" />
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Best practices and security measures
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Supported Networks
          </CardTitle>
          <CardDescription>
            Multi-chain support and network-specific information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-blue-700 dark:text-blue-300">Ethereum Sepolia</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Testnet • Chain ID: 11155111</div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-purple-700 dark:text-purple-300">Base Sepolia</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Testnet • Chain ID: 84532</div>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <div className="font-semibold text-green-700 dark:text-green-300">Arbitrum Sepolia</div>
                <div className="text-sm text-green-600 dark:text-green-400">Testnet • Chain ID: 421614</div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
          
          <Alert>
            <Network className="h-4 w-4" />
            <AlertDescription>
              All networks are currently in testnet mode. Use test tokens only. Mainnet support coming soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">How much can I expect to earn?</h4>
              <p className="text-sm text-muted-foreground">
                Arbitrage profits typically range from 0.1% to 5% per trade, depending on market conditions and trade size. The AI bot identifies the most profitable opportunities automatically.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-sm mb-2">What are the risks involved?</h4>
              <p className="text-sm text-muted-foreground">
                Main risks include gas price volatility, slippage, and failed transactions. Our risk management system helps minimize these risks through careful analysis and optimization.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-sm mb-2">How fast are trades executed?</h4>
              <p className="text-sm text-muted-foreground">
                Most arbitrage trades are completed within 15-30 seconds, depending on network congestion and the complexity of the opportunity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};