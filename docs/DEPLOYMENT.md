# 🚀 ATOM Arbitrage - Deployment Guide

This guide covers the complete deployment process for the ATOM Arbitrage System across all components.

## 📋 Prerequisites

### Required Accounts & Services
- **GitHub Account**: For code repository and CI/CD
- **Vercel Account**: For frontend deployment
- **Supabase Account**: For database and authentication
- **Alchemy/Infura**: For blockchain RPC endpoints
- **Railway/AWS/GCP**: For orchestrator bot hosting
- **Telegram Bot**: For notifications (optional)
- **Email Provider**: For notifications (optional)

### Required Tools
- Node.js 18+
- Git
- Ethereum wallet with Base Sepolia ETH (for testnet)
- Ethereum wallet with Base ETH (for mainnet)

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 3. Set Up Row Level Security
The migrations automatically set up RLS policies, but verify:
- Users can only access their own data
- Admin users have full access
- API keys are properly configured

## 🔗 Smart Contract Deployment

### 1. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
PRIVATE_KEY=your_wallet_private_key
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Deploy to Base Sepolia (Testnet)
```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to testnet
npm run deploy:base

# Verify on Etherscan
npx hardhat verify --network base_sepolia DEPLOYED_CONTRACT_ADDRESS
```

### 3. Deploy to Base Mainnet (Production)
```bash
# Update environment for mainnet
BASE_MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Deploy to mainnet
npm run deploy:base-mainnet

# Verify on Etherscan
npx hardhat verify --network base_mainnet DEPLOYED_CONTRACT_ADDRESS
```

## 🌐 Frontend Deployment

### 1. Configure Vercel Project
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard:

```env
# Blockchain Configuration
VITE_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_BASE_SEPOLIA_CONTRACT_ADDRESS=0xYourContractAddress

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFICATION_EMAIL=alerts@your-domain.com
```

### 2. Deploy via GitHub
```bash
# Push to main branch triggers automatic deployment
git add .
git commit -m "Deploy ATOM Arbitrage System"
git push origin main
```

### 3. Custom Domain (Optional)
1. Add your domain in Vercel dashboard
2. Configure DNS records
3. Enable HTTPS

## 🤖 Orchestrator Bot Deployment

### 1. Railway Deployment
1. Create Railway account
2. Connect GitHub repository
3. Create new project from GitHub repo
4. Set environment variables:

```env
NODE_ENV=production
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
BASE_SEPOLIA_CONTRACT_ADDRESS=0xYourContractAddress
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_super_secret_jwt_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFICATION_EMAIL=alerts@your-domain.com
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_PORT=3001
```

### 2. Docker Deployment
```bash
# Build orchestrator image
cd orchestrator
docker build -t atom-orchestrator .

# Run with environment file
docker run -d \
  --name atom-orchestrator \
  --env-file .env \
  -p 3001:3001 \
  atom-orchestrator
```

### 3. Docker Compose Deployment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f orchestrator

# Stop services
docker-compose down
```

## 🔐 Security Configuration

### 1. Environment Variables Security
- Never commit `.env` files to git
- Use different keys for development and production
- Rotate keys regularly
- Use strong, unique passwords

### 2. Wallet Security
- Use hardware wallets for production
- Keep private keys encrypted
- Use multi-signature wallets for large amounts
- Monitor wallet activity

### 3. API Security
- Enable rate limiting
- Use HTTPS everywhere
- Implement proper CORS policies
- Monitor API usage

## 📊 Monitoring Setup

### 1. Application Monitoring
- Set up Vercel analytics
- Configure error tracking (Sentry)
- Monitor API response times
- Track user engagement

### 2. Bot Monitoring
- Monitor bot uptime
- Track trading performance
- Set up alerts for errors
- Monitor gas usage

### 3. Smart Contract Monitoring
- Monitor contract events
- Track gas usage
- Set up alerts for large transactions
- Monitor contract balance

## 🚨 Alerting Configuration

### 1. Telegram Alerts
```bash
# Create Telegram bot
# 1. Message @BotFather on Telegram
# 2. Create new bot with /newbot
# 3. Get bot token
# 4. Add bot to your group/channel
# 5. Get chat ID
```

### 2. Email Alerts
```bash
# Configure SMTP settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # Use app password for Gmail
```

### 3. Discord Webhooks (Optional)
```bash
# Create Discord webhook
# Add webhook URL to environment variables
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Setup
The repository includes a complete CI/CD pipeline that:
- Runs tests on every push
- Deploys to staging on PR merge
- Deploys to production on main branch push
- Verifies smart contracts
- Sends deployment notifications

### 2. Required GitHub Secrets
```env
# Vercel
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Blockchain
PRIVATE_KEY=your_wallet_private_key
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Orchestrator
RAILWAY_TOKEN=your_railway_token

# Notifications
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

## 🧪 Testing Deployment

### 1. Frontend Testing
```bash
# Test locally
npm run dev

# Test production build
npm run build
npm run preview

# Test API endpoints
curl https://your-domain.com/api/health
```

### 2. Smart Contract Testing
```bash
# Run contract tests
npm run test

# Test on testnet
npm run deploy:base

# Verify contract functionality
npx hardhat run scripts/test-deployment.js --network base_sepolia
```

### 3. Orchestrator Testing
```bash
# Test orchestrator locally
cd orchestrator
npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Check logs
docker-compose logs orchestrator
```

## 🚀 Go Live Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Smart contracts deployed and verified
- [ ] Frontend deployed to Vercel
- [ ] Orchestrator deployed and running
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Monitoring and alerts set up
- [ ] Security audit completed

### Launch
- [ ] Switch to mainnet configuration
- [ ] Deploy contracts to mainnet
- [ ] Update frontend with mainnet addresses
- [ ] Start orchestrator with mainnet config
- [ ] Monitor initial transactions
- [ ] Verify all systems operational

### Post-Launch
- [ ] Monitor system performance
- [ ] Track trading metrics
- [ ] Respond to any issues
- [ ] Gather user feedback
- [ ] Plan future improvements

## 🆘 Troubleshooting

### Common Issues
1. **Contract deployment fails**: Check gas price and network congestion
2. **Frontend build errors**: Verify environment variables
3. **Orchestrator connection issues**: Check RPC endpoints and API keys
4. **Database connection errors**: Verify Supabase configuration

### Support Resources
- [GitHub Issues](https://github.com/your-username/atom-arbitrage/issues)
- [Discord Community](https://discord.gg/atom-arbitrage)
- [Documentation](https://docs.atom-arbitrage.com)

---

**🎉 Congratulations! Your ATOM Arbitrage System is now live! 🎉**
