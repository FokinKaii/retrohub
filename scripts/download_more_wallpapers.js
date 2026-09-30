import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const wallpapers = [
  // PSP
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation_Portable/master/Named_Snaps/God%20of%20War%20-%20Chains%20of%20Olympus%20(USA).png', file: 'assets/game_wallpapers/psp/gow.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation_Portable/master/Named_Snaps/Ridge%20Racer%20(USA).png', file: 'assets/game_wallpapers/psp/ridgeracer.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation_Portable/master/Named_Snaps/Crisis%20Core%20-%20Final%20Fantasy%20VII%20(USA).png', file: 'assets/game_wallpapers/psp/crisis_core.png' },
  
  // PS1
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Snaps/Tekken%203%20(USA).png', file: 'assets/game_wallpapers/ps1/tekken3.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Snaps/Final%20Fantasy%20VII%20(USA)%20(Disc%201).png', file: 'assets/game_wallpapers/ps1/ff7.png' },
  
  // NDS
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Snaps/Mario%20Kart%20DS%20(USA).png', file: 'assets/game_wallpapers/nds/mariokart_ds.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_DS/master/Named_Snaps/Pokemon%20-%20HeartGold%20Version%20(USA).png', file: 'assets/game_wallpapers/nds/pokemon_hg.png' },
  
  // Atari 2600
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Atari_-_2600/master/Named_Snaps/Pitfall!%20(USA).png', file: 'assets/game_wallpapers/atari/pitfall.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Atari_-_2600/master/Named_Snaps/Space%20Invaders%20(USA).png', file: 'assets/game_wallpapers/atari/spaceinvaders.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Atari_-_2600/master/Named_Snaps/Pac-Man%20(USA).png', file: 'assets/game_wallpapers/atari/pacman.png' },
  
  // Virtual Boy
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Virtual_Boy/master/Named_Snaps/Mario%27s%20Tennis%20(USA).png', file: 'assets/game_wallpapers/virtualboy/mariotennis.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Virtual_Boy/master/Named_Snaps/Virtual%20Boy%20Wario%20Land%20(USA).png', file: 'assets/game_wallpapers/virtualboy/warioland.png' },
  
  // GBA
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Snaps/Golden%20Sun%20(USA%2C%20Europe).png', file: 'assets/game_wallpapers/gba/goldensun.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Snaps/Castlevania%20-%20Aria%20of%20Sorrow%20(USA).png', file: 'assets/game_wallpapers/gba/aria.png' },
  
  // PCE
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/NEC_-_PC_Engine_-_TurboGrafx%2016/master/Named_Snaps/Castlevania%20-%20Rondo%20of%20Blood%20(Japan).png', file: 'assets/game_wallpapers/pce/rondo.png' },
  
  // Arcade
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/FBNeo_-_Arcade_Games/master/Named_Snaps/mslug.png', file: 'assets/game_wallpapers/arcade/metalslug.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/FBNeo_-_Arcade_Games/master/Named_Snaps/sf2.png', file: 'assets/game_wallpapers/arcade/sf2.png' },
  { url: 'https://raw.githubusercontent.com/libretro-thumbnails/FBNeo_-_Arcade_Games/master/Named_Snaps/pacman.png', file: 'assets/game_wallpapers/arcade/pacman.png' }
];

function download(item) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(__dirname, '..', item.file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const req = https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r2) => {
          if (r2.statusCode === 200) {
            const out = fs.createWriteStream(fullPath);
            r2.pipe(out);
            out.on('finish', () => { console.log('OK redirect:', item.file); resolve(true); });
          } else {
            console.log('FAIL redirect status', r2.statusCode, item.file);
            resolve(false);
          }
        }).on('error', (err) => { console.log('FAIL:', err.message); resolve(false); });
        return;
      }
      if (res.statusCode === 200) {
        const out = fs.createWriteStream(fullPath);
        res.pipe(out);
        out.on('finish', () => { console.log('OK:', item.file); resolve(true); });
      } else {
        console.log('FAIL status', res.statusCode, item.file);
        resolve(false);
      }
    });
    req.on('error', (err) => {
      console.log('FAIL error:', err.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const item of wallpapers) {
    await download(item);
  }
  
  const manifest = {};
  const baseDir = path.resolve(__dirname, '../assets/game_wallpapers');
  const dirs = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const files = fs.readdirSync(path.join(baseDir, dir.name)).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    manifest[dir.name] = files.map(f => 'assets/game_wallpapers/' + dir.name + '/' + f);
  }
  fs.writeFileSync(path.join(baseDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Updated manifest.json with consoles:', Object.keys(manifest));
}

run();
