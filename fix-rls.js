const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres' }); 
async function run() { 
  await client.connect(); 
  
  // Create INSERT policy for profiles
  await client.query(`
    CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
  `).catch(e => console.log('Policy insert error:', e.message));

  // Make sure users can insert into customers too
  await client.query(`
    CREATE POLICY "Users can insert their own customer record" 
    ON customers FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  `).catch(e => console.log('Policy insert error:', e.message));

  // Insert profiles for all users that are missing them!
  const users = await client.query('SELECT id FROM auth.users');
  for (const user of users.rows) {
    await client.query(`
      INSERT INTO profiles (id, role, username)
      VALUES ($1, 'customer', 'User')
      ON CONFLICT (id) DO NOTHING
    `, [user.id]);
  }
  
  console.log("Fixed RLS policies and populated missing profiles!");
  await client.end(); 
} 
run();
