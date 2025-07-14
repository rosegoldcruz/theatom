import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Zap, TrendingUp } from 'lucide-react';

export const LoginPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ATOM Arbitrage</h1>
              <p className="text-sm text-muted-foreground">Professional Trading Platform</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Access your arbitrage trading dashboard
          </p>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Secure Access:</strong> Your account is protected with enterprise-grade security.
            All trading activities are logged and monitored.
          </AlertDescription>
        </Alert>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Access Button */}
            <div className="space-y-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                onClick={() => window.location.href = '/dashboard'}
              >
                <Shield className="w-5 h-5 mr-2" />
                Enter Trading Dashboard
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Authentication temporarily disabled for development
              </p>
            </div>

            {/* Development Notice */}
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> Authentication is temporarily disabled.
                Click the button above to access the trading dashboard directly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">Real-time Trading</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Secure & Private</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-muted-foreground">AI-Powered</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          Professional arbitrage trading platform with enterprise security.
        </p>
      </div>
    </div>
  );
};
