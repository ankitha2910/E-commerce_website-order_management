const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zzcrhiawxhrdwnwauape.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Y3JoaWF3eGhyZHdud2F1YXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4ODM2ODIsImV4cCI6MjA5ODQ1OTY4Mn0.S5a5xMjPqqmlGUilX5BqrYCwEl0NOLyyRE3G5XFXcD4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
  console.log("Testing signup with a dummy email...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: {
        fullName: 'Test User',
        mobile: '1234567890',
        role: 'customer'
      }
    }
  });

  if (error) {
    console.error("Signup failed:", error);
    if (error.status) console.error("Status:", error.status);
    console.log("Stringified error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Signup success:", data);
  }
}

testSignup();
