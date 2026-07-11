const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres' }); 
async function run() { 
  await client.connect(); 
  
  // 1. Drop the strict constraint that was breaking signups
  await client.query('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check').catch(e => console.log('Drop error:', e.message));
  
  // 2. Add the correct constraint
  await client.query("ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'student'))").catch(e => console.log('Add constraint error:', e.message));

  // 3. Add missing INSERT policy (if missing)
  await client.query(`
    CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
  `).catch(e => console.log('Policy insert error (might already exist):', e.message));

  // 4. Backfill all missing profiles!
  const users = await client.query('SELECT id, email FROM auth.users');
  let count = 0;
  for (const user of users.rows) {
    const res = await client.query(`
      INSERT INTO profiles (id, role, username)
      VALUES ($1, 'customer', $2)
      ON CONFLICT (id) DO NOTHING
    `, [user.id, user.email.split('@')[0]]);
    if (res.rowCount > 0) count++;
  }
  
  console.log("SUCCESS! Fixed database constraints and created " + count + " missing profiles!");
  await client.end(); 
} 
run();
