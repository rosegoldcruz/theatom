import { NextApiRequest, NextApiResponse } from 'next';

interface Config {
  maxPositionSizeETH: string;
  minProfitThresholdUSD: string;
  maxGasCostUSD: string;
  enabledDEXes: string[];
}

// Mock configuration storage (in production, use database)
let currentConfig: Config = {
  maxPositionSizeETH: '5.0',
  minProfitThresholdUSD: '15',
  maxGasCostUSD: '20',
  enabledDEXes: ['uniswap', 'balancer']
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return current configuration
      res.status(200).json(currentConfig);

    } else if (req.method === 'POST') {
      // Update configuration
      const config: Config = req.body;

      // Validate configuration
      if (!config.maxPositionSizeETH || !config.minProfitThresholdUSD || !config.maxGasCostUSD) {
        return res.status(400).json({
          success: false,
          error: 'Missing required configuration fields'
        });
      }

      // Update mock configuration
      currentConfig = { ...config };

      res.status(200).json({
        success: true,
        message: 'Configuration updated successfully'
      });

    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Config API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
