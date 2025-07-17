import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Frontend Supabase client - only for authentication and public data
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to get current user session
export const getCurrentUser = async () => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Helper function to get auth token for API calls
export const getAuthToken = async () => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    return session?.access_token || null
  } catch (error) {
    console.error('Error in getAuthToken:', error)
    return null
  }
}
