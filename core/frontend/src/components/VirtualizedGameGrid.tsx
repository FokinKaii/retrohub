/**
 * RetroHub Commercial AAA Engine - Virtualized Grid for 10,000+ ROMs
 * Stack: Windowing Virtualization + IntersectionObserver + GPU Transform Recycling
 * Archivo: core/frontend/src/components/VirtualizedGameGrid.tsx
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Game, BoxArtAspectRatio } from '../../types/engine';

interface VirtualGridProps {
  games: Game[];
  focusedIndex: number;
  onSelectGame: (game: Game) => void;
  aspectRatio?: BoxArtAspectRatio;
  columnWidth?: number;
  rowHeight?: number;
}

export const VirtualizedGameGrid: React.FC<VirtualGridProps> = ({
  games,
  focusedIndex,
  onSelectGame,
  aspectRatio = '2:3',
  columnWidth = 220,
  rowHeight = 310
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [containerHeight, setContainerHeight] = useState(700);

  // ResizeObserver para recalcular columnas reactivamente
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const columns = useMemo(() => {
    return Math.max(1, Math.floor(containerWidth / columnWidth));
  }, [containerWidth, columnWidth]);

  const totalRows = Math.ceil(games.length / columns);
  const totalHeight = totalRows * rowHeight;

  // Cálculo del Viewport Windowing (Solo elementos visibles + buffer)
  const bufferRows = 2;
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
  const endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + bufferRows);

  const visibleItems = useMemo(() => {
    const items: Array<{ game: Game; index: number; top: number; left: number; width: number; height: number }> = [];
    const itemWidth = Math.floor(containerWidth / columns) - 16;
    const itemHeight = rowHeight - 20;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < games.length) {
          items.push({
            game: games[index],
            index,
            top: row * rowHeight,
            left: col * Math.floor(containerWidth / columns) + 8,
            width: itemWidth,
            height: itemHeight
          });
        }
      }
    }
    return items;
  }, [columns, containerWidth, endRow, games, rowHeight, startRow]);

  // Auto-scroll para mantener el elemento enfocado por Gamepad visible
  useEffect(() => {
    if (!containerRef.current) return;
    const targetRow = Math.floor(focusedIndex / columns);
    const targetTop = targetRow * rowHeight;
    const currentScroll = containerRef.current.scrollTop;

    if (targetTop < currentScroll) {
      containerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
    } else if (targetTop + rowHeight > currentScroll + containerHeight) {
      containerRef.current.scrollTo({ top: targetTop - containerHeight + rowHeight + 20, behavior: 'smooth' });
    }
  }, [columns, containerHeight, focusedIndex, rowHeight]);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1:1': return 'aspect-square';
      case '3:4': return 'aspect-[3/4]';
      case '16:9': return 'aspect-video';
      case '2:3':
      default: return 'aspect-[2/3]';
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={(e) => setScrollTop((e.target as HTMLElement).scrollTop)}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden p-4 scroll-smooth"
    >
      {/* Contenedor Fantasma de Altura Completa (Garantiza el scrollbar nativo) */}
      <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
        
        {visibleItems.map(({ game, index, top, left, width, height }) => {
          const isFocused = focusedIndex === index;

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game)}
              style={{
                position: 'absolute',
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
                transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                zIndex: isFocused ? 20 : 1,
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className={`rounded-xl overflow-hidden cursor-pointer border group bg-black/40 ${
                isFocused
                  ? 'border-[var(--theme-accent,#00f0ff)] shadow-[0_12px_35px_var(--theme-accent-glow,rgba(0,240,255,0.4))] ring-2 ring-white/80'
                  : 'border-white/10 hover:border-white/40'
              }`}
            >
              {/* Box Art con Carga Perezosa e Intersection Observer */}
              <div className={`w-full ${getAspectClass()} overflow-hidden bg-black/60 relative`}>
                <img
                  src={game.boxArt || game.fallbackArt || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80'}
                  alt={game.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badge de Consola */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md text-[var(--theme-accent,#00f0ff)] border border-white/20">
                  {game.systemId}
                </div>

                {/* PILA DE AVATARES DE AMIGOS JUGANDO ESTE JUEGO (Rich Presence) */}
                {game.activeFriends && game.activeFriends.length > 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center">
                    {game.activeFriends.map((friend, idx) => (
                      <img
                        key={friend.userId}
                        src={friend.avatar}
                        alt={friend.name}
                        title={`${friend.name} está jugando ahora`}
                        style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Información Inferior del Juego */}
              <div className="p-2.5 bg-black/70 backdrop-blur-md flex flex-col justify-between flex-1">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-[var(--theme-accent,#00f0ff)]">
                  {game.title}
                </h4>
                <div className="flex justify-between items-center text-[10px] text-white/60 mt-1 font-mono">
                  <span>{game.year}</span>
                  <span className="text-[var(--theme-secondary,#ffd700)]">★ {game.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
