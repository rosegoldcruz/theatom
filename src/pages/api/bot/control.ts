import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../../../lib/auth';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BotControlResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Contract ABI for bot control functions
const CONTRACT_ABI = [
  "function pause() external",
  "function unpause() external",
  "function paused() external view returns (bool)",
  "function updateConfig(uint256 minProfitBasisPoints, uint256 maxSlippageBasisPoints, uint256 maxGasPrice) external",
  "function getConfig() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)"
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BotControlResponse>
) {
  try {
    // Verify authentication and admin role
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGetStatus(req, res, user);
      case 'POST':
        return await handleBotControl(req, res, user);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Bot control API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGetStatus(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    // Get contract status
    const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(
      process.env.BASE_SEPOLIA_CONTRACT_ADDRESS!,
      CONTRACT_ABI,
      provider
    );

    const [isPaused, config] = await Promise.all([
      contract.paused(),
      contract.getConfig()
    ]);

    // Get bot status from database
    const { data: botStatuses, error } = await supabase
      .from('bot_status')
      .select(`
        *,
        arbitrage_config (
          id,
          name,
          user_id,
          is_active
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    // Get recent system logs
    const { data: recentLogs, error: logsError } = await supabase
      .from('system_logs')
      .select('*')
      .eq('component', 'orchestrator')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Failed to fetch logs:', logsError);
    }

    res.status(200).json({
      success: true,
      data: {
        contract: {
          address: process.env.BASE_SEPOLIA_CONTRACT_ADDRESS,
          paused: isPaused,
          config: {
            minProfitBasisPoints: config[0].toString(),
            maxSlippageBasisPoints: config[1].toString(),
            maxGasPrice: ethers.formatUnits(config[2], 'gwei'),
            totalTrades: config[3].toString(),
            successfulTrades: config[4].toString(),
            totalProfit: ethers.formatEther(config[5]),
            totalGasUsed: config[6].toString()
          }
        },
        bots: botStatuses || [],
        recentLogs: recentLogs || []
      }
    });

  } catch (error) {
    console.error('Error getting bot status:', error);
    res.status(500).json({ success: false, error: 'Failed to get bot status' });
  }
}

async function handleBotControl(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { action, configId, contractConfig } = req.body;

  if (!action) {
    return res.status(400).json({ success: false, error: 'Action is required' });
  }

  try {
    switch (action) {
      case 'start':
        return await startBot(configId, user, res);
      case 'stop':
        return await stopBot(configId, user, res);
      case 'pause_contract':
        return await pauseContract(user, res);
      case 'unpause_contract':
        return await unpauseContract(user, res);
      case 'update_contract_config':
        return await updateContractConfig(contractConfig, user, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Bot control action error:', error);
    res.status(500).json({ success: false, error: 'Failed to execute bot control action' });
  }
}

async function startBot(configId: string, user: any, res: NextApiResponse) {
  if (!configId) {
    return res.status(400).json({ success: false, error: 'Config ID is required' });
  }

  // Update bot status
  await supabase.rpc('update_bot_status', {
    config_uuid: configId,
    new_status: 'running',
    error_msg: null,
    metadata_json: { startedBy: user.userId, startedAt: new Date().toISOString() }
  });

  // Log the action
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Bot started via API',
    log_details: { configId, userId: user.userId },
    user_uuid: user.userId
  });

  res.status(200).json({ success: true, data: { message: 'Bot started successfully' } });
}

async function stopBot(configId: string, user: any, res: NextApiResponse) {
  if (!configId) {
    return res.status(400).json({ success: false, error: 'Config ID is required' });
  }

  // Update bot status
  await supabase.rpc('update_bot_status', {
    config_uuid: configId,
    new_status: 'stopped',
    error_msg: null,
    metadata_json: { stoppedBy: user.userId, stoppedAt: new Date().toISOString() }
  });

  // Log the action
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Bot stopped via API',
    log_details: { configId, userId: user.userId },
    user_uuid: user.userId
  });

  res.status(200).json({ success: true, data: { message: 'Bot stopped successfully' } });
}

async function pauseContract(user: any, res: NextApiResponse) {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    process.env.BASE_SEPOLIA_CONTRACT_ADDRESS!,
    CONTRACT_ABI,
    wallet
  );

  const tx = await contract.pause();
  await tx.wait();

  // Log the action
  await supabase.rpc('log_system_event', {
    log_level: 'warn',
    component_name: 'api',
    log_message: 'Contract paused via API',
    log_details: { txHash: tx.hash, userId: user.userId },
    user_uuid: user.userId
  });

  res.status(200).json({ 
    success: true, 
    data: { message: 'Contract paused successfully', txHash: tx.hash } 
  });
}

async function unpauseContract(user: any, res: NextApiResponse) {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    process.env.BASE_SEPOLIA_CONTRACT_ADDRESS!,
    CONTRACT_ABI,
    wallet
  );

  const tx = await contract.unpause();
  await tx.wait();

  // Log the action
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Contract unpaused via API',
    log_details: { txHash: tx.hash, userId: user.userId },
    user_uuid: user.userId
  });

  res.status(200).json({ 
    success: true, 
    data: { message: 'Contract unpaused successfully', txHash: tx.hash } 
  });
}

async function updateContractConfig(contractConfig: any, user: any, res: NextApiResponse) {
  if (!contractConfig) {
    return res.status(400).json({ success: false, error: 'Contract config is required' });
  }

  const { minProfitBasisPoints, maxSlippageBasisPoints, maxGasPriceGwei } = contractConfig;

  const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    process.env.BASE_SEPOLIA_CONTRACT_ADDRESS!,
    CONTRACT_ABI,
    wallet
  );

  const tx = await contract.updateConfig(
    minProfitBasisPoints,
    maxSlippageBasisPoints,
    ethers.parseUnits(maxGasPriceGwei.toString(), 'gwei')
  );
  await tx.wait();

  // Log the action
  await supabase.rpc('log_system_event', {
    log_level: 'info',
    component_name: 'api',
    log_message: 'Contract configuration updated via API',
    log_details: { 
      txHash: tx.hash, 
      userId: user.userId,
      config: contractConfig
    },
    user_uuid: user.userId
  });

  res.status(200).json({ 
    success: true, 
    data: { message: 'Contract configuration updated successfully', txHash: tx.hash } 
  });
}
