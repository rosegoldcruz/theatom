import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Server,
  Loader2
} from 'lucide-react';
import { useBotControl } from '../hooks/useBotControl';

export const BotControlPanel: React.FC = () => {
  const { 
    botStatus, 
    loading, 
    error, 
    startBot, 
    stopBot, 
    pauseContract, 
    unpauseContract, 
    updateContractConfig 
  } = useBotControl();

  const [contractConfigForm, setContractConfigForm] = useState({
    minProfitBasisPoints: 50,
    maxSlippageBasisPoints: 300,
    maxGasPriceGwei: 50
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleBotAction = async (action: 'start' | 'stop', configId: string) => {
    try {
      setActionLoading(action);
      setActionError(null);

      const result = action === 'start' ? await startBot(configId) : await stopBot(configId);
      
      if (!result.success) {
        setActionError(result.error || `Failed to ${action} bot`);
      }
    } catch (error) {
      setActionError(`Failed to ${action} bot`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleContractAction = async (action: 'pause' | 'unpause') => {
    try {
      setActionLoading(action);
      setActionError(null);

      const result = action === 'pause' ? await pauseContract() : await unpauseContract();
      
      if (!result.success) {
        setActionError(result.error || `Failed to ${action} contract`);
      }
    } catch (error) {
      setActionError(`Failed to ${action} contract`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateContractConfig = async () => {
    try {
      setActionLoading('update_config');
      setActionError(null);

      const result = await updateContractConfig(contractConfigForm);
      
      if (!result.success) {
        setActionError(result.error || 'Failed to update contract configuration');
      }
    } catch (error) {
      setActionError('Failed to update contract configuration');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-400" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-red-400" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'stopped':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
        <p className="text-gray-300">Loading bot control panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || actionError) && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-400">
            {error || actionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Contract Status */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="h-5 w-5" />
            Smart Contract Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {botStatus?.contract && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Contract Address</p>
                  <p className="font-mono text-white text-sm">{botStatus.contract.address}</p>
                </div>
                <Badge className={botStatus.contract.paused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}>
                  {botStatus.contract.paused ? 'PAUSED' : 'ACTIVE'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {parseFloat(botStatus.contract.config.totalProfit).toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-300">Total Profit (ETH)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {botStatus.contract.config.totalTrades}
                  </p>
                  <p className="text-sm text-gray-300">Total Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {botStatus.contract.config.successfulTrades}
                  </p>
                  <p className="text-sm text-gray-300">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">
                    {parseFloat(botStatus.contract.config.maxGasPrice).toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-300">Max Gas (gwei)</p>
                </div>
              </div>

              <div className="flex gap-2">
                {botStatus.contract.paused ? (
                  <Button
                    onClick={() => handleContractAction('unpause')}
                    disabled={actionLoading === 'unpause'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === 'unpause' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Unpause Contract
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleContractAction('pause')}
                    disabled={actionLoading === 'pause'}
                    variant="destructive"
                  >
                    {actionLoading === 'pause' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Pause className="h-4 w-4 mr-2" />
                    )}
                    Pause Contract
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bot Instances */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bot Instances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {botStatus?.bots && botStatus.bots.length > 0 ? (
            <div className="space-y-4">
              {botStatus.bots.map((bot) => (
                <div key={bot.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bot.status)}
                        <h3 className="font-semibold text-white">
                          {bot.arbitrage_config.name}
                        </h3>
                      </div>
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {bot.status === 'running' ? (
                        <Button
                          size="sm"
                          onClick={() => handleBotAction('stop', bot.config_id)}
                          disabled={actionLoading === 'stop'}
                          variant="destructive"
                        >
                          {actionLoading === 'stop' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Square className="h-3 w-3" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleBotAction('start', bot.config_id)}
                          disabled={actionLoading === 'start'}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === 'start' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">Opportunities Found</p>
                      <p className="font-semibold text-white">{bot.opportunities_found}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Trades Executed</p>
                      <p className="font-semibold text-white">{bot.trades_executed}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Total Profit</p>
                      <p className="font-semibold text-green-400">{bot.total_profit.toFixed(4)} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Uptime</p>
                      <p className="font-semibold text-white">
                        {Math.floor(bot.uptime_seconds / 3600)}h {Math.floor((bot.uptime_seconds % 3600) / 60)}m
                      </p>
                    </div>
                  </div>

                  {bot.last_scan_at && (
                    <div className="mt-2 text-xs text-gray-400">
                      Last scan: {new Date(bot.last_scan_at).toLocaleString()}
                    </div>
                  )}

                  {bot.error_message && (
                    <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 text-sm">{bot.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-300">No bot instances found</p>
              <p className="text-sm text-gray-400 mt-2">
                Create a configuration and start the orchestrator to see bot instances here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Configuration */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Contract Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_profit_bp" className="text-white">Min Profit (basis points)</Label>
              <Input
                id="min_profit_bp"
                type="number"
                value={contractConfigForm.minProfitBasisPoints}
                onChange={(e) => setContractConfigForm(prev => ({
                  ...prev,
                  minProfitBasisPoints: parseInt(e.target.value)
                }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="max_slippage_bp" className="text-white">Max Slippage (basis points)</Label>
              <Input
                id="max_slippage_bp"
                type="number"
                value={contractConfigForm.maxSlippageBasisPoints}
                onChange={(e) => setContractConfigForm(prev => ({
                  ...prev,
                  maxSlippageBasisPoints: parseInt(e.target.value)
                }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="max_gas_gwei" className="text-white">Max Gas Price (gwei)</Label>
              <Input
                id="max_gas_gwei"
                type="number"
                value={contractConfigForm.maxGasPriceGwei}
                onChange={(e) => setContractConfigForm(prev => ({
                  ...prev,
                  maxGasPriceGwei: parseInt(e.target.value)
                }))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleUpdateContractConfig}
            disabled={actionLoading === 'update_config'}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {actionLoading === 'update_config' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Update Contract Config
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      {botStatus?.recentLogs && botStatus.recentLogs.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {botStatus.recentLogs.map((log) => (
                <div key={log.id} className="p-2 rounded bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        log.level === 'error' ? 'bg-red-500/20 text-red-400' :
                        log.level === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-white">{log.message}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
