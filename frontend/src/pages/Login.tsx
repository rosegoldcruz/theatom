import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md bg-gray-900/50 border-purple-500/20 relative z-10">
        <CardHeader className="text-center">
          {/* ATOM Logo */}
          <div className="mb-6 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 relative">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/686038f307d9dd2be3c229d1_1751848002115_bbf861ce.png" 
                alt="ATOM Logo" 
                className="w-full h-full object-contain animate-spin-slow"
              />
              {/* Orbit rings */}
              <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border border-purple-400/40 rounded-full animate-pulse"></div>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              THE ATOM
            </span>
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Secure Access Portal
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Authorized Personnel Only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
