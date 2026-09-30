import fs from 'fs';
import path from 'path';
import https from 'https';

const boxarts = [
  {
    id: 'sm64',
    title: 'Super Mario 64',
    systemId: 'n64',
    systemName: 'Nintendo 64',
    boxType: 'n64_box',
    genre: 'Plataformas 3D',
    year: '1996',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_64/master/Named_Boxarts/Super%20Mario%2064%20(USA).png',
    file: 'ROMS/covers/box_sm64.png'
  },
  {
    id: 'oot',
    title: 'The Legend of Zelda: Ocarina of Time',
    systemId: 'n64',
    systemName: 'Nintendo 64',
    boxType: 'n64_box',
    genre: 'Acción / RPG',
    year: '1998',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_64/master/Named_Boxarts/Legend%20of%20Zelda%2C%20The%20-%20Ocarina%20of%20Time%20(USA).png',
    file: 'ROMS/covers/box_oot.png'
  },
  {
    id: 'sonic2',
    title: 'Sonic The Hedgehog 2',
    systemId: 'genesis',
    systemName: 'Sega Genesis / Mega Drive',
    boxType: 'genesis_clam',
    genre: 'Velocidad / Plataformas',
    year: '1992',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Mega_Drive_-_Genesis/master/Named_Boxarts/Sonic%20the%20Hedgehog%202%20(World).png',
    file: 'ROMS/covers/box_sonic2.png'
  },
  {
    id: 'smw',
    title: 'Super Mario World',
    systemId: 'snes',
    systemName: 'Super Nintendo',
    boxType: 'snes_box',
    genre: 'Plataformas 16-Bit',
    year: '1990',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Super_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20World%20(USA).png',
    file: 'ROMS/covers/box_smw.png'
  },
  {
    id: 'crash1',
    title: 'Crash Bandicoot',
    systemId: 'ps1',
    systemName: 'PlayStation 1',
    boxType: 'ps1_jewel',
    genre: 'Aventura 3D',
    year: '1996',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Boxarts/Crash%20Bandicoot%20(USA).png',
    file: 'ROMS/covers/box_crash1.png'
  },
  {
    id: 'poke_emerald',
    title: 'Pokémon Esmeralda',
    systemId: 'gba',
    systemName: 'Game Boy Advance',
    boxType: 'gba_box',
    genre: 'RPG / Coleccionismo',
    year: '2004',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Game_Boy_Advance/master/Named_Boxarts/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).png',
    file: 'ROMS/covers/box_emerald.png'
  },
  {
    id: 'alexkidd',
    title: 'Alex Kidd in Miracle World',
    systemId: 'sms',
    systemName: 'Sega Master System',
    boxType: 'sms_case',
    genre: 'Aventura 8-Bit',
    year: '1986',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sega_-_Master_System_-_Mark_III/master/Named_Boxarts/Alex%20Kidd%20in%20Miracle%20World%20(USA%2C%20Europe).png',
    file: 'ROMS/covers/box_alexkidd.png'
  },
  {
    id: 'sotn',
    title: 'Castlevania: Symphony of the Night',
    systemId: 'ps1',
    systemName: 'PlayStation 1',
    boxType: 'ps1_jewel',
    genre: 'Metroidvania',
    year: '1997',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Sony_-_PlayStation/master/Named_Boxarts/Castlevania%20-%20Symphony%20of%20the%20Night%20(USA).png',
    file: 'ROMS/covers/box_sotn.png'
  },
  {
    id: 'smb3',
    title: 'Super Mario Bros. 3',
    systemId: 'nes',
    systemName: 'Nintendo NES',
    boxType: 'nes_box',
    genre: 'Plataformas Clásico',
    year: '1988',
    url: 'https://raw.githubusercontent.com/libretro-thumbnails/Nintendo_-_Nintendo_Entertainment_System/master/Named_Boxarts/Super%20Mario%20Bros.%203%20(USA).png',
    file: 'ROMS/covers/box_smb3.png'
  }
];

function download(item) {
  return new Promise((resolve) => {
    const fullPath = path.resolve(process.cwd(), item.file);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    https.get(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (r2) => {
          if (r2.statusCode === 200) {
            const out = fs.createWriteStream(fullPath);
            r2.pipe(out);
            out.on('finish', () => { console.log('OK redirect:', item.title); resolve(true); });
          } else {
            console.log('FAIL redirect status', r2.statusCode, item.title);
            resolve(false);
          }
        }).on('error', () => resolve(false));
        return;
      }
      if (res.statusCode === 200) {
        const out = fs.createWriteStream(fullPath);
        res.pipe(out);
        out.on('finish', () => { console.log('OK:', item.title); resolve(true); });
      } else {
        console.log('FAIL status', res.statusCode, item.title);
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function run() {
  for (const b of boxarts) {
    await download(b);
  }
  console.log('Finished downloading original packaging boxarts!');
}

run();
