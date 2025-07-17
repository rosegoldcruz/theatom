# ATOM Arbitrage Trading System

A production-ready React TypeScript application for crypto arbitrage trading with AAVE flash loans, multi-DEX routing, and real-time opportunity detection.

## 🏗️ Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page (ATOM Trading System)
├── components/             # React components
│   ├── ui/                 # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── BotControlPage.tsx
│   │   ├── OpportunitiesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── ATOMTradingSystem.tsx  # Main app component
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── Header.tsx             # Top header
│   ├── TradingMetrics.tsx     # Metrics dashboard
│   ├── BotControls.tsx        # Bot control panel
│   ├── OpportunitiesFeed.tsx  # Live opportunities table
│   ├── NetworkSelector.tsx    # Network selection
│   ├── ThemeCustomizer.tsx    # Theme settings
│   └── index.ts               # Component exports
├── contexts/               # React contexts
│   └── AppContext.tsx      # Global app state
├── hooks/                  # Custom React hooks
│   ├── useArbitrageBot.ts  # Bot state management
│   ├── useWeb3.ts          # Wallet connection
│   ├── useRealTimeData.ts  # WebSocket data
│   ├── useArbitrageAPI.ts  # API integration (legacy)
│   └── index.ts            # Hook exports
├── constants/              # App constants
│   └── networks.ts         # Network configurations
├── types/                  # TypeScript definitions
│   └── index.ts            # Type definitions
└── lib/                    # Utilities
    ├── api.ts              # API functions
    ├── supabase.ts         # Supabase client
    └── utils.ts            # Utility functions
```

## 🚀 Key Features

### ✅ Implemented
- **Real-time Dashboard**: Live trading metrics and bot status
- **Bot Control System**: Start/stop/pause with configuration
- **Live Opportunities Feed**: Real-time arbitrage opportunities
- **Multi-Network Support**: Ethereum, Polygon, Arbitrum, Optimism
- **Theme System**: 6 color themes + dark/light mode
- **Mobile Responsive**: Touch-optimized interface
- **WebSocket Simulation**: Real-time data updates
- **State Management**: React Context with persistence

### 🔄 In Progress
- **Analytics Page**: Advanced charts and performance metrics
- **Trade History**: Complete transaction history
- **Enhanced Real-time**: WebSocket integration with backend

## 🎨 UI Components

### Core Components
- **ATOMTradingSystem**: Main application wrapper
- **Sidebar**: Navigation with user profile
- **Header**: Network selector, wallet connection, theme toggle
- **TradingMetrics**: Key performance indicators
- **BotControls**: Bot configuration and system status
- **OpportunitiesFeed**: Live arbitrage opportunities table

### UI Library
Built on **shadcn/ui** with Radix UI primitives:
- Button, Card, Input, Select, Switch, Table
- Checkbox, Badge, Alert components
- Fully accessible and customizable

## 🔧 State Management

### AppContext
Global state management with React Context:
```typescript
interface AppState {
  currentPage: PageId;
  theme: ThemeColor;
  isDark: boolean;
  selectedNetwork: string;
  isWalletConnected: boolean;
  walletAddress: string;
  showBalance: boolean;
  isMobile: boolean;
  isSidebarOpen: boolean;
}
```

### Custom Hooks
- **useArbitrageBot**: Bot status, config, and trading metrics
- **useWeb3**: Wallet connection and network switching
- **useRealTimeData**: WebSocket data and opportunity updates

## 🌐 Network Support

### Supported Networks
- **Ethereum**: Mainnet with AAVE integration
- **Polygon**: Low-cost transactions
- **Arbitrum**: Layer 2 scaling
- **Optimism**: Optimistic rollup

### DEX Integration
- Uniswap V2/V3
- Sushiswap
- Balancer
- Curve
- 1inch

## 🎯 Trading Features

### Bot Configuration
- Maximum flash loan amount
- Minimum profit threshold
- Max gas price limits
- DEX selection
- Slippage tolerance

### Real-time Monitoring
- Live opportunity detection
- Spread percentage tracking
- Profit estimation
- Gas cost calculation
- Execution status

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (collapsible sidebar)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Overlay sidebar navigation
- Touch-optimized controls
- Responsive grid layouts
- Optimized table scrolling

## 🎨 Theming

### Color Themes
- Blue (default)
- Green
- Purple
- Orange
- Red
- Pink

### Dark Mode
- Automatic system detection
- Manual toggle
- Persistent preferences
- Consistent across all components

## 🔌 API Integration

### Mock Implementation
Currently uses mock data for development:
- Simulated WebSocket connections
- Mock trading metrics
- Fake opportunity generation
- Simulated bot operations

### Production Ready
Structured for easy backend integration:
- Typed API responses
- Error handling
- Loading states
- Real-time subscriptions

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x
- pnpm package manager

### Installation
```bash
cd frontend
pnpm install
```

### Development
```bash
pnpm run dev
```

### Build
```bash
pnpm run build
pnpm run start
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### Customization
- Modify `constants/networks.ts` for network configs
- Update `types/index.ts` for type definitions
- Customize themes in `constants/networks.ts`

## 📊 Performance

### Optimizations
- React.memo for expensive components
- useCallback for event handlers
- Efficient re-renders with Context
- Lazy loading for heavy components

### Real-time Updates
- 3-second intervals for live data
- WebSocket simulation
- Efficient state updates
- Minimal re-renders

## 🧪 Testing

### Recommended Testing
- Unit tests for hooks
- Component testing with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Environment Setup
- Configure environment variables
- Set up domain and SSL
- Enable analytics and monitoring

## 📈 Future Enhancements

### Planned Features
- Real WebSocket integration
- Advanced analytics dashboard
- Trade history with filters
- Performance optimization
- Mobile app version

### Backend Integration
- Replace mock data with real APIs
- WebSocket server connection
- Database integration
- Authentication system

---

**Built with**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui

**Status**: Production-ready frontend, ready for backend integration
