# 🚀 THEATOM STARTUP GUIDE

## ✅ CONFIRMED STRUCTURE & PORTS

### 📁 Project Structure:
```
/backend  → FastAPI app (Port 8000)
/bot      → Arbitrage engine (Port 3002) 
/agents   → Orchestrators and helper agents
/frontend → Dashboard (Port 3000) - ONLY this deploys to Vercel
/isolation → ALL unused/old/experimental logic moved here
```

### 🔌 Port Configuration:
- **Backend**: Port 8000 (FastAPI)
- **Bot**: Port 3002 (Node.js)  
- **Frontend**: Port 3000 (Next.js)

## 🔧 ENVIRONMENT FILES TO UPDATE:

### Backend (.env):
```bash
# Backend runs on port 8000
PORT=8000
NODE_ENV=production

# RPC Configuration
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BASE_SEPOLIA_WSS_URL=wss://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# AAVE Configuration (CRITICAL - PRIME DIRECTIVE)
AAVE_POOL_ADDRESSES_PROVIDER=0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e

# Supabase Configuration
SUPABASE_URL=https://nmjvebcauoyqzjlnluos.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Private Key (TESTNET ONLY)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Bot (.env):
```bash
# Bot runs on port 3002
BOT_PORT=3002

# RPC Configuration
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# AAVE Configuration (CRITICAL - PRIME DIRECTIVE)
AAVE_POOL_ADDRESSES_PROVIDER=0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e

# Trading Configuration
MIN_PROFIT_THRESHOLD=0.01
MAX_GAS_PRICE_GWEI=50
MAX_TRADE_AMOUNT_ETH=1.0

# Private Key (TESTNET ONLY)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Frontend (.env.local):
```bash
# Frontend runs on port 3000 (Next.js default)

# Supabase Configuration (PUBLIC - Safe for frontend)
NEXT_PUBLIC_SUPABASE_URL=https://nmjvebcauoyqzjlnluos.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
NEXT_PUBLIC_BOT_API_URL=http://localhost:3002

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 STARTUP COMMANDS:

### Terminal 1 - Backend (FastAPI):
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Terminal 2 - Bot (Node.js):
```bash
cd bot
npm start
```

### Terminal 3 - Frontend (Next.js):
```bash
cd frontend
npm run dev
```

## ✅ VERIFICATION CHECKLIST:

### 1. Backend Health Check:
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "service": "THEATOM Backend"}
```

### 2. Bot Health Check:
```bash
curl http://localhost:3002/health
# Should return bot status and scanning state
```

### 3. Frontend Dashboard:
- Open: http://localhost:3000
- Should load dashboard showing:
  - Bot scanning state
  - Live trade logs
  - System health status

### 4. Bot Logs Verification:
Check bot terminal for:
- ✅ "🔍 Scanning for arbitrage opportunities..."
- ✅ "💡 Found X arbitrage opportunities"
- ✅ "🏥 Health check server running on port 3002"

### 5. Dashboard Integration:
- Dashboard should show live bot status
- Real-time updates from backend API
- Scanning state indicators

## 🎯 PHASE 2 DEPLOYMENT READY:

Once local verification is complete:
- ✅ Backend → DigitalOcean deployment
- ✅ Frontend → Vercel deployment (already configured)
- ✅ Bot → Production server deployment

## 🔥 AAVE PRIME DIRECTIVE CONFIRMED:
All configurations maintain AAVE flash loan integration as the core protocol foundation.
