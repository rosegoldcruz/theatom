import type { NextApiRequest, NextApiResponse } from 'next';

const generateMockStatus = () => {
  const statuses = ['running', 'stopped', 'error'];
  const connectionStatuses = ['connected', 'disconnected', 'error'];
  const onlineStatuses = ['online', 'offline', 'error'];
  
  return {
    bot: statuses[Math.floor(Math.random() * statuses.length)],
    backend: onlineStatuses[Math.floor(Math.random() * onlineStatuses.length)],
    database: connectionStatuses[Math.floor(Math.random() * connectionStatuses.length)],
    blockchain: connectionStatuses[Math.floor(Math.random() * connectionStatuses.length)],
    lastUpdate: new Date().toISOString(),
    uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
    version: '1.0.0',
    network: 'Base Sepolia',
    gasPrice: (Math.random() * 20 + 5).toFixed(2),
    blockNumber: Math.floor(Math.random() * 1000000) + 5000000
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real implementation, you would check actual system status
    const status = generateMockStatus();
    
    res.status(200).json(status);
    
  } catch (error) {
    console.error('Failed to fetch status:', error);
    res.status(500).json({
      error: 'Failed to fetch status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
