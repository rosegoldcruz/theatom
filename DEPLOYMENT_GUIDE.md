# 🚀 DEPLOYMENT GUIDE - THEATOM REFACTORED

## 📋 PREREQUISITES

- Railway account (for backend)
- Vercel account (for frontend)
- Supabase project
- GitHub repository
- Wallet with private key
- Base Sepolia RPC access

## 🔧 STEP 1: BACKEND DEPLOYMENT (Railway)

### 1.1 Prepare Backend
```bash
cd backend
npm install
npm test  # Ensure everything works
```

### 1.2 Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder as root
4. Railway will auto-detect Node.js and use `package.json`

### 1.3 Set Environment Variables in Railway
```bash
# Required Variables
PRIVATE_KEY=your_wallet_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CONTRACT_ADDRESS=your_deployed_contract_address
JWT_SECRET=your_jwt_secret_32_chars_min

# Optional Variables
NODE_ENV=production
PORT=3001
COINGECKO_API_KEY=your_api_key
MAX_GAS_PRICE_GWEI=50
MIN_PROFIT_THRESHOLD=0.01
```

### 1.4 Verify Backend Deployment
```bash
# Test health endpoint
curl https://your-railway-app.up.railway.app/api/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

## 🎨 STEP 2: FRONTEND DEPLOYMENT (Vercel)

### 2.1 Prepare Frontend
```bash
cd frontend
npm install
npm run build  # Test build
```

### 2.2 Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `frontend` folder as root
4. Vercel will auto-detect Next.js

### 2.3 Set Environment Variables in Vercel
```bash
# Required Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_BACKEND_API_URL=https://your-railway-app.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret_32_chars_min
NODE_ENV=production
```

### 2.4 Verify Frontend Deployment
1. Visit your Vercel URL
2. Should see login page
3. Test authentication flow

## 🗄️ STEP 3: SUPABASE CONFIGURATION

### 3.1 Database Setup
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  can_execute_trades BOOLEAN DEFAULT false,
  can_control_bot BOOLEAN DEFAULT false,
  can_configure_bot BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 3.2 Authentication Setup
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable OAuth providers:
   - **Google OAuth**: Add client ID and secret
   - **GitHub OAuth**: Add client ID and secret
3. Set redirect URLs:
   - `https://your-vercel-app.vercel.app/dashboard`
   - `http://localhost:3000/dashboard` (for development)

### 3.3 API Keys
- **Anon Key**: Use in frontend (public)
- **Service Role Key**: Use in backend (private)

## 🔗 STEP 4: INTEGRATION TESTING

### 4.1 Test Authentication
```bash
# Frontend should redirect to login
curl https://your-vercel-app.vercel.app

# Should show login form or redirect to OAuth
```

### 4.2 Test API Integration
```bash
# Get auth token from frontend, then test backend
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://your-railway-app.up.railway.app/api/arbitrage/status
```

### 4.3 Test Full Flow
1. **Login** → Frontend authentication
2. **Dashboard** → Should load with data from backend
3. **Bot Control** → Start/stop should work
4. **Opportunities** → Should fetch from backend API

## 🛠️ STEP 5: SMART CONTRACT DEPLOYMENT

### 5.1 Deploy Contract (if not done)
```bash
# In project root
npx hardhat compile
npx hardhat run scripts/deployBase.cjs --network base_sepolia
```

### 5.2 Update Contract Address
Update `CONTRACT_ADDRESS` in Railway environment variables with deployed address.

## 📊 STEP 6: MONITORING & LOGS

### 6.1 Railway Logs
```bash
# View backend logs
railway logs
```

### 6.2 Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. View Functions logs

### 6.3 Supabase Logs
1. Go to Supabase Dashboard
2. Logs & Reports section
3. Monitor auth and API usage

## 🚨 TROUBLESHOOTING

### Common Issues

#### Backend Not Starting
```bash
# Check Railway logs
railway logs

# Common fixes:
# 1. Verify all environment variables are set
# 2. Check package.json start script
# 3. Ensure PORT is set correctly
```

#### Frontend Auth Issues
```bash
# Check Vercel logs
# Common fixes:
# 1. Verify Supabase URLs and keys
# 2. Check OAuth redirect URLs
# 3. Ensure JWT_SECRET matches backend
```

#### API Connection Issues
```bash
# Test backend health
curl https://your-railway-app.up.railway.app/api/health

# Check CORS settings in backend
# Verify FRONTEND_URL environment variable
```

## ✅ DEPLOYMENT CHECKLIST

### Backend (Railway)
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Health endpoint responding
- [ ] Logs showing no errors
- [ ] Database connection working

### Frontend (Vercel)
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Login page accessible
- [ ] API calls working

### Supabase
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] OAuth providers enabled
- [ ] Redirect URLs set

### Integration
- [ ] Authentication flow working
- [ ] Dashboard loading data
- [ ] Bot controls functional
- [ ] Error handling working

## 🎉 SUCCESS!

Once all steps are complete, you'll have:

1. **Secure Backend** → Railway hosting blockchain logic
2. **Fast Frontend** → Vercel hosting display layer
3. **Proper Auth** → Supabase handling users
4. **Clean Separation** → No private keys in frontend
5. **Production Ready** → Scalable architecture

Your TheAtom arbitrage platform is now deployed and ready for production use! 🚀
