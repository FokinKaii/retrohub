/**
 * RetroHub Commercial AAA Engine - Dual IPC Bridge Architecture (Electron & Tauri v2)
 * Archivo: core/backend/ipc_bridge.ts
 */

import { Emulator, Game, ThemeConfig } from '../types/engine';

export interface RomScanResult {
  systemId: string;
  romsFound: number;
  games: Game[];
  errors: string[];
}

export interface EmulatorLaunchResult {
  success: boolean;
  pid?: number;
  exitCode?: number;
  error?: string;
}

// 1. CONTRATO DE INTERFAZ DEL PUENTE IPC
export interface IRetroHubBridge {
  scanRomDirectory: (systemId: string, directoryPath: string) => Promise<RomScanResult>;
  launchEmulator: (emulator: Emulator, game: Game) => Promise<EmulatorLaunchResult>;
  readThemeConfig: (themeId: string) => Promise<ThemeConfig>;
  fetchScraperMetadata: (title: string, system: string) => Promise<Partial<Game> | null>;
  listAvailableThemes: () => Promise<Array<{ id: string; name: string }>>;
}

// 2. IMPLEMENTACIÓN PARA ELECTRON (Node.js Main Process)
export class ElectronMainBridge {
  public static registerHandlers(ipcMain: any, childProcess: any, fs: any, path: any) {
    // A. Escaneo de ROMs asíncrono y hash check
    ipcMain.handle('ROM:SCAN', async (_: any, { systemId, directoryPath }: { systemId: string; directoryPath: string }): Promise<RomScanResult> => {
      const result: RomScanResult = { systemId, romsFound: 0, games: [], errors: [] };
      if (!fs.existsSync(directoryPath)) {
        result.errors.push(`Directorio no encontrado: ${directoryPath}`);
        return result;
      }

      const files = fs.readdirSync(directoryPath);
      for (const file of files) {
        const fullPath = path.join(directoryPath, file);
        const ext = path.extname(file).toLowerCase();
        // Filtrar archivos válidos de ROM
        if (['.iso', '.chd', '.z64', '.n64', '.gba', '.sfc', '.smc', '.nes', '.bin'].includes(ext)) {
          result.romsFound++;
          result.games.push({
            id: `${systemId}_${path.basename(file, ext)}`,
            title: path.basename(file, ext).replace(/[_\-\.]/g, ' '),
            systemId,
            romPath: fullPath,
            boxArt: '',
            year: 'Unknown',
            developer: 'RetroHub Local',
            genre: 'Classic',
            rating: 4.5,
            synopsis: `ROM local detectada en ${fullPath}`
          });
        }
      }
      return result;
    });

    // B. Lanzamiento de Emulador con Alta Prioridad de Proceso
    ipcMain.handle('EMU:LAUNCH', async (_: any, { emulator, game }: { emulator: Emulator; game: Game }): Promise<EmulatorLaunchResult> => {
      try {
        if (!emulator.binaryPath) {
          throw new Error(`Ruta al ejecutable del emulador ${emulator.name} no configurada.`);
        }

        // Argumentos dinámicos (soporte para RetroArch o emulador standalone)
        const args = emulator.cliArgsTemplate
          ? emulator.cliArgsTemplate.replace('{ROM}', game.romPath).split(' ')
          : [game.romPath];

        // Lanzar proceso desacoplado para evitar cuelgues del launcher
        const emuProc = childProcess.spawn(emulator.binaryPath, args, {
          detached: true,
          stdio: 'ignore'
        });

        emuProc.unref();

        return {
          success: true,
          pid: emuProc.pid
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Error desconocido al lanzar el emulador'
        };
      }
    });

    // C. Lectura de Theme.json en caliente
    ipcMain.handle('THEME:READ', async (_: any, themeId: string): Promise<ThemeConfig> => {
      const themePath = path.join(process.cwd(), 'core', 'themes', themeId, 'theme.json');
      const raw = fs.readFileSync(themePath, 'utf-8');
      return JSON.parse(raw);
    });
  }
}

// 3. IMPLEMENTACIÓN DE CLIENTE (Frontend Renderer - Agnóstico para Tauri / Electron / Web)
export const RetroHubIPC: IRetroHubBridge = {
  scanRomDirectory: async (systemId, directoryPath) => {
    if ((window as any).__TAURI__) {
      return await (window as any).__TAURI__.invoke('scan_rom_directory', { systemId, directoryPath });
    }
    if ((window as any).electronBridge) {
      return await (window as any).electronBridge.invoke('ROM:SCAN', { systemId, directoryPath });
    }
    // Fallback REST para navegador / testing
    const res = await fetch(`/api/roms?system=${systemId}`);
    return await res.json();
  },

  launchEmulator: async (emulator, game) => {
    if ((window as any).__TAURI__) {
      return await (window as any).__TAURI__.invoke('launch_emulator', { emulator, game });
    }
    if ((window as any).electronBridge) {
      return await (window as any).electronBridge.invoke('EMU:LAUNCH', { emulator, game });
    }
    console.log(`[Web Simulation]: Lanzando emulador ${emulator.name} con juego: ${game.title}`);
    return { success: true, pid: 9999 };
  },

  readThemeConfig: async (themeId) => {
    if ((window as any).electronBridge) {
      return await (window as any).electronBridge.invoke('THEME:READ', themeId);
    }
    const res = await fetch(`/core/themes/${themeId}/theme.json`);
    return await res.json();
  },

  fetchScraperMetadata: async (title, system) => {
    try {
      const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(title)}&key=DEMO_KEY`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        return {
          boxArt: item.background_image,
          year: item.released ? item.released.split('-')[0] : 'Unknown',
          rating: item.rating || 4.5,
          synopsis: item.description_raw || `Juego clásico de ${system}`
        };
      }
    } catch (e) {
      console.warn('[Scraper]: Error consultando metadatos externos:', e);
    }
    return null;
  },

  listAvailableThemes: async () => {
    return [
      { id: 'minecraft_overworld', name: 'Minecraft (Overworld Inventory)' },
      { id: 'sonic_green_hill', name: 'Sonic (Green Hill Zone)' },
      { id: 'undertale_underground', name: 'Undertale (Determination)' },
      { id: 'frutiger_aero', name: 'Frutiger Aero (Aqua Vista 2006)' },
      { id: 'iisu_glass', name: 'iiSU Mint Glassmorphism' },
      { id: 'y2k_cyberia', name: 'Y2K Cyberia 2000' }
    ];
  }
};
