import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../../../lib/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ConfigResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfigResponse>
) {
  try {
    // Verify authentication
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user);
      case 'POST':
        return await handlePost(req, res, user);
      case 'PUT':
        return await handlePut(req, res, user);
      case 'DELETE':
        return await handleDelete(req, res, user);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Config API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { data: configs, error } = await supabase
    .from('arbitrage_config')
    .select('*')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  res.status(200).json({ success: true, data: configs });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    name,
    min_profit_basis_points,
    max_slippage_basis_points,
    max_gas_price_gwei,
    enabled_tokens,
    enabled_dexes,
    flash_loan_enabled,
    max_trade_amount_eth
  } = req.body;

  // Validation
  if (!name || !enabled_tokens || !enabled_dexes) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name, enabled_tokens, and enabled_dexes are required' 
    });
  }

  if (min_profit_basis_points < 1 || min_profit_basis_points > 1000) {
    return res.status(400).json({ 
      success: false, 
      error: 'Min profit basis points must be between 1 and 1000' 
    });
  }

  const { data: config, error } = await supabase
    .from('arbitrage_config')
    .insert({
      user_id: user.userId,
      name,
      min_profit_basis_points: min_profit_basis_points || 50,
      max_slippage_basis_points: max_slippage_basis_points || 300,
      max_gas_price_gwei: max_gas_price_gwei || 50,
      enabled_tokens,
      enabled_dexes,
      flash_loan_enabled: flash_loan_enabled !== false,
      max_trade_amount_eth: max_trade_amount_eth || 1.0,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  // Log config creation
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Arbitrage configuration created',
    log_details: { configId: config.id, name },
    user_uuid: user.userId
  });

  res.status(201).json({ success: true, data: config });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Config ID is required' });
  }

  // Verify ownership
  const { data: existingConfig, error: fetchError } = await supabase
    .from('arbitrage_config')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existingConfig) {
    return res.status(404).json({ success: false, error: 'Configuration not found' });
  }

  if (existingConfig.user_id !== user.userId && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Update configuration
  const { data: updatedConfig, error } = await supabase
    .from('arbitrage_config')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  // Log config update
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Arbitrage configuration updated',
    log_details: { configId: id, changes: updateData },
    user_uuid: user.userId
  });

  res.status(200).json({ success: true, data: updatedConfig });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Config ID is required' });
  }

  // Verify ownership
  const { data: existingConfig, error: fetchError } = await supabase
    .from('arbitrage_config')
    .select('user_id, name')
    .eq('id', id)
    .single();

  if (fetchError || !existingConfig) {
    return res.status(404).json({ success: false, error: 'Configuration not found' });
  }

  if (existingConfig.user_id !== user.userId && user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('arbitrage_config')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  // Log config deletion
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Arbitrage configuration deleted',
    log_details: { configId: id, name: existingConfig.name },
    user_uuid: user.userId
  });

  res.status(200).json({ success: true, data: { message: 'Configuration deleted successfully' } });
}
