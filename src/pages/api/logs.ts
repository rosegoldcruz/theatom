import { NextApiRequest, NextApiResponse } from 'next';

// Mock log data generator
const generateMockLogs = (count: number = 50) => {
  const logTypes = ['info', 'warning', 'error', 'success'];
  const messages = [
    'Bot started successfully',
    'Scanning for arbitrage opportunities',
    'Found profitable opportunity on Uniswap/Balancer',
    'Executing flash loan transaction',
    'Transaction confirmed',
    'Profit realized: $45.67',
    'Gas cost: $12.34',
    'Bot stopped by user',
    'Connection to RPC node established',
    'Price feed updated',
    'Risk threshold exceeded, skipping trade',
    'Insufficient liquidity detected',
    'Network congestion detected',
    'Slippage tolerance exceeded'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    type: logTypes[Math.floor(Math.random() * logTypes.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date(Date.now() - i * 30000).toISOString()
  }));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // For development, return mock data
      // In production, you would fetch from your actual logging system
      const mockLogs = generateMockLogs();

      res.status(200).json(mockLogs);

    } else if (req.method === 'DELETE') {
      // For development, just return success
      // In production, you would clear actual logs
      res.status(200).json({
        success: true,
        message: 'Logs cleared successfully'
      });

    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Logs API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
