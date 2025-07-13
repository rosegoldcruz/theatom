import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { useAuth, usePermissions, useApiKey } from './AuthProvider';
import { 
  User, 
  Key, 
  Shield, 
  Settings, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Crown,
  Zap,
  LogOut,
  Save
} from 'lucide-react';
import { useToast } from '../ui/use-toast';

export const UserProfile: React.FC = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { canTrade, canAdmin, role } = usePermissions();
  const { apiKey, hasApiKey, regenerateApiKey } = useApiKey();
  const { toast } = useToast();
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    max_daily_trades: profile?.max_daily_trades || 100,
    max_position_size: profile?.max_position_size || 1000
  });

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      setLoading(true);
      const newKey = await regenerateApiKey();
      toast({
        title: "API Key Regenerated",
        description: "Your new API key has been generated. Please update your applications.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to regenerate API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Crown className="w-3 h-3 mr-1" />
          Administrator
        </Badge>;
      case 'trader':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Zap className="w-3 h-3 mr-1" />
          Trader
        </Badge>;
      default:
        return <Badge variant="outline">
          <Eye className="w-3 h-3 mr-1" />
          Viewer
        </Badge>;
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profile.full_name || 'Anonymous Trader'}
                  {getRoleBadge()}
                </CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          {canAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and trading preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {canTrade && (
                <>
                  <Separator />
                  <h4 className="text-sm font-semibold">Trading Limits</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxTrades">Max Daily Trades</Label>
                      <Input
                        id="maxTrades"
                        type="number"
                        value={formData.max_daily_trades}
                        onChange={(e) => setFormData({ ...formData, max_daily_trades: parseInt(e.target.value) })}
                        min="1"
                        max="1000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxPosition">Max Position Size ($)</Label>
                      <Input
                        id="maxPosition"
                        type="number"
                        value={formData.max_position_size}
                        onChange={(e) => setFormData({ ...formData, max_position_size: parseFloat(e.target.value) })}
                        min="1"
                        max="100000"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Account Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Your account is {profile.is_active ? 'active' : 'inactive'}
                    </p>
                  </div>
                  <Badge variant={profile.is_active ? 'default' : 'destructive'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Role & Permissions</h4>
                    <p className="text-sm text-muted-foreground">
                      {role === 'admin' ? 'Full system access' :
                       role === 'trader' ? 'Trading and viewing access' :
                       'View-only access'}
                    </p>
                  </div>
                  {getRoleBadge()}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access to the trading system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasApiKey ? (
                <div className="space-y-4">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      Keep your API key secure. It provides full access to your account.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey || ''}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey || '', 'API Key')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={handleRegenerateApiKey}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate API Key
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No API Key</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate an API key to access the trading system programmatically.
                  </p>
                  <Button onClick={handleRegenerateApiKey} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Generate API Key
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        {canAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Administrator Panel</CardTitle>
                <CardDescription>
                  System administration and user management tools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Administrator features are coming soon. This will include user management,
                    system monitoring, and configuration tools.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
