import https from 'https';

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          resolve(Array.isArray(list) ? list.slice(0, 10).map(x => x.name) : data.slice(0, 200));
        } catch(e) { resolve('error: ' + data.slice(0, 100)); }
      });
    }).on('error', e => resolve('req err: ' + e.message));
  });
}

async function test() {
  console.log('VB:', await check('https://api.github.com/repos/libretro-thumbnails/Nintendo_-_Virtual_Boy/contents/Named_Snaps'));
  console.log('FBNeo:', await check('https://api.github.com/repos/libretro-thumbnails/FBNeo_-_Arcade_Games/contents/Named_Snaps'));
  console.log('MAME:', await check('https://api.github.com/repos/libretro-thumbnails/MAME/contents/Named_Snaps'));
}
test();
