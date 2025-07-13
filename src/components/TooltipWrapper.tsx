import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info, AlertCircle, TrendingUp, Shield, Zap, Network, Bot, BarChart3 } from 'lucide-react';

interface TooltipWrapperProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const TooltipWrapper = ({ children, content, side = 'top', className }: TooltipWrapperProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Pre-configured tooltip components for common use cases
export const HelpTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
  </TooltipWrapper>
);

export const InfoTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <Info className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help" />
  </TooltipWrapper>
);

export const WarningTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <AlertCircle className="h-4 w-4 text-yellow-500 hover:text-yellow-600 cursor-help" />
  </TooltipWrapper>
);

// Icon tooltips for specific features
export const ProfitTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <TrendingUp className="h-4 w-4 text-green-500 hover:text-green-600 cursor-help" />
  </TooltipWrapper>
);

export const SecurityTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <Shield className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help" />
  </TooltipWrapper>
);

export const SpeedTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <Zap className="h-4 w-4 text-yellow-500 hover:text-yellow-600 cursor-help" />
  </TooltipWrapper>
);

export const NetworkTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <Network className="h-4 w-4 text-purple-500 hover:text-purple-600 cursor-help" />
  </TooltipWrapper>
);

export const BotTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <Bot className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help" />
  </TooltipWrapper>
);

export const StatsTooltip = ({ content, side = 'top' }: { content: string; side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <TooltipWrapper content={content} side={side}>
    <BarChart3 className="h-4 w-4 text-green-500 hover:text-green-600 cursor-help" />
  </TooltipWrapper>
);

// Common tooltip content constants
export const TOOLTIP_CONTENT = {
  MEV_PROTECTION: "MEV Protection prevents front-running and sandwich attacks by using private mempools and optimized transaction ordering.",
  RISK_CALCULATION: "Risk is calculated based on liquidity depth, slippage tolerance, gas price volatility, and market conditions.",
  PROFIT_POTENTIAL: "Estimated profit after accounting for gas fees, slippage, and exchange fees. Actual results may vary.",
  EXECUTION_TIME: "Average time to complete the arbitrage trade across multiple DEXs, including confirmation times.",
  GAS_OPTIMIZATION: "Smart gas estimation and optimization to maximize profit margins while ensuring transaction success.",
  LIQUIDITY_ANALYSIS: "Real-time analysis of liquidity pools to ensure sufficient depth for profitable execution.",
  SLIPPAGE_TOLERANCE: "Maximum acceptable price movement during trade execution. Lower values reduce risk but may cause failures.",
  SUCCESS_RATE: "Historical success rate of similar arbitrage opportunities based on market conditions and trade size.",
  NETWORK_STATUS: "Current network congestion and gas prices affecting trade execution and profitability.",
  AI_CONFIDENCE: "AI model confidence score based on historical data, market patterns, and real-time analysis."
};