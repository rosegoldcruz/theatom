import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AppContextProvider } from '@/contexts/AppContext';
import { ResponsiveDashboard } from '@/components/ResponsiveDashboard';
import { DesignSystemApp } from '@/components/design-system/DesignSystemApp';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserProfile } from '@/components/auth/UserProfile';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContextProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute requiredRole="viewer">
                      <ResponsiveDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="viewer">
                      <ResponsiveDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredRole="viewer">
                      <div className="container mx-auto px-4 py-8">
                        <UserProfile />
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trading"
                  element={
                    <ProtectedRoute requiredRole="trader">
                      <ResponsiveDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <div className="container mx-auto px-4 py-8">
                        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
                        <p>Admin features coming soon...</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route path="/design-system" element={<DesignSystemApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AppContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;