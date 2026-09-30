/**
 * RetroHub - Dynamic Liquid Grid Layout Engine
 * Stack: React 19 + CSS Grid Engine + Modular Component Injection
 * Archivo: DynamicGridLayout.tsx
 */

import React from 'react';
import { useThemeEngine } from './ThemeContext';

// Módulos Integrados del Sistema
interface ModuleProps {
  config: Record<string, any>;
  onAction?: (action: string, payload?: any) => void;
}

export const TopBarModule: React.FC<ModuleProps> = ({ config }) => {
  const { playSFX } = useThemeEngine();
  return (
    <header className="module-topbar flex items-center justify-between px-6 py-3 bg-[var(--theme-surface-glass)] backdrop-blur-[var(--theme-backdrop-blur)] rounded-[var(--theme-border-radius-global)] border-[length:var(--theme-border-width)] border-[var(--theme-border-light)] shadow-[var(--theme-box-shadow)]">
      <div className="flex items-center gap-3">
        <span className="text-xl">🕹️</span>
        <span className="font-extrabold tracking-wider text-[var(--theme-text-main)] font-[var(--theme-font-display)]">
          RETROHUB OS // V2.0
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs font-mono text-[var(--theme-text-muted)]">
        <span className="px-2 py-1 bg-black/30 rounded border border-white/10">CPU: 3.2GHz</span>
        <span className="px-2 py-1 bg-black/30 rounded border border-white/10">FPS: 60.0</span>
        <span className="text-[var(--theme-accent)]">● CONECTADO</span>
      </div>
    </header>
  );
};

export const SidebarModule: React.FC<ModuleProps> = ({ config }) => {
  const { playSFX } = useThemeEngine();
  const navItems = [
    { id: 'all', icon: '🎮', label: 'Librería' },
    { id: 'favs', icon: '⭐', label: 'Favoritos' },
    { id: 'net', icon: '🌐', label: 'Comunidad' },
    { id: 'emu', icon: '⚙️', label: 'Emuladores' },
    { id: 'opt', icon: '🎨', label: 'Ajustes' }
  ];

  return (
    <aside className="module-sidebar flex flex-col justify-between p-4 bg-[var(--theme-surface-glass)] backdrop-blur-[var(--theme-backdrop-blur)] rounded-[var(--theme-border-radius-global)] border-[length:var(--theme-border-width)] border-[var(--theme-border-light)] shadow-[var(--theme-box-shadow)]">
      <div className="space-y-3">
        <div className="text-center font-black tracking-widest text-[var(--theme-primary)] mb-4 font-[var(--theme-font-display)]">
          MENÚ
        </div>
        {navItems.map(item => (
          <button
            key={item.id}
            onMouseEnter={() => playSFX('onHover')}
            onClick={() => playSFX('onClick')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--theme-border-radius-global)] text-left font-bold text-[var(--theme-text-main)] transition-all hover:bg-[var(--theme-accent)] hover:text-[var(--theme-text-inverted)] hover:scale-105 active:scale-95"
            style={{
              border: 'var(--theme-border-width) var(--theme-border-style) var(--theme-border-light)',
              background: 'var(--theme-surface-texture)'
            }}
          >
            <span>{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="p-3 bg-black/20 rounded-[var(--theme-border-radius-global)] border border-white/10 text-xs text-[var(--theme-text-muted)] text-center">
        v2.4.0 Engine
      </div>
    </aside>
  );
};

export const HeroBannerModule: React.FC<ModuleProps> = ({ config }) => {
  const { playSFX } = useThemeEngine();
  return (
    <section className="module-banner relative overflow-hidden flex items-center justify-between px-8 py-4 bg-[var(--theme-surface-glass)] backdrop-blur-[var(--theme-backdrop-blur)] rounded-[var(--theme-border-radius-global)] border-[length:var(--theme-border-width)] border-[var(--theme-border-light)] shadow-[var(--theme-box-shadow)]">
      <div className="z-10 space-y-1">
        <div className="inline-block px-3 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-[var(--theme-accent)] text-[var(--theme-text-inverted)]">
          SISTEMA SELECCIONADO
        </div>
        <h1 className="text-3xl font-black text-[var(--theme-text-main)] font-[var(--theme-font-display)]">
          NINTENDO 64 // 64-BIT REALITY
        </h1>
        <p className="text-xs text-[var(--theme-text-muted)] max-w-md">
          Lanzamiento: 1996 | Arquitectura Silicon Graphics VR4300 | 128 Juegos Indexados
        </p>
      </div>

      <div className="z-10 flex gap-3">
        <button
          onMouseEnter={() => playSFX('onHover')}
          onClick={() => playSFX('onLaunchGame')}
          className="px-6 py-2.5 font-black text-sm uppercase tracking-wider rounded-[var(--theme-border-radius-global)] text-[var(--theme-text-inverted)] bg-[var(--theme-primary)] hover:bg-[var(--theme-accent)] transition-all shadow-[0_4px_15px_var(--theme-accent-glow)] active:scale-95"
          style={{
            border: 'var(--theme-border-width) outset var(--theme-border-light)'
          }}
        >
          ▶ INICIAR SISTEMA
        </button>
      </div>
    </section>
  );
};

export const LibraryGridModule: React.FC<ModuleProps> = ({ config }) => {
  const { playSFX } = useThemeEngine();
  const mockGames = [
    { id: '1', title: 'Super Mario 64', year: '1996', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png' },
    { id: '2', title: 'The Legend of Zelda: Ocarina of Time', year: '1998', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vci.png' },
    { id: '3', title: 'Super Smash Bros. Melee', year: '2001', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2224.png' },
    { id: '4', title: 'Mario Kart 64', year: '1996', cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7f.png' }
  ];

  return (
    <main className="module-library flex-1 flex flex-col p-5 bg-[var(--theme-surface-glass)] backdrop-blur-[var(--theme-backdrop-blur)] rounded-[var(--theme-border-radius-global)] border-[length:var(--theme-border-width)] border-[var(--theme-border-light)] shadow-[var(--theme-box-shadow)] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-extrabold text-[var(--theme-text-main)] font-[var(--theme-font-display)]">
          LUDOTECA EN LÍNEA
        </h2>
        <span className="text-xs text-[var(--theme-text-muted)] font-mono">4 JUEGOS DISPONIBLES</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 overflow-y-auto pr-1">
        {mockGames.map(game => (
          <div
            key={game.id}
            onMouseEnter={() => playSFX('onHover')}
            onClick={() => playSFX('onLaunchGame')}
            className="group relative rounded-[var(--theme-border-radius-global)] overflow-hidden bg-black/40 border-[length:var(--theme-border-width)] border-[var(--theme-border-dark)] hover:border-[var(--theme-accent)] transition-all duration-300 hover:scale-[1.03] cursor-pointer shadow-lg hover:shadow-[0_10px_25px_var(--theme-accent-glow)]"
          >
            <div className="w-full aspect-[3/4] overflow-hidden">
              <img src={game.cover} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <span className="text-xs font-black text-[var(--theme-accent)]">{game.year}</span>
              <h3 className="text-sm font-bold text-white truncate">{game.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export const FriendsPanelModule: React.FC<ModuleProps> = ({ config }) => {
  const { playSFX } = useThemeEngine();
  const friends = [
    { name: 'Lucas_Fox', game: 'Smash Melee', status: 'Wii', online: true },
    { name: 'PixelQueen', game: 'Ocarina of Time', status: 'N64', online: true },
    { name: 'CyberKidd', game: 'Pokémon Emerald', status: 'GBA', online: false }
  ];

  return (
    <aside className="module-friends flex flex-col p-4 bg-[var(--theme-surface-glass)] backdrop-blur-[var(--theme-backdrop-blur)] rounded-[var(--theme-border-radius-global)] border-[length:var(--theme-border-width)] border-[var(--theme-border-light)] shadow-[var(--theme-box-shadow)]">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--theme-primary)] mb-3 font-[var(--theme-font-display)]">
        AMIGOS EN LÍNEA ({friends.filter(f => f.online).length})
      </h3>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {friends.map((f, i) => (
          <div
            key={i}
            onMouseEnter={() => playSFX('onHover')}
            className="flex items-center gap-3 p-2.5 rounded-[var(--theme-border-radius-global)] bg-black/20 border border-white/10 hover:border-[var(--theme-accent)] transition-all cursor-pointer"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[var(--theme-secondary)] flex items-center justify-center font-bold text-black text-sm">
                {f.name[0]}
              </div>
              {f.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="text-xs font-bold text-[var(--theme-text-main)] truncate">{f.name}</p>
                <span className="text-[10px] font-mono text-[var(--theme-accent)]">{f.status}</span>
              </div>
              <p className="text-[11px] text-[var(--theme-text-muted)] truncate">{f.game}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export const MacOSDockModule: React.FC<ModuleProps> = ({ config }) => {
  const { playSFX } = useThemeEngine();
  const dockIcons = [
    { icon: '🚀', label: 'Lanzar' },
    { icon: '💾', label: 'ROMs' },
    { icon: '⭐', label: 'Favoritos' },
    { icon: '💬', label: 'Chat' },
    { icon: '📻', label: 'Radio' },
    { icon: '🛠️', label: 'Ajustes' }
  ];

  return (
    <footer className="module-dock flex items-center justify-center">
      <div
        className="flex items-center gap-3 px-6 py-2.5 bg-[var(--theme-surface-glass)] backdrop-blur-[var(--theme-backdrop-blur)] rounded-full border-[length:var(--theme-border-width)] border-[var(--theme-border-light)] shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
        style={{
          boxShadow: 'var(--theme-box-shadow)'
        }}
      >
        {dockIcons.map((item, idx) => (
          <button
            key={idx}
            onMouseEnter={() => playSFX('onHover')}
            onClick={() => playSFX('onClick')}
            className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-full hover:scale-125 transition-transform duration-200 active:scale-95"
            style={{
              background: 'var(--theme-surface-texture)',
              border: '1px solid var(--theme-border-light)'
            }}
          >
            <span className="text-2xl group-hover:-translate-y-1 transition-transform">{item.icon}</span>
            <span className="absolute -top-7 px-2 py-0.5 text-[10px] font-bold rounded bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </footer>
  );
};

// Registro de Módulos Dinámicos
const MODULE_REGISTRY: Record<string, React.FC<ModuleProps>> = {
  topbar: TopBarModule,
  sidebar: SidebarModule,
  banner: HeroBannerModule,
  library: LibraryGridModule,
  friends: FriendsPanelModule,
  dock: MacOSDockModule
};

// Componente Maestro del Layout Líquido
export const DynamicGridLayout: React.FC = () => {
  const { theme } = useThemeEngine();

  if (!theme) return null;

  const { layout } = theme;
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateAreas: layout.gridTemplateAreas.join(' '),
    gridTemplateColumns: layout.gridTemplateColumns,
    gridTemplateRows: layout.gridTemplateRows,
    gap: layout.gap,
    padding: layout.padding,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    height: '100%',
    maxHeight: '94vh',
    borderRadius: layout.borderRadiusWindow,
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <div className="dynamic-grid-container" style={gridStyle}>
      {Object.entries(layout.activeModules).map(([moduleKey, modConfig]) => {
        if (!modConfig.enabled) return null;
        const Component = MODULE_REGISTRY[moduleKey];
        if (!Component) return null;

        return (
          <div
            key={moduleKey}
            style={{ gridArea: moduleKey }}
            className="module-grid-slot flex flex-col min-w-0 min-h-0 overflow-hidden"
          >
            <Component config={modConfig} />
          </div>
        );
      })}
    </div>
  );
};
