import https from 'https';
import fs from 'fs';
import path from 'path';

function getList(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function download(url, filePath) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        const out = fs.createWriteStream(fullPath);
        res.pipe(out);
        out.on('finish', () => resolve(true));
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function run() {
  const mameList = await getList('https://api.github.com/repos/libretro-thumbnails/MAME/contents/Named_Snaps');
  console.log('MAME total items:', mameList.length);
  // Find mslug, sf2, pacman or neogeo games
  const candidates = mameList.filter(x => 
    x.name.toLowerCase().includes('metal slug') || 
    x.name.toLowerCase().includes('street fighter') || 
    x.name.toLowerCase().includes('pac-man') ||
    x.name.toLowerCase().includes('galaga') ||
    x.name.toLowerCase().includes('donkey kong') ||
    x.name.toLowerCase().includes('king of fighters')
  );
  console.log('Candidates found:', candidates.slice(0, 10).map(x => x.name));

  const chosen = candidates.slice(0, 3);
  for (const c of chosen) {
    console.log('Downloading Arcade:', c.name);
    const fname = c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
    await download(c.download_url, `assets/game_wallpapers/arcade/${fname}`);
  }

  // Update manifest.json
  const manifest = {};
  const baseDir = path.resolve(process.cwd(), 'assets/game_wallpapers');
  const dirs = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const files = fs.readdirSync(path.join(baseDir, dir.name)).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    manifest[dir.name] = files.map(f => 'assets/game_wallpapers/' + dir.name + '/' + f);
  }
  fs.writeFileSync(path.join(baseDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Arcade count:', manifest['arcade'].length);
}

run();
