# 🔐 **ATOM ARBITRAGE - ENVIRONMENT VARIABLES SETUP**

## 📁 **FILE STRUCTURE**

```
theatom/
├── .env.local                 ← Smart contract deployment (Hardhat)
├── frontend/.env.local        ← Website & user interface
├── backend/.env.local         ← Trading logic & blockchain connections
└── ENV_SETUP.md              ← This documentation
```

---

## 🎯 **WHAT EACH FILE DOES**

### **🌐 FRONTEND (`frontend/.env.local`)**
**Purpose**: Website functionality, user authentication, public APIs
- ✅ **Safe for Vercel deployment**
- ✅ **NEXT_PUBLIC_* variables exposed to browser**
- ⚠️  **Private auth secrets server-side only**

### **⚡ BACKEND (`backend/.env.local`)**
**Purpose**: Trading bot, blockchain connections, private keys
- 🔐 **ULTRA SENSITIVE - Contains private keys**
- 🚫 **NEVER deploy to frontend**
- 🏗️  **For Railway/Node.js backend**

### **🔗 ROOT (`.env.local`)**
**Purpose**: Smart contract deployment with Hardhat
- 🔧 **For contract deployment only**
- 🔐 **Contains deployment private key**
- 📝 **Used by Hardhat scripts**

---

## 🚨 **SECURITY LEVELS**

### **🟢 PUBLIC (Safe to expose)**
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_ALCHEMY_KEY
NEXT_PUBLIC_APP_URL
```

### **🟡 PRIVATE (Server-side only)**
```env
NEXTAUTH_SECRET
JWT_SECRET
SESSION_SECRET
```

### **🔴 ULTRA SENSITIVE (Never expose)**
```env
PRIVATE_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_PASSWORD
```

---

## 🚀 **DEPLOYMENT SETUP**

### **Vercel (Frontend)**
Add to Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BACKEND_API_URL
NEXT_PUBLIC_ALCHEMY_KEY
NEXT_PUBLIC_INFURA_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
NEXTAUTH_SECRET
NEXTAUTH_URL
JWT_SECRET
SESSION_SECRET
```

### **Railway (Backend - Future)**
Add to Railway dashboard → Variables:
```
SUPABASE_SERVICE_ROLE_KEY
PRIVATE_KEY
POSTGRES_URL
ALCHEMY_KEY
INFURA_KEY
API_SECRET
DB_ENCRYPTION_KEY
```

---

## 🔧 **CURRENT STATUS**

### **✅ READY**
- Frontend environment variables
- Supabase authentication
- Blockchain RPC connections
- Google OAuth setup

### **🔄 FUTURE ADDITIONS**
- Stripe payment processing
- DEX API integrations
- Email notifications
- Telegram alerts

---

## ⚠️  **IMPORTANT NOTES**

1. **Never commit `.env.local` files** - Already protected by `.gitignore`
2. **Private keys are for TESTNET only** - Replace for mainnet
3. **Service role keys have full database access** - Keep secure
4. **Frontend variables with `NEXT_PUBLIC_` are exposed** - Only use for safe data

---

## 🤝 **FOR YOUR PARTNER**

**Simple Explanation:**
- **Frontend**: Website secrets (safe for Vercel)
- **Backend**: Trading bot secrets (private keys, database)
- **Root**: Smart contract deployment (Hardhat)

**All sensitive data is properly separated and secured!** 🔒
