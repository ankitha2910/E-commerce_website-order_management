const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjg4MzY4MiwiZXhwIjoyMDk4NDU5NjgyfQ.AxUrwCPdxI9_lQIMnn9BqgMFZPAcATHLwrj1PUOhufg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function investigatePhone() {
  console.log("Attempting to create a user with PHONE ONLY...");
  const { data, error } = await supabase.auth.admin.createUser({
    phone: '+1' + Math.floor(1000000000 + Math.random() * 9000000000),
    password: 'password123',
    phone_confirm: true,
    user_metadata: {
      fullName: 'Phone Test',
      role: 'customer'
    }
  });

  if (error) {
    console.error("Phone CreateUser failed:");
    console.error(error);
  } else {
    console.log("Phone CreateUser succeeded:", data);
  }
}

investigatePhone();
