'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { api } from '@/lib/api'
import { useWallet } from '@/contexts/WalletContext'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const { network, switchNetwork } = useWallet()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Bot Configuration State
  const [config, setConfig] = useState({
    // Trading settings
    minProfitUSD: 10,
    maxPositionSize: 10000,
    slippageTolerance: 0.5,
    maxGasPrice: 100,
    
    // MEV Protection
    flashbotsEnabled: true,
    useCommitReveal: true,
    rbfEnabled: true,
    
    // DEX Aggregators
    use0x: true,
    use1inch: true,
    useParaswap: true,
    
    // CoW Protocol
    cowEnabled: true,
    cowSolverMode: false,
    
    // Monitoring
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: '',
    
    // Risk Management
    maxDailyTrades: 100,
    maxDailyGasETH: 1.0,
    emergencyShutdownEnabled: true,
  })

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')

  useEffect(() => {
    // Load configuration from backend
    const loadConfig = async () => {
      try {
        const backendConfig = await api.getConfig()
        setConfig(prev => ({
          ...prev,
          ...backendConfig,
        }))
      } catch (error) {
        console.error('Failed to load config:', error)
        toast({
          title: 'Failed to load settings',
          description: 'Using default configuration',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to backend
      await api.updateConfig(config)
      
      // Save theme to localStorage
      localStorage.setItem('theme', theme)
      
      // Apply theme
      if (theme === 'system') {
        document.documentElement.classList.remove('light', 'dark')
      } else {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
      }
      
      toast({
        title: 'Settings saved',
        description: 'Your configuration has been updated',
      })
    } catch (error) {
      console.error('Failed to save config:', error)
      toast({
        title: 'Failed to save settings',
        description: 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNetworkChange = (chainId: string) => {
    switchNetwork(parseInt(chainId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your ATOM arbitrage bot preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="protection">MEV Protection</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic configuration for your arbitrage bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select value={network} onValueChange={handleNetworkChange}>
                  <SelectTrigger id="network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ethereum</SelectItem>
                    <SelectItem value="137">Polygon</SelectItem>
                    <SelectItem value="42161">Arbitrum</SelectItem>
                    <SelectItem value="8453">Base</SelectItem>
                    <SelectItem value="10">Optimism</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emergency Shutdown</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable emergency stop functionality
                  </p>
                </div>
                <Switch
                  checked={config.emergencyShutdownEnabled}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, emergencyShutdownEnabled: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Parameters</CardTitle>
              <CardDescription>
                Configure your trading strategy and risk limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minProfit">Minimum Profit (USD)</Label>
                  <Input
                    id="minProfit"
                    type="number"
                    value={config.minProfitUSD}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, minProfitUSD: parseFloat(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPosition">Max Position Size (USD)</Label>
                  <Input
                    id="maxPosition"
                    type="number"
                    value={config.maxPositionSize}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, maxPositionSize: parseFloat(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                  <Input
                    id="slippage"
                    type="number"
                    step="0.1"
                    value={config.slippageTolerance}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxGas">Max Gas Price (GWEI)</Label>
                  <Input
                    id="maxGas"
                    type="number"
                    value={config.maxGasPrice}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, maxGasPrice: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDailyTrades">Max Daily Trades</Label>
                  <Input
                    id="maxDailyTrades"
                    type="number"
                    value={config.maxDailyTrades}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, maxDailyTrades: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDailyGas">Max Daily Gas (ETH)</Label>
                  <Input
                    id="maxDailyGas"
                    type="number"
                    step="0.1"
                    value={config.maxDailyGasETH}
                    onChange={(e) =>
                      setConfig(prev => ({ ...prev, maxDailyGasETH: parseFloat(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  )
}
