const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4MzY4MiwiZXhwIjoyMDk4NDU5NjgyfQ.AxUrwCPdxI9_lQIMnn9BqgMFZPAcATHLwrj1PUOhufg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkTriggers() {
  console.log("Checking information_schema...");
  const { data, error } = await supabase.from('information_schema.triggers').select('*');
  console.log("Error:", error);
  console.log("Data:", data);
}

checkTriggers();
