/**
 * RetroHub Commercial AAA Engine - Master Main Dashboard Component
 * Integrates: Gamepad Spatial Navigation, 3D Emulator Carousel, Virtualized Grid, Liquid Layout & Soundscapes
 * Archivo: core/frontend/src/components/RetroHubDashboard.tsx
 */

import React, { useState, useEffect } from 'react';
import { Emulator, Game, UserPresence } from '../../types/engine';
import { EmulatorHeroCarousel } from './EmulatorHeroCarousel';
import { VirtualizedGameGrid } from './VirtualizedGameGrid';
import { useGamepad } from '../hooks/useGamepad';
import { useThemeEngine } from '../theme/ThemeContext';
import { RetroHubIPC } from '../../backend/ipc_bridge';

export const RetroHubDashboard: React.FC = () => {
  const { theme, switchTheme, playSFX } = useThemeEngine();
  const [viewState, setViewState] = useState<'console_select' | 'catalogue'>('console_select');

  // MOCK DE CONSOLAS CON HARDWARE REAL
  const [emulators] = useState<Emulator[]>([
    {
      id: 'n64',
      name: 'Nintendo 64',
      maker: 'Nintendo',
      year: '1996',
      arch: '64-Bit MIPS VR4300',
      gamesCount: 388,
      controllers: '4 Puertos',
      desc: 'La era dorada del 3D revolucionario.',
      color: '#ff4757',
      glow: 'rgba(255, 71, 87, 0.5)',
      secondary: '#00d2d3',
      realImage: '/assets/consoles/n64.png',
      wallpaper: '/assets/wallpapers/n64.svg',
      supportedExtensions: ['.z64', '.n64', '.v64']
    },
    {
      id: 'ps1',
      name: 'PlayStation',
      maker: 'Sony',
      year: '1994',
      arch: '32-Bit MIPS R3000A',
      gamesCount: 1420,
      controllers: '2 Puertos DualShock',
      desc: 'Revolución en CD-ROM y sonido orquestal.',
      color: '#00a8ff',
      glow: 'rgba(0, 168, 255, 0.5)',
      secondary: '#e84118',
      realImage: '/assets/consoles/ps1.png',
      wallpaper: '/assets/wallpapers/ps1.svg',
      supportedExtensions: ['.iso', '.chd', '.bin']
    },
    {
      id: 'snes',
      name: 'Super Nintendo',
      maker: 'Nintendo',
      year: '1990',
      arch: '16-Bit Ricoh 5A22 Mode 7',
      gamesCount: 780,
      controllers: '2 Mandos',
      desc: 'La cúspide del arte en 16 bits.',
      color: '#00d2d3',
      glow: 'rgba(0, 210, 211, 0.5)',
      secondary: '#2ed573',
      realImage: '/assets/consoles/snes.png',
      wallpaper: '/assets/wallpapers/snes.svg',
      supportedExtensions: ['.sfc', '.smc']
    },
    {
      id: 'gba',
      name: 'Game Boy Advance',
      maker: 'Nintendo',
      year: '2001',
      arch: '32-Bit ARM7TDMI',
      gamesCount: 1040,
      controllers: 'Portátil',
      desc: 'Potencia de 32 bits en tu mano.',
      color: '#a55eea',
      glow: 'rgba(165, 94, 234, 0.5)',
      secondary: '#45aaf2',
      realImage: '/assets/consoles/gba.png',
      wallpaper: '/assets/wallpapers/gba.svg',
      supportedExtensions: ['.gba']
    }
  ]);

  const [activeEmulator, setActiveEmulator] = useState<Emulator>(emulators[0]);

  // Generador de 5.000 ROMs para demostrar el rendimiento a 60 FPS
  const mockGames: Game[] = React.useMemo(() => {
    return Array.from({ length: 5000 }, (_, i) => ({
      id: `game_${activeEmulator.id}_${i}`,
      title: `${activeEmulator.name} Título Legendario #${i + 1}`,
      systemId: activeEmulator.name,
      boxArt: i % 2 === 0
        ? 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png'
        : 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2224.png',
      year: `${1990 + (i % 15)}`,
      developer: 'RetroHub Studios',
      genre: 'Acción / Plataformas',
      rating: 4.2 + (i % 8) * 0.1,
      synopsis: 'Juego clásico renderizado a 60 FPS fijos con la arquitectura de Virtualized Lists.',
      romPath: `C:/ROMS/${activeEmulator.id}/game_${i}.rom`,
      activeFriends: i % 7 === 0 ? [
        { userId: 'u1', name: 'Lucas', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' }
      ] : undefined
    }));
  }, [activeEmulator]);

  // INTEGRACIÓN DE MANDOS NATIVOS
  const { focusedIndex, controllerType, isConnected, buttonPrompts } = useGamepad({
    itemCount: viewState === 'console_select' ? emulators.length : mockGames.length,
    columns: viewState === 'console_select' ? 1 : 4,
    onSelect: (index) => {
      playSFX('onClick');
      if (viewState === 'console_select') {
        setViewState('catalogue');
      } else {
        handleLaunchGame(mockGames[index]);
      }
    },
    onBack: () => {
      playSFX('onClick');
      if (viewState === 'catalogue') {
        setViewState('console_select');
      }
    }
  });

  const handleLaunchGame = async (game: Game) => {
    playSFX('onEmulatorLaunch');
    await RetroHubIPC.launchEmulator(activeEmulator, game);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
      
      {/* 1. CABECERA SUPERIOR CON STATUS BAR Y DETECCIÓN DE MANDOS */}
      <header className="w-full h-14 px-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <span className="font-black text-sm tracking-widest text-[var(--theme-primary,#00f0ff)]">
            RETROHUB COMMERCIAL OS // NEXT-GEN
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/80">
            {viewState === 'console_select' ? 'SELECCIÓN DE CONSOLA' : `${activeEmulator.name.toUpperCase()} CATALOGUE`}
          </span>
        </div>

        {/* ESTADO DEL MANDO CONECTADO */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span>MANDO: {controllerType.toUpperCase()}</span>
          </div>
          <span className="text-white/60">FPS: 60.0 LOCKED</span>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL HERO: COVER FLOW 3D O CATÁLOGO VIRTUALIZADO */}
      <main className="flex-1 overflow-hidden relative flex items-center justify-center">
        {viewState === 'console_select' ? (
          <div className="w-full flex flex-col items-center">
            <EmulatorHeroCarousel
              emulators={emulators}
              activeEmulator={activeEmulator}
              onSelectEmulator={(emu) => {
                setActiveEmulator(emu);
                playSFX('onHover');
              }}
              onLaunchConsole={() => {
                playSFX('onClick');
                setViewState('catalogue');
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-black text-white font-[var(--theme-font-display)]">
                  LUDOTECA {activeEmulator.name.toUpperCase()}
                </h2>
                <p className="text-xs text-white/60">
                  5,000 ROMs Indexadas en Memoria con Virtualización a 60 FPS
                </p>
              </div>
              <button
                onClick={() => setViewState('console_select')}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20"
              >
                ← VOLVER A CONSOLAS
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl bg-black/30 border border-white/10">
              <VirtualizedGameGrid
                games={mockGames}
                focusedIndex={focusedIndex}
                onSelectGame={handleLaunchGame}
                aspectRatio={theme?.boxArtFormat?.aspectRatio || '2:3'}
              />
            </div>
          </div>
        )}
      </main>

      {/* 3. BARRA INFERIOR DE PROMPTS DINÁMICOS SEGÚN MANDO ACTIVO */}
      <footer className="w-full h-12 px-6 flex items-center justify-between border-t border-white/10 bg-black/60 backdrop-blur-md z-30 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-black"
              style={{ background: buttonPrompts.select.color }}
            >
              {buttonPrompts.select.glyph}
            </span>
            <span className="text-white/80">{buttonPrompts.select.action}</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span
              className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-black"
              style={{ background: buttonPrompts.back.color }}
            >
              {buttonPrompts.back.glyph}
            </span>
            <span className="text-white/80">{buttonPrompts.back.action}</span>
          </div>
        </div>

        <div className="text-white/40 font-mono text-[11px]">
          RETROHUB COMMERCIAL ENGINE V3.0 • READY FOR TAURI / ELECTRON
        </div>
      </footer>

    </div>
  );
};
