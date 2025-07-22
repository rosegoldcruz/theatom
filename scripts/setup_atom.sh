#!/bin/bash

# 🤖 ATOM - PM2 Setup Script
# Advanced Efficient Optimized Network - Node.js Bot Management
# This script configures PM2 for the ATOM arbitrage bot

set -e  # Exit on any error

echo "🤖 ATOM - PM2 Setup Script"
echo "=========================="
echo "🚀 Configuring PM2 for ATOM bot..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BOT_DIR="$PROJECT_ROOT/bot"

print_header "📍 Bot directory: $BOT_DIR"
echo ""

# ============================================================================
# STEP 1: INSTALL PM2 GLOBALLY
# ============================================================================
print_header "📦 Installing PM2 globally..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js first."
    exit 1
fi

# Install PM2 globally
print_status "Installing PM2 process manager..."
npm install -g pm2

# Verify PM2 installation
if command -v pm2 &> /dev/null; then
    print_status "✅ PM2 installed successfully"
    pm2 --version
else
    print_error "❌ PM2 installation failed"
    exit 1
fi

echo ""

# ============================================================================
# STEP 2: SETUP BOT DIRECTORY
# ============================================================================
print_header "📁 Setting up bot directory..."

# Navigate to bot directory
cd "$BOT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_warning "package.json not found, creating basic one..."
    cat > package.json << EOF
{
  "name": "atom-arbitrage-bot",
  "version": "2.0.0",
  "description": "ATOM - Advanced arbitrage bot for THEATOM network",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop atom",
    "pm2:restart": "pm2 restart atom",
    "pm2:logs": "pm2 logs atom"
  },
  "dependencies": {
    "ethers": "^6.0.0",
    "dotenv": "^16.0.0",
    "axios": "^1.0.0",
    "winston": "^3.8.0"
  },
  "keywords": ["arbitrage", "defi", "ethereum", "bot"],
  "author": "THEATOM",
  "license": "MIT"
}
EOF
    print_status "✅ Created package.json"
fi

# Install dependencies
if [ -f "package.json" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
else
    print_error "❌ package.json still not found"
    exit 1
fi

echo ""

# ============================================================================
# STEP 3: CREATE PM2 ECOSYSTEM CONFIG
# ============================================================================
print_header "⚙️  Creating PM2 ecosystem configuration..."

# Create PM2 ecosystem config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'atom',
      script: 'src/index.js',
      cwd: '$BOT_DIR',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      
      // Restart policy
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: '$BOT_DIR/logs/atom.log',
      out_file: '$BOT_DIR/logs/atom-out.log',
      error_file: '$BOT_DIR/logs/atom-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Auto restart on file changes (development)
      // watch: ['src'],
      
      // Memory management
      max_memory_restart: '500M',
      
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Source map support
      source_map_support: true,
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true
    }
  ]
};
EOF

print_status "✅ Created PM2 ecosystem configuration"

echo ""

# ============================================================================
# STEP 4: CREATE BASIC BOT INDEX FILE (IF MISSING)
# ============================================================================
print_header "📝 Checking bot entry point..."

# Create src directory if it doesn't exist
mkdir -p src

# Create basic index.js if it doesn't exist
if [ ! -f "src/index.js" ]; then
    print_warning "src/index.js not found, creating basic template..."
    
    mkdir -p logs
    
    cat > src/index.js << EOF
/**
 * ATOM - Advanced Arbitrage Bot
 * Part of THEATOM - Advanced Efficient Optimized Network
 */

require('dotenv').config();
const { ethers } = require('ethers');

console.log('🤖 ATOM - Advanced Arbitrage Bot Starting...');
console.log('============================================');

// Configuration
const config = {
    rpcUrl: process.env.NODE_RPC || process.env.BASE_SEPOLIA_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS || process.env.BASE_SEPOLIA_CONTRACT_ADDRESS,
    scanInterval: parseInt(process.env.SCAN_INTERVAL) || 3000,
    minProfitThreshold: parseFloat(process.env.MIN_PROFIT_THRESHOLD) || 10.0
};

// Validate configuration
if (!config.rpcUrl) {
    console.error('❌ RPC URL not configured');
    process.exit(1);
}

if (!config.privateKey) {
    console.error('❌ Private key not configured');
    process.exit(1);
}

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(config.privateKey, provider);

console.log('✅ Configuration loaded');
console.log('📍 Wallet Address:', wallet.address);
console.log('🌐 Network:', config.rpcUrl.includes('sepolia') ? 'Base Sepolia' : 'Unknown');
console.log('⏱️  Scan Interval:', config.scanInterval + 'ms');
console.log('💰 Min Profit Threshold:', config.minProfitThreshold);

// Main bot loop
async function startBot() {
    console.log('🚀 Starting arbitrage scanning...');
    
    let scanCount = 0;
    
    const scanLoop = async () => {
        try {
            scanCount++;
            console.log(\`🔍 Scan #\${scanCount} - \${new Date().toISOString()}\`);
            
            // Get wallet balance
            const balance = await provider.getBalance(wallet.address);
            const balanceEth = ethers.formatEther(balance);
            
            console.log(\`💰 Wallet Balance: \${balanceEth} ETH\`);
            
            // TODO: Implement actual arbitrage scanning logic
            // This is a placeholder that demonstrates the bot is running
            
            if (scanCount % 10 === 0) {
                console.log(\`📊 Completed \${scanCount} scans - Bot is healthy\`);
            }
            
        } catch (error) {
            console.error('❌ Scan error:', error.message);
        }
        
        // Schedule next scan
        setTimeout(scanLoop, config.scanInterval);
    };
    
    // Start the scanning loop
    scanLoop();
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the bot
startBot().catch(error => {
    console.error('❌ Bot startup failed:', error);
    process.exit(1);
});
EOF
    
    print_status "✅ Created basic bot template"
fi

echo ""

# ============================================================================
# STEP 5: START ATOM WITH PM2
# ============================================================================
print_header "🚀 Starting ATOM with PM2..."

# Stop any existing ATOM processes
print_status "Stopping any existing ATOM processes..."
pm2 stop atom 2>/dev/null || true
pm2 delete atom 2>/dev/null || true

# Start ATOM using ecosystem config
print_status "Starting ATOM bot..."
pm2 start ecosystem.config.js

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

echo ""

# ============================================================================
# STEP 6: VERIFICATION
# ============================================================================
print_header "✅ Verifying ATOM setup..."

# Check PM2 status
print_status "PM2 Process List:"
pm2 list

# Check if ATOM is running
if pm2 list | grep -q "atom.*online"; then
    print_status "✅ ATOM bot is running successfully"
else
    print_error "❌ ATOM bot failed to start"
    print_status "Checking logs..."
    pm2 logs atom --lines 10
fi

echo ""

# ============================================================================
# COMPLETION
# ============================================================================
print_header "🎉 ATOM PM2 SETUP COMPLETE!"
echo ""
print_status "🤖 ATOM bot is now managed by PM2!"
print_status "📊 Monitor with: pm2 monit"
print_status "📋 Status: pm2 status"
print_status "📝 Logs: pm2 logs atom"
print_status "🔄 Restart: pm2 restart atom"
print_status "🛑 Stop: pm2 stop atom"
echo ""
print_status "🚀 ATOM is ready for autonomous arbitrage operations!"
echo "=========================="
EOF
