import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://nmjvebcauoyqzjlnluos.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tanZlYmNhdW95cXpqbG5sdW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDUwMDksImV4cCI6MjA2NzkyMTAwOX0.zCo7UC0Vb0wIUT0mAPk6qknKe0iQbY7dgGVXwUmqXGI'
)

// Add missing export that other files expect
export const getAuthToken = async () => {
  try {
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
