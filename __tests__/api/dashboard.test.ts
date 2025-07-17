// 🧪 DASHBOARD API TESTING SUITE
// Day 4 Afternoon - API endpoint testing

import { createMocks } from 'node-mocks-http';
import { jest } from '@jest/globals';
import handler from '../../src/pages/api/dashboard/stats';
import { authTestUtils } from '../auth.test';

// Mock authentication
jest.mock('../../src/lib/auth', () => ({
  verifyToken: jest.fn(),
  requireAuth: jest.fn((handler) => handler)
}));

// Mock Supabase
const mockSupabaseData = {
  overview: [{
    total_trades: 150,
    successful_trades: 142,
    total_profit: 2847.50,
    success_rate: 94.67,
    avg_profit_per_trade: 18.98,
    total_gas_used: 0.45,
    avg_gas_per_trade: 0.003
  }],
  profit_by_token: [
    { token: 'ETH', profit: 1200.50 },
    { token: 'USDC', profit: 847.25 },
    { token: 'WBTC', profit: 799.75 }
  ],
  profit_by_dex: [
    { dex: 'Uniswap V3', profit: 1547.30 },
    { dex: 'Balancer', profit: 800.20 },
    { dex: 'Curve', profit: 500.00 }
  ],
  daily_summary: [
    { date: '2025-01-15', trades: 25, profit: 450.75 },
    { date: '2025-01-14', trades: 30, profit: 523.25 },
    { date: '2025-01-13', trades: 22, profit: 387.50 }
  ],
  recent_activity: [
    {
      id: 'activity-1',
      activity_type: 'trade_executed',
      description: 'Executed ETH/USDC arbitrage',
      timestamp: '2025-01-16T10:30:00Z'
    }
  ]
};

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({
              data: mockSupabaseData[table as keyof typeof mockSupabaseData] || [],
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('🏠 Dashboard API Endpoints', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/stats', () => {
    
    test('should return dashboard data for authenticated user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      // Mock successful authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toMatchObject({
        success: true,
        data: {
          overview: expect.objectContaining({
            total_trades: expect.any(Number),
            successful_trades: expect.any(Number),
            total_profit: expect.any(Number),
            success_rate: expect.any(Number)
          }),
          profit_by_token: expect.any(Array),
          profit_by_dex: expect.any(Array),
          daily_summary: expect.any(Array),
          recent_activity: expect.any(Array)
        }
      });
    });

    test('should return 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET'
        // No authorization header
      });

      // Mock failed authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toMatchObject({
        success: false,
        error: expect.any(String)
      });
    });

    test('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
    });

    test('should handle database errors gracefully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      // Mock successful authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      });

      // Mock database error
      const { supabase } = require('../../src/lib/supabase');
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database connection failed' }
          }))
        }))
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData).toMatchObject({
        success: false,
        error: expect.any(String)
      });
    });
  });

  describe('Performance Tests', () => {
    
    test('should respond within acceptable time limits', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      // Mock successful authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      });

      const startTime = Date.now();
      await handler(req, res);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      expect(res._getStatusCode()).toBe(200);
    });

    test('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () => {
        const { req, res } = createMocks({
          method: 'GET',
          headers: {
            authorization: 'Bearer valid-token'
          }
        });
        return { req, res };
      });

      // Mock successful authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      });

      const startTime = Date.now();
      const promises = requests.map(({ req, res }) => handler(req, res));
      await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should complete within 3 seconds
      expect(totalTime).toBeLessThan(3000);
      
      // All requests should succeed
      requests.forEach(({ res }) => {
        expect(res._getStatusCode()).toBe(200);
      });
    });
  });

  describe('Data Validation', () => {
    
    test('should return properly formatted data', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      // Mock successful authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      
      // Validate data structure
      expect(responseData.data.overview).toMatchObject({
        total_trades: expect.any(Number),
        successful_trades: expect.any(Number),
        total_profit: expect.any(Number),
        success_rate: expect.any(Number),
        avg_profit_per_trade: expect.any(Number),
        total_gas_used: expect.any(Number),
        avg_gas_per_trade: expect.any(Number)
      });

      // Validate profit by token array
      expect(Array.isArray(responseData.data.profit_by_token)).toBe(true);
      if (responseData.data.profit_by_token.length > 0) {
        expect(responseData.data.profit_by_token[0]).toMatchObject({
          token: expect.any(String),
          profit: expect.any(Number)
        });
      }

      // Validate profit by DEX array
      expect(Array.isArray(responseData.data.profit_by_dex)).toBe(true);
      if (responseData.data.profit_by_dex.length > 0) {
        expect(responseData.data.profit_by_dex[0]).toMatchObject({
          dex: expect.any(String),
          profit: expect.any(Number)
        });
      }
    });

    test('should handle empty data gracefully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      // Mock successful authentication
      const { verifyToken } = require('../../src/lib/auth');
      verifyToken.mockResolvedValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      });

      // Mock empty data
      const { supabase } = require('../../src/lib/supabase');
      supabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({
                data: [],
                error: null
              }))
            }))
          }))
        }))
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
    });
  });
});

// 🔧 TEST UTILITIES

export const dashboardTestUtils = {
  createMockDashboardData: (overrides = {}) => ({
    overview: {
      total_trades: 100,
      successful_trades: 95,
      total_profit: 1500.00,
      success_rate: 95.0,
      avg_profit_per_trade: 15.0,
      total_gas_used: 0.5,
      avg_gas_per_trade: 0.005,
      ...overrides.overview
    },
    profit_by_token: [
      { token: 'ETH', profit: 800.00 },
      { token: 'USDC', profit: 700.00 },
      ...(overrides.profit_by_token || [])
    ],
    profit_by_dex: [
      { dex: 'Uniswap V3', profit: 900.00 },
      { dex: 'Balancer', profit: 600.00 },
      ...(overrides.profit_by_dex || [])
    ],
    daily_summary: [
      { date: '2025-01-16', trades: 20, profit: 300.00 },
      { date: '2025-01-15', trades: 25, profit: 400.00 },
      ...(overrides.daily_summary || [])
    ],
    recent_activity: [
      {
        id: 'activity-1',
        activity_type: 'trade_executed',
        description: 'Test trade',
        timestamp: new Date().toISOString()
      },
      ...(overrides.recent_activity || [])
    ]
  }),

  mockAuthenticatedRequest: (userId = 'test-user-id') => {
    const { verifyToken } = require('../../src/lib/auth');
    verifyToken.mockResolvedValue({
      userId,
      email: 'test@example.com',
      role: 'user'
    });
  },

  mockUnauthenticatedRequest: () => {
    const { verifyToken } = require('../../src/lib/auth');
    verifyToken.mockResolvedValue(null);
  }
};

export default dashboardTestUtils;
