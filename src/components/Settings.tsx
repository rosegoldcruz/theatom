import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';

type Config = {
  maxPositionSizeETH: string;
  minProfitThresholdUSD: string;
  maxGasCostUSD: string;
  enabledDEXes: string[];
};

const Settings = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load config:', error);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Configuration saved successfully",
        });
      } else {
        throw new Error('Failed to save config');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const handleDEXToggle = (dex: string, checked: boolean) => {
    if (!config) return;
    
    const newEnabledDEXes = checked 
      ? [...config.enabledDEXes, dex]
      : config.enabledDEXes.filter(d => d !== dex);
    
    setConfig({
      ...config,
      enabledDEXes: newEnabledDEXes
    });
  };

  if (loading) return <div className="p-8">Loading configuration...</div>;
  if (!config) return <div className="p-8">Failed to load configuration</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-white mb-8">Bot Configuration</h1>
      
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Trading Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxPosition" className="text-white">
                Max Position Size (ETH)
              </Label>
              <Input
                id="maxPosition"
                type="number"
                step="0.01"
                value={config.maxPositionSizeETH}
                onChange={e => setConfig({ ...config, maxPositionSizeETH: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minProfit" className="text-white">
                Min Profit Threshold (USD)
              </Label>
              <Input
                id="minProfit"
                type="number"
                step="0.01"
                value={config.minProfitThresholdUSD}
                onChange={e => setConfig({ ...config, minProfitThresholdUSD: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxGas" className="text-white">
                Max Gas Cost (USD)
              </Label>
              <Input
                id="maxGas"
                type="number"
                step="0.01"
                value={config.maxGasCostUSD}
                onChange={e => setConfig({ ...config, maxGasCostUSD: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Enabled DEXes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {['uniswap', 'balancer', 'curve', 'sushi'].map((dex) => (
              <div key={dex} className="flex items-center space-x-2">
                <Checkbox
                  id={dex}
                  checked={config.enabledDEXes.includes(dex)}
                  onCheckedChange={(checked) => handleDEXToggle(dex, checked as boolean)}
                />
                <Label htmlFor={dex} className="text-white capitalize">
                  {dex === 'sushi' ? 'SushiSwap' : dex}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default Settings;
