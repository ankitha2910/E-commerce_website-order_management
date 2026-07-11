const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres' }); 
async function run() { 
  await client.connect(); 
  const res = await client.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'profiles_role_check'");
  console.log(res.rows);
  await client.end(); 
} 
run();
