/**
 * RetroHub - Core Agnostic Theme Provider & State Manager
 * Stack: React 19 + TypeScript + CSS Token Injection + Soundscape Engine
 * Archivo: ThemeContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundEngine, ThemeAudioConfig } from './SoundEngine';

export interface ThemeSchema {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  layout: {
    type: 'css-grid';
    gridTemplateAreas: string[];
    gridTemplateColumns: string;
    gridTemplateRows: string;
    gap: string;
    padding: string;
    maxContentWidth: string;
    windowMode: string;
    borderRadiusWindow: string;
    activeModules: Record<string, { enabled: boolean; [key: string]: any }>;
  };
  morphology: {
    borderRadiusGlobal: string;
    buttonStyle: string;
    borderStyle: string;
    borderWidth: string;
    borderLightColor: string;
    borderDarkColor: string;
    surfaceTexture: string;
    boxShadow: string;
    fontFamilyPrimary: string;
    fontFamilyDisplay: string;
    fontScale: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    accentGlow: string;
    surface: string;
    surfaceGlass: string;
    surfaceHighlight: string;
    textMain: string;
    textMuted: string;
    textInverted: string;
    scanlineColor: string;
  };
  background: {
    type: 'composite' | 'gradient' | 'video' | 'image';
    videoSource?: string;
    fallbackImage?: string;
    cssGradient?: string;
    patternOverlay?: string;
    patternSize?: string;
    backdropBlur: string;
    overlayOpacity: number;
    overlayColor: string;
  };
  shaders: {
    crtEffect: {
      enabled: boolean;
      scanlines?: boolean;
      scanlineFrequency?: number;
      barrelCurvature?: number;
      chromaticAberration?: number;
      phosphorGlow?: boolean;
      vignette?: number;
      flicker?: number;
    };
    filmGrain?: {
      enabled: boolean;
      intensity: number;
    };
  };
  cursors: {
    default: string;
    pointer: string;
  };
  audio: ThemeAudioConfig;
}

interface ThemeContextType {
  theme: ThemeSchema | null;
  isLoading: boolean;
  activeThemeId: string;
  availableThemes: Array<{ id: string; name: string; description: string; active: boolean }>;
  switchTheme: (themeId: string) => Promise<void>;
  toggleShader: (shaderName: 'crt' | 'grain') => void;
  playSFX: (name: 'onHover' | 'onClick' | 'onLaunchGame' | 'onNotification' | 'onThemeSwitch') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialThemeId?: string }> = ({
  children,
  initialThemeId = 'y2k_cyberia'
}) => {
  const [theme, setTheme] = useState<ThemeSchema | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<string>(initialThemeId);
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inyección de variables CSS y estado sensorial
  const applyThemeToDOM = useCallback((newTheme: ThemeSchema) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Colores y Superficies
    root.style.setProperty('--theme-primary', newTheme.colors.primary);
    root.style.setProperty('--theme-secondary', newTheme.colors.secondary);
    root.style.setProperty('--theme-accent', newTheme.colors.accent);
    root.style.setProperty('--theme-accent-glow', newTheme.colors.accentGlow);
    root.style.setProperty('--theme-surface', newTheme.colors.surface);
    root.style.setProperty('--theme-surface-glass', newTheme.colors.surfaceGlass);
    root.style.setProperty('--theme-surface-highlight', newTheme.colors.surfaceHighlight);
    root.style.setProperty('--theme-text-main', newTheme.colors.textMain);
    root.style.setProperty('--theme-text-muted', newTheme.colors.textMuted);
    root.style.setProperty('--theme-text-inverted', newTheme.colors.textInverted);

    // 2. Morfología y Bordes 3D / Acrílico
    root.style.setProperty('--theme-border-radius-window', newTheme.layout.borderRadiusWindow);
    root.style.setProperty('--theme-border-radius-global', newTheme.morphology.borderRadiusGlobal);
    root.style.setProperty('--theme-border-width', newTheme.morphology.borderWidth);
    root.style.setProperty('--theme-border-style', newTheme.morphology.borderStyle);
    root.style.setProperty('--theme-border-light', newTheme.morphology.borderLightColor);
    root.style.setProperty('--theme-border-dark', newTheme.morphology.borderDarkColor);
    root.style.setProperty('--theme-surface-texture', newTheme.morphology.surfaceTexture);
    root.style.setProperty('--theme-box-shadow', newTheme.morphology.boxShadow);
    root.style.setProperty('--theme-font-primary', newTheme.morphology.fontFamilyPrimary);
    root.style.setProperty('--theme-font-display', newTheme.morphology.fontFamilyDisplay);

    // 3. Fondos y Desenfoque
    root.style.setProperty('--theme-backdrop-blur', newTheme.background.backdropBlur);
    root.style.setProperty('--theme-overlay-opacity', `${newTheme.background.overlayOpacity}`);
    root.style.setProperty('--theme-overlay-color', newTheme.background.overlayColor);
    if (newTheme.background.patternOverlay) {
      root.style.setProperty('--theme-pattern-overlay', newTheme.background.patternOverlay);
      root.style.setProperty('--theme-pattern-size', newTheme.background.patternSize || '20px 20px');
    }

    // 4. Cursores Custom
    document.body.style.cursor = newTheme.cursors.default;
    root.style.setProperty('--theme-cursor-default', newTheme.cursors.default);
    root.style.setProperty('--theme-cursor-pointer', newTheme.cursors.pointer);

    // 5. Configurar Soundscape Engine
    if (newTheme.audio) {
      soundEngine.configure(newTheme.audio);
    }
  }, []);

  // Carga de tema por API o JSON local
  const loadTheme = useCallback(async (themeId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/theme/active?t=${Date.now()}`);
      let data: ThemeSchema;
      if (response.ok) {
        data = await response.json();
      } else {
        // Fallback local a carpeta themes
        const fallbackRes = await fetch(`/core/themes/${themeId}/theme.json`);
        data = await fallbackRes.json();
      }

      setTheme(data);
      setActiveThemeId(data.id || themeId);
      applyThemeToDOM(data);
    } catch (err) {
      console.error("[ThemeProvider] Error cargando tema:", err);
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeToDOM]);

  const switchTheme = async (themeId: string) => {
    soundEngine.playSFX('onThemeSwitch');
    try {
      await fetch(`/api/theme/set?id=${themeId}`);
    } catch (e) {}
    await loadTheme(themeId);
  };

  const toggleShader = (shaderName: 'crt' | 'grain') => {
    if (!theme) return;
    const updated = { ...theme };
    if (shaderName === 'crt') {
      updated.shaders.crtEffect.enabled = !updated.shaders.crtEffect.enabled;
    }
    setTheme(updated);
  };

  const playSFX = (name: 'onHover' | 'onClick' | 'onLaunchGame' | 'onNotification' | 'onThemeSwitch') => {
    soundEngine.playSFX(name);
  };

  // Inicialización y escucha de Hot Module Reloading
  useEffect(() => {
    loadTheme(activeThemeId);

    // Polling ligero para lista de temas
    fetch('/api/themes')
      .then(res => res.json())
      .then(data => setAvailableThemes(data))
      .catch(() => {});
  }, [loadTheme, activeThemeId]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLoading,
        activeThemeId,
        availableThemes,
        switchTheme,
        toggleShader,
        playSFX
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeEngine = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeEngine debe usarse dentro de un ThemeProvider');
  }
  return context;
};
