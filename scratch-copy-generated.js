const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:%25_%2Aps%23s9%2F4VE%26kj@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres'
});

const updates = [
  {
    name: "Non-Stick 10-Piece Cookware Set",
    sourceFile: "cookware_set_1783411233178.png",
    targetFile: "cookware_set.png"
  },
  {
    name: "Geometric Tufted Area Rug",
    sourceFile: "area_rug_1783411245307.png",
    targetFile: "area_rug.png"
  },
  {
    name: "Smart Air Purifier with HEPA Filter",
    sourceFile: "air_purifier_1783411282637.png",
    targetFile: "air_purifier.png"
  },
  {
    name: "Aromatherapy Essential Oil Diffuser",
    sourceFile: "oil_diffuser_1783411296551.png",
    targetFile: "oil_diffuser.png"
  }
];

const sourceDir = "C:\\Users\\SuriNB\\.gemini\\antigravity-ide\\brain\\c07fba13-6c8c-454a-95b5-55444f1575d7";
const targetDir = "C:\\Users\\SuriNB\\Desktop\\Project1\\novaboard\\public\\images";

async function run() {
  try {
    await client.connect();
    
    for (const item of updates) {
      const sourcePath = path.join(sourceDir, item.sourceFile);
      const targetPath = path.join(targetDir, item.targetFile);
      
      console.log(`Copying ${item.sourceFile}...`);
      fs.copyFileSync(sourcePath, targetPath);
      
      const localUrl = `/images/${item.targetFile}`;
      
      await client.query(`
        UPDATE products SET image_url = $1 WHERE name = $2
      `, [localUrl, item.name]);
      
      console.log(`Updated ${item.name} to ${localUrl}`);
    }
    
    console.log("Successfully copied and updated all generated images!");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
