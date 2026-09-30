/**
 * Himawari Cinematic Launcher - ThemeProvider & Hybrid Layout Context
 * Stack: React 19 + TypeScript + Framer Motion (useMotionValue) + Spatial Audio
 * Archivo: core/frontend/src/theme/HimawariContext.tsx
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';
import { himawariAudio } from './HimawariAudio';
import { ButtonSkinType } from '../components/ThemeButton';
import { ParallaxLayerConfig } from '../components/ParallaxBackground';

export interface HimawariTheme {
  id: string;
  name: string;
  parallax: ParallaxLayerConfig[];
  morfology: {
    buttonSkin: ButtonSkinType;
    borderRadiusGlobal: string;
    boxShadow: string;
    fontPrimary: string;
    fontDisplay: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    accentGlow: string;
    hudSurface: string;
    hudBorder: string;
    textMain: string;
    textMuted: string;
    vignetteColor: string;
  };
  audio: {
    enabled: boolean;
    spatialPanning: boolean;
    panStrength: number;
    masterVolume: number;
    sfx: Record<string, any>;
  };
}

interface HimawariContextType {
  theme: HimawariTheme | null;
  activeThemeId: string;
  buttonSkin: ButtonSkinType;
  scrollInertia: MotionValue<number>;
  switchTheme: (themeId: string) => Promise<void>;
  playSFX: (name: 'ui_move' | 'ui_select' | 'social_notify' | 'ui_launch', dir?: 'left' | 'right' | 'center') => void;
}

const HimawariContext = createContext<HimawariContextType | null>(null);

export const HimawariProvider: React.FC<{ children: React.ReactNode; defaultThemeId?: string }> = ({
  children,
  defaultThemeId = 'sonic_green_hill'
}) => {
  const [theme, setTheme] = useState<HimawariTheme | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string>(defaultThemeId);
  const scrollInertia = useMotionValue(0);

  const applyThemeToDOM = (t: HimawariTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--himawari-primary', t.colors.primary);
    root.style.setProperty('--himawari-secondary', t.colors.secondary);
    root.style.setProperty('--himawari-accent', t.colors.accent);
    root.style.setProperty('--himawari-accent-glow', t.colors.accentGlow);
    root.style.setProperty('--himawari-hud-surface', t.colors.hudSurface);
    root.style.setProperty('--himawari-hud-border', t.colors.hudBorder);
    root.style.setProperty('--himawari-text-main', t.colors.textMain);
    root.style.setProperty('--himawari-text-muted', t.colors.textMuted);
    root.style.setProperty('--himawari-font-primary', t.morfology.fontPrimary);
    root.style.setProperty('--himawari-font-display', t.morfology.fontDisplay);

    // Precargar rutas de audio locales
    if (t.audio?.sfx) {
      for (const soundDef of Object.values(t.audio.sfx)) {
        if (soundDef.src) {
          himawariAudio.preloadSound(soundDef.src);
        }
      }
    }
  };

  const loadTheme = async (themeId: string) => {
    try {
      const res = await fetch(`/api/theme/${themeId}`);
      if (res.ok) {
        const data = await res.json();
        setTheme(data);
        setActiveThemeId(themeId);
        applyThemeToDOM(data);
      }
    } catch (e) {
      console.warn(`[HimawariContext] Error cargando tema ${themeId}:`, e);
    }
  };

  const switchTheme = async (themeId: string) => {
    himawariAudio.playSpatialSFX('ui_select', 'center');
    await loadTheme(themeId);
  };

  const playSFX = (name: 'ui_move' | 'ui_select' | 'social_notify' | 'ui_launch', dir: 'left' | 'right' | 'center' = 'center') => {
    const sfxDef = theme?.audio?.sfx?.[name];
    himawariAudio.playSpatialSFX(name, dir, sfxDef);
  };

  useEffect(() => {
    loadTheme(activeThemeId);
  }, []);

  return (
    <HimawariContext.Provider
      value={{
        theme,
        activeThemeId,
        buttonSkin: theme?.morfology?.buttonSkin || 'sonic_capsule',
        scrollInertia,
        switchTheme,
        playSFX
      }}
    >
      {children}
    </HimawariContext.Provider>
  );
};

export const useHimawari = () => {
  const ctx = useContext(HimawariContext);
  if (!ctx) {
    throw new Error('useHimawari debe usarse dentro de un HimawariProvider');
  }
  return ctx;
};
