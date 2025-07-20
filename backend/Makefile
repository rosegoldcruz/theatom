# ATOM v2 Makefile

.PHONY: help init install start stop status deploy test clean logs

# Default target
help:
	@echo "ATOM v2 - Available commands:"
	@echo "  make init     - Initialize project (install dependencies)"
	@echo "  make install  - Install Python dependencies"
	@echo "  make start    - Start ATOM arbitrage system"
	@echo "  make stop     - Stop ATOM arbitrage system"
	@echo "  make status   - Show system status"
	@echo "  make deploy   - Deploy smart contracts"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Clean up logs and cache"
	@echo "  make logs     - Show system logs"

# Initialize project
init: install
	@echo "🚀 Initializing ATOM v2..."
	@mkdir -p logs
	@mkdir -p config
	@cp config/.env.example config/.env || true
	@echo "✅ Project initialized!"
	@echo "📝 Please edit config/.env with your API keys"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@pip install -r requirements.txt
	@npm install

# Start the system
start:
	@echo "🚀 Starting ATOM v2 Arbitrage System..."
	@python atom_cli.py start

# Start in dry-run mode
start-dry:
	@echo "🧪 Starting ATOM v2 in dry-run mode..."
	@python atom_cli.py start --dry-run

# Stop the system
stop:
	@echo "🛑 Stopping ATOM v2..."
	@python atom_cli.py stop

# Show status
status:
	@echo "📊 ATOM v2 Status:"
	@python atom_cli.py status

# Deploy contracts
deploy:
	@echo "🚀 Deploying contracts to mainnet..."
	@python atom_cli.py deploy --network mainnet

# Deploy to testnet
deploy-testnet:
	@echo "🧪 Deploying contracts to testnet..."
	@python atom_cli.py deploy --network testnet

# Run tests
test:
	@echo "🧪 Running tests..."
	@python -m pytest tests/ -v

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	@rm -rf logs/*.log
	@rm -rf __pycache__
	@rm -rf src/__pycache__
	@rm -rf .pytest_cache
	@echo "✅ Cleanup complete"

# Show logs
logs:
	@echo "📋 Recent logs:"
	@tail -n 50 logs/atom.log || echo "No logs found"

# Emergency stop and withdraw
emergency:
	@echo "🚨 EMERGENCY STOP AND WITHDRAW"
	@python atom_cli.py emergency-withdraw

# Development mode with auto-restart
dev:
	@echo "🔧 Starting development mode..."
	@nodemon --exec "python atom_cli.py start --dry-run" --ext py

# Check configuration
check-config:
	@echo "⚙️ Checking configuration..."
	@python -c "from src.core.config_manager import ConfigManager; ConfigManager()"
	@echo "✅ Configuration is valid"

# Install development dependencies
install-dev: install
	@echo "🔧 Installing development dependencies..."
	@pip install pytest pytest-asyncio black flake8 mypy
	@npm install -g nodemon

# Format code
format:
	@echo "🎨 Formatting code..."
	@black src/ tests/ atom_cli.py
	@echo "✅ Code formatted"

# Lint code
lint:
	@echo "🔍 Linting code..."
	@flake8 src/ tests/ atom_cli.py
	@mypy src/ --ignore-missing-imports
	@echo "✅ Linting complete"

# Build Docker image
docker-build:
	@echo "🐳 Building Docker image..."
	@docker build -t atom-v2 .
	@echo "✅ Docker image built"

# Run with Docker
docker-run:
	@echo "🐳 Running ATOM v2 with Docker..."
	@docker run -d --name atom-v2 \
		-v $(PWD)/config:/app/config \
		-v $(PWD)/logs:/app/logs \
		atom-v2

# Stop Docker container
docker-stop:
	@echo "🐳 Stopping Docker container..."
	@docker stop atom-v2 || true
	@docker rm atom-v2 || true

# Show Docker logs
docker-logs:
	@echo "🐳 Docker logs:"
	@docker logs atom-v2

# Backup configuration
backup:
	@echo "💾 Backing up configuration..."
	@cp config/config.json config/config.json.backup.$(shell date +%Y%m%d_%H%M%S)
	@echo "✅ Configuration backed up"

# Restore configuration
restore:
	@echo "🔄 Available backups:"
	@ls -la config/config.json.backup.* 2>/dev/null || echo "No backups found"

# Monitor system
monitor:
	@echo "📊 Monitoring ATOM v2..."
	@watch -n 5 "python atom_cli.py status"

# Quick setup for new users
quick-start: init check-config
	@echo "🚀 Quick start complete!"
	@echo "Next steps:"
	@echo "1. Edit config/.env with your API keys"
	@echo "2. Run 'make deploy-testnet' to deploy contracts"
	@echo "3. Run 'make start-dry' to test the system"
	@echo "4. Run 'make start' to begin live trading"
