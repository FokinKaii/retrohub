/**
 * Himawari Cinematic Launcher - Multilayer Parallax Background Engine
 * Stack: React 19 + Framer Motion + Kinetic Inertia Layers + Edge Vignetting
 * Archivo: core/frontend/src/components/ParallaxBackground.tsx
 */

import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

export interface ParallaxLayerConfig {
  id: string;
  name: string;
  src: string;
  speedFactor: number;
  blur?: number;
  opacity?: number;
}

interface ParallaxBackgroundProps {
  layers: ParallaxLayerConfig[];
  scrollX: MotionValue<number>;
  vignetteGradient?: string;
  ambientGlowColor?: string;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  layers,
  scrollX,
  vignetteGradient = 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(3, 8, 20, 0.92) 100%)',
  ambientGlowColor = 'rgba(0, 85, 255, 0.4)'
}) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. RENDERIZADO DE CAPAS PARALLAX MULTINIVEL */}
      {layers.map((layer) => {
        // Desplazamiento reactivo proporcional al speedFactor
        const x = useTransform(scrollX, (val) => -val * layer.speedFactor);

        return (
          <motion.div
            key={layer.id}
            style={{
              x,
              filter: layer.blur ? `blur(${layer.blur}px)` : 'none',
              opacity: layer.opacity ?? 1.0,
              backgroundImage: `url(${layer.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="absolute inset-y-0 -left-[20%] -right-[20%] w-[140%] h-full will-change-transform"
          />
        );
      })}

      {/* 2. AURA AMBIENTAL REACTIVA (GLOW CENTRADO) */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none filter blur-[90px] opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${ambientGlowColor} 0%, transparent 65%)`
        }}
      />

      {/* 3. VIÑETEADO OSCURO (EDGE VIGNETTING PARA FUSIÓN CON HUD DE CRISTAL) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: vignetteGradient }}
      />

    </div>
  );
};
