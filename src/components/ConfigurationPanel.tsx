import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';

interface ArbitrageConfig {
  id: string;
  name: string;
  min_profit_basis_points: number;
  max_slippage_basis_points: number;
  max_gas_price_gwei: number;
  enabled_tokens: string[];
  enabled_dexes: string[];
  flash_loan_enabled: boolean;
  max_trade_amount_eth: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ConfigurationPanel: React.FC = () => {
  const [configs, setConfigs] = useState<ArbitrageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<ArbitrageConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    min_profit_basis_points: 50,
    max_slippage_basis_points: 300,
    max_gas_price_gwei: 50,
    enabled_tokens: ['0x4200000000000000000000000000000000000006', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'],
    enabled_dexes: ['uniswap_v2', 'uniswap_v3', 'balancer'],
    flash_loan_enabled: true,
    max_trade_amount_eth: 1.0
  });

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/config');
      
      if (response.data.success) {
        setConfigs(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch configurations');
      }
    } catch (err: any) {
      console.error('Config fetch error:', err);
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTokensChange = (value: string) => {
    const tokens = value.split('\n').map(t => t.trim()).filter(t => t);
    handleInputChange('enabled_tokens', tokens);
  };

  const handleDexesChange = (dex: string, enabled: boolean) => {
    const currentDexes = formData.enabled_dexes;
    if (enabled) {
      if (!currentDexes.includes(dex)) {
        handleInputChange('enabled_dexes', [...currentDexes, dex]);
      }
    } else {
      handleInputChange('enabled_dexes', currentDexes.filter(d => d !== dex));
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingConfig(null);
    setFormData({
      name: '',
      min_profit_basis_points: 50,
      max_slippage_basis_points: 300,
      max_gas_price_gwei: 50,
      enabled_tokens: ['0x4200000000000000000000000000000000000006', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'],
      enabled_dexes: ['uniswap_v2', 'uniswap_v3', 'balancer'],
      flash_loan_enabled: true,
      max_trade_amount_eth: 1.0
    });
  };

  const startEditing = (config: ArbitrageConfig) => {
    setEditingConfig(config);
    setIsCreating(false);
    setFormData({
      name: config.name,
      min_profit_basis_points: config.min_profit_basis_points,
      max_slippage_basis_points: config.max_slippage_basis_points,
      max_gas_price_gwei: config.max_gas_price_gwei,
      enabled_tokens: config.enabled_tokens,
      enabled_dexes: config.enabled_dexes,
      flash_loan_enabled: config.flash_loan_enabled,
      max_trade_amount_eth: config.max_trade_amount_eth
    });
  };

  const cancelEditing = () => {
    setEditingConfig(null);
    setIsCreating(false);
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      setError(null);

      const url = editingConfig ? `/api/config?id=${editingConfig.id}` : '/api/config';
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: formData
      });

      if (response.data.success) {
        await fetchConfigs();
        cancelEditing();
      } else {
        setError(response.data.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      console.error('Config save error:', err);
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/config?id=${configId}`);
      
      if (response.data.success) {
        await fetchConfigs();
      } else {
        setError(response.data.error || 'Failed to delete configuration');
      }
    } catch (err: any) {
      console.error('Config delete error:', err);
      setError(err.response?.data?.error || 'Network error occurred');
    }
  };

  const availableDexes = [
    { id: 'uniswap_v2', name: 'Uniswap V2' },
    { id: 'uniswap_v3', name: 'Uniswap V3' },
    { id: 'balancer', name: 'Balancer' },
    { id: 'curve', name: 'Curve' }
  ];

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Arbitrage Configurations</h2>
        <Button 
          onClick={startCreating}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration List */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Existing Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
                <p className="text-gray-300">Loading configurations...</p>
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300">No configurations found</p>
                <Button onClick={startCreating} className="mt-4" variant="outline">
                  Create your first configuration
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <div key={config.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{config.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(config)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteConfig(config.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>Min Profit: {config.min_profit_basis_points}bp</div>
                      <div>Max Slippage: {config.max_slippage_basis_points}bp</div>
                      <div>Max Gas: {config.max_gas_price_gwei} gwei</div>
                      <div>Max Amount: {config.max_trade_amount_eth} ETH</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {config.enabled_dexes.map((dex) => (
                        <Badge key={dex} variant="outline" className="text-xs">
                          {dex}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Form */}
        {(isCreating || editingConfig) && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {isCreating ? 'Create Configuration' : 'Edit Configuration'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Configuration Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter configuration name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_profit" className="text-white">Min Profit (basis points)</Label>
                  <Input
                    id="min_profit"
                    type="number"
                    value={formData.min_profit_basis_points}
                    onChange={(e) => handleInputChange('min_profit_basis_points', parseInt(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="max_slippage" className="text-white">Max Slippage (basis points)</Label>
                  <Input
                    id="max_slippage"
                    type="number"
                    value={formData.max_slippage_basis_points}
                    onChange={(e) => handleInputChange('max_slippage_basis_points', parseInt(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_gas" className="text-white">Max Gas Price (gwei)</Label>
                  <Input
                    id="max_gas"
                    type="number"
                    value={formData.max_gas_price_gwei}
                    onChange={(e) => handleInputChange('max_gas_price_gwei', parseInt(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="max_amount" className="text-white">Max Trade Amount (ETH)</Label>
                  <Input
                    id="max_amount"
                    type="number"
                    step="0.1"
                    value={formData.max_trade_amount_eth}
                    onChange={(e) => handleInputChange('max_trade_amount_eth', parseFloat(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Enabled DEXes</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableDexes.map((dex) => (
                    <div key={dex.id} className="flex items-center space-x-2">
                      <Switch
                        checked={formData.enabled_dexes.includes(dex.id)}
                        onCheckedChange={(checked) => handleDexesChange(dex.id, checked)}
                      />
                      <Label className="text-white text-sm">{dex.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.flash_loan_enabled}
                  onCheckedChange={(checked) => handleInputChange('flash_loan_enabled', checked)}
                />
                <Label className="text-white">Enable Flash Loans</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={saveConfig}
                  disabled={saving || !formData.name}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                <Button
                  onClick={cancelEditing}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
