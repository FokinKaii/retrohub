/**
 * Himawari Cinematic Launcher - Floating Glass HUD & Real-time WebSockets
 * Features: Top-Left Profile Card (SQLite) + Right Column Live Friends + Animated Rich Presence Pop
 * Archivo: core/frontend/src/components/HimawariHUD.tsx
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { himawariAudio } from '../theme/HimawariAudio';

export interface UserProfileData {
  username: string;
  display_name: string;
  avatar_url: string;
  banner_url: string;
  games_count: number;
  hours_played: number;
  favorite_system: string;
}

export interface LiveFriend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'playing';
  systemId?: string;
  systemName?: string;
  gameTitle?: string;
  gameBoxArt?: string;
  isRecentChange?: boolean;
}

export const HimawariHUD: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [friends, setFriends] = useState<LiveFriend[]>([]);

  // 1. CARGA DE PERFIL DESDE SQLITE
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      })
      .catch(() => {
        // Fallback local
        setProfile({
          username: '@saragamer',
          display_name: 'Sara',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SaraHimawari',
          banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
          games_count: 442,
          hours_played: 184,
          favorite_system: 'Nintendo 64 / Mega Drive'
        });
      });
  }, []);

  // 2. CONEXIÓN A WEBSOCKETS EN TIEMPO REAL
  useEffect(() => {
    const socket: Socket = io('/', { transports: ['websocket'] });

    socket.on('presence_initial', (initialList: LiveFriend[]) => {
      setFriends(initialList);
    });

    socket.on('presence_update', (payload: any) => {
      // Disparar audio espacial de notificación social
      himawariAudio.playSpatialSFX('social_notify', 'right');

      setFriends(prev => {
        return prev.map(f => {
          if (f.id === payload.friendId || f.name === payload.name) {
            return {
              ...f,
              status: payload.status,
              systemId: payload.systemId,
              systemName: payload.systemName,
              gameTitle: payload.gameTitle,
              gameBoxArt: payload.gameBoxArt,
              isRecentChange: true
            };
          }
          return f;
        });
      });

      // Retirar flag de animación tras 5 segundos
      setTimeout(() => {
        setFriends(prev => prev.map(f => ({ ...f, isRecentChange: false })));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-hidden">
      
      {/* 3. PERFIL DE USUARIA (TOP-LEFT): CRISTAL OSCURO + BANNER CON FADE GRADIENTE */}
      <motion.aside
        initial={{ opacity: 0, x: -40, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="pointer-events-auto absolute top-6 left-8 w-[320px] rounded-3xl overflow-hidden border border-white/20 bg-black/60 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
      >
        {/* Banner Temático con Degradado a Transparente */}
        <div className="relative w-full h-[85px]">
          <img
            src={profile?.banner_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
        </div>

        {/* Avatar Circular y Estadísticas */}
        <div className="relative px-5 pb-5 -mt-9 flex flex-col">
          <div className="flex items-end justify-between">
            <div className="relative">
              <img
                src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Sara'}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-white/90 shadow-xl bg-black/80"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#00ff88] border-2 border-black" />
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-xs font-mono font-black text-white">{profile?.games_count || 442}</p>
                <p className="text-[10px] uppercase text-white/50 font-bold">Juegos</p>
              </div>
              <div className="w-[1px] h-6 bg-white/20" />
              <div>
                <p className="text-xs font-mono font-black text-[#ffd700]">{profile?.hours_played || 184}h</p>
                <p className="text-[10px] uppercase text-white/50 font-bold">Tiempo</p>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-black text-white leading-tight">{profile?.display_name || 'Sara'}</h3>
            <p className="text-xs text-white/60 font-mono">{profile?.username || '@saragamer'}</p>
          </div>
        </div>
      </motion.aside>

      {/* 4. LIVE FRIENDS (RIGHT COLUMN): WEBSOCKET RICH PRESENCE ANIMADO */}
      <motion.aside
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="pointer-events-auto absolute top-6 right-8 w-[280px] flex flex-col gap-3"
      >
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#00e8c6] font-mono">
            ● COMUNIDAD EN VIVO ({friends.length})
          </span>
          <span className="text-[10px] font-mono text-white/40">WEBSOCKET P2P</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <AnimatePresence>
            {friends.map((friend) => (
              <motion.div
                key={friend.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={
                  friend.isRecentChange
                    ? { scale: [1, 1.15, 1], borderColor: ['#ffd700', '#00ff88', 'rgba(255,255,255,0.2)'] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 18 }}
                className="relative flex items-center gap-3 p-3 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-2xl shadow-lg transition-colors hover:border-white/40"
              >
                <div className="relative">
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full border border-white/40" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00e8c6] border-2 border-black" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-black text-white truncate">{friend.name}</p>
                    {friend.systemName && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono bg-white/10 text-[#ffd700]">
                        {friend.systemName}
                      </span>
                    )}
                  </div>

                  {friend.gameTitle ? (
                    <motion.p
                      key={friend.gameTitle}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-[#00ff88] truncate font-semibold mt-0.5"
                    >
                      ▶ {friend.gameTitle}
                    </motion.p>
                  ) : (
                    <p className="text-[11px] text-white/50 truncate">En el menú principal</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.aside>

    </div>
  );
};
