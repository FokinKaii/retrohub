/**
 * Himawari Cinematic Launcher - Dynamic Morphology Button Swapping
 * Patterns: Sonic Capsule (SVG 3D), Minecraft Stone (Hard 4px CSS), Glass Pill (Acrylic)
 * Archivo: core/frontend/src/components/ThemeButton.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { himawariAudio } from '../theme/HimawariAudio';

export type ButtonSkinType = 'sonic_capsule' | 'minecraft_stone' | 'glass_pill' | 'undertale_retro';

interface ThemeButtonProps {
  skin?: ButtonSkinType;
  label: string;
  icon?: string;
  onClick?: () => void;
  primaryColor?: string;
  className?: string;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({
  skin = 'sonic_capsule',
  label,
  icon,
  onClick,
  primaryColor = '#ffd700',
  className = ''
}) => {
  const handleClick = () => {
    himawariAudio.playSpatialSFX('ui_select', 'center');
    onClick?.();
  };

  const handleHover = () => {
    himawariAudio.playSpatialSFX('ui_move', 'center');
  };

  // 1. MORFOLOGÍA: CÁPSULA DE SONIC (SVG INTERACTIVO TRIDIMENSIONAL)
  if (skin === 'sonic_capsule') {
    return (
      <motion.button
        onMouseEnter={handleHover}
        onClick={handleClick}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
        className={`relative inline-flex items-center justify-center cursor-pointer select-none px-8 py-3.5 ${className}`}
      >
        <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_8px_20px_rgba(0,85,255,0.5)]" viewBox="0 0 200 50" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sonicCapsuleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="25%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#0055ff" />
              <stop offset="100%" stopColor="#002288" />
            </linearGradient>
            <linearGradient id="rimGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ffd700" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="194" height="44" rx="22" fill="url(#sonicCapsuleGrad)" stroke="url(#rimGlow)" strokeWidth="3" />
        </svg>

        <span className="relative z-10 flex items-center gap-2 font-black uppercase text-sm tracking-widest text-white drop-shadow-md">
          {icon && <span className="text-base">{icon}</span>}
          {label}
        </span>
      </motion.button>
    );
  }

  // 2. MORFOLOGÍA: BLOQUE DE PIEDRA MINECRAFT (REJILLA Y BORDES DUROS DE 4px)
  if (skin === 'minecraft_stone') {
    return (
      <motion.button
        onMouseEnter={handleHover}
        onClick={handleClick}
        whileTap={{ scale: 0.96 }}
        style={{
          boxShadow: 'inset -4px -4px 0px #373737, inset 4px 4px 0px #ffffff, 0 6px 0px #000000',
          backgroundColor: '#8a8a8a',
          fontFamily: "'VT323', monospace"
        }}
        className={`px-8 py-2.5 text-black font-black uppercase tracking-wider text-xl cursor-pointer ${className}`}
      >
        <span className="flex items-center gap-2 text-[#1e1e1e] drop-shadow">
          {icon && <span>{icon}</span>}
          {label}
        </span>
      </motion.button>
    );
  }

  // 3. MORFOLOGÍA: PÍLDORA CRISTALINA (GLASS PILL FRUTIGER AERO)
  return (
    <motion.button
      onMouseEnter={handleHover}
      onClick={handleClick}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(200,240,255,0.3) 50%, rgba(150,220,255,0.5) 100%)',
        boxShadow: '0 12px 30px rgba(0,110,200,0.3), inset 0 2px 6px rgba(255,255,255,1), inset 0 -2px 6px rgba(0,80,180,0.3)',
        border: '1.5px solid rgba(255,255,255,0.9)'
      }}
      className={`px-8 py-3 rounded-full text-[#002b4d] font-black uppercase tracking-wider text-xs backdrop-blur-md cursor-pointer ${className}`}
    >
      <span className="flex items-center gap-2 drop-shadow-sm">
        {icon && <span>{icon}</span>}
        {label}
      </span>
    </motion.button>
  );
};
