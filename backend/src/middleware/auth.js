const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key (only if env vars are available)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Authentication middleware for backend API
 * Verifies JWT tokens from frontend and validates user session
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Skip auth if Supabase is not configured (for development/testing)
    if (!supabase) {
      req.user = {
        id: 'test-user',
        email: 'test@example.com',
        profile: {
          can_execute_trades: true,
          can_control_bot: true,
          can_configure_bot: true,
          status: 'active'
        }
      };
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (jwtError) {
      return res.status(403).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // Validate user session with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        error: 'Invalid user session',
        code: 'INVALID_SESSION'
      });
    }

    // Check if user is active
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (profileError || !profile || profile.status !== 'active') {
      return res.status(403).json({
        error: 'User account is not active',
        code: 'INACTIVE_USER'
      });
    }

    // Attach user info to request
    req.user = {
      id: user.user.id,
      email: user.user.email,
      profile: profile
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Optional authentication middleware
 * Allows requests to proceed even without valid auth, but attaches user if available
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user } = await supabase.auth.getUser(token);
    
    if (user) {
      req.user = {
        id: user.user.id,
        email: user.user.email
      };
    }
  } catch (error) {
    // Ignore auth errors for optional auth
    req.user = null;
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
