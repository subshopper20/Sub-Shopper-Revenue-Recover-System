const { createClient } = require('@supabase/supabase-js');

// Your actual Supabase credentials
const supabaseUrl = 'https://nyakvkyostmzwaawdcmp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YWt2a3lvc3RtendhYXdkY21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjI4NTEsImV4cCI6MjA4Nzk5ODg1MX0.p7JFT7SD4Ynrbg0ZUdKELAh0PiETvrJwr07MyxMG8ow';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;