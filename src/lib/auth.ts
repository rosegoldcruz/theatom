import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// 🔐 SECURE JWT CONFIGURATION
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_ISSUER = process.env.JWT_ISSUER || 'theatom-app';

// Validate JWT secret on startup
if (!JWT_SECRET || JWT_SECRET.includes('change-this') || JWT_SECRET.length < 16) {
  throw new Error('🚨 SECURITY ERROR: JWT_SECRET must be set to a secure value (16+ characters)');
}

// 🛡️ RATE LIMITING (to be used in API routes)
export const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts
  message: { error: 'Too many login attempts', retryAfter: '15 minutes' }
};

export const API_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 API requests
  message: { error: 'Too many API requests', retryAfter: '15 minutes' }
};

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface SecureUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
}

export async function verifyToken(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return null;
    }

    // 🔐 SECURE JWT VERIFICATION
    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: JWT_ISSUER,
      algorithms: ['HS256'] // Only allow HMAC SHA256
    }) as JWTPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: any) => {
    const user = await verifyToken(req);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    return handler(req, res, user);
  };
}

export function requireAdmin(handler: Function) {
  return async (req: NextApiRequest, res: any) => {
    const user = await verifyToken(req);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    return handler(req, res, user);
  };
}

// 🔐 SECURE TOKEN GENERATION
export function generateToken(user: SecureUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iss: JWT_ISSUER
  };

  return jwt.sign(payload, JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER
  });
}

// 🔒 SECURE PASSWORD HASHING
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // High security
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 🛡️ INPUT VALIDATION
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
