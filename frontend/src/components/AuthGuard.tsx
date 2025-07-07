import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/login");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          {/* ATOM Logo with loading animation */}
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
          <div className="text-white text-lg font-semibold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              THE ATOM
            </span>
          </div>
          <div className="text-gray-400">Authenticating...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
