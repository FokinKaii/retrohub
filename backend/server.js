/**
 * RetroHub Living Organism - Master Backend Engine
 * Stack: Node.js 24 + Express + Native SQLite (node:sqlite) + Socket.io + JWT + Bcryptjs
 * Compliant with: Especificación Profesional Plataforma Emulación Antigravity
 * Archivo: backend/server.js
 */

import express from 'express';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'retrohub_master.sqlite');
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'retrohub-super-secret-master-token-key-2026';

const app = express();
const server = http.createServer(app);

// Configurar Socket.io con CORS permisivo y autenticación
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Encabezados de Alto Rendimiento y WebAssembly SharedArrayBuffer
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// ========================================================
// 1. INICIALIZACIÓN DE BASE DE DATOS SQLITE NATIVA
// ========================================================
console.log(`[RetroHub DB]: Inicializando base de datos SQLite en: ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);

// Migraciones de Esquema Maestro
db.exec(`
  PRAGMA foreign_keys = ON;

  -- 1. Tabla de Usuarios (Identidad de Cuenta)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    username_clean TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    onboarding_completed INTEGER DEFAULT 0,
    account_status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
  );

  -- 2. Tabla de Perfiles Públicos
  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    display_name TEXT NOT NULL,
    bio TEXT DEFAULT 'Explorador del multiverso retro.',
    avatar_url TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    title_honor TEXT DEFAULT '🎮 Maestro de los 64-Bits',
    system_aura TEXT DEFAULT 'scarlet',
    favorite_system TEXT DEFAULT 'n64',
    favorite_games TEXT DEFAULT '[]',
    social_links TEXT DEFAULT '[]',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 3. Catálogo Maestro de Emuladores
  CREATE TABLE IF NOT EXISTS emulators (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    maker TEXT,
    arch TEXT,
    year TEXT,
    color TEXT,
    glow TEXT,
    real_image TEXT,
    wallpaper TEXT,
    famous_game TEXT,
    theme_song TEXT,
    synopsis TEXT,
    status TEXT DEFAULT 'available'
  );

  -- 4. Preferencias de Emuladores por Usuario
  CREATE TABLE IF NOT EXISTS user_emulator_preferences (
    user_id INTEGER NOT NULL,
    emulator_id TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 1,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, emulator_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(emulator_id) REFERENCES emulators(id) ON DELETE CASCADE
  );

  -- 5. Solicitudes de Amistad
  CREATE TABLE IF NOT EXISTS friend_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 6. Amistades Reales (Relación canónica user1_id < user2_id)
  CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id),
    FOREIGN KEY(user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user2_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 7. Bloqueos Sociales
  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id),
    FOREIGN KEY(blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(blocked_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 8. Configuración de Privacidad
  CREATE TABLE IF NOT EXISTS privacy_settings (
    user_id INTEGER PRIMARY KEY,
    profile_visibility TEXT DEFAULT 'all',      -- 'all', 'friends', 'nobody'
    online_visibility TEXT DEFAULT 'all',       -- 'all', 'friends', 'nobody'
    emulator_visibility TEXT DEFAULT 'all',     -- 'all', 'friends', 'nobody'
    game_visibility TEXT DEFAULT 'all',         -- 'all', 'friends', 'nobody'
    friend_list_visibility TEXT DEFAULT 'friends', -- 'all', 'friends', 'nobody'
    friend_request_permission TEXT DEFAULT 'all',   -- 'all', 'nobody'
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 9. Presencia y Actividad en Vivo
  CREATE TABLE IF NOT EXISTS presences (
    user_id INTEGER PRIMARY KEY,
    status TEXT DEFAULT 'offline',             -- 'online', 'away', 'offline', 'playing'
    emulator_id TEXT,
    emulator_name TEXT,
    rom_id TEXT,
    rom_name TEXT,
    started_at DATETIME,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 10. Notificaciones de Usuario
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_id INTEGER NOT NULL,
    type TEXT NOT NULL,                         -- 'FRIEND_REQUEST', 'FRIEND_REQUEST_ACCEPTED', 'FRIEND_REMOVED'
    payload TEXT NOT NULL,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 11. Mensajes Directos de Amigos
  CREATE TABLE IF NOT EXISTS direct_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- 12. Biblioteca de Cajas 3D y ROMs Físicas
  CREATE TABLE IF NOT EXISTS rom_library (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    system_id TEXT NOT NULL,
    system_name TEXT NOT NULL,
    rom_path TEXT NOT NULL,
    box_art TEXT,
    cartridge_art TEXT,
    box_type TEXT NOT NULL,
    genre TEXT,
    year TEXT,
    favorite INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migración dinámica de columnas de perfil si no existen
try {
  const profileCols = db.prepare('PRAGMA table_info(profiles)').all().map(c => c.name);
  if (!profileCols.includes('favorite_games')) {
    db.exec("ALTER TABLE profiles ADD COLUMN favorite_games TEXT DEFAULT '[]'");
  }
  if (!profileCols.includes('social_links')) {
    db.exec("ALTER TABLE profiles ADD COLUMN social_links TEXT DEFAULT '[]'");
  }
} catch (e) {
  console.error('[RetroHub DB]: Error en migración de profiles:', e);
}

// ========================================================
// 2. SEED DEL CATÁLOGO DE CONSOLAS MAESTRAS
// ========================================================
const emuCount = db.prepare('SELECT COUNT(*) as count FROM emulators').get();
if (emuCount.count === 0) {
  console.log('[RetroHub DB]: Sembrando catálogo de 14 emuladores maestros...');
  const insertEmu = db.prepare(`
    INSERT INTO emulators (id, name, platform, maker, arch, year, color, glow, real_image, wallpaper, famous_game, theme_song, synopsis)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialEmulators = [
    ['n64', 'Nintendo 64', 'N64', 'Nintendo', '64-Bit MIPS VR4300', '1996', '#ff4757', 'rgba(255, 71, 87, 0.45)', 'n64.png', 'assets/wallpapers/n64.svg', 'Super Mario 64', 'Bob-omb Battlefield', 'La legendaria consola de 64 bits de Nintendo que revolucionó los mundos 3D con Super Mario 64, Zelda y Paper Mario.'],
    ['gba', 'Game Boy Advance', 'GBA', 'Nintendo', '32-Bit ARM7TDMI @ 16.78MHz', '2001', '#5352ed', 'rgba(83, 82, 237, 0.45)', 'gba.png', 'assets/wallpapers/gba.svg', 'Pokémon Rubí / Zafiro', 'Littleroot Town Theme', 'La consola portátil de 32 bits por excelencia. Cuna del pixel art moderno.'],
    ['snes', 'Super Nintendo (SNES)', 'SNES', 'Nintendo', '16-Bit Ricoh 5A22 + Chip S-SMP', '1990', '#6c5ce7', 'rgba(108, 92, 231, 0.45)', 'snes.png', 'assets/wallpapers/snes.svg', 'Super Mario World', 'Overworld 1-1 Theme', 'El pináculo del pixel art y sonido orquestal con Super Mario World y Chrono Trigger.'],
    ['nes', 'Nintendo NES', 'NES', 'Nintendo', '8-Bit Ricoh 2A03 (MOS 6502)', '1983', '#e74c3c', 'rgba(231, 76, 60, 0.45)', 'nes.png', 'assets/wallpapers/nes.svg', 'Super Mario Bros.', 'Ground Theme', 'La consola que rescató a la industria estableciendo las bases del videojuego moderno.'],
    ['genesis', 'Sega Genesis / Mega Drive', 'GENESIS', 'SEGA', 'Motorola 68000 + Z80', '1988', '#3742fa', 'rgba(55, 66, 250, 0.45)', 'genesis.png', 'assets/wallpapers/genesis.svg', 'Sonic The Hedgehog', 'Green Hill Zone Theme', 'Pura adrenalina de 16 bits y velocidad vertiginosa con Blast Processing.'],
    ['ps1', 'PlayStation 1', 'PS1', 'Sony Computer Ent.', '32-Bit MIPS R3000A + GTE', '1994', '#0984e3', 'rgba(9, 132, 227, 0.45)', 'ps1.png', 'assets/wallpapers/ps1.svg', 'Crash Bandicoot', 'N. Sanity Beach Main Theme', 'El terremoto cinematográfico de Sony que cambió los videojuegos para siempre.'],
    ['psp', 'PlayStation Portable (PSP)', 'PSP', 'Sony Computer Ent.', '32-Bit MIPS R4000 @ 333MHz', '2004', '#00cec9', 'rgba(0, 206, 201, 0.45)', 'psp.png', 'assets/wallpapers/psp.svg', 'Persona 3 Portable', 'Velvet Room', 'Gráficos de nivel PS2 en tu bolsillo con pantalla panorámica deslumbrante.'],
    ['arcade', 'Arcade MAME', 'ARCADE', 'Varios Fabricantes', 'Hardware Custom Coin-Op', '1985', '#ff6348', 'rgba(255, 99, 72, 0.45)', 'arcade.png', 'assets/wallpapers/arcade.svg', 'Street Fighter II', "Guile's Theme", 'El rugido de los salones recreativos dorados con Street Fighter II y Metal Slug.'],
    ['gbc', 'Game Boy Color', 'GBC', 'Nintendo', 'Sharp 8-Bit Z80 @ 8MHz', '1998', '#9b59b6', 'rgba(155, 89, 182, 0.45)', 'gbc.png', 'assets/wallpapers/gbc.svg', 'Pokémon Oro / Plata', 'New Bark Town Theme', 'La explosión a color de Game Boy con Pokémon Oro, Plata y Cristal.'],
    ['nds', 'Nintendo DS', 'NDS', 'Nintendo', 'Dual ARM946E-S & ARM7TDMI', '2004', '#1dd1a1', 'rgba(29, 209, 161, 0.45)', 'nds.png', 'assets/wallpapers/nds.svg', 'Mario Kart DS', 'Figure-8 Circuit', 'Doble pantalla y control táctil revolucionario con Mario Kart DS y Pokémon Platino.'],
    ['ps2', 'PlayStation 2', 'PS2', 'Sony Computer Ent.', 'Emotion Engine 128-Bit @ 294MHz', '2000', '#2e86de', 'rgba(46, 134, 222, 0.45)', 'ps2.png', 'assets/wallpapers/ps2.svg', 'GTA: San Andreas', 'San Andreas Theme', 'La consola más vendida de todos los tiempos con un catálogo legendario de miles de obras.'],
    ['dreamcast', 'Sega Dreamcast', 'DC', 'SEGA', 'Hitachi SH-4 128-Bit @ 200MHz', '1998', '#ff9f43', 'rgba(255, 159, 67, 0.45)', 'dreamcast.png', 'assets/wallpapers/dreamcast.svg', 'Sonic Adventure', 'Open Your Heart', 'La joya visionaria de 128 bits de Sega con juego online nativo y VMU.'],
    ['saturn', 'Sega Saturn', 'SATURN', 'SEGA', 'Dual Hitachi SH-2 @ 28.6MHz', '1994', '#576574', 'rgba(87, 101, 116, 0.45)', 'saturn.png', 'assets/wallpapers/saturn.svg', 'Nights into Dreams', 'Dreams Dreams', 'La potencia arcade 2D/3D con joyas de culto como Panzer Dragoon y Radiant Silvergun.'],
    ['neogeo', 'Neo Geo AES/MVS', 'NEOGEO', 'SNK', 'Motorola 68000 @ 12MHz + Z80', '1990', '#ee5253', 'rgba(238, 82, 83, 0.45)', 'neogeo.png', 'assets/wallpapers/neogeo.svg', 'Metal Slug X', 'The Military Men', 'El Ferrari de los videojuegos. El hardware arcade original de SNK directamente en el salón.']
  ];

  for (const emu of initialEmulators) {
    insertEmu.run(...emu);
  }
}

// Seed de la biblioteca 3D inicial si está vacía
const romCount = db.prepare('SELECT COUNT(*) as count FROM rom_library').get();
if (romCount.count === 0) {
  console.log('[RetroHub DB]: Sembrando biblioteca inicial de cajas 3D...');
  const insertRom = db.prepare(`
    INSERT INTO rom_library (id, title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year, favorite, play_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialBoxes = [
    ['rom_papermario', 'Paper Mario', 'n64', 'Nintendo 64', 'ROMS/n64/Paper Mario (Europe) (En,Fr,De,Es).z64', 'ROMS/covers/papermario.png', 'ROMS/cartridges/cart_papermario.png', 'n64_box', 'Aventura / RPG', '2001', 1, 14],
    ['rom_sm64', 'Super Mario 64', 'n64', 'Nintendo 64', 'ROMS/n64/Super Mario 64.z64', 'ROMS/covers/box_sm64.png', 'ROMS/cartridges/n64_clean.png', 'n64_box', 'Plataformas 3D', '1996', 1, 28],
    ['rom_anguna', 'Anguna Warriors of Faith', 'gba', 'Game Boy Advance', 'ROMS/gba/anguna.gba', 'ROMS/covers/anguna.png', 'ROMS/cartridges/gba_clean.png', 'gba_box', 'Acción / RPG', '2008', 0, 8],
    ['rom_zelda_oot', 'Zelda Ocarina of Time', 'n64', 'Nintendo 64', 'ROMS/n64/The Legend of Zelda - Ocarina of Time.z64', 'ROMS/covers/zelda_oot.png', 'ROMS/cartridges/n64_gold.png', 'n64_box', 'Aventura Épica', '1998', 1, 35],
    ['rom_sonic2', 'Sonic The Hedgehog 2', 'genesis', 'Sega Genesis', 'ROMS/genesis/Sonic 2.bin', 'ROMS/covers/sonic2.png', 'ROMS/cartridges/genesis_clean.png', 'genesis_clam', 'Plataformas', '1992', 1, 19],
    ['rom_smw', 'Super Mario World', 'snes', 'Super Nintendo', 'ROMS/snes/Super Mario World.sfc', 'ROMS/covers/smw.png', 'ROMS/cartridges/snes_clean.png', 'snes_box', 'Plataformas', '1990', 1, 42],
    ['rom_crash', 'Crash Bandicoot 3: Warped', 'ps1', 'PlayStation 1', 'ROMS/ps1/Crash 3.bin', 'ROMS/covers/crash3.png', 'ROMS/cartridges/ps1_disc.png', 'ps1_jewel', 'Plataformas 3D', '1998', 0, 11]
  ];

  for (const b of initialBoxes) {
    try { insertRom.run(...b); } catch(e){}
  }
}

// ========================================================
// 3. SEGURIDAD Y UTILIDADES
// ========================================================
const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'system', 'support', 'api', 'root',
  'moderator', 'official', 'retrohub', 'bot', 'guest', 'null', 'undefined'
]);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(username);
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      onboarding_completed: Boolean(user.onboarding_completed)
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Middleware de Autenticación
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token de sesión ausente o inválido.' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, username, onboarding_completed, account_status FROM users WHERE id = ?').get(decoded.id);
    if (!user || user.account_status !== 'active') {
      return res.status(401).json({ success: false, error: { code: 'USER_INACTIVE', message: 'La cuenta no existe o está inactiva.' } });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 'TOKEN_EXPIRED', message: 'La sesión ha expirado o no es válida.' } });
  }
}

// Opcional para rutas que pueden o no estar autenticadas
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT id, email, username, onboarding_completed, account_status FROM users WHERE id = ?').get(decoded.id);
      if (user && user.account_status === 'active') {
        req.user = user;
      }
    } catch (e) {}
  }
  next();
}

// Comprueba si dos usuarios son amigos
function areFriends(userIdA, userIdB) {
  if (userIdA === userIdB) return true;
  const u1 = Math.min(userIdA, userIdB);
  const u2 = Math.max(userIdA, userIdB);
  const row = db.prepare('SELECT id FROM friendships WHERE user1_id = ? AND user2_id = ?').get(u1, u2);
  return Boolean(row);
}

// Comprueba si existe bloqueo entre dos usuarios
function isBlocked(userIdA, userIdB) {
  const row = db.prepare(`
    SELECT id FROM blocks 
    WHERE (blocker_id = ? AND blocked_id = ?) 
       OR (blocker_id = ? AND blocked_id = ?)
  `).get(userIdA, userIdB, userIdB, userIdA);
  return Boolean(row);
}

// Filtra presencia y actividad en base a las reglas de privacidad (EVALUACIÓN EN SERVIDOR)
function getSanitizedUserActivity(targetUserId, requesterId) {
  if (requesterId && isBlocked(targetUserId, requesterId)) {
    return null;
  }

  const presence = db.prepare(`
    SELECT p.*, prof.display_name, prof.avatar_url, u.username
    FROM presences p
    JOIN profiles prof ON prof.user_id = p.user_id
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ?
  `).get(targetUserId);

  if (!presence) return null;

  const privacy = db.prepare('SELECT * FROM privacy_settings WHERE user_id = ?').get(targetUserId) || {
    profile_visibility: 'all',
    online_visibility: 'all',
    emulator_visibility: 'all',
    game_visibility: 'all',
    friend_list_visibility: 'friends',
    friend_request_permission: 'all'
  };

  const isSelf = requesterId === targetUserId;
  const friendRelation = requesterId ? areFriends(requesterId, targetUserId) : false;

  const canSeeOnline = isSelf || privacy.online_visibility === 'all' || (privacy.online_visibility === 'friends' && friendRelation);
  const canSeeEmulator = isSelf || privacy.emulator_visibility === 'all' || (privacy.emulator_visibility === 'friends' && friendRelation);
  const canSeeGame = isSelf || privacy.game_visibility === 'all' || (privacy.game_visibility === 'friends' && friendRelation);

  const status = canSeeOnline ? presence.status : 'offline';
  const isPlaying = status === 'playing';

  const sanitized = {
    userId: targetUserId,
    username: presence.username,
    displayName: presence.display_name,
    avatarUrl: presence.avatar_url,
    status: status,
    isPlaying: isPlaying && (canSeeEmulator || canSeeGame),
    lastSeen: presence.last_seen
  };

  if (isPlaying && canSeeEmulator) {
    sanitized.emulator = {
      id: presence.emulator_id,
      name: presence.emulator_name
    };
  }

  if (isPlaying && canSeeGame) {
    sanitized.game = {
      id: presence.rom_id,
      title: presence.rom_name
    };
  }

  return sanitized;
}

// ========================================================
// 4. RUTAS REST: AUTENTICACIÓN (FASE 1)
// ========================================================

// Registro
app.post('/api/auth/register', (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Todos los campos son obligatorios.' } });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanUsername = String(username).trim();
  const usernameClean = cleanUsername.toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'El formato de correo no es válido.' } });
  }

  if (!isValidUsername(cleanUsername)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_USERNAME', message: 'El nombre de usuario debe tener entre 3 y 24 caracteres alfanuméricos.' } });
  }

  if (RESERVED_USERNAMES.has(usernameClean)) {
    return res.status(400).json({ success: false, error: { code: 'RESERVED_USERNAME', message: 'Este nombre de usuario está reservado por el sistema.' } });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: 'La contraseña debe tener al menos 6 caracteres.' } });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, error: { code: 'PASSWORD_MISMATCH', message: 'Las contraseñas no coinciden.' } });
  }

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existingEmail) {
    return res.status(400).json({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'El correo electrónico ya está registrado.' } });
  }

  const existingUsername = db.prepare('SELECT id FROM users WHERE username_clean = ?').get(usernameClean);
  if (existingUsername) {
    return res.status(400).json({ success: false, error: { code: 'USERNAME_ALREADY_EXISTS', message: 'El nombre de usuario ya está en uso.' } });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const insertUser = db.prepare(`
    INSERT INTO users (email, username, username_clean, password_hash, onboarding_completed)
    VALUES (?, ?, ?, ?, 0)
  `);
  const result = insertUser.run(cleanEmail, cleanUsername, usernameClean, passwordHash);
  const newUserId = Number(result.lastInsertRowid);

  // Perfil por defecto
  const defaultAvatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${cleanUsername}`;
  const defaultBanner = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80';
  db.prepare(`
    INSERT INTO profiles (user_id, display_name, avatar_url, banner_url, favorite_system)
    VALUES (?, ?, ?, ?, 'n64')
  `).run(newUserId, cleanUsername, defaultAvatar, defaultBanner);

  // Privacidad por defecto
  db.prepare(`
    INSERT INTO privacy_settings (user_id)
    VALUES (?)
  `).run(newUserId);

  // Presencia inicial offline
  db.prepare(`
    INSERT INTO presences (user_id, status)
    VALUES (?, 'offline')
  `).run(newUserId);

  const newUser = {
    id: newUserId,
    email: cleanEmail,
    username: cleanUsername,
    onboarding_completed: 0
  };

  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Cuenta creada con éxito.',
    token,
    user: newUser,
    profile: {
      displayName: cleanUsername,
      avatarUrl: defaultAvatar,
      bannerUrl: defaultBanner,
      bio: 'Explorador del multiverso retro.',
      titleHonor: '🎮 Maestro de los 64-Bits',
      systemAura: 'scarlet',
      favoriteSystem: 'n64'
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Introduce usuario/correo y contraseña.' } });
  }

  const cleanIdentifier = String(identifier).trim().toLowerCase();
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE email = ? OR username_clean = ?
  `).get(cleanIdentifier, cleanIdentifier);

  if (!user) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } });
  }

  const passwordValid = bcrypt.compareSync(password, user.password_hash);
  if (!passwordValid) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas.' } });
  }

  // Actualizar último login
  db.prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id) || {};
  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      onboarding_completed: Boolean(user.onboarding_completed)
    },
    profile: {
      displayName: profile.display_name || user.username,
      avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`,
      bannerUrl: profile.banner_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80',
      bio: profile.bio || '',
      titleHonor: profile.title_honor || '🎮 Maestro de los 64-Bits',
      systemAura: profile.system_aura || 'scarlet',
      favoriteSystem: profile.favorite_system || 'n64'
    }
  });
});

// Sesión Actual (/api/auth/me)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id) || {};
  const privacy = db.prepare('SELECT * FROM privacy_settings WHERE user_id = ?').get(req.user.id) || {};
  const favoriteEmus = db.prepare(`
    SELECT emulator_id FROM user_emulator_preferences 
    WHERE user_id = ? AND is_favorite = 1 
    ORDER BY position ASC
  `).all(req.user.id).map(r => r.emulator_id);

  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      onboarding_completed: Boolean(req.user.onboarding_completed)
    },
    profile: {
      displayName: profile.display_name || req.user.username,
      avatarUrl: profile.avatar_url,
      bannerUrl: profile.banner_url,
      bio: profile.bio,
      titleHonor: profile.title_honor,
      systemAura: profile.system_aura,
      favoriteSystem: profile.favorite_system
    },
    privacy,
    favoriteEmulators: favoriteEmus
  });
});

// Logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  db.prepare("UPDATE presences SET status = 'offline', emulator_id = NULL, rom_id = NULL WHERE user_id = ?").run(req.user.id);
  io.emit('user_offline', { userId: req.user.id });
  res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

// ========================================================
// 5. RUTAS REST: PERFIL Y ONBOARDING (FASE 2 Y 3)
// ========================================================

// Completar Onboarding
app.put('/api/users/onboarding', authMiddleware, (req, res) => {
  const { displayName, bio, avatarUrl, bannerUrl, titleHonor, systemAura, favoriteSystem, favoriteEmulators } = req.body;

  const validDisplayName = (displayName && String(displayName).trim()) || req.user.username;
  const validBio = bio ? String(bio).trim().slice(0, 300) : 'Explorador del multiverso retro.';
  const validAvatar = avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${req.user.username}`;
  const validBanner = bannerUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80';
  const validTitle = titleHonor || '🎮 Maestro de los 64-Bits';
  const validAura = systemAura || 'scarlet';
  const validFavSys = favoriteSystem || 'n64';

  // 1. Guardar perfil
  db.prepare(`
    UPDATE profiles SET
      display_name = ?,
      bio = ?,
      avatar_url = ?,
      banner_url = ?,
      title_honor = ?,
      system_aura = ?,
      favorite_system = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(validDisplayName, validBio, validAvatar, validBanner, validTitle, validAura, validFavSys, req.user.id);

  // 2. Guardar emuladores favoritos iniciales
  db.prepare('DELETE FROM user_emulator_preferences WHERE user_id = ?').run(req.user.id);
  if (Array.isArray(favoriteEmulators) && favoriteEmulators.length > 0) {
    const insertFav = db.prepare(`
      INSERT INTO user_emulator_preferences (user_id, emulator_id, is_favorite, position)
      VALUES (?, ?, 1, ?)
    `);
    favoriteEmulators.forEach((emuId, idx) => {
      try { insertFav.run(req.user.id, emuId, idx); } catch (e) {}
    });
  } else {
    // Si no especificó ninguno, asignar por defecto n64, snes, gba, ps1
    const defaultEmus = ['n64', 'snes', 'gba', 'ps1'];
    const insertFav = db.prepare(`
      INSERT INTO user_emulator_preferences (user_id, emulator_id, is_favorite, position)
      VALUES (?, ?, 1, ?)
    `);
    defaultEmus.forEach((emuId, idx) => {
      try { insertFav.run(req.user.id, emuId, idx); } catch (e) {}
    });
  }

  // 3. Marcar onboarding como completado de forma persistente
  db.prepare('UPDATE users SET onboarding_completed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.user.id);

  // Actualizar usuario en sesión
  const updatedUser = db.prepare('SELECT id, email, username, onboarding_completed FROM users WHERE id = ?').get(req.user.id);
  const updatedToken = generateToken(updatedUser);

  res.json({
    success: true,
    message: '¡Onboarding completado con éxito!',
    token: updatedToken,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      onboarding_completed: true
    },
    profile: {
      displayName: validDisplayName,
      bio: validBio,
      avatarUrl: validAvatar,
      bannerUrl: validBanner,
      titleHonor: validTitle,
      systemAura: validAura,
      favoriteSystem: validFavSys
    }
  });
});

// Comprobación en vivo de unicidad y formato de nombre de usuario
app.get(['/api/users/check-username', '/api/users/check-username/:username'], (req, res) => {
  const username = String(req.params.username || req.query.username || '').trim();
  const excludeUserId = req.query.excludeUserId ? Number(req.query.excludeUserId) : (req.query.currentUserId ? Number(req.query.currentUserId) : null);

  if (!username) {
    return res.status(400).json({ success: false, available: false, code: 'EMPTY', message: 'El nombre de usuario no puede estar vacío.' });
  }

  if (username.length < 3 || username.length > 24) {
    return res.json({ success: false, available: false, code: 'INVALID_LENGTH', message: 'El nombre debe tener entre 3 y 24 caracteres.' });
  }

  if (!isValidUsername(username)) {
    return res.json({ success: false, available: false, code: 'INVALID_CHARACTERS', message: 'Solo se permiten letras, números, guiones (-) y guión bajo (_).' });
  }

  const clean = username.toLowerCase();
  if (RESERVED_USERNAMES.has(clean)) {
    return res.json({ success: false, available: false, code: 'RESERVED', message: 'Este nombre de usuario está reservado por el sistema.' });
  }

  let existing;
  if (excludeUserId) {
    existing = db.prepare('SELECT id, username FROM users WHERE username_clean = ? AND id != ?').get(clean, excludeUserId);
  } else {
    existing = db.prepare('SELECT id, username FROM users WHERE username_clean = ?').get(clean);
  }

  if (existing) {
    return res.json({ success: false, available: false, code: 'TAKEN', message: `El nombre de usuario '${username}' ya está en uso. Elige otro.` });
  }

  return res.json({ success: true, available: true, message: `¡'${username}' está disponible!` });
});

// Catálogo de imágenes de stock del proyecto para avatares y banners
app.get('/api/assets/stock-images', (req, res) => {
  const stock = {
    avatars: [
      { id: 'av_sara', name: 'Sara Retro', type: 'dicebear', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SaraRetro' },
      { id: 'av_lucas', name: 'Lucas Fox', type: 'dicebear', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
      { id: 'av_queen', name: 'Pixel Queen', type: 'dicebear', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen' },
      { id: 'av_cyber', name: 'Cyber Kidd', type: 'dicebear', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber' },
      { id: 'av_alex', name: 'Alex Speedrun', type: 'dicebear', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
      { id: 'av_mario', name: 'Super Mario 64', type: 'cover', url: 'ROMS/covers/box_sm64.png' },
      { id: 'av_zelda', name: 'Zelda Ocarina of Time', type: 'cover', url: 'ROMS/covers/box_oot.png' },
      { id: 'av_emerald', name: 'Pokémon Esmeralda', type: 'cover', url: 'ROMS/covers/box_emerald.png' },
      { id: 'av_smw', name: 'Super Mario World', type: 'cover', url: 'ROMS/covers/box_smw.png' },
      { id: 'av_sonic', name: 'Sonic The Hedgehog 2', type: 'cover', url: 'ROMS/covers/box_sonic2.png' },
      { id: 'av_crash', name: 'Crash Bandicoot', type: 'cover', url: 'ROMS/covers/box_crash1.png' },
      { id: 'av_sotn', name: 'Castlevania SOTN', type: 'cover', url: 'ROMS/covers/box_sotn.png' },
      { id: 'av_n64', name: 'Consola N64', type: 'hardware', url: 'assets/consoles_hires/n64.png' },
      { id: 'av_snes', name: 'Consola SNES', type: 'hardware', url: 'assets/consoles_hires/snes.png' },
      { id: 'av_gba', name: 'Consola GBA', type: 'hardware', url: 'assets/consoles_hires/gba.png' },
      { id: 'av_ps1', name: 'Consola PS1', type: 'hardware', url: 'assets/consoles_hires/ps1.png' },
      { id: 'av_genesis', name: 'Consola Genesis', type: 'hardware', url: 'assets/consoles_hires/genesis.png' }
    ],
    banners: [
      { id: 'bn_sm64', name: 'Super Mario 64 Castle', platform: 'N64', url: 'assets/game_wallpapers/n64/sm64.png' },
      { id: 'bn_oot', name: 'Zelda: Ocarina of Time', platform: 'N64', url: 'assets/game_wallpapers/n64/oot.png' },
      { id: 'bn_papermario', name: 'Paper Mario Mushroom Kingdom', platform: 'N64', url: 'assets/game_wallpapers/n64/papermario.png' },
      { id: 'bn_mariokart64', name: 'Mario Kart 64 Grand Prix', platform: 'N64', url: 'assets/game_wallpapers/n64/mariokart64.png' },
      { id: 'bn_smw', name: 'Super Mario World Yoshi', platform: 'SNES', url: 'assets/game_wallpapers/snes/smw.png' },
      { id: 'bn_chrono', name: 'Chrono Trigger Epoch', platform: 'SNES', url: 'assets/game_wallpapers/snes/chrono.png' },
      { id: 'bn_super_metroid', name: 'Super Metroid Zebes', platform: 'SNES', url: 'assets/game_wallpapers/snes/super_metroid.png' },
      { id: 'bn_emerald', name: 'Pokémon Esmeralda Rayquaza', platform: 'GBA', url: 'assets/game_wallpapers/gba/pokemon_emerald.png' },
      { id: 'bn_goldensun', name: 'Golden Sun Sol Sanctum', platform: 'GBA', url: 'assets/game_wallpapers/gba/goldensun.png' },
      { id: 'bn_minish', name: 'The Minish Cap', platform: 'GBA', url: 'assets/game_wallpapers/gba/minish_cap.png' },
      { id: 'bn_sonic2', name: 'Sonic 2 Chemical Plant', platform: 'GENESIS', url: 'assets/game_wallpapers/genesis/sonic2.png' },
      { id: 'bn_ff7', name: 'Final Fantasy VII Midgar', platform: 'PS1', url: 'assets/game_wallpapers/ps1/ff7.png' },
      { id: 'bn_sotn', name: 'Castlevania: SotN Dracula', platform: 'PS1', url: 'assets/game_wallpapers/ps1/sotn.png' },
      { id: 'bn_crash', name: 'Crash Bandicoot Jungle', platform: 'PS1', url: 'assets/game_wallpapers/ps1/crash1.png' },
      { id: 'bn_metalslug', name: 'Metal Slug Heavy Machine Gun', platform: 'ARCADE', url: 'assets/game_wallpapers/arcade/metalslug.png' },
      { id: 'bn_cyber_retro', name: 'Cyber Neon Synthwave', platform: 'RETRO', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80' },
      { id: 'bn_arcade_lights', name: 'Arcade Cabinets Glow', platform: 'ARCADE', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80' }
    ]
  };
  res.json({ success: true, ...stock });
});

// Subida de imágenes manuales (Base64)
app.post('/api/users/upload', (req, res) => {
  try {
    const { image, filename, type } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: { code: 'NO_IMAGE', message: 'No se envió ninguna imagen.' } });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_DATA', message: 'Formato de imagen inválido (se requiere base64).' } });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';

    const uploadsDir = path.join(ROOT_DIR, 'assets', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safePrefix = type === 'banner' ? 'banner' : 'pfp';
    const safeName = `${safePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `assets/uploads/${safeName}`;
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ success: false, error: { code: 'UPLOAD_FAILED', message: 'Error procesando la subida de imagen.' } });
  }
});

// Actualizar Perfil propio
app.put('/api/users/profile', optionalAuthMiddleware, (req, res) => {
  const { username, displayName, bio, avatarUrl, bannerUrl, titleHonor, systemAura, favoriteSystem, favoriteGames, socialLinks } = req.body;

  // Determinar el ID del usuario objetivo: JWT o fallback a sesión activa
  let targetUserId = req.user ? req.user.id : null;
  if (!targetUserId && req.body.userId) {
    targetUserId = Number(req.body.userId);
  }
  if (!targetUserId && req.headers['x-user-id']) {
    targetUserId = Number(req.headers['x-user-id']);
  }
  if (!targetUserId) {
    // Si no viene autenticado, usar el usuario principal por defecto
    const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
    targetUserId = firstUser ? firstUser.id : 2;
  }

  const currentUser = db.prepare('SELECT id, username, username_clean FROM users WHERE id = ?').get(targetUserId);
  if (!currentUser) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' } });
  }

  const currentProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(targetUserId);
  if (!currentProfile) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Perfil no encontrado.' } });
  }

  // 1. GESTIÓN Y VALIDACIÓN DE NOMBRE DE USUARIO ÚNICO
  let cleanUsername = currentUser.username;
  if (username && username.trim() !== currentUser.username) {
    cleanUsername = String(username).trim();
    const cleanLower = cleanUsername.toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 24) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_USERNAME_LENGTH', message: 'El nombre de usuario debe tener entre 3 y 24 caracteres.' } });
    }

    if (!isValidUsername(cleanUsername)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_USERNAME_FORMAT', message: 'El nombre de usuario solo puede contener letras, números, guiones (-) y guión bajo (_).' } });
    }

    if (RESERVED_USERNAMES.has(cleanLower)) {
      return res.status(400).json({ success: false, error: { code: 'RESERVED_USERNAME', message: 'Este nombre de usuario está reservado por el sistema.' } });
    }

    // Comprobación de unicidad en la base de datos
    const collision = db.prepare('SELECT id FROM users WHERE username_clean = ? AND id != ?').get(cleanLower, targetUserId);
    if (collision) {
      return res.status(409).json({ success: false, error: { code: 'USERNAME_ALREADY_EXISTS', message: `El nombre de usuario '${cleanUsername}' ya está en uso. Elige otro.` } });
    }

    // Actualización con restricción UNIQUE reforzada a nivel de base de datos
    try {
      db.prepare('UPDATE users SET username = ?, username_clean = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cleanUsername, cleanLower, targetUserId);
    } catch (dbErr) {
      console.error('[DB Constraint Error]:', dbErr);
      return res.status(409).json({ success: false, error: { code: 'DB_UNIQUE_CONSTRAINT', message: 'Error de unicidad: la base de datos rechazó el nombre por duplicidad.' } });
    }
  }

  // 2. ACTUALIZACIÓN DEL PERFIL PÚBLICO
  const favGamesStr = favoriteGames !== undefined ? (typeof favoriteGames === 'string' ? favoriteGames : JSON.stringify(favoriteGames)) : null;
  const linksStr = socialLinks !== undefined ? (typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks)) : null;

  db.prepare(`
    UPDATE profiles SET
      display_name = COALESCE(?, display_name),
      bio = COALESCE(?, bio),
      avatar_url = COALESCE(?, avatar_url),
      banner_url = COALESCE(?, banner_url),
      title_honor = COALESCE(?, title_honor),
      system_aura = COALESCE(?, system_aura),
      favorite_system = COALESCE(?, favorite_system),
      favorite_games = COALESCE(?, favorite_games),
      social_links = COALESCE(?, social_links),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    displayName !== undefined ? displayName : cleanUsername,
    bio,
    avatarUrl,
    bannerUrl,
    titleHonor,
    systemAura,
    favoriteSystem,
    favGamesStr,
    linksStr,
    targetUserId
  );

  const updatedUser = db.prepare('SELECT id, username, username_clean FROM users WHERE id = ?').get(targetUserId);
  const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(targetUserId);

  let parsedGames = [];
  try {
    parsedGames = updatedProfile.favorite_games ? JSON.parse(updatedProfile.favorite_games) : [];
  } catch (e) { parsedGames = []; }

  let parsedLinks = [];
  try {
    parsedLinks = updatedProfile.social_links ? JSON.parse(updatedProfile.social_links) : [];
  } catch (e) { parsedLinks = []; }

  // Emitir presencia actualizada por Socket.io
  io.emit('user_profile_updated', {
    userId: targetUserId,
    username: updatedUser.username,
    displayName: updatedProfile.display_name,
    avatarUrl: updatedProfile.avatar_url,
    titleHonor: updatedProfile.title_honor,
    systemAura: updatedProfile.system_aura
  });

  res.json({
    success: true,
    message: 'Perfil guardado con éxito.',
    user: updatedUser,
    profile: {
      ...updatedProfile,
      favoriteGames: parsedGames,
      socialLinks: parsedLinks
    }
  });
});

// Ver Perfil de Usuario por @username (con soporte de juegos favoritos y enlaces)
app.get('/api/users/profile/:username', optionalAuthMiddleware, (req, res) => {
  const targetUsername = String(req.params.username).trim().toLowerCase();
  const targetUser = db.prepare('SELECT id, username, created_at FROM users WHERE username_clean = ?').get(targetUsername);

  if (!targetUser) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' } });
  }

  const requesterId = req.user ? req.user.id : null;
  if (requesterId && isBlocked(targetUser.id, requesterId)) {
    return res.status(403).json({ success: false, error: { code: 'BLOCKED', message: 'No puedes ver este perfil.' } });
  }

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(targetUser.id);
  if (!profile) {
    return res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Perfil no configurado.' } });
  }

  const privacy = db.prepare('SELECT * FROM privacy_settings WHERE user_id = ?').get(targetUser.id) || {
    profile_visibility: 'all',
    online_visibility: 'all',
    friend_list_visibility: 'friends'
  };

  const isSelf = requesterId === targetUser.id;
  const isFriend = requesterId ? areFriends(requesterId, targetUser.id) : false;

  const canSeeProfile = isSelf || privacy.profile_visibility === 'all' || (privacy.profile_visibility === 'friends' && isFriend);

  if (!canSeeProfile) {
    return res.json({
      success: true,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        isPrivate: true
      }
    });
  }

  let parsedGames = [];
  try {
    parsedGames = profile.favorite_games ? JSON.parse(profile.favorite_games) : [];
  } catch (e) { parsedGames = []; }

  let parsedLinks = [];
  try {
    parsedLinks = profile.social_links ? JSON.parse(profile.social_links) : [];
  } catch (e) { parsedLinks = []; }

  const activity = getSanitizedUserActivity(targetUser.id, requesterId);

  res.json({
    success: true,
    user: {
      id: targetUser.id,
      username: targetUser.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bannerUrl: profile.banner_url,
      bio: profile.bio,
      titleHonor: profile.title_honor,
      systemAura: profile.system_aura,
      favoriteSystem: profile.favorite_system,
      favoriteGames: parsedGames,
      socialLinks: parsedLinks,
      isFriend,
      activity
    }
  });
});

// Búsqueda de Usuarios por @username
app.get('/api/users/search', optionalAuthMiddleware, (req, res) => {
  let query = (req.query.q || '').toString().trim();
  if (query.startsWith('@')) query = query.slice(1);
  query = query.toLowerCase();

  if (query.length < 2) {
    return res.json({ success: true, results: [] });
  }

  const requesterId = req.user ? req.user.id : null;

  const rows = db.prepare(`
    SELECT u.id, u.username, prof.display_name, prof.avatar_url, prof.title_honor
    FROM users u
    JOIN profiles prof ON prof.user_id = u.id
    WHERE u.username_clean LIKE ? AND u.account_status = 'active'
    LIMIT 15
  `).all(`%${query}%`);

  const results = rows
    .filter(r => !requesterId || (!isBlocked(r.id, requesterId) && r.id !== requesterId))
    .map(r => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      avatarUrl: r.avatar_url,
      titleHonor: r.title_honor,
      isFriend: requesterId ? areFriends(requesterId, r.id) : false
    }));

  res.json({ success: true, results });
});

// ========================================================
// 6. RUTAS REST: PRIVACIDAD (FASE 7)
// ========================================================

// Obtener Configuración de Privacidad
app.get('/api/users/privacy', authMiddleware, (req, res) => {
  let privacy = db.prepare('SELECT * FROM privacy_settings WHERE user_id = ?').get(req.user.id);
  if (!privacy) {
    db.prepare('INSERT INTO privacy_settings (user_id) VALUES (?)').run(req.user.id);
    privacy = db.prepare('SELECT * FROM privacy_settings WHERE user_id = ?').get(req.user.id);
  }
  res.json({ success: true, privacy });
});

// Modificar Configuración de Privacidad
app.put('/api/users/privacy', authMiddleware, (req, res) => {
  const {
    profile_visibility,
    online_visibility,
    emulator_visibility,
    game_visibility,
    friend_list_visibility,
    friend_request_permission
  } = req.body;

  const allowedVis = ['all', 'friends', 'nobody'];
  const allowedPerm = ['all', 'nobody'];

  const pVis = allowedVis.includes(profile_visibility) ? profile_visibility : 'all';
  const oVis = allowedVis.includes(online_visibility) ? online_visibility : 'all';
  const eVis = allowedVis.includes(emulator_visibility) ? emulator_visibility : 'all';
  const gVis = allowedVis.includes(game_visibility) ? game_visibility : 'all';
  const fVis = allowedVis.includes(friend_list_visibility) ? friend_list_visibility : 'friends';
  const frPerm = allowedPerm.includes(friend_request_permission) ? friend_request_permission : 'all';

  db.prepare(`
    INSERT INTO privacy_settings (user_id, profile_visibility, online_visibility, emulator_visibility, game_visibility, friend_list_visibility, friend_request_permission)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      profile_visibility = excluded.profile_visibility,
      online_visibility = excluded.online_visibility,
      emulator_visibility = excluded.emulator_visibility,
      game_visibility = excluded.game_visibility,
      friend_list_visibility = excluded.friend_list_visibility,
      friend_request_permission = excluded.friend_request_permission
  `).run(req.user.id, pVis, oVis, eVis, gVis, fVis, frPerm);

  const updated = db.prepare('SELECT * FROM privacy_settings WHERE user_id = ?').get(req.user.id);
  res.json({ success: true, privacy: updated });
});

// ========================================================
// 7. RUTAS REST: EMULADORES Y FAVORITOS (FASE 4)
// ========================================================

// Catálogo Global de Emuladores
app.get('/api/emulators', (req, res) => {
  const emulators = db.prepare("SELECT * FROM emulators WHERE status = 'available'").all();
  res.json({ success: true, emulators });
});

// Obtener Emuladores Favoritos del Usuario
app.get('/api/users/emulators', authMiddleware, (req, res) => {
  const favorites = db.prepare(`
    SELECT e.*, p.position 
    FROM user_emulator_preferences p
    JOIN emulators e ON e.id = p.emulator_id
    WHERE p.user_id = ? AND p.is_favorite = 1
    ORDER BY p.position ASC
  `).all(req.user.id);

  res.json({ success: true, favorites });
});

// Guardar / Reordenar Emuladores Favoritos del Usuario
app.put('/api/users/emulators', authMiddleware, (req, res) => {
  const { emulatorIds } = req.body;
  if (!Array.isArray(emulatorIds)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_DATA', message: 'Se esperaba un arreglo de IDs.' } });
  }

  db.prepare('DELETE FROM user_emulator_preferences WHERE user_id = ?').run(req.user.id);
  const insertPref = db.prepare(`
    INSERT INTO user_emulator_preferences (user_id, emulator_id, is_favorite, position)
    VALUES (?, ?, 1, ?)
  `);

  emulatorIds.forEach((emuId, idx) => {
    try { insertPref.run(req.user.id, emuId, idx); } catch (e) {}
  });

  res.json({ success: true, message: 'Emuladores favoritos actualizados con éxito.' });
});

// ========================================================
// 8. RUTAS REST: SISTEMA SOCIAL REAL (FASE 5)
// ========================================================

// Lista Real de Amigos (Con Presencia Evaluada por Backend)
app.get('/api/friends/list', authMiddleware, (req, res) => {
  const myId = req.user.id;

  // Buscar relaciones de amistad canónicas
  const friendRows = db.prepare(`
    SELECT 
      CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END as friend_id,
      f.created_at as friendship_date
    FROM friendships f
    WHERE user1_id = ? OR user2_id = ?
  `).all(myId, myId, myId);

  const friends = [];
  for (const row of friendRows) {
    const friendId = row.friend_id;
    // Si está bloqueado, no lo incluimos
    if (isBlocked(myId, friendId)) continue;

    const activity = getSanitizedUserActivity(friendId, myId);
    if (activity) {
      friends.push({
        ...activity,
        friendshipDate: row.friendship_date
      });
    }
  }

  res.json({ success: true, friends });
});

// Solicitudes Entrantes
app.get('/api/friends/requests/incoming', authMiddleware, (req, res) => {
  const requests = db.prepare(`
    SELECT r.id, r.sender_id, r.created_at, u.username, prof.display_name, prof.avatar_url
    FROM friend_requests r
    JOIN users u ON u.id = r.sender_id
    JOIN profiles prof ON prof.user_id = r.sender_id
    WHERE r.receiver_id = ? AND r.status = 'pending'
    ORDER BY r.created_at DESC
  `).all(req.user.id);

  res.json({ success: true, requests });
});

// Solicitudes Salientes
app.get('/api/friends/requests/outgoing', authMiddleware, (req, res) => {
  const requests = db.prepare(`
    SELECT r.id, r.receiver_id, r.created_at, u.username, prof.display_name, prof.avatar_url
    FROM friend_requests r
    JOIN users u ON u.id = r.receiver_id
    JOIN profiles prof ON prof.user_id = r.receiver_id
    WHERE r.sender_id = ? AND r.status = 'pending'
    ORDER BY r.created_at DESC
  `).all(req.user.id);

  res.json({ success: true, requests });
});

// Enviar Solicitud de Amistad
app.post('/api/friends/request', authMiddleware, (req, res) => {
  const senderId = req.user.id;
  let { targetUsername, targetUserId } = req.body;

  let target;
  if (targetUserId) {
    target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(targetUserId);
  } else if (targetUsername) {
    let clean = String(targetUsername).trim();
    if (clean.startsWith('@')) clean = clean.slice(1);
    target = db.prepare('SELECT id, username FROM users WHERE username_clean = ?').get(clean.toLowerCase());
  }

  if (!target) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'El usuario no existe.' } });
  }

  const receiverId = target.id;

  // 1. ¿Es el mismo usuario?
  if (senderId === receiverId) {
    return res.status(400).json({ success: false, error: { code: 'CANNOT_FRIEND_SELF', message: 'No puedes enviarte una solicitud a ti mismo.' } });
  }

  // 2. ¿Bloqueado?
  if (isBlocked(senderId, receiverId)) {
    return res.status(403).json({ success: false, error: { code: 'BLOCKED', message: 'No puedes interactuar con este usuario.' } });
  }

  // 3. ¿Ya son amigos?
  if (areFriends(senderId, receiverId)) {
    return res.status(400).json({ success: false, error: { code: 'ALREADY_FRIENDS', message: 'Ya sois amigos.' } });
  }

  // 4. ¿Permite solicitudes?
  const receiverPrivacy = db.prepare('SELECT friend_request_permission FROM privacy_settings WHERE user_id = ?').get(receiverId);
  if (receiverPrivacy && receiverPrivacy.friend_request_permission === 'nobody') {
    return res.status(403).json({ success: false, error: { code: 'REQUESTS_DISABLED', message: 'Este usuario no acepta solicitudes de amistad.' } });
  }

  // 5. ¿Existe solicitud pendiente en cualquier dirección?
  const existingReq = db.prepare(`
    SELECT id, sender_id, status FROM friend_requests
    WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      AND status = 'pending'
  `).get(senderId, receiverId, receiverId, senderId);

  if (existingReq) {
    if (existingReq.sender_id === receiverId) {
      // Caso determinista: Si el otro ya nos había mandado una solicitud pendiente, ¡aceptémosla automáticamente!
      const u1 = Math.min(senderId, receiverId);
      const u2 = Math.max(senderId, receiverId);
      db.prepare("UPDATE friend_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(existingReq.id);
      db.prepare('INSERT OR IGNORE INTO friendships (user1_id, user2_id) VALUES (?, ?)').run(u1, u2);
      
      // Notificar a ambos por socket
      io.to(`user_${senderId}`).emit('friend_request_accepted', { friendId: receiverId, friendUsername: target.username });
      io.to(`user_${receiverId}`).emit('friend_request_accepted', { friendId: senderId, friendUsername: req.user.username });
      
      return res.json({ success: true, message: '¡Ambos os habíais enviado solicitud! Ahora sois amigos mutuamente.' });
    }
    return res.status(400).json({ success: false, error: { code: 'REQUEST_ALREADY_PENDING', message: 'Ya existe una solicitud pendiente.' } });
  }

  // Crear solicitud
  const insertReq = db.prepare(`
    INSERT INTO friend_requests (sender_id, receiver_id, status)
    VALUES (?, ?, 'pending')
  `);
  const result = insertReq.run(senderId, receiverId);
  const reqId = Number(result.lastInsertRowid);

  // Registrar notificación
  const senderProfile = db.prepare('SELECT display_name, avatar_url FROM profiles WHERE user_id = ?').get(senderId);
  db.prepare(`
    INSERT INTO notifications (recipient_id, type, payload)
    VALUES (?, 'FRIEND_REQUEST', ?)
  `).run(receiverId, JSON.stringify({
    requestId: reqId,
    senderId,
    senderUsername: req.user.username,
    senderDisplayName: senderProfile ? senderProfile.display_name : req.user.username,
    senderAvatar: senderProfile ? senderProfile.avatar_url : null
  }));

  // Emitir evento por Socket.io en tiempo real al receptor
  io.to(`user_${receiverId}`).emit('friend_request_received', {
    id: reqId,
    senderId,
    username: req.user.username,
    displayName: senderProfile ? senderProfile.display_name : req.user.username,
    avatarUrl: senderProfile ? senderProfile.avatar_url : null
  });

  res.status(201).json({ success: true, message: 'Solicitud de amistad enviada con éxito.', requestId: reqId });
});

// Aceptar Solicitud
app.put('/api/friends/requests/:id/accept', authMiddleware, (req, res) => {
  const requestId = Number(req.params.id);
  const request = db.prepare('SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ?').get(requestId, req.user.id);

  if (!request) {
    return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Solicitud no encontrada.' } });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, error: { code: 'ALREADY_RESOLVED', message: 'Esta solicitud ya no está pendiente.' } });
  }

  const senderId = request.sender_id;
  const receiverId = req.user.id;

  if (isBlocked(senderId, receiverId)) {
    return res.status(403).json({ success: false, error: { code: 'BLOCKED', message: 'No se puede aceptar debido a un bloqueo.' } });
  }

  // 1. Actualizar solicitud
  db.prepare("UPDATE friend_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(requestId);

  // 2. Crear relación de amistad canónica
  const u1 = Math.min(senderId, receiverId);
  const u2 = Math.max(senderId, receiverId);
  db.prepare('INSERT OR IGNORE INTO friendships (user1_id, user2_id) VALUES (?, ?)').run(u1, u2);

  // 3. Crear notificación para el remitente
  const receiverProfile = db.prepare('SELECT display_name, avatar_url FROM profiles WHERE user_id = ?').get(receiverId);
  db.prepare(`
    INSERT INTO notifications (recipient_id, type, payload)
    VALUES (?, 'FRIEND_REQUEST_ACCEPTED', ?)
  `).run(senderId, JSON.stringify({
    friendId: receiverId,
    friendUsername: req.user.username,
    friendDisplayName: receiverProfile ? receiverProfile.display_name : req.user.username
  }));

  // 4. Notificar a ambos por Socket.io
  const senderActivity = getSanitizedUserActivity(senderId, receiverId);
  const receiverActivity = getSanitizedUserActivity(receiverId, senderId);

  io.to(`user_${senderId}`).emit('friend_request_accepted', {
    friend: receiverActivity
  });
  io.to(`user_${receiverId}`).emit('friend_request_accepted', {
    friend: senderActivity
  });

  res.json({ success: true, message: 'Solicitud aceptada. ¡Ahora sois amigos!' });
});

// Rechazar Solicitud
app.put('/api/friends/requests/:id/reject', authMiddleware, (req, res) => {
  const requestId = Number(req.params.id);
  const request = db.prepare('SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ?').get(requestId, req.user.id);

  if (!request || request.status !== 'pending') {
    return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Solicitud no encontrada.' } });
  }

  db.prepare("UPDATE friend_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(requestId);
  res.json({ success: true, message: 'Solicitud rechazada.' });
});

// Cancelar Solicitud Saliente
app.put('/api/friends/requests/:id/cancel', authMiddleware, (req, res) => {
  const requestId = Number(req.params.id);
  const request = db.prepare('SELECT * FROM friend_requests WHERE id = ? AND sender_id = ?').get(requestId, req.user.id);

  if (!request || request.status !== 'pending') {
    return res.status(404).json({ success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Solicitud no encontrada.' } });
  }

  db.prepare("UPDATE friend_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(requestId);
  res.json({ success: true, message: 'Solicitud cancelada.' });
});

// Eliminar Amigo
app.delete('/api/friends/:friendId', authMiddleware, (req, res) => {
  const myId = req.user.id;
  const friendId = Number(req.params.friendId);

  const u1 = Math.min(myId, friendId);
  const u2 = Math.max(myId, friendId);

  const deleted = db.prepare('DELETE FROM friendships WHERE user1_id = ? AND user2_id = ?').run(u1, u2);

  if (deleted.changes === 0) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FRIENDS', message: 'No existía una relación de amistad.' } });
  }

  // Notificar por Socket
  io.to(`user_${friendId}`).emit('friend_removed', { friendId: myId });
  io.to(`user_${myId}`).emit('friend_removed', { friendId });

  res.json({ success: true, message: 'Amigo eliminado correctamente.' });
});

// Bloquear Usuario
app.post('/api/friends/block/:targetId', authMiddleware, (req, res) => {
  const myId = req.user.id;
  const targetId = Number(req.params.targetId);

  if (myId === targetId) {
    return res.status(400).json({ success: false, error: { code: 'CANNOT_BLOCK_SELF', message: 'No puedes bloquearte a ti mismo.' } });
  }

  // 1. Eliminar cualquier amistad existente
  const u1 = Math.min(myId, targetId);
  const u2 = Math.max(myId, targetId);
  db.prepare('DELETE FROM friendships WHERE user1_id = ? AND user2_id = ?').run(u1, u2);

  // 2. Cancelar solicitudes pendientes en cualquier dirección
  db.prepare(`
    UPDATE friend_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
  `).run(myId, targetId, targetId, myId);

  // 3. Insertar bloqueo
  db.prepare('INSERT OR IGNORE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)').run(myId, targetId);

  // 4. Notificar por socket para invalidar vistas
  io.to(`user_${targetId}`).emit('friend_removed', { friendId: myId });
  io.to(`user_${myId}`).emit('friend_removed', { friendId: targetId });

  res.json({ success: true, message: 'Usuario bloqueado correctamente.' });
});

// Desbloquear Usuario
app.delete('/api/friends/block/:targetId', authMiddleware, (req, res) => {
  const myId = req.user.id;
  const targetId = Number(req.params.targetId);

  db.prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?').run(myId, targetId);
  res.json({ success: true, message: 'Usuario desbloqueado.' });
});

// Lista de Usuarios Bloqueados
app.get('/api/friends/blocks', authMiddleware, (req, res) => {
  const blocks = db.prepare(`
    SELECT b.id, b.blocked_id, b.created_at, u.username, prof.display_name, prof.avatar_url
    FROM blocks b
    JOIN users u ON u.id = b.blocked_id
    JOIN profiles prof ON prof.user_id = b.blocked_id
    WHERE b.blocker_id = ?
  `).all(req.user.id);

  res.json({ success: true, blocks });
});

// ========================================================
// 9. RUTAS REST: PRESENCIA Y ACTIVIDAD (FASE 6)
// ========================================================

// Iniciar Actividad de Juego
app.post('/api/activity/start', authMiddleware, (req, res) => {
  const { emulatorId, emulatorName, romId, romName } = req.body;
  const myId = req.user.id;

  db.prepare(`
    UPDATE presences SET
      status = 'playing',
      emulator_id = ?,
      emulator_name = ?,
      rom_id = ?,
      rom_name = ?,
      started_at = CURRENT_TIMESTAMP,
      last_seen = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(emulatorId || null, emulatorName || null, romId || null, romName || null, myId);

  // Notificar a amigos conectados en tiempo real evaluando privacidad individualmente
  notifyFriendsPresence(myId);

  res.json({ success: true, message: 'Actividad de juego iniciada.' });
});

// Detener Actividad de Juego
app.post('/api/activity/stop', authMiddleware, (req, res) => {
  const myId = req.user.id;

  db.prepare(`
    UPDATE presences SET
      status = 'online',
      emulator_id = NULL,
      emulator_name = NULL,
      rom_id = NULL,
      rom_name = NULL,
      last_seen = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(myId);

  notifyFriendsPresence(myId);

  res.json({ success: true, message: 'Actividad de juego finalizada.' });
});

// Notificar a los amigos en tiempo real con filtrado de privacidad en servidor
function notifyFriendsPresence(userId) {
  const friendRows = db.prepare(`
    SELECT CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END as friend_id
    FROM friendships
    WHERE user1_id = ? OR user2_id = ?
  `).all(userId, userId, userId);

  for (const f of friendRows) {
    const friendId = f.friend_id;
    const sanitized = getSanitizedUserActivity(userId, friendId);
    if (sanitized) {
      io.to(`user_${friendId}`).emit('presence_update', sanitized);
    }
  }
}

// Consultar Actividad / Presencia de Usuario
app.get('/api/users/:userId/activity', optionalAuthMiddleware, (req, res) => {
  const targetId = Number(req.params.userId);
  const requesterId = req.user ? req.user.id : null;

  const activity = getSanitizedUserActivity(targetId, requesterId);
  if (!activity) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND_OR_RESTRICTED', message: 'No hay actividad disponible.' } });
  }

  res.json({ success: true, activity });
});

// ========================================================
// 10. RUTAS REST: NOTIFICACIONES (FASE 8)
// ========================================================

app.get('/api/notifications', authMiddleware, (req, res) => {
  const notifs = db.prepare(`
    SELECT * FROM notifications 
    WHERE recipient_id = ? AND read_at IS NULL
    ORDER BY created_at DESC LIMIT 30
  `).all(req.user.id);

  res.json({
    success: true,
    notifications: notifs.map(n => ({
      ...n,
      payload: JSON.parse(n.payload)
    }))
  });
});

app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?').run(Number(req.params.id), req.user.id);
  res.json({ success: true });
});

app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
  db.prepare('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE recipient_id = ? AND read_at IS NULL').run(req.user.id);
  res.json({ success: true });
});

// ========================================================
// 11. RUTAS DE COMPATIBILIDAD CON ROMS Y BIBLIOTECA
// ========================================================

app.get('/api/roms', (req, res) => {
  const catFile = path.join(ROOT_DIR, 'ROMS', 'catalogo.json');
  let resultado = {};
  if (fs.existsSync(catFile)) {
    try {
      resultado = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
    } catch (e) {}
  }

  const romsDir = path.join(ROOT_DIR, 'ROMS');
  if (fs.existsSync(romsDir)) {
    const sistemas = fs.readdirSync(romsDir);
    for (const sis of sistemas) {
      if (['consoles', 'cartridges', 'covers'].includes(sis)) continue;
      const sisPath = path.join(romsDir, sis);
      if (fs.statSync(sisPath).isDirectory()) {
        if (!resultado[sis]) resultado[sis] = [];
        const files = fs.readdirSync(sisPath);
        for (const f of files) {
          const ext = path.extname(f).toLowerCase();
          if (['.iso', '.chd', '.z64', '.n64', '.gba', '.sfc', '.smc', '.nes', '.bin'].includes(ext)) {
            const relPath = path.relative(ROOT_DIR, path.join(sisPath, f)).replace(/\\/g, '/');
            if (!resultado[sis].some(item => item.archivo === relPath)) {
              resultado[sis].push({
                titulo: path.basename(f, ext).replace(/[_\-\.]/g, ' '),
                archivo: relPath,
                nombreArchivo: f
              });
            }
          }
        }
      }
    }
  }

  res.json(resultado);
});

// Biblioteca de cajas 3D
app.get('/api/boxes', (req, res) => {
  const boxes = db.prepare('SELECT * FROM rom_library ORDER BY added_at DESC').all();
  res.json({ success: true, boxes });
});

app.post('/api/boxes', (req, res) => {
  const { title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year } = req.body;
  const boxId = `rom_${Date.now().toString(36)}`;
  db.prepare(`
    INSERT INTO rom_library (id, title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(boxId, title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year);

  res.status(201).json({ success: true, boxId });
});

// Mensajes directos (Chat)
app.get('/api/social/messages/:u1/:u2', authMiddleware, (req, res) => {
  const u1 = Number(req.params.u1);
  const u2 = Number(req.params.u2);
  const myId = req.user.id;

  if (myId !== u1 && myId !== u2) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No puedes ver estos mensajes.' } });
  }

  const messages = db.prepare(`
    SELECT m.*, u.username as sender_name
    FROM direct_messages m
    JOIN users u ON u.id = m.sender_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.sent_at ASC LIMIT 100
  `).all(u1, u2, u2, u1);

  res.json({ success: true, messages });
});

// ========================================================
// 12. SOCKET.IO: AUTENTICACIÓN Y TIEMPO REAL
// ========================================================

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    // Si no tiene token pero envía userId, permitimos modo handshake para verificar
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.io]: Cliente conectado [socketId=${socket.id}]`);

  // Identificación del usuario en socket
  socket.on('authenticate', (data) => {
    if (!data || !data.token) return;
    try {
      const decoded = jwt.verify(data.token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.join(`user_${decoded.id}`);

      // Actualizar presencia en DB
      db.prepare("UPDATE presences SET status = 'online', last_seen = CURRENT_TIMESTAMP WHERE user_id = ?").run(decoded.id);

      // Notificar a amigos
      notifyFriendsPresence(decoded.id);

      socket.emit('authenticated', { userId: decoded.id });
    } catch (e) {
      socket.emit('auth_error', { message: 'Token inválido' });
    }
  });

  // Evento para compatibilidad con cliente antiguo (user_register)
  socket.on('user_register', (data) => {
    if (data && data.userId) {
      socket.userId = data.userId;
      socket.join(`user_${data.userId}`);
    }
  });

  // Actualizar presencia desde socket
  socket.on('user_update_presence', (data) => {
    if (!socket.userId) return;
    const isPlaying = data && data.status === 'playing' && data.playing;

    db.prepare(`
      UPDATE presences SET
        status = ?,
        emulator_id = ?,
        emulator_name = ?,
        rom_id = ?,
        rom_name = ?,
        last_seen = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      isPlaying ? 'playing' : 'online',
      isPlaying ? (data.playing.systemId || null) : null,
      isPlaying ? (data.playing.systemName || null) : null,
      isPlaying ? (data.playing.romId || null) : null,
      isPlaying ? (data.playing.gameTitle || null) : null,
      socket.userId
    );

    notifyFriendsPresence(socket.userId);
  });

  // Enviar mensaje de chat directo
  socket.on('chat_message', (data) => {
    if (!socket.userId || !data || !data.toUserId || !data.content) return;
    const fromId = Number(socket.userId);
    const toId = Number(data.toUserId);

    if (!areFriends(fromId, toId)) return;

    db.prepare(`
      INSERT INTO direct_messages (sender_id, receiver_id, content)
      VALUES (?, ?, ?)
    `).run(fromId, toId, String(data.content).trim());

    const senderProf = db.prepare('SELECT display_name FROM profiles WHERE user_id = ?').get(fromId);
    const senderName = senderProf ? senderProf.display_name : `Usuario ${fromId}`;

    io.to(`user_${toId}`).emit('chat_message_received', {
      fromId,
      fromName: senderName,
      toId,
      content: String(data.content).trim(),
      sentAt: Date.now()
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    if (socket.userId) {
      console.log(`[Socket.io]: Usuario desconectado [userId=${socket.userId}]`);
      db.prepare("UPDATE presences SET status = 'offline', last_seen = CURRENT_TIMESTAMP WHERE user_id = ?").run(socket.userId);
      notifyFriendsPresence(socket.userId);
    }
  });
});

// ========================================================
// 13. SERVIR FRONTEND ESTÁTICO DE RETROHUB & RUTAS DIRECTAS
// ========================================================
app.get(['/profile', '/profile/:username'], (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'profile.html'));
});

app.use(express.static(ROOT_DIR));

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(` 🎮 RETROHUB MASTER PLATFORM ONLINE — PUERTO ${PORT}`);
  console.log(` URL: http://localhost:${PORT}/`);
  console.log(` Base de Datos SQLite: ${DB_PATH}`);
  console.log(` Arquitectura: Autenticación JWT + Amistades + Privacidad + Socket.io`);
  console.log(`=============================================================`);
});
