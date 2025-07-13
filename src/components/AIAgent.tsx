import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Lightbulb, TrendingUp, Shield, Zap } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const aiResponses = {
  'profit': 'Your current profit of 0.234 ETH represents a 12.3% gain over the last 24 hours. This is above the 8% average for similar arbitrage strategies. The profit comes mainly from ETH/USDC pairs with low slippage.',
  'risk': 'Current risk level is LOW. MEV protection is active, slippage tolerance is set to 0.5%, and gas price monitoring prevents overpaying. Consider increasing position size given the favorable conditions.',
  'strategy': 'Based on recent market data, I recommend focusing on stablecoin pairs during high volatility periods. The USDT/USDC spread has been consistently profitable with 0.3% average returns.',
  'gas': 'Current gas prices are 25 gwei (normal). Optimal execution window is in 2-3 hours when gas typically drops to 18-20 gwei. This could save ~0.003 ETH per transaction.',
  'default': 'I can help explain any metric, suggest strategy improvements, or analyze market conditions. Try asking about profit, risk, gas costs, or trading strategies.'
};

const quickActions = [
  { label: 'Explain Profit', icon: TrendingUp, query: 'profit' },
  { label: 'Risk Analysis', icon: Shield, query: 'risk' },
  { label: 'Strategy Tips', icon: Lightbulb, query: 'strategy' },
  { label: 'Gas Optimization', icon: Zap, query: 'gas' }
];

export const AIAgent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI trading copilot. I can explain metrics, suggest optimizations, and help you make better trading decisions. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

    // Simulate AI response delay
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
    }, 1000);
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
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-4 mb-4 max-h-80 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
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
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickActions.map((action) => (
            <Button
              key={action.query}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSend(action.query)}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your trading..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};