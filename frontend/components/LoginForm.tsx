'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Github, Mail } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      // TODO: Implement OAuth with Supabase
      setError('OAuth sign-in coming soon!');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError(null);
      // TODO: Implement OAuth with Supabase
      setError('OAuth sign-in coming soon!');
    } catch (err: any) {
      setError(err.message || 'GitHub sign-in failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create your account to access TheAtom arbitrage platform'
              : 'Sign in to your TheAtom account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <Mail className="h-4 w-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleGithubSignIn}
              disabled={isSubmitting}
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={isSubmitting}
            >
              {isSignUp 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
