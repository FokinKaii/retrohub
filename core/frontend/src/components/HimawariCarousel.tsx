/**
 * Himawari Cinematic Launcher - Kinetic 3D Carousel (120Hz Handheld Optimized)
 * Stack: Framer Motion (useMotionValue, useSpring, useTransform) + Conditional Motion Blur + Haptic Impact Zoom
 * Archivo: core/frontend/src/components/HimawariCarousel.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { himawariAudio } from '../theme/HimawariAudio';

export interface HimawariConsole {
  id: string;
  name: string;
  maker: string;
  year: string;
  specs: string;
  img: string;
  color: string;
  glow: string;
  gamesCount: number;
}

interface HimawariCarouselProps {
  consoles: HimawariConsole[];
  activeConsole: HimawariConsole;
  onConsoleChange: (console: HimawariConsole) => void;
  onSystemLaunch?: (console: HimawariConsole) => void;
  scrollInertia: MotionValue<number>;
}

export const HimawariCarousel: React.FC<HimawariCarouselProps> = ({
  consoles,
  activeConsole,
  onConsoleChange,
  onSystemLaunch,
  scrollInertia
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomingImpact, setIsZoomingImpact] = useState(false);

  // 1. FÍSICAS CINÉTICAS DE FRAMER MOTION PARA 120Hz
  const analogAxisX = useMotionValue(0);
  const analogAxisY = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);

  // Resortes elásticos no-lineales
  const springConfig = { stiffness: 340, damping: 20, mass: 0.82 };
  const smoothTiltX = useSpring(useTransform(analogAxisY, [-1, 1], [22, -22]), springConfig);
  const smoothTiltY = useSpring(useTransform(analogAxisX, [-1, 1], [-28, 28]), springConfig);
  const dynamicMotionBlur = useSpring(useTransform(scrollVelocity, [0, 5], [0, 8]), { stiffness: 400, damping: 25 });

  // 2. DISPARADOR HÁPTICO DE MANDO
  const triggerHaptic = (weak = 0.35, strong = 0.1, duration = 35) => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1];
    if (gp && (gp as any).vibrationActuator) {
      (gp as any).vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: weak,
        strongMagnitude: strong
      }).catch(() => {});
    }
  };

  // 3. NAVEGACIÓN Y PANEO DE AUDIO ESPACIAL 3D
  const navigateCarousel = (direction: 'left' | 'right') => {
    const nextIdx = direction === 'left'
      ? (selectedIndex - 1 + consoles.length) % consoles.length
      : (selectedIndex + 1) % consoles.length;

    setSelectedIndex(nextIdx);
    onConsoleChange(consoles[nextIdx]);

    // Sonido espacial paneado a izquierda o derecha
    himawariAudio.playSpatialSFX('ui_move', direction);
    triggerHaptic(0.35, 0.08, 35);

    // Impulso de velocidad para motion blur condicional
    scrollVelocity.set(4);
    setTimeout(() => scrollVelocity.set(0), 120);

    // Mover inercia del fondo Parallax
    scrollInertia.set(nextIdx * 300);
  };

  const handleImpactLaunch = () => {
    setIsZoomingImpact(true);
    himawariAudio.playSpatialSFX('ui_launch', 'center');
    triggerHaptic(0.8, 0.98, 420); // Impacto háptico masivo

    setTimeout(() => {
      onSystemLaunch?.(activeConsole);
      setIsZoomingImpact(false);
    }, 550);
  };

  // 4. LECTURA CONTINUA DEL ANALÓGICO DEL MANDO (120Hz Loop)
  useEffect(() => {
    let animId: number;
    const pollStick = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];
      if (gp) {
        const x = gp.axes[0] || 0;
        const y = gp.axes[1] || 0;
        analogAxisX.set(Math.abs(x) > 0.1 ? x : 0);
        analogAxisY.set(Math.abs(y) > 0.1 ? y : 0);
      }
      animId = requestAnimationFrame(pollStick);
    };
    animId = requestAnimationFrame(pollStick);
    return () => cancelAnimationFrame(animId);
  }, [analogAxisX, analogAxisY]);

  // Soporte teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateCarousel('left');
      if (e.key === 'ArrowRight') navigateCarousel('right');
      if (e.key === 'Enter') handleImpactLaunch();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex]);

  return (
    <div className="relative w-full h-[540px] flex flex-col items-center justify-center perspective-[1200px] select-none">
      
      {/* ESCENARIO COVER FLOW 3D */}
      <div className="relative w-full max-w-[1400px] h-[380px] flex items-center justify-center preserve-3d">
        {consoles.map((c, idx) => {
          const offset = idx - selectedIndex;
          const absOffset = Math.abs(offset);
          const isFocused = offset === 0;

          const translateX = offset * 270;
          const translateZ = isFocused ? (isZoomingImpact ? 260 : 150) : -absOffset * 140;
          const rotateY = isFocused ? 0 : offset > 0 ? -40 : 40;
          const opacity = isFocused ? 1 : Math.max(0.2, 1 - absOffset * 0.35);

          return (
            <motion.div
              key={c.id}
              onClick={() => {
                if (!isFocused) {
                  navigateCarousel(offset > 0 ? 'right' : 'left');
                } else {
                  handleImpactLaunch();
                }
              }}
              animate={{
                x: translateX,
                z: translateZ,
                rotateY: rotateY,
                opacity,
                scale: isFocused ? (isZoomingImpact ? 1.25 : 1.06) : 0.88
              }}
              transition={springConfig}
              style={{
                rotateX: isFocused ? smoothTiltX : 0,
                rotateY: isFocused ? smoothTiltY : rotateY,
                zIndex: 50 - absOffset,
                // Motion Blur Condicional solo en tarjetas no enfocadas a alta velocidad
                filter: isFocused ? 'none' : `blur(${absOffset * 3}px) brightness(0.65)`
              }}
              className={`absolute w-[330px] h-[350px] rounded-[28px] p-6 flex flex-col items-center justify-between cursor-pointer border backdrop-blur-3xl ${
                isFocused
                  ? 'border-white/90 shadow-[0_35px_90px_rgba(0,0,0,0.7)]'
                  : 'border-white/15'
              }`}
              style={{
                background: isFocused ? 'rgba(5, 18, 45, 0.85)' : 'rgba(0, 5, 15, 0.6)',
                borderColor: isFocused ? c.color : 'rgba(255,255,255,0.15)',
                boxShadow: isFocused ? `0 20px 70px ${c.glow}` : 'none'
              }}
            >
              {/* RESPIRACIÓN SINUSOIDAL EN IDLE */}
              <motion.div
                animate={isFocused ? { y: [0, -9, 0], rotateZ: [0, 0.5, -0.5, 0] } : {}}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full flex flex-col items-center justify-between"
              >
                <div className="w-full flex justify-between items-center text-xs font-mono font-bold">
                  <span style={{ color: c.color }}>{c.maker}</span>
                  <span className="text-white/60">{c.year}</span>
                </div>

                <motion.img
                  src={c.img}
                  alt={c.name}
                  className="max-h-[170px] max-w-[92%] object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                  whileHover={{ scale: 1.1, y: -4 }}
                />

                <div className="text-center w-full">
                  <h3 className="text-xl font-black text-white tracking-wide truncate">{c.name}</h3>
                  <p className="text-[11px] font-mono text-white/60 mt-0.5">{c.gamesCount} TÍTULOS DISPONIBLES</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
