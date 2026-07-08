const { Client } = require('pg');

const client = new Client({
  host: 'db.zzcrhiawxhrdwnwauape.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '%_*ps#s9/4VE&kj',
  ssl: { rejectUnauthorized: false }
});

async function fixDb() {
  try {
    await client.connect();
    console.log("Connected to database successfully.");
    
    // Find triggers on auth.users
    const res = await client.query(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_table = 'users' AND trigger_schema = 'auth';
    `);
    
    console.log("Triggers found on auth.users:", res.rows);
    
    for (let row of res.rows) {
       console.log("Dropping trigger:", row.trigger_name);
       await client.query(`DROP TRIGGER IF EXISTS "${row.trigger_name}" ON auth.users;`);
    }
    
    console.log("Database triggers cleared.");
  } catch (err) {
    console.error("Database connection or query failed:", err);
  } finally {
    await client.end();
  }
}

fixDb();
