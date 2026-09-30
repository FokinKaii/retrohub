import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function checkPngTransparency(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];

  // Extract IDAT chunks
  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const allIdat = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(allIdat);

  // Each scanline: 1 byte filter + width * (colorType == 6 ? 4 : 3)
  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = 1 + width * bytesPerPixel;

  let transparentPixels = 0;
  let opaquePixels = 0;

  // Check sample pixels across the image
  for (let y = 0; y < Math.min(height, 50); y++) {
    const rowStart = y * stride + 1;
    for (let x = 0; x < width; x++) {
      const p = rowStart + x * bytesPerPixel;
      const a = colorType === 6 ? decompressed[p + 3] : 255;
      if (a < 20) transparentPixels++;
      else opaquePixels++;
    }
  }

  return {
    width,
    height,
    colorType,
    transparentPercentage: ((transparentPixels / (transparentPixels + opaquePixels)) * 100).toFixed(1)
  };
}

const dir = 'assets/consoles_hires';
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.png'))) {
  try {
    const res = checkPngTransparency(path.join(dir, f));
    console.log(f.padEnd(16), `${res.width}x${res.height}`, `Transparent: ${res.transparentPercentage}%`);
  } catch (e) {
    console.log(f.padEnd(16), 'Error:', e.message);
  }
}
