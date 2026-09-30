import http from 'http';
import fs from 'fs';

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8080/${url}`, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => resolve({ url, status: 'error: ' + e.message }));
  });
}

async function run() {
  const manifest = JSON.parse(fs.readFileSync('assets/game_wallpapers/manifest.json', 'utf8'));
  let totalWallpapers = 0;
  let okWallpapers = 0;

  for (const [consoleId, files] of Object.entries(manifest)) {
    for (const f of files) {
      totalWallpapers++;
      const res = await checkUrl(f);
      if (res.status === 200) {
        okWallpapers++;
      } else {
        console.error(`Missing wallpaper: ${f} -> status ${res.status}`);
      }
    }
  }

  console.log(`Wallpapers verified: ${okWallpapers}/${totalWallpapers} OK`);

  const consoles = ['arcade', 'atari', 'gba', 'gbc', 'genesis', 'n64', 'nds', 'nes', 'pce', 'ps1', 'psp', 'sms', 'snes', 'virtualboy'];
  let okConsoles = 0;
  for (const c of consoles) {
    const res = await checkUrl(`assets/consoles_hires/${c}.png`);
    if (res.status === 200) {
      okConsoles++;
    } else {
      console.error(`Missing console hires: ${c} -> status ${res.status}`);
    }
  }
  console.log(`Console photos verified: ${okConsoles}/${consoles.length} OK`);
}

run();
