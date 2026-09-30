/**
 * RetroHub Commercial AAA Engine - 3D Cover Flow & Emulator Hero Carousel
 * Stack: React 19 + CSS 3D Perspective + Fluid Hardware Spring Transforms
 * Archivo: core/frontend/src/components/EmulatorHeroCarousel.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { Emulator } from '../../types/engine';

interface CarouselProps {
  emulators: Emulator[];
  activeEmulator: Emulator;
  onSelectEmulator: (emu: Emulator) => void;
  onLaunchConsole?: (emu: Emulator) => void;
}

export const EmulatorHeroCarousel: React.FC<CarouselProps> = ({
  emulators,
  activeEmulator,
  onSelectEmulator,
  onLaunchConsole
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    emulators.findIndex(e => e.id === activeEmulator.id) || 0
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    const nextIdx = (selectedIndex - 1 + emulators.length) % emulators.length;
    setSelectedIndex(nextIdx);
    onSelectEmulator(emulators[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (selectedIndex + 1) % emulators.length;
    setSelectedIndex(nextIdx);
    onSelectEmulator(emulators[nextIdx]);
  };

  // Soporte teclado local (flechas izquierda / derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Enter') onLaunchConsole?.(emulators[selectedIndex]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, emulators]);

  return (
    <div className="relative w-full h-[380px] flex flex-col items-center justify-center overflow-hidden perspective-[1200px] select-none py-6">
      
      {/* Luz Ambiental Reactiva de la Consola Activa */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-[100px] transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeEmulator.glow} 0%, transparent 70%)`
        }}
      />

      {/* Escenario 3D Cover Flow */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[1200px] h-[260px] flex items-center justify-center preserve-3d"
      >
        {emulators.map((emu, index) => {
          const offset = index - selectedIndex;
          const absOffset = Math.abs(offset);
          const isSelected = offset === 0;

          // Cálculo espacial de Cover Flow
          const translateX = offset * 220;
          const translateZ = isSelected ? 120 : -absOffset * 100;
          const rotateY = isSelected ? 0 : offset > 0 ? -45 : 45;
          const opacity = isSelected ? 1 : Math.max(0.25, 1 - absOffset * 0.3);
          const zIndex = 50 - absOffset;

          return (
            <div
              key={emu.id}
              onClick={() => {
                setSelectedIndex(index);
                onSelectEmulator(emu);
              }}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
                zIndex,
                transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              className={`absolute w-[280px] h-[220px] rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer border backdrop-blur-md transition-shadow ${
                isSelected
                  ? 'border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-105'
                  : 'border-white/20 shadow-lg'
              }`}
              style={{
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
                borderColor: isSelected ? emu.color : 'rgba(255,255,255,0.2)',
                boxShadow: isSelected ? `0 15px 40px ${emu.glow}` : 'none'
              }}
            >
              {/* Imagen Fotográfica Real de la Consola con Elevación 3D */}
              <div className="relative w-full h-[140px] flex items-center justify-center">
                <img
                  src={emu.realImage}
                  alt={emu.name}
                  className={`max-h-[130px] max-w-[90%] object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.6)] transition-transform duration-500 ${
                    isSelected ? 'scale-110 -translate-y-2' : 'scale-90'
                  }`}
                />
              </div>

              {/* Titular y Metadatos de la Consola */}
              <div className="w-full text-center">
                <h3 className="text-base font-black tracking-wider text-white truncate drop-shadow-md">
                  {emu.name}
                </h3>
                <p className="text-[11px] font-mono text-white/70">
                  {emu.maker} • {emu.year} • {emu.gamesCount} ROMs
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flechas de Navegación Lateral y Botón de Inicio Rápido */}
      <div className="z-20 flex items-center gap-6 mt-4">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white font-bold text-lg flex items-center justify-center border border-white/20 transition-all hover:scale-110 active:scale-95"
        >
          ‹
        </button>

        <button
          onClick={() => onLaunchConsole?.(activeEmulator)}
          className="px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: activeEmulator.color,
            boxShadow: `0 4px 20px ${activeEmulator.glow}`
          }}
        >
          ▶ ABRIR CATÁLOGO ({activeEmulator.gamesCount})
        </button>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md text-white font-bold text-lg flex items-center justify-center border border-white/20 transition-all hover:scale-110 active:scale-95"
        >
          ›
        </button>
      </div>

    </div>
  );
};
