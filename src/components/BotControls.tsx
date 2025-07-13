import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Zap, DollarSign } from 'lucide-react';
import SmartContractIntegration from './SmartContractIntegration';

interface BotControlsProps {
  isRunning: boolean;
}

export const BotControls: React.FC<BotControlsProps> = ({ isRunning }) => {
  const [settings, setSettings] = useState({
    minProfitThreshold: 10,
    maxGasPrice: 50,
    slippageTolerance: 0.5,
    autoExecute: true,
    mevProtection: true,
    flashLoanProvider: 'aave',
    maxTradeSize: 1000,
    riskLevel: 'medium'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="trading" className="text-white">Trading</TabsTrigger>
          <TabsTrigger value="security" className="text-white">Security</TabsTrigger>
          <TabsTrigger value="contract" className="text-white">Contract</TabsTrigger>
          <TabsTrigger value="advanced" className="text-white">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Trading Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Minimum Profit Threshold ($)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[settings.minProfitThreshold]}
                    onValueChange={(value) => updateSetting('minProfitThreshold', value[0])}
                    max={100}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-white w-16 text-right">${settings.minProfitThreshold}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Maximum Gas Price (gwei)</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[settings.maxGasPrice]}
                    onValueChange={(value) => updateSetting('maxGasPrice', value[0])}
                    max={200}
                    min={10}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-white w-16 text-right">{settings.maxGasPrice}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Auto-Execute Trades</Label>
                <Switch
                  checked={settings.autoExecute}
                  onCheckedChange={(checked) => updateSetting('autoExecute', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300">MEV Protection</Label>
                  <p className="text-sm text-slate-400">Use Flashbots to prevent frontrunning</p>
                </div>
                <Switch
                  checked={settings.mevProtection}
                  onCheckedChange={(checked) => updateSetting('mevProtection', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="mt-6">
          <SmartContractIntegration />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Bot Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={isRunning ? 'text-green-400' : 'text-red-400'}>
                      {isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BotControls;