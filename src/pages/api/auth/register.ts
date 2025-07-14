import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
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
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password, confirmPassword }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError || !authData.user) {
      return res.status(400).json({ 
        success: false, 
        error: authError?.message || 'Failed to create user' 
      });
    }

    // The user profile will be created automatically by the database trigger
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the created user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create user profile' 
      });
    }

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

    // Log successful registration
    await supabase.rpc('log_system_event', {
      log_level: 'info',
      component_name: 'auth',
      log_message: 'User registered successfully',
      log_details: { userId: userProfile.id, email: userProfile.email },
      user_uuid: userProfile.id
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Log error
    await supabase.rpc('log_system_event', {
      log_level: 'error',
      component_name: 'auth',
      log_message: 'Registration failed',
      log_details: { error: error.message }
    });

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
