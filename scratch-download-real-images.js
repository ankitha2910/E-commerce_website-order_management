const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres'
});

const imageUpdates = {
  "Non-Stick 10-Piece Cookware Set": "https://loremflickr.com/600/400/cookware,pots,pans/all",
  "Geometric Tufted Area Rug": "https://loremflickr.com/600/400/rug,carpet,livingroom/all",
  "Smart Air Purifier with HEPA Filter": "https://loremflickr.com/600/400/appliance,purifier/all",
  "Aromatherapy Essential Oil Diffuser": "https://loremflickr.com/600/400/diffuser,aromatherapy/all"
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
      const filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_real.jpg';
      const filepath = path.join(__dirname, 'public', 'images', filename);
      
      console.log(`Downloading real image for ${name}...`);
      await downloadImage(url, filepath);
      
      const localUrl = `/images/${filename}`;
      
      await client.query(`
        UPDATE products SET image_url = $1 WHERE name = $2
      `, [localUrl, name]);
      
      console.log(`Updated ${name} to ${localUrl}`);
    }
    
    console.log("Successfully downloaded and updated real Flickr images!");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
