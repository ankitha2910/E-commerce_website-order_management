import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODM2ODIsImV4cCI6MjA5ODQ1OTY4Mn0.S5a5xMjPqqmlGUilX5BqrYCwEl0NOLyyRE3G5XFXcD4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)