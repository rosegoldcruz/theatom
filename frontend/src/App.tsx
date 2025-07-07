import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Partners from '@/components/Partners';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Dashboard from '@/components/Dashboard';
import Login from '@/pages/Login';
import AuthGuard from '@/components/AuthGuard';
import './App.css';

const HomePage = () => (
  <div className="min-h-screen bg-black">
    <Navigation />
    <Hero />
    <HowItWorks />
    <Partners />
    <Contact />
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;