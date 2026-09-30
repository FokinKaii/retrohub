import fs from 'fs';
import zlib from 'zlib';

function cleanPngCorner(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  if (colorType !== 6) return;

  let pos = 8;
  const chunks = [];
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') {
      idats.push(buf.slice(pos + 8, pos + 8 + len));
    } else {
      chunks.push({ type, data: buf.slice(pos + 8, pos + 8 + len) });
    }
    pos += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  const stride = 1 + width * 4;

  // Zero out any stray border pixels at (0,0) or (width-1, 0)
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      const p = y * stride + 1 + x * 4;
      // If it was near transparent or single stray pixel, make alpha 0
      if (decompressed[p + 3] < 10 || (decompressed[p] === 255 && decompressed[p+1] === 255 && decompressed[p+2] === 255 && x === 0 && y === 0)) {
        decompressed[p + 3] = 0;
      }
    }
  }

  const recompressed = zlib.deflateSync(decompressed);

  // Build new PNG
  const out = [];
  out.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])); // Signature

  // Write IHDR
  const ihdr = chunks.find(c => c.type === 'IHDR');
  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(ihdr.data.length);
  const ihdrTypeAndData = Buffer.concat([Buffer.from('IHDR'), ihdr.data]);
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeInt32BE(crc32(ihdrTypeAndData));
  out.push(ihdrLen, ihdrTypeAndData, ihdrCrc);

  // Write IDAT
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(recompressed.length);
  const idatTypeAndData = Buffer.concat([Buffer.from('IDAT'), recompressed]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeInt32BE(crc32(idatTypeAndData));
  out.push(idatLen, idatTypeAndData, idatCrc);

  // Write IEND
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0);
  const iendTypeAndData = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeInt32BE(crc32(iendTypeAndData));
  out.push(iendLen, iendTypeAndData, iendCrc);

  fs.writeFileSync(filePath, Buffer.concat(out));
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c >>> 0;
}

cleanPngCorner('assets/consoles_hires/nes.png');
cleanPngCorner('assets/consoles_hires/n64.png');
cleanPngCorner('assets/consoles/nes.png');
cleanPngCorner('assets/consoles/n64.png');
console.log('Cleaned nes.png and n64.png!');
