// 🛡️ RATE LIMITING MIDDLEWARE
// Implements secure rate limiting for API endpoints

import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private getKey(req: NextApiRequest): string {
    // Use IP address as the key, with fallbacks
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    return ip || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  public check(req: NextApiRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(req);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      // Initialize or reset the counter
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: this.store[key].resetTime
      };
    }

    this.store[key].count++;
    
    return {
      allowed: this.store[key].count <= this.config.max,
      remaining: Math.max(0, this.config.max - this.store[key].count),
      resetTime: this.store[key].resetTime
    };
  }

  public middleware() {
    return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const result = this.check(req);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.config.max);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: this.config.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      next();
    };
  }
}

// 🔧 PREDEFINED RATE LIMITERS

// Authentication endpoints - very strict
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: false
});

// API endpoints - moderate
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests. Please try again later.',
  skipSuccessfulRequests: true
});

// Trading endpoints - strict
export const tradingRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 trades per minute
  message: 'Too many trading requests. Please wait before trying again.',
  skipSuccessfulRequests: false
});

// Dashboard endpoints - lenient
export const dashboardRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many dashboard requests. Please slow down.',
  skipSuccessfulRequests: true
});

// 🛡️ HELPER FUNCTIONS

export function withRateLimit(rateLimiter: RateLimiter) {
  return function(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const result = rateLimiter.check(req);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', rateLimiter['config'].max);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: rateLimiter['config'].message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      return handler(req, res);
    };
  };
}

// 🔒 IP WHITELIST/BLACKLIST

class IPFilter {
  private whitelist: Set<string> = new Set();
  private blacklist: Set<string> = new Set();

  addToWhitelist(ip: string): void {
    this.whitelist.add(ip);
  }

  addToBlacklist(ip: string): void {
    this.blacklist.add(ip);
  }

  isAllowed(req: NextApiRequest): boolean {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    
    if (!ip) return false;
    
    // If blacklisted, deny
    if (this.blacklist.has(ip)) return false;
    
    // If whitelist exists and IP not in it, deny
    if (this.whitelist.size > 0 && !this.whitelist.has(ip)) return false;
    
    return true;
  }

  middleware() {
    return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      if (!this.isAllowed(req)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP address'
        });
      }
      next();
    };
  }
}

export const ipFilter = new IPFilter();

// 📊 MONITORING AND ANALYTICS

export class RateLimitMonitor {
  private violations: Array<{
    ip: string;
    endpoint: string;
    timestamp: number;
    userAgent?: string;
  }> = [];

  logViolation(req: NextApiRequest, endpoint: string): void {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    
    this.violations.push({
      ip: ip || 'unknown',
      endpoint,
      timestamp: Date.now(),
      userAgent: req.headers['user-agent']
    });

    // Keep only last 1000 violations
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 Rate limit violation: ${ip} on ${endpoint}`);
    }
  }

  getViolations(since?: number): typeof this.violations {
    const cutoff = since || Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    return this.violations.filter(v => v.timestamp > cutoff);
  }

  getTopViolators(limit = 10): Array<{ ip: string; count: number }> {
    const counts: { [ip: string]: number } = {};
    
    this.violations.forEach(v => {
      counts[v.ip] = (counts[v.ip] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const rateLimitMonitor = new RateLimitMonitor();

// 🔧 UTILITY FUNCTIONS

export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  return ip || 'unknown';
}

export default {
  authRateLimiter,
  apiRateLimiter,
  tradingRateLimiter,
  dashboardRateLimiter,
  withRateLimit,
  ipFilter,
  rateLimitMonitor
};
