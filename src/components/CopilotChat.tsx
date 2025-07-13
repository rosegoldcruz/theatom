import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Mic, Bell, TrendingUp, Shield, Zap, DollarSign, BarChart3, Target, AlertTriangle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const aiResponses = {
  'safest': 'The safest trade right now is USDC/USDT on Ethereum with 0.02% spread and 99.8% success rate. Low gas costs and high liquidity make it ideal for conservative strategies.',
  'best-performing': 'ETH/WETH on Base is showing 2.3% average returns with 15 successful trades in the last hour. The spread is widening due to increased volume.',
  'gas-optimal': 'Gas prices are currently 18 gwei. Execute trades in the next 30 minutes for optimal costs. Avoid trading between 2-4 PM UTC when gas spikes.',
  'risk-analysis': 'Current portfolio risk: LOW. MEV protection active, diversified across 3 networks, max position size 5% of balance. Consider increasing exposure.',
  'market-sentiment': 'Market sentiment is BULLISH. Trading volume up 23%, volatility decreasing. Good conditions for larger position sizes.',
  'profit-forecast': 'Based on current patterns, expect 0.8-1.2% returns in next 4 hours. ETH pairs showing strongest momentum.',
  'strategy-tips': 'Focus on stablecoin pairs during high volatility. Use 0.3% slippage tolerance. Set stop-loss at 2% to protect gains.',
  'network-status': 'All networks operational. Base showing lowest fees (0.001 ETH avg). Polygon has highest volume but moderate fees.',
  'default': 'I can help with trading decisions, risk analysis, market insights, and strategy optimization. Try asking about the safest trades or best-performing assets.'
};

const quickActions = [
  { label: "What's the safest trade?", icon: Shield, query: 'safest', color: 'text-green-600' },
  { label: 'Best-performing asset', icon: TrendingUp, query: 'best-performing', color: 'text-blue-600' },
  { label: 'Gas optimization', icon: Zap, query: 'gas-optimal', color: 'text-yellow-600' },
  { label: 'Risk analysis', icon: AlertTriangle, query: 'risk-analysis', color: 'text-red-600' },
  { label: 'Market sentiment', icon: BarChart3, query: 'market-sentiment', color: 'text-purple-600' },
  { label: 'Profit forecast', icon: DollarSign, query: 'profit-forecast', color: 'text-emerald-600' },
  { label: 'Strategy tips', icon: Target, query: 'strategy-tips', color: 'text-indigo-600' },
  { label: 'Network status', icon: Sparkles, query: 'network-status', color: 'text-pink-600' }
];

export const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI trading copilot. I can analyze markets, suggest trades, and help optimize your strategy. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSend = async (query?: string) => {
    const message = query || input;
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[query as keyof typeof aiResponses] || aiResponses.default;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Placeholder for voice input
    setTimeout(() => {
      setIsListening(false);
      setInput('Voice input placeholder - What\'s the safest trade?');
    }, 2000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Trading Copilot
          <Badge variant="secondary" className="ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Online
          </Badge>
          <Button variant="ghost" size="sm" className="ml-2">
            <Bell className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 mb-4 max-h-80 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4 max-h-32 overflow-y-auto">
          {quickActions.map((action) => (
            <Button key={action.query} variant="outline" size="sm" className="text-xs justify-start" onClick={() => handleSend(action.query)}>
              <action.icon className={`h-3 w-3 mr-1 ${action.color}`} />
              {action.label}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything about trading..." onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-1" />
          <Button variant="outline" onClick={handleVoiceInput} className={isListening ? 'bg-red-100' : ''}>
            <Mic className={`h-4 w-4 ${isListening ? 'text-red-600 animate-pulse' : ''}`} />
          </Button>
          <Button onClick={() => handleSend()} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Voice input, notifications, and AI trading instructions coming soon
        </div>
      </CardContent>
    </Card>
  );
};