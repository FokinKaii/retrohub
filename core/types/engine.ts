/**
 * RetroHub Commercial AAA Engine - Core TypeScript Definitions
 * Archivo: core/types/engine.ts
 */

export type ControllerType = 'nintendo' | 'xbox' | 'playstation' | 'generic';
export type BoxArtAspectRatio = '1:1' | '2:3' | '3:4' | '16:9' | 'jewel_case' | 'cartridge';
export type WindowMode = 'floating-glass' | 'floating-acrylic' | 'fullscreen' | 'borderless';

export interface LayoutConfig {
  type: 'css-grid';
  gridTemplateAreas: string[];
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gap: string;
  padding: string;
  maxContentWidth: string;
  windowMode: WindowMode;
  borderRadiusWindow: string;
  activeModules: Record<string, {
    enabled: boolean;
    position?: string;
    viewMode?: string;
    [key: string]: any;
  }>;
}

export interface MorphologyConfig {
  borderRadiusGlobal: string;
  buttonStyle: 'jelly-acrylic' | 'smooth-glass' | 'pixel-hard' | 'skeuomorphic' | 'flat-minimal';
  borderStyle: 'solid' | 'outset' | 'inset' | 'double' | 'none';
  borderWidth: string;
  borderLightColor: string;
  borderDarkColor: string;
  surfaceTexture?: string;
  boxShadow: string;
  fontFamilyPrimary: string;
  fontFamilyDisplay: string;
  fontScale: number;
}

export interface ColorPalette {
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
  scanlineColor?: string;
}

export interface ShaderConfig {
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
}

export interface AudioThemeConfig {
  enabled: boolean;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  backgroundMusic?: {
    src: string;
    loop: boolean;
    fadeInDuration: number;
    duckingOnLaunch?: boolean;
  };
  sfx: {
    onHover?: { type: string; frequency?: number; duration?: number; src?: string };
    onClick?: { type: string; frequency?: number; duration?: number; src?: string };
    onEmulatorLaunch?: { type: string; frequency?: number; duration?: number; src?: string };
    onNotification?: { type: string; frequencies?: number[]; duration?: number; src?: string };
    onThemeSwitch?: { type: string; frequency?: number; duration?: number; src?: string };
    [key: string]: any;
  };
}

export interface ThemeConfig {
  $schema?: string;
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  layout: LayoutConfig;
  morphology: MorphologyConfig;
  colors: ColorPalette;
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
  shaders: ShaderConfig;
  cursors: {
    default: string;
    pointer: string;
  };
  audio: AudioThemeConfig;
  defaultController?: ControllerType;
  boxArtFormat?: {
    aspectRatio: BoxArtAspectRatio;
    show3DSpine?: boolean;
    badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

export interface Emulator {
  id: string;
  name: string;
  maker: string;
  year: string;
  arch: string;
  gamesCount: number;
  controllers: string;
  desc: string;
  color: string;
  glow: string;
  secondary: string;
  realImage: string;
  wallpaper: string;
  binaryPath?: string;
  cliArgsTemplate?: string;
  supportedExtensions: string[];
}

export interface Game {
  id: string;
  title: string;
  systemId: string;
  boxArt: string;
  fallbackArt?: string;
  year: string;
  developer: string;
  genre: string;
  rating: number;
  synopsis: string;
  romPath: string;
  crc32?: string;
  sha1?: string;
  activeFriends?: Array<{
    userId: string;
    name: string;
    avatar: string;
  }>;
}

export interface UserPresence {
  userId: string;
  name: string;
  avatar: string;
  status: 'online' | 'playing' | 'idle' | 'offline';
  currentSystem?: string;
  currentGameId?: string;
  currentGameTitle?: string;
  elapsedSeconds?: number;
}

export interface GamepadNavState {
  connected: boolean;
  type: ControllerType;
  focusedIndex: number;
  activeArea: 'carousel' | 'grid' | 'sidebar' | 'dock';
  rawGamepad: Gamepad | null;
}
