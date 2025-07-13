import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
// Using direct values from project configuration
const supabaseUrl = 'https://nmjvebcauoyqzjlnluos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tanZlYmNhdW95cXpqbG5sdW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDUwMDksImV4cCI6MjA2NzkyMTAwOX0.zCo7UC0Vb0wIUT0mAPk6qknKe0iQbY7dgGVXwUmqXGI';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };