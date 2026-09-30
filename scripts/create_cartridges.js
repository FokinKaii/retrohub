import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, '..', 'ROMS', 'cartridges');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. CD Disc for PS1
const cdSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="cdDiscGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="18%" stop-color="#1f2937"/>
      <stop offset="20%" stop-color="transparent"/>
      <stop offset="24%" stop-color="#cbd5e1" stop-opacity="0.9"/>
      <stop offset="28%" stop-color="#e2e8f0"/>
      <stop offset="32%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="45%" stop-color="#c084fc" stop-opacity="0.7"/>
      <stop offset="60%" stop-color="#4ade80" stop-opacity="0.8"/>
      <stop offset="75%" stop-color="#f472b6" stop-opacity="0.7"/>
      <stop offset="90%" stop-color="#94a3b8"/>
      <stop offset="98%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="transparent"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="96" fill="url(#cdDiscGrad)"/>
  <circle cx="100" cy="100" r="96" fill="url(#shineGrad)"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="#f8fafc" stroke-width="1" opacity="0.4"/>
  <circle cx="100" cy="100" r="24" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
  <circle cx="100" cy="100" r="12" fill="#000000" opacity="0.8"/>
  <text x="100" y="65" fill="#1e293b" font-family="sans-serif" font-weight="900" font-size="10" text-anchor="middle" letter-spacing="2">COMPACT DISC</text>
  <text x="100" y="145" fill="#334155" font-family="sans-serif" font-weight="800" font-size="9" text-anchor="middle" letter-spacing="1">PLAYSTATION • CD-ROM</text>
</svg>`;
fs.writeFileSync(path.join(targetDir, 'cd_disc.svg'), cdSvg);

// 2. SNES Cartridge
const snesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130" width="200" height="130">
  <defs>
    <linearGradient id="snesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="8%" stop-color="#94a3b8"/>
      <stop offset="95%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="180" height="110" rx="12" fill="url(#snesGrad)" stroke="#334155" stroke-width="2"/>
  <rect x="30" y="30" width="140" height="75" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="35" y="35" width="130" height="65" rx="4" fill="#f59e0b" opacity="0.85"/>
  <text x="100" y="72" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="12" text-anchor="middle" letter-spacing="1">SUPER NINTENDO</text>
  <rect x="15" y="100" width="170" height="8" fill="#334155" rx="2"/>
  <circle cx="24" cy="22" r="4" fill="#8b5cf6"/>
  <circle cx="36" cy="22" r="4" fill="#8b5cf6"/>
</svg>`;
fs.writeFileSync(path.join(targetDir, 'cart_snes.svg'), snesSvg);

// 3. Genesis Cartridge
const genesisSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 140" width="170" height="140">
  <defs>
    <linearGradient id="genGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="15%" stop-color="#1e293b"/>
      <stop offset="90%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <path d="M10,35 Q85,15 160,35 L155,130 L15,130 Z" fill="url(#genGrad)" stroke="#475569" stroke-width="2"/>
  <rect x="25" y="50" width="120" height="65" rx="4" fill="#dc2626"/>
  <text x="85" y="80" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="13" text-anchor="middle" letter-spacing="1">SEGA GENESIS</text>
  <text x="85" y="98" fill="#fef08a" font-family="sans-serif" font-weight="800" font-size="9" text-anchor="middle">16-BIT CARTRIDGE</text>
</svg>`;
fs.writeFileSync(path.join(targetDir, 'cart_genesis.svg'), genesisSvg);

// 4. Sega Master System Cartridge
const smsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 130" width="160" height="130">
  <defs>
    <linearGradient id="smsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="20%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect x="15" y="15" width="130" height="100" rx="8" fill="url(#smsGrad)" stroke="#64748b" stroke-width="2"/>
  <rect x="30" y="35" width="100" height="60" rx="4" fill="#be123c"/>
  <text x="80" y="65" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="11" text-anchor="middle" letter-spacing="0.5">MASTER SYSTEM</text>
  <text x="80" y="80" fill="#fef08a" font-family="sans-serif" font-weight="700" font-size="8" text-anchor="middle">SEGA 8-BIT</text>
</svg>`;
fs.writeFileSync(path.join(targetDir, 'cart_sms.svg'), smsSvg);

console.log('Successfully wrote cartridges SVGs!');
