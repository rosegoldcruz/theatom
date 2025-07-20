'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Settings, Save, RotateCcw } from 'lucide-react'

interface BotConfig {
  minProfitThreshold: number
  minProfitMargin: number
  maxGasPrice: number
  maxConcurrentTrades: number
  scanInterval: string
  tokenPairs: Array<{
    tokenA: string
    tokenB: string
    amount: number
    enabled: boolean
  }>
  dexes: {
    uniswap: { enabled: boolean; priority: number }
    sushiswap: { enabled: boolean; priority: number }
  }
  riskManagement: {
    maxDailyLoss: number
    maxTradeSize: number
    stopLossEnabled: boolean
    emergencyStopEnabled: boolean
  }
}

export default function BotConfigPanel() {
  const [config, setConfig] = useState<BotConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bot/config')
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.config)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch configuration')
      }
    } catch (err) {
      setError('Network error: Unable to fetch configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setSaving(true)
    try {
      const response = await fetch('/api/bot/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Configuration saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save configuration",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error: Unable to save configuration",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const resetConfig = async () => {
    try {
      const response = await fetch('/api/bot/config/reset', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.config)
        toast({
          title: "Success",
          description: "Configuration reset to defaults",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reset configuration",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error: Unable to reset configuration",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const updateConfig = (path: string, value: any) => {
    if (!config) return

    const keys = path.split('.')
    const newConfig = { ...config }
    let current: any = newConfig

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    setConfig(newConfig)
  }

  const addTokenPair = () => {
    if (!config) return

    const newPair = {
      tokenA: '0x4200000000000000000000000000000000000006', // WETH
      tokenB: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
      amount: 0.1,
      enabled: true
    }

    setConfig({
      ...config,
      tokenPairs: [...config.tokenPairs, newPair]
    })
  }

  const removeTokenPair = (index: number) => {
    if (!config) return

    setConfig({
      ...config,
      tokenPairs: config.tokenPairs.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading configuration...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!config) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Bot Configuration
            </CardTitle>
            <CardDescription>
              Configure bot parameters, risk management, and trading pairs
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetConfig}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={saveConfig}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trading Parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Trading Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minProfitThreshold">Min Profit Threshold (ETH)</Label>
              <Input
                id="minProfitThreshold"
                type="number"
                step="0.001"
                value={config.minProfitThreshold}
                onChange={(e) => updateConfig('minProfitThreshold', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minProfitMargin">Min Profit Margin (%)</Label>
              <Input
                id="minProfitMargin"
                type="number"
                step="0.1"
                value={config.minProfitMargin}
                onChange={(e) => updateConfig('minProfitMargin', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGasPrice">Max Gas Price (gwei)</Label>
              <Input
                id="maxGasPrice"
                type="number"
                value={config.maxGasPrice}
                onChange={(e) => updateConfig('maxGasPrice', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxConcurrentTrades">Max Concurrent Trades</Label>
              <Input
                id="maxConcurrentTrades"
                type="number"
                value={config.maxConcurrentTrades}
                onChange={(e) => updateConfig('maxConcurrentTrades', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Risk Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDailyLoss">Max Daily Loss (ETH)</Label>
              <Input
                id="maxDailyLoss"
                type="number"
                step="0.01"
                value={config.riskManagement.maxDailyLoss}
                onChange={(e) => updateConfig('riskManagement.maxDailyLoss', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTradeSize">Max Trade Size (ETH)</Label>
              <Input
                id="maxTradeSize"
                type="number"
                step="0.1"
                value={config.riskManagement.maxTradeSize}
                onChange={(e) => updateConfig('riskManagement.maxTradeSize', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="stopLoss"
                checked={config.riskManagement.stopLossEnabled}
                onCheckedChange={(checked) => updateConfig('riskManagement.stopLossEnabled', checked)}
              />
              <Label htmlFor="stopLoss">Enable Stop Loss</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="emergencyStop"
                checked={config.riskManagement.emergencyStopEnabled}
                onCheckedChange={(checked) => updateConfig('riskManagement.emergencyStopEnabled', checked)}
              />
              <Label htmlFor="emergencyStop">Enable Emergency Stop</Label>
            </div>
          </div>
        </div>

        {/* DEX Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">DEX Configuration</h3>
          <div className="space-y-3">
            {Object.entries(config.dexes).map(([dexName, dexConfig]) => (
              <div key={dexName} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={dexConfig.enabled}
                    onCheckedChange={(checked) => updateConfig(`dexes.${dexName}.enabled`, checked)}
                  />
                  <Label className="capitalize">{dexName}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${dexName}-priority`} className="text-sm">Priority:</Label>
                  <Input
                    id={`${dexName}-priority`}
                    type="number"
                    min="1"
                    max="10"
                    value={dexConfig.priority}
                    onChange={(e) => updateConfig(`dexes.${dexName}.priority`, parseInt(e.target.value))}
                    className="w-16"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Pairs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Token Pairs</h3>
            <Button onClick={addTokenPair} size="sm">
              Add Pair
            </Button>
          </div>
          <div className="space-y-3">
            {config.tokenPairs.map((pair, index) => (
              <div key={index} className="p-3 border rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <Switch
                    checked={pair.enabled}
                    onCheckedChange={(checked) => updateConfig(`tokenPairs.${index}.enabled`, checked)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTokenPair(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Token A Address</Label>
                    <Input
                      value={pair.tokenA}
                      onChange={(e) => updateConfig(`tokenPairs.${index}.tokenA`, e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Token B Address</Label>
                    <Input
                      value={pair.tokenB}
                      onChange={(e) => updateConfig(`tokenPairs.${index}.tokenB`, e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (ETH)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pair.amount}
                      onChange={(e) => updateConfig(`tokenPairs.${index}.amount`, parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
