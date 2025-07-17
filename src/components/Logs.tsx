import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

type LogEntry = {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
};

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Fetch initial logs
    fetch('/api/logs')
      .then(r => r.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch logs:', error);
        setLoading(false);
      });

    // WebSocket connection for real-time logs
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/logs/ws`);
    
    ws.onopen = () => {
      setConnected(true);
    };
    
    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prev => [newLog, ...prev.slice(0, 999)]); // Keep only last 1000 logs
    };
    
    ws.onclose = () => {
      setConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const refreshLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toISOString()}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atom-bot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getLogTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'outline';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) return <div className="p-8">Loading logs...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Execution Logs</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button onClick={refreshLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Recent Activity</span>
            <Badge variant="outline" className="text-white">
              {logs.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No logs available
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Badge variant={getLogTypeVariant(log.type)} className="mt-0.5">
                      {log.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white text-sm break-words">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
