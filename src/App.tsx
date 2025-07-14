import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AtomDashboard } from './components/AtomDashboard';
import { LoginForm } from './components/LoginForm';
import { Toaster } from './components/ui/toaster';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading ATOM...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? <AtomDashboard /> : <LoginForm />}
      <Toaster />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;