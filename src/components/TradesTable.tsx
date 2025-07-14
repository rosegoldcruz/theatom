import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';

interface Trade {
  id: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  amount_out: number;
  dex_path: string;
  profit: number;
  gas_used: number;
  gas_price_gwei: number;
  tx_hash: string;
  block_number: number;
  status: 'pending' | 'success' | 'failed' | 'reverted';
  executed_at: string;
  confirmed_at: string;
}

interface TradesResponse {
  success: boolean;
  data: Trade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export const TradesTable: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    token_in: '',
    token_out: '',
    dex_path: '',
    search: ''
  });

  const fetchTrades = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort_by: 'executed_at',
        sort_order: 'desc',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get<TradesResponse>(`/api/trades?${params}`);
      
      if (response.data.success) {
        setTrades(response.data.data);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.data.error || 'Failed to fetch trades');
      }
    } catch (err: any) {
      console.error('Trades fetch error:', err);
      setError(err.response?.data?.error || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(1);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      success: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      reverted: { color: 'bg-red-500/20 text-red-400', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProfitDisplay = (profit: number) => {
    const isProfit = profit > 0;
    const Icon = isProfit ? TrendingUp : TrendingDown;
    const colorClass = isProfit ? 'text-green-400' : 'text-red-400';

    return (
      <div className={`flex items-center ${colorClass}`}>
        <Icon className="h-4 w-4 mr-1" />
        {formatCurrency(Math.abs(profit))}
      </div>
    );
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Trade History</CardTitle>
          <Button 
            onClick={() => fetchTrades(currentPage)} 
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search trades..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reverted">Reverted</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Token In"
            value={filters.token_in}
            onChange={(e) => handleFilterChange('token_in', e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />

          <Input
            placeholder="Token Out"
            value={filters.token_out}
            onChange={(e) => handleFilterChange('token_out', e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />

          <Input
            placeholder="DEX Path"
            value={filters.dex_path}
            onChange={(e) => handleFilterChange('dex_path', e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-300">Loading trades...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
            <Button 
              onClick={() => fetchTrades(currentPage)} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300">No trades found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">Pair</TableHead>
                    <TableHead className="text-gray-300">DEX Path</TableHead>
                    <TableHead className="text-gray-300">Amount In</TableHead>
                    <TableHead className="text-gray-300">Profit</TableHead>
                    <TableHead className="text-gray-300">Gas</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">TX</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white">
                        {formatDate(trade.executed_at)}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-mono text-sm">
                          {trade.token_in.slice(0, 6)}.../{trade.token_out.slice(0, 6)}...
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge variant="outline" className="text-xs">
                          {trade.dex_path}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {formatCurrency(trade.amount_in)}
                      </TableCell>
                      <TableCell>
                        {getProfitDisplay(trade.profit)}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="text-sm">
                          <div>{(trade.gas_used / 1000).toFixed(0)}k</div>
                          <div className="text-xs text-gray-400">
                            {trade.gas_price_gwei} gwei
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(trade.status)}
                      </TableCell>
                      <TableCell>
                        {trade.tx_hash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://base-sepolia.blockscout.com/tx/${trade.tx_hash}`, '_blank')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTrades(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTrades(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
