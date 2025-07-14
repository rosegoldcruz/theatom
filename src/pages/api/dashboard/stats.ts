import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../../../lib/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StatsResponse {
  success: boolean;
  data?: {
    overview: {
      total_trades: number;
      successful_trades: number;
      total_profit: number;
      success_rate: number;
      avg_profit_per_trade: number;
      total_gas_used: number;
      avg_gas_per_trade: number;
    };
    profit_by_token: Array<{
      token_in: string;
      total_profit: number;
      trade_count: number;
      avg_profit: number;
    }>;
    profit_by_dex: Array<{
      dex_path: string;
      total_profit: number;
      trade_count: number;
      avg_profit: number;
      success_rate: number;
    }>;
    daily_summary: Array<{
      date: string;
      total_profit: number;
      trade_count: number;
      success_count: number;
      avg_profit: number;
    }>;
    recent_activity: Array<{
      activity_type: string;
      activity_id: string;
      description: string;
      value: number;
      status: string;
      timestamp: string;
      metadata: any;
    }>;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse>
) {
  try {
    // Verify authentication
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { days = '30' } = req.query;
    const daysBack = parseInt(days as string);

    // Get user statistics
    const { data: overview, error: overviewError } = await supabase
      .rpc('get_user_stats', { user_uuid: user.userId });

    if (overviewError) {
      return res.status(500).json({ success: false, error: overviewError.message });
    }

    // Get profit by token
    const { data: profitByToken, error: tokenError } = await supabase
      .rpc('get_profit_by_token', { user_uuid: user.userId });

    if (tokenError) {
      return res.status(500).json({ success: false, error: tokenError.message });
    }

    // Get profit by DEX
    const { data: profitByDex, error: dexError } = await supabase
      .rpc('get_profit_by_dex', { user_uuid: user.userId });

    if (dexError) {
      return res.status(500).json({ success: false, error: dexError.message });
    }

    // Get daily summary
    const { data: dailySummary, error: dailyError } = await supabase
      .rpc('get_daily_profit_summary', { 
        user_uuid: user.userId, 
        days_back: daysBack 
      });

    if (dailyError) {
      return res.status(500).json({ success: false, error: dailyError.message });
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('recent_activity')
      .select('*')
      .eq('user_id', user.userId)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (activityError) {
      return res.status(500).json({ success: false, error: activityError.message });
    }

    res.status(200).json({
      success: true,
      data: {
        overview: overview[0] || {
          total_trades: 0,
          successful_trades: 0,
          total_profit: 0,
          success_rate: 0,
          avg_profit_per_trade: 0,
          total_gas_used: 0,
          avg_gas_per_trade: 0
        },
        profit_by_token: profitByToken || [],
        profit_by_dex: profitByDex || [],
        daily_summary: dailySummary || [],
        recent_activity: recentActivity || []
      }
    });

  } catch (error) {
    console.error('Dashboard stats API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
