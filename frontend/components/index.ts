// Main Components
export { ATOMTradingSystem } from './ATOMTradingSystem';
export { Sidebar } from './Sidebar';
export { Header } from './Header';
export { TradingMetrics } from './TradingMetrics';
export { BotControls } from './BotControls';
export { OpportunitiesFeed } from './OpportunitiesFeed';
export { NetworkSelector } from './NetworkSelector';
export { ThemeCustomizer } from './ThemeCustomizer';

// Page Components
export { DashboardPage } from './pages/DashboardPage';
export { BotControlPage } from './pages/BotControlPage';
export { OpportunitiesPage } from './pages/OpportunitiesPage';
export { SettingsPage } from './pages/SettingsPage';

// Legacy Components (if needed)
export { default as LandingPage } from './LandingPage';
export { LoginForm } from './LoginForm';
export { ProtectedRoute } from './ProtectedRoute';
export { AuthProvider, useAuth } from './AuthContext';
