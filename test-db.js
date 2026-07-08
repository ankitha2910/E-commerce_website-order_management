const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4MzY4MiwiZXhwIjoyMDk4NDU5NjgyfQ.AxUrwCPdxI9_lQIMnn9BqgMFZPAcATHLwrj1PUOhufg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkDatabase() {
  console.log("Checking profiles table...");
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*').limit(1);
  if (profileErr) {
    console.log("Profiles error:", profileErr);
  } else {
    console.log("Profiles table exists. First row:", profiles);
  }

  console.log("Checking customers table...");
  const { data: customers, error: custErr } = await supabase.from('customers').select('*').limit(1);
  if (custErr) {
    console.log("Customers error:", custErr);
  } else {
    console.log("Customers table exists. First row:", customers);
  }

  console.log("Checking admins table...");
  const { data: admins, error: adminErr } = await supabase.from('admins').select('*').limit(1);
  if (adminErr) {
    console.log("Admins error:", adminErr);
  } else {
    console.log("Admins table exists. First row:", admins);
  }
}

checkDatabase();
