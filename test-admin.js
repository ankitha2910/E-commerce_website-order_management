const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4MzY4MiwiZXhwIjoyMDk4NDU5NjgyfQ.AxUrwCPdxI9_lQIMnn9BqgMFZPAcATHLwrj1PUOhufg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function investigate() {
  console.log("Attempting to create a user using Admin API...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin_test' + Date.now() + '@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      fullName: 'Admin Test',
      mobile: '1234567890',
      role: 'customer'
    }
  });

  if (error) {
    console.error("Admin CreateUser failed:");
    console.error(error);
  } else {
    console.log("Admin CreateUser succeeded:", data);
  }
}

investigate();
