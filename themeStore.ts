/**
 * iiSU Network - Absolute Theme Engine State Architecture
 * Stack: React + TypeScript + Zustand + CSS Tokens Engine
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ControllerType = 'nintendo' | 'xbox' | 'playstation';

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  accentGlow: string;
  textMain: string;
  textMuted: string;
  textOnAccent: string;
  glassBg: string;
  glassSidebar: string;
  glassCard: string;
  glassBorder: string;
  blurIntensity: number; // in pixels
  radiusWindow: number;  // in pixels
  radiusGlobal: number;  // in pixels
  fontPrimary: string;
  fontDisplay: string;
  bgType: 'gradient' | 'image' | 'video';
  bgSource: string;
  bgOverlayOpacity: number;
  bgOverlayColor: string;
  brandTitle: string;
  brandSub: string;
  brandIcon: string;
  defaultController: ControllerType;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  mint: {
    id: 'mint',
    name: 'iiSU Mint Pearl',
    primary: '#10ac84',
    secondary: '#00d2d3',
    accent: '#1dd1a1',
    accentGlow: 'rgba(29, 209, 161, 0.45)',
    textMain: '#0f172a',
    textMuted: '#475569',
    textOnAccent: '#ffffff',
    glassBg: 'rgba(255, 255, 255, 0.72)',
    glassSidebar: 'rgba(255, 255, 255, 0.45)',
    glassCard: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.85)',
    blurIntensity: 16,
    radiusWindow: 32,
    radiusGlobal: 22,
    fontPrimary: "'Outfit', sans-serif",
    fontDisplay: "'Space Grotesk', sans-serif",
    bgType: 'gradient',
    bgSource: 'linear-gradient(135deg, #78ffd6 0%, #a8ff78 40%, #00d2d3 80%, #54a0ff 100%)',
    bgOverlayOpacity: 0.15,
    bgOverlayColor: '#ffffff',
    brandTitle: 'iiSU',
    brandSub: 'Network OS',
    brandIcon: '🎮',
    defaultController: 'nintendo'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk PS5',
    primary: '#00f2fe',
    secondary: '#4facfe',
    accent: '#ff007f',
    accentGlow: 'rgba(255, 0, 127, 0.5)',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    textOnAccent: '#ffffff',
    glassBg: 'rgba(15, 23, 42, 0.76)',
    glassSidebar: 'rgba(30, 41, 59, 0.65)',
    glassCard: 'rgba(30, 41, 59, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    blurIntensity: 26,
    radiusWindow: 18,
    radiusGlobal: 14,
    fontPrimary: "'Rajdhani', sans-serif",
    fontDisplay: "'Space Grotesk', sans-serif",
    bgType: 'gradient',
    bgSource: 'radial-gradient(circle at 70% 30%, #4a00e0 0%, #8e2de2 50%, #090a1a 100%)',
    bgOverlayOpacity: 0.45,
    bgOverlayColor: '#05060f',
    brandTitle: 'CYBER',
    brandSub: 'Matrix OS',
    brandIcon: '⚡',
    defaultController: 'playstation'
  },
  switch_oled: {
    id: 'switch_oled',
    name: 'Switch OLED Crimson',
    primary: '#e60012',
    secondary: '#0abde3',
    accent: '#e60012',
    accentGlow: 'rgba(230, 0, 18, 0.5)',
    textMain: '#ffffff',
    textMuted: '#a4b0be',
    textOnAccent: '#ffffff',
    glassBg: 'rgba(24, 24, 28, 0.82)',
    glassSidebar: 'rgba(38, 38, 44, 0.7)',
    glassCard: 'rgba(38, 38, 44, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    blurIntensity: 20,
    radiusWindow: 28,
    radiusGlobal: 20,
    fontPrimary: "'Outfit', sans-serif",
    fontDisplay: "'Space Grotesk', sans-serif",
    bgType: 'gradient',
    bgSource: 'linear-gradient(135deg, #2c3e50 0%, #000000 60%, #e60012 140%)',
    bgOverlayOpacity: 0.5,
    bgOverlayColor: '#000000',
    brandTitle: 'SWITCH',
    brandSub: 'OLED Suite',
    brandIcon: '🔴',
    defaultController: 'nintendo'
  },
  famicom: {
    id: 'famicom',
    name: 'Famicom 80s',
    primary: '#8b0000',
    secondary: '#d4af37',
    accent: '#8b0000',
    accentGlow: 'rgba(139, 0, 0, 0.4)',
    textMain: '#1a1a1a',
    textMuted: '#595959',
    textOnAccent: '#ffffff',
    glassBg: 'rgba(245, 240, 230, 0.9)',
    glassSidebar: 'rgba(235, 226, 210, 0.8)',
    glassCard: 'rgba(255, 252, 245, 0.95)',
    glassBorder: 'rgba(139, 0, 0, 0.3)',
    blurIntensity: 8,
    radiusWindow: 8,
    radiusGlobal: 6,
    fontPrimary: "'Outfit', sans-serif",
    fontDisplay: "'Press Start 2P', monospace",
    bgType: 'gradient',
    bgSource: 'linear-gradient(135deg, #d3cbb8 0%, #6d6027 100%)',
    bgOverlayOpacity: 0.2,
    bgOverlayColor: '#000000',
    brandTitle: 'FC-83',
    brandSub: 'Family Computer',
    brandIcon: '👾',
    defaultController: 'nintendo'
  }
};

interface ThemeState {
  currentTheme: ThemeConfig;
  controller: ControllerType;
  setPreset: (presetId: string) => void;
  setBlurIntensity: (val: number) => void;
  setBorderRadius: (val: number) => void;
  setOverlayOpacity: (val: number) => void;
  setController: (type: ControllerType) => void;
  updateCustomColor: (key: 'primary' | 'secondary' | 'accent', color: string) => void;
}

// Inyección de tokens en el DOM sin re-renderizado costoso
export const injectThemeCSSVariables = (theme: ThemeConfig) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--secondary-color', theme.secondary);
  root.style.setProperty('--accent-color', theme.accent);
  root.style.setProperty('--accent-glow', theme.accentGlow);
  root.style.setProperty('--text-main', theme.textMain);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--text-on-accent', theme.textOnAccent);
  root.style.setProperty('--glass-bg', theme.glassBg);
  root.style.setProperty('--glass-sidebar', theme.glassSidebar);
  root.style.setProperty('--glass-card', theme.glassCard);
  root.style.setProperty('--glass-border', theme.glassBorder);
  root.style.setProperty('--glass-blur-intensity', `${theme.blurIntensity}px`);
  root.style.setProperty('--border-radius-window', `${theme.radiusWindow}px`);
  root.style.setProperty('--border-radius-global', `${theme.radiusGlobal}px`);
  root.style.setProperty('--font-primary', theme.fontPrimary);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--bg-overlay-opacity', `${theme.bgOverlayOpacity}`);
  root.style.setProperty('--bg-overlay-color', theme.bgOverlayColor);
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: THEME_PRESETS.mint,
      controller: 'nintendo',

      setPreset: (presetId: string) => {
        const selected = THEME_PRESETS[presetId];
        if (!selected) return;
        injectThemeCSSVariables(selected);
        set({ currentTheme: selected, controller: selected.defaultController });
      },

      setBlurIntensity: (val: number) => {
        const updated = { ...get().currentTheme, blurIntensity: val };
        injectThemeCSSVariables(updated);
        set({ currentTheme: updated });
      },

      setBorderRadius: (val: number) => {
        const updated = { ...get().currentTheme, radiusGlobal: val };
        injectThemeCSSVariables(updated);
        set({ currentTheme: updated });
      },

      setOverlayOpacity: (val: number) => {
        const updated = { ...get().currentTheme, bgOverlayOpacity: val };
        injectThemeCSSVariables(updated);
        set({ currentTheme: updated });
      },

      setController: (type: ControllerType) => {
        set({ controller: type });
      },

      updateCustomColor: (key, color) => {
        const theme = get().currentTheme;
        const updated = {
          ...theme,
          [key]: color,
          ...(key === 'accent' ? { accentGlow: `${color}66` } : {})
        };
        injectThemeCSSVariables(updated);
        set({ currentTheme: updated });
      }
    }),
    {
      name: 'iisu-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.currentTheme) {
          injectThemeCSSVariables(state.currentTheme);
        }
      }
    }
  )
);
