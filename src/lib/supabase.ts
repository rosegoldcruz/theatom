import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client - Use environment variables for consistency
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngyylrygxroocpttizgo.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neXlscnlneHJvb2NwdHRpemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDM1NzIsImV4cCI6MjA2NzY3OTU3Mn0.Eap0yphzVPlgGW3FM5NHE01DFW-5D5ehqBEuOieu68A';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };