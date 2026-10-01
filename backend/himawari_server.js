/**
 * Himawari Cinematic Launcher - Core Backend & WebSocket Engine
 * Stack: Node.js 24 + Express + Native SQLite (node:sqlite) + Socket.io
 * Archivo: backend/himawari_server.js
 */

import express from 'express';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'himawari.db');
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());

// Encabezados de Alto Rendimiento y Aceleración WebGL
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 1. INICIALIZACIÓN DE SQLITE NATIVO
console.log(`[Himawari DB]: Inicializando SQLite en ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    games_count INTEGER DEFAULT 0,
    hours_played INTEGER DEFAULT 0,
    favorite_system TEXT NOT NULL,
    title_honor TEXT DEFAULT 'Maestro de los 64-Bits',
    system_aura TEXT DEFAULT 'scarlet'
  );

  CREATE TABLE IF NOT EXISTS friends (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    status TEXT NOT NULL,
    system_id TEXT,
    system_name TEXT,
    game_title TEXT,
    game_box_art TEXT,
    updated_at INTEGER NOT NULL
  );

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
    added_at INTEGER NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS social_users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS social_friends (
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    friend_name TEXT NOT NULL,
    friend_avatar TEXT NOT NULL,
    status TEXT DEFAULT 'accepted',
    added_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, friend_id)
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    from_id TEXT NOT NULL,
    from_name TEXT NOT NULL,
    to_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at INTEGER NOT NULL,
    read_at INTEGER DEFAULT 0
  );
`);

try { db.exec(`ALTER TABLE user_profile ADD COLUMN title_honor TEXT DEFAULT 'Maestro de los 64-Bits'`); } catch(e){}
try { db.exec(`ALTER TABLE user_profile ADD COLUMN system_aura TEXT DEFAULT 'scarlet'`); } catch(e){}

// Seed inicial de la biblioteca de cajas si está vacía
const romCount = db.prepare('SELECT COUNT(*) as count FROM rom_library').get();
if (romCount.count === 0) {
  console.log('[Himawari DB]: Sembrando colección inicial de cajas 3D en la biblioteca...');
  const insertRom = db.prepare(`
    INSERT INTO rom_library (id, title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year, favorite, play_count, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialBoxes = [
    {
      id: 'rom_papermario',
      title: 'Paper Mario',
      system_id: 'n64',
      system_name: 'Nintendo 64',
      rom_path: 'ROMS/n64/Paper Mario (Europe) (En,Fr,De,Es).z64',
      box_art: 'ROMS/covers/papermario.png',
      cartridge_art: 'ROMS/cartridges/cart_papermario.png',
      box_type: 'n64_box',
      genre: 'Aventura / RPG',
      year: '2001'
    },
    {
      id: 'rom_sm64',
      title: 'Super Mario 64',
      system_id: 'n64',
      system_name: 'Nintendo 64',
      rom_path: 'ROMS/n64/Super Mario 64.z64',
      box_art: 'ROMS/covers/box_sm64.png',
      cartridge_art: 'ROMS/cartridges/n64_clean.png',
      box_type: 'n64_box',
      genre: 'Plataformas 3D',
      year: '1996'
    },
    {
      id: 'rom_oot',
      title: 'The Legend of Zelda: Ocarina of Time',
      system_id: 'n64',
      system_name: 'Nintendo 64',
      rom_path: 'ROMS/n64/Zelda Ocarina of Time.z64',
      box_art: 'ROMS/covers/box_oot.png',
      cartridge_art: 'ROMS/cartridges/n64_clean.png',
      box_type: 'n64_box',
      genre: 'Acción / RPG',
      year: '1998'
    },
    {
      id: 'rom_anguna',
      title: 'Anguna: Warriors of Demrav',
      system_id: 'gba',
      system_name: 'Game Boy Advance',
      rom_path: 'ROMS/gba/Anguna.gba',
      box_art: 'ROMS/covers/anguna_box.png',
      cartridge_art: 'ROMS/cartridges/cart_anguna.png',
      box_type: 'gba_box',
      genre: 'Acción / RPG',
      year: '2008'
    },
    {
      id: 'rom_emerald',
      title: 'Pokémon Esmeralda',
      system_id: 'gba',
      system_name: 'Game Boy Advance',
      rom_path: 'ROMS/gba/Pokemon Emerald.gba',
      box_art: 'ROMS/covers/box_emerald.png',
      cartridge_art: 'ROMS/cartridges/gba_clean.png',
      box_type: 'gba_box',
      genre: 'RPG / Coleccionismo',
      year: '2004'
    },
    {
      id: 'rom_3weeks',
      title: '3 Weeks in Paradise',
      system_id: 'gba',
      system_name: 'Game Boy Advance',
      rom_path: 'ROMS/gba/3Weeksinparadise.gba',
      box_art: 'ROMS/covers/3weeksinparadise.jpg',
      cartridge_art: 'ROMS/cartridges/cart_3weeksinparadise.png',
      box_type: 'gba_box',
      genre: 'Aventura Clásica',
      year: '1986 / GBA'
    },
    {
      id: 'rom_smw',
      title: 'Super Mario World',
      system_id: 'snes',
      system_name: 'Super Nintendo',
      rom_path: 'ROMS/snes/Super Mario World.sfc',
      box_art: 'ROMS/covers/box_smw.png',
      cartridge_art: 'ROMS/cartridges/snes_clean.png',
      box_type: 'snes_box',
      genre: 'Plataformas 16-Bit',
      year: '1990'
    },
    {
      id: 'rom_sonic2',
      title: 'Sonic The Hedgehog 2',
      system_id: 'genesis',
      system_name: 'Sega Genesis / Mega Drive',
      rom_path: 'ROMS/genesis/Sonic The Hedgehog 2.bin',
      box_art: 'ROMS/covers/box_sonic2.png',
      cartridge_art: 'ROMS/cartridges/genesis_clean.png',
      box_type: 'genesis_clam',
      genre: 'Velocidad / Plataformas',
      year: '1992'
    },
    {
      id: 'rom_crash1',
      title: 'Crash Bandicoot',
      system_id: 'ps1',
      system_name: 'PlayStation 1',
      rom_path: 'ROMS/ps1/Crash Bandicoot.iso',
      box_art: 'ROMS/covers/box_crash1.png',
      cartridge_art: 'ROMS/covers/box_crash1.png',
      box_type: 'ps1_jewel',
      genre: 'Aventura 3D',
      year: '1996'
    },
    {
      id: 'rom_sotn',
      title: 'Castlevania: Symphony of the Night',
      system_id: 'ps1',
      system_name: 'PlayStation 1',
      rom_path: 'ROMS/ps1/Castlevania SOTN.iso',
      box_art: 'ROMS/covers/box_sotn.png',
      cartridge_art: 'ROMS/covers/box_sotn.png',
      box_type: 'ps1_jewel',
      genre: 'Metroidvania',
      year: '1997'
    },
    {
      id: 'rom_31in1',
      title: '31 In 1 Realgame Multicart',
      system_id: 'nes',
      system_name: 'Nintendo NES',
      rom_path: 'ROMS/nes/31In1Realgame-Multicart.nes',
      box_art: 'ROMS/covers/31in1.png',
      cartridge_art: 'ROMS/cartridges/cart_31in1.png',
      box_type: 'nes_box',
      genre: 'Compilación 8-Bit',
      year: '1992'
    },
    {
      id: 'rom_smb3',
      title: 'Super Mario Bros. 3',
      system_id: 'nes',
      system_name: 'Nintendo NES',
      rom_path: 'ROMS/nes/Super Mario Bros 3.nes',
      box_art: 'ROMS/covers/box_smb3.png',
      cartridge_art: 'ROMS/cartridges/nes_clean.png',
      box_type: 'nes_box',
      genre: 'Plataformas Clásico',
      year: '1988'
    },
    {
      id: 'rom_alexkidd',
      title: 'Alex Kidd in Miracle World',
      system_id: 'sms',
      system_name: 'Sega Master System',
      rom_path: 'ROMS/sms/Alex Kidd in Miracle World.sms',
      box_art: 'ROMS/covers/box_alexkidd.png',
      cartridge_art: 'ROMS/covers/box_alexkidd.png',
      box_type: 'sms_case',
      genre: 'Aventura 8-Bit',
      year: '1986'
    }
  ];

  initialBoxes.forEach(b => {
    insertRom.run(
      b.id, b.title, b.system_id, b.system_name, b.rom_path,
      b.box_art, b.cartridge_art, b.box_type, b.genre, b.year, 1, 0, Date.now()
    );
  });
}

// Seed de la usuaria "Sara" y Amigos si la base de datos está vacía
const userCount = db.prepare('SELECT COUNT(*) as count FROM user_profile').get();
if (userCount.count === 0) {
  console.log('[Himawari DB]: Creando perfil de usuaria Sara y amigos P2P...');
  db.prepare(`
    INSERT INTO user_profile (id, username, display_name, avatar_url, banner_url, games_count, hours_played, favorite_system)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'u_sara',
    '@saragamer',
    'Sara',
    'https://api.dicebear.com/7.x/bottts/svg?seed=SaraHimawari',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    442,
    184,
    'Nintendo 64 / Sega Mega Drive'
  );

  const insertFriend = db.prepare(`
    INSERT INTO friends (id, name, avatar, status, system_id, system_name, game_title, game_box_art, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFriend.run(
    'f_abel',
    'Abel_Fox',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Abel',
    'playing',
    'n64',
    'N64',
    'Super Mario 64',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png',
    Date.now()
  );

  insertFriend.run(
    'f_pixel',
    'PixelQueen',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen',
    'playing',
    'genesis',
    'Genesis',
    'Sonic The Hedgehog 2',
    'https://images.igdb.com/igdb/image/upload/t_cover_big/co2224.png',
    Date.now()
  );
}

// 2. ENDPOINTS REST

// Perfil de Usuario (Top-Left HUD)
app.get('/api/user/profile', (req, res) => {
  const profile = db.prepare('SELECT * FROM user_profile WHERE id = ?').get('u_sara');
  res.json({ success: true, profile });
});

// Actualizar Perfil de Usuario
app.post('/api/user/profile', (req, res) => {
  const { display_name, avatar_url, banner_url, favorite_system, title_honor, system_aura } = req.body;
  const update = db.prepare(`
    UPDATE user_profile SET 
      display_name = COALESCE(?, display_name),
      avatar_url = COALESCE(?, avatar_url),
      banner_url = COALESCE(?, banner_url),
      favorite_system = COALESCE(?, favorite_system),
      title_honor = COALESCE(?, title_honor),
      system_aura = COALESCE(?, system_aura)
    WHERE id = 'u_sara'
  `);
  update.run(display_name, avatar_url, banner_url, favorite_system, title_honor, system_aura);
  res.json({ success: true });
});

// Biblioteca de ROMs (Cajas Originales 3D)
app.get('/api/roms', (req, res) => {
  const roms = db.prepare('SELECT * FROM rom_library ORDER BY added_at DESC').all();
  res.json({ success: true, roms });
});

// Añadir / Guardar ROM en Biblioteca
app.post('/api/roms', (req, res) => {
  const { id, title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year } = req.body;
  const insert = db.prepare(`
    INSERT OR REPLACE INTO rom_library (id, title, system_id, system_name, rom_path, box_art, cartridge_art, box_type, genre, year, favorite, play_count, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
  `);
  insert.run(
    id || ('rom_' + Date.now()),
    title,
    system_id,
    system_name,
    rom_path,
    box_art || '',
    cartridge_art || '',
    box_type || 'default_box',
    genre || 'Aventura',
    year || '2000',
    Date.now()
  );
  res.json({ success: true, id: id || ('rom_' + Date.now()) });
});

// Lista de Amigos
app.get('/api/friends', (req, res) => {
  const friends = db.prepare('SELECT * FROM friends').all();
  res.json({ success: true, friends });
});

// Carga de Tema JSON
app.get('/api/theme/:themeId', (req, res) => {
  const { themeId } = req.params;
  const themePath = path.join(ROOT_DIR, 'core', 'themes', themeId, 'theme.json');
  if (fs.existsSync(themePath)) {
    const raw = fs.readFileSync(themePath, 'utf-8');
    return res.json(JSON.parse(raw));
  }
  res.status(404).json({ error: `Tema '${themeId}' no encontrado` });
});

const onlineUsers = new Map(); // userId -> { socketId, name, avatar, status, playing, connectedAt }

// Social REST endpoints
app.get('/api/social/friends/:userId', (req, res) => {
  const rows = db.prepare('SELECT * FROM social_friends WHERE user_id = ? AND status = ?').all(req.params.userId, 'accepted');
  res.json({ success: true, friends: rows });
});

app.get('/api/social/pending/:userId', (req, res) => {
  const incoming = db.prepare('SELECT * FROM social_friends WHERE friend_id = ? AND status = ?').all(req.params.userId, 'pending_received');
  const outgoing = db.prepare('SELECT * FROM social_friends WHERE user_id = ? AND status = ?').all(req.params.userId, 'pending_sent');
  res.json({ success: true, incoming, outgoing });
});

app.get('/api/social/messages/:userId/:friendId', (req, res) => {
  const { userId, friendId } = req.params;
  const msgs = db.prepare(`SELECT * FROM chat_messages WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?) ORDER BY sent_at ASC LIMIT 100`).all(userId, friendId, friendId, userId);
  res.json({ success: true, messages: msgs });
});

app.post('/api/social/user-info', (req, res) => {
  const { userId } = req.body;
  const user = db.prepare('SELECT * FROM social_users WHERE user_id = ?').get(userId);
  if (user) {
    res.json({ success: true, user: { ...user, online: onlineUsers.has(userId) } });
  } else {
    res.json({ success: false, error: 'Usuario no encontrado' });
  }
});

app.delete('/api/social/friends/:userId/:friendId', (req, res) => {
  const { userId, friendId } = req.params;
  db.prepare('DELETE FROM social_friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(userId, friendId, friendId, userId);
  res.json({ success: true });
});

// 3. REAL-TIME SOCIAL SYSTEM
io.on('connection', (socket) => {
  let currentUserId = null;
  console.log(`[Social]: Nueva conexión WS (${socket.id})`);

  socket.on('user_register', (data) => {
    const { userId, name, avatar } = data;
    currentUserId = userId;
    db.prepare('INSERT OR REPLACE INTO social_users (user_id, name, avatar, created_at) VALUES (?, ?, ?, COALESCE((SELECT created_at FROM social_users WHERE user_id = ?), ?))').run(userId, name, avatar, userId, Date.now());
    onlineUsers.set(userId, { socketId: socket.id, name, avatar, status: 'online', playing: null, connectedAt: Date.now() });

    const dbFriends = db.prepare('SELECT * FROM social_friends WHERE user_id = ? AND status = ?').all(userId, 'accepted');
    const friends = dbFriends.map(row => {
      const isOnline = onlineUsers.has(row.friend_id);
      const onlineData = onlineUsers.get(row.friend_id);
      return { userId: row.friend_id, name: row.friend_name, avatar: row.friend_avatar, online: isOnline, status: isOnline ? (onlineData.status || 'online') : 'offline', playing: isOnline ? onlineData.playing : null };
    });

    const pendingIn = db.prepare('SELECT * FROM social_friends WHERE friend_id = ? AND status = ?').all(userId, 'pending_received');
    const pendingRequests = pendingIn.map(row => ({ fromId: row.user_id, fromName: row.friend_name, fromAvatar: row.friend_avatar }));
    const pendingOut = db.prepare('SELECT * FROM social_friends WHERE user_id = ? AND status = ?').all(userId, 'pending_sent');

    socket.emit('user_registered', { userId, friends, pendingRequests, pendingOut });

    friends.filter(f => f.online).forEach(f => {
      const friendSocket = onlineUsers.get(f.userId);
      if (friendSocket) io.to(friendSocket.socketId).emit('friend_online', { userId, name, avatar, status: 'online', playing: null });
    });

    console.log(`[Social]: ${name} (${userId}) registrado online. ${friends.length} amigos.`);
  });

  socket.on('user_update_presence', (data) => {
    if (!currentUserId) return;
    const user = onlineUsers.get(currentUserId);
    if (!user) return;
    user.status = data.status;
    user.playing = data.playing;
    onlineUsers.set(currentUserId, user);
    const dbFriends = db.prepare('SELECT friend_id FROM social_friends WHERE user_id = ? AND status = ?').all(currentUserId, 'accepted');
    dbFriends.forEach(row => {
      const friendOnline = onlineUsers.get(row.friend_id);
      if (friendOnline) io.to(friendOnline.socketId).emit('presence_update', { userId: currentUserId, status: data.status, playing: data.playing });
    });
  });

  socket.on('friend_request_send', (data) => {
    if (!currentUserId) return;
    const { toUserId, fromName, fromAvatar } = data;
    const user = onlineUsers.get(currentUserId);
    const name = (user ? user.name : fromName) || fromName;
    const avatar = (user ? user.avatar : fromAvatar) || fromAvatar;
    const existing = db.prepare('SELECT 1 FROM social_friends WHERE user_id = ? AND friend_id = ?').get(currentUserId, toUserId);
    if (existing) return;
    db.prepare('INSERT OR IGNORE INTO social_friends (user_id, friend_id, friend_name, friend_avatar, status, added_at) VALUES (?, ?, ?, ?, ?, ?)').run(currentUserId, toUserId, name, avatar, 'pending_sent', Date.now());
    db.prepare('INSERT OR IGNORE INTO social_friends (user_id, friend_id, friend_name, friend_avatar, status, added_at) VALUES (?, ?, ?, ?, ?, ?)').run(toUserId, currentUserId, name, avatar, 'pending_received', Date.now());
    const recipientOnline = onlineUsers.get(toUserId);
    if (recipientOnline) io.to(recipientOnline.socketId).emit('friend_request_received', { fromId: currentUserId, fromName: name, fromAvatar: avatar });
    console.log(`[Social]: ${name} envio solicitud a ${toUserId}`);
  });

  socket.on('friend_request_accept', (data) => {
    if (!currentUserId) return;
    const { fromUserId } = data;
    const user = onlineUsers.get(currentUserId);
    const myName = user ? user.name : 'Unknown';
    const myAvatar = user ? user.avatar : '';
    db.prepare('UPDATE social_friends SET status = ? WHERE user_id = ? AND friend_id = ?').run('accepted', fromUserId, currentUserId);
    db.prepare('UPDATE social_friends SET status = ?, friend_name = ?, friend_avatar = ? WHERE user_id = ? AND friend_id = ?').run('accepted', myName, myAvatar, currentUserId, fromUserId);
    const requesterOnline = onlineUsers.get(fromUserId);
    if (requesterOnline) io.to(requesterOnline.socketId).emit('friend_request_accepted', { byId: currentUserId, byName: myName, byAvatar: myAvatar });
    console.log(`[Social]: ${myName} acepto solicitud de ${fromUserId}`);
  });

  socket.on('friend_request_reject', (data) => {
    if (!currentUserId) return;
    const { fromUserId } = data;
    db.prepare('DELETE FROM social_friends WHERE user_id = ? AND friend_id = ?').run(fromUserId, currentUserId);
    db.prepare('DELETE FROM social_friends WHERE user_id = ? AND friend_id = ?').run(currentUserId, fromUserId);
  });

  socket.on('chat_message', (data) => {
    if (!currentUserId) return;
    const { toUserId, content } = data;
    const user = onlineUsers.get(currentUserId);
    const fromName = user ? user.name : 'Unknown';
    const fromAvatar = user ? user.avatar : '';
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    db.prepare('INSERT INTO chat_messages (id, from_id, from_name, to_id, content, sent_at) VALUES (?, ?, ?, ?, ?, ?)').run(msgId, currentUserId, fromName, toUserId, content, Date.now());
    const recipientOnline = onlineUsers.get(toUserId);
    if (recipientOnline) io.to(recipientOnline.socketId).emit('chat_message_received', { fromId: currentUserId, fromName, fromAvatar, content, sentAt: Date.now() });
  });

  socket.on('disconnect', () => {
    if (!currentUserId) return;
    const user = onlineUsers.get(currentUserId);
    onlineUsers.delete(currentUserId);
    if (user) {
      const dbFriends = db.prepare('SELECT friend_id FROM social_friends WHERE user_id = ? AND status = ?').all(currentUserId, 'accepted');
      dbFriends.forEach(row => {
        const friendOnline = onlineUsers.get(row.friend_id);
        if (friendOnline) io.to(friendOnline.socketId).emit('friend_offline', { userId: currentUserId });
      });
      console.log(`[Social]: ${user.name} (${currentUserId}) desconectado`);
    }
  });
});

// Servir Estáticos del Frontend y Assets
app.use(express.static(ROOT_DIR));

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` HIMAWARI CINEMATIC LAUNCHER BACKEND EN EJECUCIÓN`);
  console.log(` HTTP & WebSockets: http://localhost:${PORT}/`);
  console.log(` Base de datos: SQLite nativo activo`);
  console.log(`================================================================`);
});
