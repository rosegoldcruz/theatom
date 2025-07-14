import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch user profile' 
      });
    }

    if (!userProfile.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is deactivated' 
      });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Log successful login
    await supabase.rpc('log_system_event', {
      log_level: 'info',
      component_name: 'auth',
      log_message: 'User logged in successfully',
      log_details: { userId: userProfile.id, email: userProfile.email },
      user_uuid: userProfile.id
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Log error
    await supabase.rpc('log_system_event', {
      log_level: 'error',
      component_name: 'auth',
      log_message: 'Login failed',
      log_details: { error: error.message }
    });

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
