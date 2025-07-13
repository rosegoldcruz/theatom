import React from 'react';
import { useAuth, usePermissions } from './AuthProvider';
import { LoginPage } from './LoginPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Shield, AlertTriangle, Crown, Zap, Eye } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'trader' | 'viewer';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'viewer',
  fallback
}) => {
  const { user, profile, loading } = useAuth();
  const { canTrade, canAdmin, canView, isActive, role } = usePermissions();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authenticating...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Verifying your credentials and loading your trading profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return <LoginPage />;
  }

  // Account inactive
  if (!isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Account Inactive</CardTitle>
            </div>
            <CardDescription>
              Your account has been temporarily deactivated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Please contact support to reactivate your account and resume trading operations.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm"><strong>Account:</strong> {profile.email}</p>
              <p className="text-sm"><strong>Status:</strong> 
                <Badge variant="destructive" className="ml-2">Inactive</Badge>
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = 'mailto:support@atomarbitrage.com'}
            >
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role permissions
  const hasPermission = () => {
    switch (requiredRole) {
      case 'admin':
        return canAdmin;
      case 'trader':
        return canTrade;
      case 'viewer':
        return canView;
      default:
        return false;
    }
  };

  // Insufficient permissions
  if (!hasPermission()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You don't have permission to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                This section requires <strong>{requiredRole}</strong> privileges. 
                Your current role is <strong>{role}</strong>.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Role:</span>
                <RoleBadge role={role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Required:</span>
                <RoleBadge role={requiredRole} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Available Actions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {canView && <li>• View trading opportunities</li>}
                {canTrade && <li>• Execute trades</li>}
                {canAdmin && <li>• System administration</li>}
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Success - render protected content
  return <>{children}</>;
};

// Role badge component
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: <Crown className="w-3 h-3" />,
          variant: 'default' as const,
          label: 'Admin'
        };
      case 'trader':
        return {
          icon: <Zap className="w-3 h-3" />,
          variant: 'secondary' as const,
          label: 'Trader'
        };
      case 'viewer':
        return {
          icon: <Eye className="w-3 h-3" />,
          variant: 'outline' as const,
          label: 'Viewer'
        };
      default:
        return {
          icon: <Eye className="w-3 h-3" />,
          variant: 'outline' as const,
          label: role
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};

// Higher-order component for role-based access
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRole: 'admin' | 'trader' | 'viewer' = 'viewer'
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Hook for conditional rendering based on permissions
export const useConditionalRender = () => {
  const permissions = usePermissions();
  
  return {
    renderForAdmin: (component: React.ReactNode) => 
      permissions.canAdmin ? component : null,
    renderForTrader: (component: React.ReactNode) => 
      permissions.canTrade ? component : null,
    renderForViewer: (component: React.ReactNode) => 
      permissions.canView ? component : null,
    renderForRole: (role: string, component: React.ReactNode) => 
      permissions.role === role ? component : null,
  };
};
