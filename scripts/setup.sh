#!/bin/bash

# 🧬 THEATOM - System Setup and Boot Script
# Advanced Efficient Optimized Network - Production Deployment
# This script sets up the entire THEATOM system for production use

set -e  # Exit on any error

echo "🧬 THEATOM - Advanced Efficient Optimized Network"
echo "=================================================="
echo "🚀 Starting system setup and deployment..."
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_header "📍 Project root: $PROJECT_ROOT"
echo ""

# ============================================================================
# STEP 1: SYSTEM DEPENDENCIES
# ============================================================================
print_header "🔧 Installing system dependencies..."

# Update system
print_status "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install Python 3 and pip
print_status "Installing Python 3 and pip..."
apt-get install -y python3 python3-pip python3-venv

# Install Node.js and npm
print_status "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2 process manager..."
npm install -g pm2

# Install other dependencies
print_status "Installing additional dependencies..."
apt-get install -y curl wget git htop nano systemctl

echo ""

# ============================================================================
# STEP 2: PYTHON DEPENDENCIES
# ============================================================================
print_header "🐍 Setting up Python environment..."

# Install FastAPI dependencies
print_status "Installing Python dependencies..."
cd "$PROJECT_ROOT/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
print_status "Installing Python packages..."
source venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn python-dotenv requests asyncio logging pathlib

# Install ADOM dependencies
cd "$PROJECT_ROOT/backend/adom"
if [ ! -d "venv" ]; then
    print_status "Creating ADOM virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install requests python-dotenv

echo ""

# ============================================================================
# STEP 3: NODE.JS DEPENDENCIES
# ============================================================================
print_header "🤖 Setting up Node.js environment..."

# Install bot dependencies
print_status "Installing ATOM bot dependencies..."
cd "$PROJECT_ROOT/bot"
if [ -f "package.json" ]; then
    npm install
else
    print_warning "No package.json found in bot directory"
fi

echo ""

# ============================================================================
# STEP 4: SYSTEMD SERVICES
# ============================================================================
print_header "⚙️  Setting up SystemD services..."

# Copy service files
print_status "Installing SystemD service files..."
cp "$PROJECT_ROOT/systemd/fastapi.service" /etc/systemd/system/
cp "$PROJECT_ROOT/systemd/adom.service" /etc/systemd/system/

# Set correct permissions
chmod 644 /etc/systemd/system/fastapi.service
chmod 644 /etc/systemd/system/adom.service

# Reload systemd daemon
print_status "Reloading SystemD daemon..."
systemctl daemon-reload

# Enable services
print_status "Enabling THEATOM services..."
systemctl enable fastapi.service
systemctl enable adom.service

echo ""

# ============================================================================
# STEP 5: CREATE DIRECTORIES AND PERMISSIONS
# ============================================================================
print_header "📁 Setting up directories and permissions..."

# Create log directories
print_status "Creating log directories..."
mkdir -p "$PROJECT_ROOT/backend/logs"
mkdir -p "$PROJECT_ROOT/bot/logs"
mkdir -p /var/log/theatom

# Set permissions
print_status "Setting permissions..."
chown -R root:root "$PROJECT_ROOT"
chmod -R 755 "$PROJECT_ROOT"
chmod 600 "$PROJECT_ROOT/backend/.env"
chmod 600 "$PROJECT_ROOT/bot/.env"

echo ""

# ============================================================================
# STEP 6: START SERVICES
# ============================================================================
print_header "🚀 Starting THEATOM services..."

# Start FastAPI service
print_status "Starting FastAPI orchestration layer..."
systemctl start fastapi.service

# Wait a moment for FastAPI to start
sleep 3

# Start ADOM service
print_status "Starting ADOM arbitrage engine..."
systemctl start adom.service

# Check service status
print_status "Checking service status..."
echo ""
echo "FastAPI Service Status:"
systemctl status fastapi.service --no-pager -l
echo ""
echo "ADOM Service Status:"
systemctl status adom.service --no-pager -l

echo ""

# ============================================================================
# STEP 7: SETUP PM2 FOR ATOM
# ============================================================================
print_header "🔄 Setting up PM2 for ATOM bot..."

cd "$PROJECT_ROOT/bot"
if [ -f "src/index.js" ]; then
    print_status "Starting ATOM bot with PM2..."
    pm2 start src/index.js --name "atom-bot"
    pm2 save
    pm2 startup
else
    print_warning "ATOM bot index.js not found, skipping PM2 setup"
fi

echo ""

# ============================================================================
# STEP 8: VERIFICATION
# ============================================================================
print_header "✅ Verifying installation..."

# Check if services are running
if systemctl is-active --quiet fastapi.service; then
    print_status "✅ FastAPI service is running"
else
    print_error "❌ FastAPI service is not running"
fi

if systemctl is-active --quiet adom.service; then
    print_status "✅ ADOM service is running"
else
    print_error "❌ ADOM service is not running"
fi

# Check PM2 processes
if pm2 list | grep -q "atom-bot"; then
    print_status "✅ ATOM bot is running under PM2"
else
    print_warning "⚠️  ATOM bot is not running under PM2"
fi

# Test API endpoint
print_status "Testing FastAPI endpoint..."
sleep 2
if curl -s http://localhost:8000/api/health > /dev/null; then
    print_status "✅ FastAPI API is responding"
else
    print_warning "⚠️  FastAPI API is not responding"
fi

echo ""

# ============================================================================
# COMPLETION
# ============================================================================
print_header "🎉 THEATOM SETUP COMPLETE!"
echo ""
print_status "🧬 Advanced Efficient Optimized Network is now running!"
print_status "📊 FastAPI Dashboard: http://localhost:8000"
print_status "🔍 Health Check: http://localhost:8000/api/health"
print_status "📈 System Status: http://localhost:8000/api/status"
echo ""
print_status "🔧 Management Commands:"
print_status "  • Restart FastAPI: sudo systemctl restart fastapi.service"
print_status "  • Restart ADOM: sudo systemctl restart adom.service"
print_status "  • View logs: sudo journalctl -u fastapi.service -f"
print_status "  • PM2 status: pm2 status"
print_status "  • PM2 logs: pm2 logs atom-bot"
echo ""
print_status "🚀 THEATOM is ready for autonomous arbitrage operations!"
echo "=================================================="
