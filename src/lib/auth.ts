import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
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
