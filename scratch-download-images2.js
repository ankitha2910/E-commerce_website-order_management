const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

const client = new Client({
  connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres'
});

const imageUpdates = {
  "Smartphone X Pro": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
  "Wireless Noise Cancelling Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
  "Ceramic Coffee Mug Set": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop", 
  "Men's Classic Denim Jacket": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop",
  "Women's Running Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
  "Smart Fitness Watch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
  "Minimalist Table Lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
  "Luxury Egyptian Cotton Bedsheet Set": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=600&auto=format&fit=crop",
  "Non-Stick 10-Piece Cookware Set": "https://picsum.photos/600/400",
  "Geometric Tufted Area Rug": "https://picsum.photos/600/400",
  "Smart Air Purifier with HEPA Filter": "https://picsum.photos/600/400",
  "Aromatherapy Essential Oil Diffuser": "https://picsum.photos/600/400"
};

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(filepath, buffer);
}

async function run() {
  try {
    await client.connect();
    
    for (const [name, url] of Object.entries(imageUpdates)) {
      const filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
      const filepath = path.join(__dirname, 'public', 'images', filename);
      
      console.log(`Downloading ${name}...`);
      await downloadImage(url, filepath);
      
      const localUrl = `/images/${filename}`;
      
      await client.query(`
        UPDATE products SET image_url = $1 WHERE name = $2
      `, [localUrl, name]);
      
      console.log(`Updated ${name} to ${localUrl}`);
    }
    
    console.log("Successfully downloaded and updated all images!");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
