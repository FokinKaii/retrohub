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
  const vbList = await getList('https://api.github.com/repos/libretro-thumbnails/Nintendo_-_Virtual_Boy/contents/Named_Snaps');
  const vbWanted = ['Galactic Pinball (Japan, USA).png', '3-D Tetris (USA).png', 'Golf (USA).png'];
  for (const w of vbWanted) {
    const found = vbList.find(x => x.name.includes(w.split(' ')[0]));
    if (found) {
      console.log('Downloading VB:', found.name);
      await download(found.download_url, `assets/game_wallpapers/virtualboy/${w.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`);
    }
  }

  const fbList = await getList('https://api.github.com/repos/libretro-thumbnails/FBNeo_-_Arcade_Games/contents/Named_Snaps');
  const mslug = fbList.find(x => x.name.startsWith('Metal Slug -'));
  const sf2 = fbList.find(x => x.name.startsWith('Street Fighter II -'));
  const pacman = fbList.find(x => x.name.startsWith('Pac-Man ('));

  if (mslug) {
    console.log('Arcade mslug:', mslug.name);
    await download(mslug.download_url, 'assets/game_wallpapers/arcade/metalslug.png');
  }
  if (sf2) {
    console.log('Arcade sf2:', sf2.name);
    await download(sf2.download_url, 'assets/game_wallpapers/arcade/sf2.png');
  }
  if (pacman) {
    console.log('Arcade pacman:', pacman.name);
    await download(pacman.download_url, 'assets/game_wallpapers/arcade/pacman.png');
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
  console.log('SUCCESS: Manifest updated!');
  console.log(manifest);
}

run();
