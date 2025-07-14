-- ATOM ARBITRAGE SYSTEM - FUNCTIONS AND VIEWS
-- Database functions and views for analytics and operations

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_trades BIGINT,
  successful_trades BIGINT,
  total_profit DECIMAL(18,8),
  success_rate DECIMAL(5,2),
  avg_profit_per_trade DECIMAL(18,8),
  total_gas_used BIGINT,
  avg_gas_per_trade DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_trades,
    COUNT(CASE WHEN status = 'success' THEN 1 END)::BIGINT as successful_trades,
    COALESCE(SUM(profit), 0) as total_profit,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN status = 'success' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
      ELSE 0 
    END as success_rate,
    CASE 
      WHEN COUNT(CASE WHEN status = 'success' THEN 1 END) > 0 THEN 
        COALESCE(SUM(profit), 0) / COUNT(CASE WHEN status = 'success' THEN 1 END)
      ELSE 0 
    END as avg_profit_per_trade,
    COALESCE(SUM(gas_used), 0) as total_gas_used,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        COALESCE(AVG(gas_used), 0)
      ELSE 0 
    END as avg_gas_per_trade
  FROM public.arbitrage_trades 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent opportunities
CREATE OR REPLACE FUNCTION public.get_recent_opportunities(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  token_in TEXT,
  token_out TEXT,
  amount_in DECIMAL(18,8),
  dex_buy TEXT,
  dex_sell TEXT,
  estimated_profit DECIMAL(18,8),
  profit_basis_points INTEGER,
  status TEXT,
  detected_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.token_in,
    o.token_out,
    o.amount_in,
    o.dex_buy,
    o.dex_sell,
    o.estimated_profit,
    o.profit_basis_points,
    o.status,
    o.detected_at,
    o.executed_at
  FROM public.arbitrage_opportunities o
  JOIN public.arbitrage_config c ON o.config_id = c.id
  WHERE c.user_id = user_uuid
  ORDER BY o.detected_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get profit by token
CREATE OR REPLACE FUNCTION public.get_profit_by_token(user_uuid UUID)
RETURNS TABLE (
  token_in TEXT,
  total_profit DECIMAL(18,8),
  trade_count BIGINT,
  avg_profit DECIMAL(18,8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.token_in,
    SUM(t.profit) as total_profit,
    COUNT(*)::BIGINT as trade_count,
    AVG(t.profit) as avg_profit
  FROM public.arbitrage_trades t
  WHERE t.user_id = user_uuid AND t.status = 'success'
  GROUP BY t.token_in
  ORDER BY total_profit DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get profit by DEX pair
CREATE OR REPLACE FUNCTION public.get_profit_by_dex(user_uuid UUID)
RETURNS TABLE (
  dex_path TEXT,
  total_profit DECIMAL(18,8),
  trade_count BIGINT,
  avg_profit DECIMAL(18,8),
  success_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.dex_path,
    SUM(CASE WHEN t.status = 'success' THEN t.profit ELSE 0 END) as total_profit,
    COUNT(*)::BIGINT as trade_count,
    AVG(CASE WHEN t.status = 'success' THEN t.profit ELSE NULL END) as avg_profit,
    ROUND((COUNT(CASE WHEN t.status = 'success' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) as success_rate
  FROM public.arbitrage_trades t
  WHERE t.user_id = user_uuid
  GROUP BY t.dex_path
  ORDER BY total_profit DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily profit summary
CREATE OR REPLACE FUNCTION public.get_daily_profit_summary(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_profit DECIMAL(18,8),
  trade_count BIGINT,
  success_count BIGINT,
  avg_profit DECIMAL(18,8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(t.executed_at) as date,
    SUM(CASE WHEN t.status = 'success' THEN t.profit ELSE 0 END) as total_profit,
    COUNT(*)::BIGINT as trade_count,
    COUNT(CASE WHEN t.status = 'success' THEN 1 END)::BIGINT as success_count,
    AVG(CASE WHEN t.status = 'success' THEN t.profit ELSE NULL END) as avg_profit
  FROM public.arbitrage_trades t
  WHERE t.user_id = user_uuid 
    AND t.executed_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(t.executed_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update bot status
CREATE OR REPLACE FUNCTION public.update_bot_status(
  config_uuid UUID,
  new_status TEXT,
  error_msg TEXT DEFAULT NULL,
  metadata_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.bot_status (config_id, status, error_message, metadata, updated_at)
  VALUES (config_uuid, new_status, error_msg, COALESCE(metadata_json, '{}'::jsonb), NOW())
  ON CONFLICT (config_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    error_message = EXCLUDED.error_message,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system events
CREATE OR REPLACE FUNCTION public.log_system_event(
  log_level TEXT,
  component_name TEXT,
  log_message TEXT,
  log_details JSONB DEFAULT NULL,
  user_uuid UUID DEFAULT NULL,
  trade_uuid UUID DEFAULT NULL,
  opportunity_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_logs (level, component, message, details, user_id, trade_id, opportunity_id)
  VALUES (log_level, component_name, log_message, COALESCE(log_details, '{}'::jsonb), user_uuid, trade_uuid, opportunity_uuid)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  user_uuid UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (user_uuid, notification_type, notification_title, notification_message, COALESCE(notification_data, '{}'::jsonb))
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for dashboard summary
CREATE OR REPLACE VIEW public.dashboard_summary AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(stats.total_trades, 0) as total_trades,
  COALESCE(stats.successful_trades, 0) as successful_trades,
  COALESCE(stats.total_profit, 0) as total_profit,
  COALESCE(stats.success_rate, 0) as success_rate,
  COALESCE(active_configs.count, 0) as active_configs,
  COALESCE(recent_opportunities.count, 0) as recent_opportunities,
  COALESCE(bot_status.status, 'stopped') as bot_status,
  bot_status.last_scan_at,
  COALESCE(unread_notifications.count, 0) as unread_notifications
FROM public.users u
LEFT JOIN LATERAL (
  SELECT * FROM public.get_user_stats(u.id)
) stats ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::BIGINT as count
  FROM public.arbitrage_config 
  WHERE user_id = u.id AND is_active = true
) active_configs ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::BIGINT as count
  FROM public.arbitrage_opportunities o
  JOIN public.arbitrage_config c ON o.config_id = c.id
  WHERE c.user_id = u.id AND o.detected_at >= NOW() - INTERVAL '24 hours'
) recent_opportunities ON true
LEFT JOIN LATERAL (
  SELECT status, last_scan_at
  FROM public.bot_status bs
  JOIN public.arbitrage_config c ON bs.config_id = c.id
  WHERE c.user_id = u.id
  ORDER BY bs.updated_at DESC
  LIMIT 1
) bot_status ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::BIGINT as count
  FROM public.notifications
  WHERE user_id = u.id AND read = false
) unread_notifications ON true;

-- View for recent activity
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT 
  'trade' as activity_type,
  t.id as activity_id,
  t.user_id,
  t.token_in || '/' || t.token_out as description,
  t.profit as value,
  t.status,
  t.executed_at as timestamp,
  jsonb_build_object(
    'dex_path', t.dex_path,
    'gas_used', t.gas_used,
    'tx_hash', t.tx_hash
  ) as metadata
FROM public.arbitrage_trades t
WHERE t.executed_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'opportunity' as activity_type,
  o.id as activity_id,
  c.user_id,
  o.token_in || '/' || o.token_out || ' (' || o.dex_buy || ' -> ' || o.dex_sell || ')' as description,
  o.estimated_profit as value,
  o.status,
  o.detected_at as timestamp,
  jsonb_build_object(
    'profit_basis_points', o.profit_basis_points,
    'amount_in', o.amount_in
  ) as metadata
FROM public.arbitrage_opportunities o
JOIN public.arbitrage_config c ON o.config_id = c.id
WHERE o.detected_at >= NOW() - INTERVAL '7 days'

ORDER BY timestamp DESC;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_opportunities(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profit_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profit_by_dex(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_profit_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_system_event(TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- Grant view permissions
GRANT SELECT ON public.dashboard_summary TO authenticated;
GRANT SELECT ON public.recent_activity TO authenticated;

-- Service role permissions for bot operations
GRANT EXECUTE ON FUNCTION public.update_bot_status(UUID, TEXT, TEXT, JSONB) TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
