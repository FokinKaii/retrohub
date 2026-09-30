/**
 * RetroHub - Shaders, SVG Optical Filters & Multi-layer Background Engine
 * Stack: SVG Filters, CSS Hardware Acceleration, Video Loop
 * Archivo: ShaderOverlay.tsx
 */

import React from 'react';
import { useThemeEngine } from './ThemeContext';

export const ShaderOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useThemeEngine();

  if (!theme) return <>{children}</>;

  const crt = theme.shaders.crtEffect;
  const grain = theme.shaders.filmGrain;
  const bg = theme.background;

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center select-none">
      {/* 1. Capa Inferior: Vídeo en Bucle / Gradiente */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {bg.type === 'video' && bg.videoSource ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105"
            src={bg.videoSource}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: bg.cssGradient || bg.fallbackImage ? `url(${bg.fallbackImage}) center/cover no-repeat` : '#000'
            }}
          />
        )}
      </div>

      {/* 2. Capa Intermedia: Textura de Patrón / Scanlines estáticas */}
      {bg.patternOverlay && (
        <div
          className="absolute inset-0 z-1 pointer-events-none"
          style={{
            backgroundImage: bg.patternOverlay,
            backgroundSize: bg.patternSize || '20px 20px'
          }}
        />
      )}

      {/* 3. Capa de Tinte y Desenfoque Global */}
      <div
        className="absolute inset-0 z-2 pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: bg.overlayColor,
          opacity: bg.overlayOpacity,
          backdropFilter: `blur(${bg.backdropBlur})`,
          WebkitBackdropFilter: `blur(${bg.backdropBlur})`
        }}
      />

      {/* 4. Contenido Principal de la Aplicación */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        {children}
      </div>

      {/* 5. Shaders Ópticos de Monitor CRT */}
      {crt.enabled && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden crt-viewport">
          {/* Scanlines Dinámicas */}
          {crt.scanlines && (
            <div
              className="absolute inset-0 crt-scanlines"
              style={{
                background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)`,
                backgroundSize: `100% ${crt.scanlineFrequency || 3}px`
              }}
            />
          )}

          {/* Vignette y Curvatura de Pantalla de Tubo (PVM Trinitron) */}
          <div
            className="absolute inset-0 crt-vignette"
            style={{
              background: `radial-gradient(circle at 50% 50%, transparent 65%, rgba(0, 0, 0, ${crt.vignette || 0.4}) 100%)`,
              boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.7)'
            }}
          />

          {/* Parpadeo Analógico Fósforo */}
          <div className="absolute inset-0 crt-flicker opacity-[0.03] bg-white animate-pulse" />
        </div>
      )}

      {/* 6. Filtros SVG para Aberración Cromática y Grano */}
      <svg className="hidden">
        <defs>
          <filter id="chromatic-aberration">
            <feColorMatrix
              type="matrix"
              result="red"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
            />
            <feOffset in="red" dx="2" dy="0" result="red-shifted" />
            <feColorMatrix
              type="matrix"
              result="blue"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
            />
            <feOffset in="blue" dx="-2" dy="0" result="blue-shifted" />
            <feBlend in="red-shifted" in2="blue-shifted" mode="screen" />
          </filter>

          {grain?.enabled && (
            <filter id="film-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
            </filter>
          )}
        </defs>
      </svg>
    </div>
  );
};
