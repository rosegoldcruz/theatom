-- ATOM ARBITRAGE SYSTEM DATABASE SCHEMA
-- Complete database structure for production arbitrage system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Arbitrage configuration table
CREATE TABLE public.arbitrage_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_profit_basis_points INTEGER NOT NULL DEFAULT 50, -- 0.5%
  max_slippage_basis_points INTEGER NOT NULL DEFAULT 300, -- 3%
  max_gas_price_gwei INTEGER NOT NULL DEFAULT 50,
  enabled_tokens TEXT[] NOT NULL DEFAULT '{}',
  enabled_dexes TEXT[] NOT NULL DEFAULT '{"uniswap_v2", "uniswap_v3", "balancer"}',
  flash_loan_enabled BOOLEAN NOT NULL DEFAULT true,
  max_trade_amount_eth DECIMAL(18,8) NOT NULL DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arbitrage opportunities table
CREATE TABLE public.arbitrage_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  config_id UUID REFERENCES public.arbitrage_config(id) ON DELETE CASCADE,
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount_in DECIMAL(18,8) NOT NULL,
  dex_buy TEXT NOT NULL,
  dex_sell TEXT NOT NULL,
  price_buy DECIMAL(18,8) NOT NULL,
  price_sell DECIMAL(18,8) NOT NULL,
  estimated_profit DECIMAL(18,8) NOT NULL,
  estimated_gas_cost DECIMAL(18,8) NOT NULL,
  profit_basis_points INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'executing', 'completed', 'failed', 'expired')),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tx_hash TEXT,
  block_number BIGINT,
  actual_profit DECIMAL(18,8),
  actual_gas_used BIGINT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Arbitrage trades table (executed trades)
CREATE TABLE public.arbitrage_trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.arbitrage_opportunities(id),
  config_id UUID REFERENCES public.arbitrage_config(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount_in DECIMAL(18,8) NOT NULL,
  amount_out DECIMAL(18,8),
  dex_path TEXT NOT NULL,
  flash_loan_amount DECIMAL(18,8),
  flash_loan_premium DECIMAL(18,8),
  profit DECIMAL(18,8) NOT NULL DEFAULT 0,
  gas_used BIGINT,
  gas_price_gwei INTEGER,
  tx_hash TEXT UNIQUE,
  block_number BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'reverted')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- System logs table
CREATE TABLE public.system_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  component TEXT NOT NULL, -- 'orchestrator', 'contract', 'api', 'frontend'
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.users(id),
  trade_id UUID REFERENCES public.arbitrage_trades(id),
  opportunity_id UUID REFERENCES public.arbitrage_opportunities(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price feeds table (for monitoring)
CREATE TABLE public.price_feeds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  dex TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  volume_24h DECIMAL(18,8),
  liquidity DECIMAL(18,8),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT,
  UNIQUE(token_address, dex, timestamp)
);

-- Bot status table
CREATE TABLE public.bot_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  config_id UUID REFERENCES public.arbitrage_config(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'paused', 'error')),
  last_scan_at TIMESTAMP WITH TIME ZONE,
  opportunities_found INTEGER DEFAULT 0,
  trades_executed INTEGER DEFAULT 0,
  total_profit DECIMAL(18,8) DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trade_success', 'trade_failed', 'high_profit', 'system_error', 'config_change')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  sent_email BOOLEAN NOT NULL DEFAULT false,
  sent_telegram BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_arbitrage_opportunities_status ON public.arbitrage_opportunities(status);
CREATE INDEX idx_arbitrage_opportunities_detected_at ON public.arbitrage_opportunities(detected_at);
CREATE INDEX idx_arbitrage_opportunities_token_pair ON public.arbitrage_opportunities(token_in, token_out);

CREATE INDEX idx_arbitrage_trades_user_id ON public.arbitrage_trades(user_id);
CREATE INDEX idx_arbitrage_trades_executed_at ON public.arbitrage_trades(executed_at);
CREATE INDEX idx_arbitrage_trades_status ON public.arbitrage_trades(status);
CREATE INDEX idx_arbitrage_trades_tx_hash ON public.arbitrage_trades(tx_hash);

CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_component ON public.system_logs(component);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

CREATE INDEX idx_price_feeds_token_dex ON public.price_feeds(token_address, dex);
CREATE INDEX idx_price_feeds_timestamp ON public.price_feeds(timestamp);

CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_arbitrage_config_updated_at BEFORE UPDATE ON public.arbitrage_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_status_updated_at BEFORE UPDATE ON public.bot_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Config policies
CREATE POLICY "Users can view own configs" ON public.arbitrage_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own configs" ON public.arbitrage_config FOR ALL USING (auth.uid() = user_id);

-- Opportunities policies
CREATE POLICY "Users can view own opportunities" ON public.arbitrage_opportunities 
  FOR SELECT USING (config_id IN (SELECT id FROM public.arbitrage_config WHERE user_id = auth.uid()));

-- Trades policies
CREATE POLICY "Users can view own trades" ON public.arbitrage_trades FOR SELECT USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (admins can see everything)
CREATE POLICY "Admins can view all data" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default admin user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create default configuration for new users
CREATE OR REPLACE FUNCTION public.create_default_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.arbitrage_config (user_id, name, enabled_tokens, enabled_dexes)
  VALUES (
    NEW.id, 
    'Default Configuration',
    ARRAY['0x4200000000000000000000000000000000000006', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'], -- WETH, USDC on Base
    ARRAY['uniswap_v2', 'uniswap_v3', 'balancer']
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_config
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_config();
