import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onVoiceInput, isListening, onToggleListening }) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const handleVoiceCommand = () => {
    if (!isSupported) {
      // Simulate voice input for demo
      const mockCommands = [
        "What's the safest trade right now?",
        "Show me the best performing asset",
        "Analyze current market conditions",
        "What's the gas price forecast?"
      ];
      const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
      setTranscript(randomCommand);
      onVoiceInput(randomCommand);
      return;
    }

    // Real implementation would use Web Speech API
    onToggleListening();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={handleVoiceCommand}
        className={`transition-all duration-200 ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      {isListening && (
        <Badge variant="secondary" className="animate-pulse">
          <Volume2 className="h-3 w-3 mr-1" />
          Listening...
        </Badge>
      )}
      
      {transcript && (
        <div className="text-xs text-gray-500 max-w-32 truncate">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

// Notification System Component
export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Trade executed successfully', timestamp: new Date() },
    { id: 2, type: 'warning', message: 'High gas prices detected', timestamp: new Date() },
    { id: 3, type: 'info', message: 'New arbitrage opportunity found', timestamp: new Date() }
  ]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg shadow-lg max-w-sm cursor-pointer transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-100 border-green-500' :
            notification.type === 'warning' ? 'bg-yellow-100 border-yellow-500' :
            'bg-blue-100 border-blue-500'
          } border-l-4`}
          onClick={() => removeNotification(notification.id)}
        >
          <p className="text-sm font-medium">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
};

// AI Trading Instructions Placeholder
export const AITradingInstructions: React.FC = () => {
  const [instructions, setInstructions] = useState([
    { id: 1, action: 'Monitor ETH/USDC spread', status: 'active', priority: 'high' },
    { id: 2, action: 'Execute when spread > 0.5%', status: 'pending', priority: 'medium' },
    { id: 3, action: 'Stop-loss at 2% drawdown', status: 'active', priority: 'high' }
  ]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">AI Trading Instructions</h3>
      {instructions.map((instruction) => (
        <div key={instruction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex-1">
            <p className="text-sm">{instruction.action}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={instruction.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {instruction.status}
              </Badge>
              <Badge 
                variant={instruction.priority === 'high' ? 'destructive' : 'outline'}
                className="text-xs"
              >
                {instruction.priority}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            Edit
          </Button>
        </div>
      ))}
      
      <Button variant="outline" size="sm" className="w-full text-xs">
        + Add New Instruction
      </Button>
      
      <div className="text-xs text-gray-500 mt-2">
        💡 Future features: Natural language commands, automated strategy adjustments, risk management rules
      </div>
    </div>
  );
};