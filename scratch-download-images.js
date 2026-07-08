const { Client } = require('pg');
const https = require('https');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres'
});

const imageUpdates = {
  "Smartphone X Pro": "https://m.media-amazon.com/images/I/71xb2cghqsl._AC_SL1500_.jpg",
  "Wireless Noise Cancelling Headphones": "https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg",
  "Ceramic Coffee Mug Set": "https://m.media-amazon.com/images/I/61L2A+d7f-L._AC_SL1500_.jpg", 
  "Men's Classic Denim Jacket": "https://m.media-amazon.com/images/I/81Pz-Fw1j1L._AC_UL1500_.jpg",
  "Women's Running Shoes": "https://m.media-amazon.com/images/I/71R2H2N5LwL._AC_UL1500_.jpg",
  "Smart Fitness Watch": "https://m.media-amazon.com/images/I/71b2u6v2RLL._AC_SL1500_.jpg",
  "Minimalist Table Lamp": "https://m.media-amazon.com/images/I/71OQ0H-xJDL._AC_SL1500_.jpg",
  "Luxury Egyptian Cotton Bedsheet Set": "https://m.media-amazon.com/images/I/71+D7bZ9y2L._AC_SL1500_.jpg",
  "Non-Stick 10-Piece Cookware Set": "https://m.media-amazon.com/images/I/71V2J+s5v3L._AC_SL1500_.jpg",
  "Geometric Tufted Area Rug": "https://m.media-amazon.com/images/I/91tK6fF-1tL._AC_SL1500_.jpg",
  "Smart Air Purifier with HEPA Filter": "https://m.media-amazon.com/images/I/71s8L5qV2dL._AC_SL1500_.jpg",
  "Aromatherapy Essential Oil Diffuser": "https://m.media-amazon.com/images/I/61D2n2Z61KL._AC_SL1500_.jpg"
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

async function run() {
  try {
    await client.connect();
    
    for (const [name, url] of Object.entries(imageUpdates)) {
      const filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
      const filepath = path.join(__dirname, '..', '..', 'public', 'images', filename);
      
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
