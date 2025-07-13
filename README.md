# DeFi Arbitrage Bot - Frontend Application

## Overview
A comprehensive React-based frontend for DeFi arbitrage trading with multi-network support, real-time data visualization, and AI-powered copilot assistance.

## Features
- **Multi-Network Support**: Ethereum, Base, Polygon, Arbitrum, Optimism, Avalanche, BSC, Sepolia
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **AI Copilot**: Chat interface with quick actions and voice input placeholder
- **Theme Customization**: Dark/light modes with 6 color themes and 4 branding options
- **Fake Data Generation**: Comprehensive mock data for testing and development
- **Design System**: Reusable components with style guide and export functionality

## Quick Start
```bash
npm install
npm run dev
```

## Project Structure
```
src/
├── components/
│   ├── design-system/     # Component library and style guide
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── EnhancedBotDashboard.tsx  # Main dashboard
│   ├── EnhancedCopilotChat.tsx   # AI chat interface
│   ├── MobileNavigation.tsx      # Mobile navigation
│   ├── NetworkSelector.tsx       # Network switching
│   ├── ThemeCustomizer.tsx       # Theme controls
│   └── FakeDataGenerator.tsx     # Mock data generation
├── contexts/
│   └── AppContext.tsx    # Global app state
├── constants/
│   └── networks.ts       # Network configurations
├── hooks/
│   ├── useArbitrageBot.ts # Bot state management
│   └── useWeb3.ts        # Web3 integration
└── lib/
    └── utils.ts          # Utility functions
```

## Backend Integration Guide

### 1. Network Configuration
Update `src/constants/networks.ts` with your contract addresses:
```typescript
export const NETWORKS = {
  ethereum: {
    contractAddress: 'YOUR_ETHEREUM_CONTRACT',
    rpcUrl: 'YOUR_RPC_URL',
    // ... other config
  }
};
```

### 2. API Integration
Replace mock data in these files:
- `src/hooks/useArbitrageBot.ts` - Bot status and trading data
- `src/components/FakeDataGenerator.tsx` - Replace with real API calls

### 3. Web3 Integration
Update `src/hooks/useWeb3.ts`:
```typescript
// Replace mock wallet connection with real Web3 provider
const connectWallet = async () => {
  // Your Web3 connection logic
};
```

### 4. Real-time Data
Implement WebSocket connections in:
- `src/components/EnhancedBotDashboard.tsx` - Trading metrics
- `src/components/OpportunitiesFeed.tsx` - Live opportunities

## Component Library

### Core Components
- **Button**: 6 variants (default, destructive, outline, secondary, ghost, link)
- **Card**: Elevated and outlined variants
- **Badge**: Status indicators with 4 variants
- **Input**: Form inputs with validation states
- **Alert**: Notification system with 4 severity levels

### Custom Components
- **NetworkSelector**: Multi-network dropdown with wallet integration
- **ThemeCustomizer**: Theme switching with persistence
- **TradingMetrics**: Real-time trading statistics
- **OpportunitiesFeed**: Live arbitrage opportunities

## Mobile Responsiveness

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Navigation
- Mobile: Bottom tab bar + hamburger menu
- Tablet/Desktop: Sidebar navigation

## Customization

### Themes
6 built-in color themes:
- Blue (default)
- Green
- Purple
- Orange
- Red
- Pink

### Branding
4 branding modes:
- Professional
- Crypto
- Minimal
- Gaming

## Development

### Adding New Networks
1. Update `src/constants/networks.ts`
2. Add network-specific logic in `src/hooks/useWeb3.ts`
3. Update UI components to handle new network

### Adding New Components
1. Create component in appropriate directory
2. Add to design system catalog
3. Export from index files
4. Document in style guide

### Testing
```bash
npm run test
npm run build
npm run preview
```

## Deployment

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_WEB3_PROVIDER=your_web3_provider
```

### Build
```bash
npm run build
```

## API Endpoints (Backend Requirements)

### Required Endpoints
```
GET /api/networks - Available networks
GET /api/opportunities - Live arbitrage opportunities
GET /api/bot/status - Bot status and metrics
POST /api/bot/start - Start bot
POST /api/bot/stop - Stop bot
GET /api/trades - Trading history
POST /api/trades/export - Export trades to CSV
```

### WebSocket Events
```
opportunity_update - New arbitrage opportunity
trade_executed - Trade completion
bot_status_change - Bot status update
network_status - Network health update
```

## Contributing
1. Follow component structure in `src/components/`
2. Use TypeScript for all new code
3. Follow Tailwind CSS conventions
4. Add components to design system
5. Ensure mobile responsiveness

## Support
For questions about integration or customization, refer to the in-app documentation at `/design-system` route.