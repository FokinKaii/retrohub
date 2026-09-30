/**
 * RetroHub Living Organism - Kinetic 3D Cover Flow with Framer Motion Physics
 * Features: Idle Breathing, Velocity Tilt, Gamepad Dual-Rumble Haptics, Color Extraction Glow
 * Archivo: core/frontend/src/components/KineticCoverFlow.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { synesthesiaAudio } from '../theme/SynesthesiaAudio';

export interface ConsoleSystem {
  id: string;
  name: string;
  maker: string;
  year: string;
  specs: string;
  img: string;
  dominantColor: string;
  glow: string;
  bgGradient: string;
}

interface KineticCoverFlowProps {
  systems: ConsoleSystem[];
  onSelectSystem?: (system: ConsoleSystem) => void;
  onLaunchSystem?: (system: ConsoleSystem) => void;
}

export const KineticCoverFlow: React.FC<KineticCoverFlowProps> = ({
  systems,
  onSelectSystem,
  onLaunchSystem
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSystem = systems[activeIndex];

  // Físicas elásticas de Inclinación (Velocity Tilt)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 280, damping: 22, mass: 0.9 };
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-24, 24]), springConfig);

  // Háptica: Gamepad Dual-Rumble
  const triggerHapticRumble = (weak = 0.35, strong = 0.1, duration = 45) => {
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

  // Navegación espacial y teclado
  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + systems.length) % systems.length;
    setActiveIndex(nextIdx);
    triggerHapticRumble(0.3, 0.1, 40);
    synesthesiaAudio.playSFX('scroll');
    onSelectSystem?.(systems[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % systems.length;
    setActiveIndex(nextIdx);
    triggerHapticRumble(0.3, 0.1, 40);
    synesthesiaAudio.playSFX('scroll');
    onSelectSystem?.(systems[nextIdx]);
  };

  const handleLaunch = () => {
    triggerHapticRumble(0.8, 0.98, 380); // Impacto fuerte háptico al lanzar
    synesthesiaAudio.playSFX('launch');
    onLaunchSystem?.(activeSystem);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-[520px] flex flex-col items-center justify-center perspective-[1200px] select-none overflow-hidden"
    >
      {/* 1. LUZ AMBIENTAL DINÁMICA POR EXTRACCIÓN DE COLOR */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at 50% 40%, ${activeSystem.glow} 0%, transparent 65%)`
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none filter blur-[110px] opacity-60"
      />

      {/* 2. ESCENARIO COVER FLOW 3D */}
      <div className="relative w-full max-w-[1400px] h-[360px] flex items-center justify-center preserve-3d">
        {systems.map((sys, idx) => {
          const offset = idx - activeIndex;
          const absOffset = Math.abs(offset);
          const isFocused = offset === 0;

          const translateX = offset * 260;
          const translateZ = isFocused ? 140 : -absOffset * 130;
          const rotateY = isFocused ? 0 : offset > 0 ? -38 : 38;
          const opacity = isFocused ? 1 : Math.max(0.25, 1 - absOffset * 0.35);

          return (
            <motion.div
              key={sys.id}
              onClick={() => {
                setActiveIndex(idx);
                triggerHapticRumble(0.35, 0.1, 40);
                synesthesiaAudio.playSFX('click');
                onSelectSystem?.(sys);
              }}
              animate={{
                x: translateX,
                z: translateZ,
                rotateY: rotateY,
                opacity,
                scale: isFocused ? 1.05 : 0.9
              }}
              transition={springConfig}
              style={{
                rotateX: isFocused ? tiltX : 0,
                rotateY: isFocused ? tiltY : rotateY,
                zIndex: 50 - absOffset
              }}
              className={`absolute w-[320px] h-[340px] rounded-[24px] p-6 flex flex-col items-center justify-between cursor-pointer border backdrop-blur-2xl transition-all ${
                isFocused
                  ? 'border-white/90 shadow-[0_30px_80px_rgba(0,0,0,0.6)]'
                  : 'border-white/20 filter blur-[4px] brightness-75'
              }`}
            >
              {/* RESPIRACIÓN CINÉTICA SUTIL EN IDLE */}
              <motion.div
                animate={isFocused ? { y: [0, -8, 0], rotateZ: [0, 0.6, -0.6, 0] } : {}}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full flex flex-col items-center justify-between h-full"
              >
                <span className="text-xs font-mono font-black uppercase tracking-widest text-[var(--accent)]">
                  {sys.maker}
                </span>

                <motion.img
                  src={sys.img}
                  alt={sys.name}
                  className="max-h-[160px] max-w-[90%] object-contain filter drop-shadow-[0_18px_25px_rgba(0,0,0,0.7)]"
                  whileHover={{ scale: 1.12, y: -6 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                />

                <div className="text-center">
                  <h3 className="text-xl font-black text-white tracking-wide">{sys.name}</h3>
                  <p className="text-xs text-white/60 font-mono mt-0.5">{sys.year}</p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. METADATOS Y BOTÓN DE IMPACTO HÁPTICO */}
      <div className="z-20 text-center mt-6">
        <h2 className="text-3xl font-black text-white tracking-wider drop-shadow-lg">
          {activeSystem.name}
        </h2>
        <p className="text-xs font-mono text-white/70 mt-1">{activeSystem.specs}</p>

        <motion.button
          onClick={handleLaunch}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-10 py-3 rounded-full font-black text-sm uppercase tracking-widest text-[#00223a] bg-gradient-to-b from-white to-[var(--accent,#00e8c6)] border-2 border-white shadow-[0_10px_35px_var(--accent-glow)]"
        >
          ▶ INICIAR SISTEMA (HAPTIC IMPACT)
        </motion.button>
      </div>

    </div>
  );
};
