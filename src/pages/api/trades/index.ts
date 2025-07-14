import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../../../lib/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TradesResponse {
  success: boolean;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TradesResponse>
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

    const {
      page = '1',
      limit = '50',
      status,
      token_in,
      token_out,
      dex_path,
      start_date,
      end_date,
      sort_by = 'executed_at',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('arbitrage_trades')
      .select('*', { count: 'exact' })
      .eq('user_id', user.userId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (token_in) {
      query = query.eq('token_in', token_in);
    }

    if (token_out) {
      query = query.eq('token_out', token_out);
    }

    if (dex_path) {
      query = query.ilike('dex_path', `%${dex_path}%`);
    }

    if (start_date) {
      query = query.gte('executed_at', start_date);
    }

    if (end_date) {
      query = query.lte('executed_at', end_date);
    }

    // Apply sorting
    const ascending = sort_order === 'asc';
    query = query.order(sort_by as string, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: trades, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const totalPages = Math.ceil((count || 0) / limitNum);

    res.status(200).json({
      success: true,
      data: trades,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages
      }
    });

  } catch (error) {
    console.error('Trades API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
