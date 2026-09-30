/**
 * RetroHub Commercial AAA Engine - Native Gamepad Spatial Navigation Hook
 * Stack: Web Gamepad API + 2D Spatial Grid Mapping + Dynamic Button Prompts
 * Archivo: core/frontend/src/hooks/useGamepad.ts
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ControllerType, GamepadNavState } from '../../types/engine';

interface UseGamepadOptions {
  itemCount: number;
  columns?: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  onPageNext?: () => void;
  onPagePrev?: () => void;
  deadzone?: number;
  cooldownMs?: number;
}

export interface ButtonPrompt {
  action: string;
  glyph: string;
  color: string;
}

export const CONTROLLER_GLYPHS: Record<ControllerType, Record<string, ButtonPrompt>> = {
  xbox: {
    select: { action: 'Seleccionar', glyph: 'A', color: '#107c10' },
    back: { action: 'Atrás', glyph: 'B', color: '#d83b01' },
    extra: { action: 'Opciones', glyph: 'Y', color: '#ffb900' },
    menu: { action: 'Menú', glyph: '≡', color: '#2f3542' }
  },
  playstation: {
    select: { action: 'Seleccionar', glyph: '✕', color: '#003087' },
    back: { action: 'Atrás', glyph: '◯', color: '#e60012' },
    extra: { action: 'Opciones', glyph: '△', color: '#00a4e4' },
    menu: { action: 'Menú', glyph: 'OPTIONS', color: '#2f3542' }
  },
  nintendo: {
    select: { action: 'Seleccionar', glyph: 'A', color: '#e60012' },
    back: { action: 'Atrás', glyph: 'B', color: '#f39c12' },
    extra: { action: 'Opciones', glyph: 'Y', color: '#00d2d3' },
    menu: { action: 'Menú', glyph: '+', color: '#2f3542' }
  },
  generic: {
    select: { action: 'Seleccionar', glyph: '1', color: '#333333' },
    back: { action: 'Atrás', glyph: '2', color: '#666666' },
    extra: { action: 'Opciones', glyph: '3', color: '#999999' },
    menu: { action: 'Menú', glyph: 'START', color: '#000000' }
  }
};

export function useGamepad({
  itemCount,
  columns = 4,
  onSelect,
  onBack,
  onPageNext,
  onPagePrev,
  deadzone = 0.45,
  cooldownMs = 180
}: UseGamepadOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [controllerType, setControllerType] = useState<ControllerType>('nintendo');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const lastActionTime = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  // Detección automática del modelo de mando por su ID string
  const detectControllerType = useCallback((id: string): ControllerType => {
    const lower = id.toLowerCase();
    if (lower.includes('xbox') || lower.includes('x-box') || lower.includes('microsoft')) {
      return 'xbox';
    }
    if (lower.includes('dualshock') || lower.includes('dualsense') || lower.includes('sony') || lower.includes('playstation')) {
      return 'playstation';
    }
    if (lower.includes('nintendo') || lower.includes('joy-con') || lower.includes('pro controller') || lower.includes('switch')) {
      return 'nintendo';
    }
    return 'generic';
  }, []);

  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

    if (!gp) {
      if (isConnected) setIsConnected(false);
      rafId.current = requestAnimationFrame(pollGamepad);
      return;
    }

    if (!isConnected) {
      setIsConnected(true);
      setControllerType(detectControllerType(gp.id));
    }

    const now = Date.now();
    if (now - lastActionTime.current > cooldownMs) {
      // D-Pad y Sticks Analógicos
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;

      const dpadUp = gp.buttons[12]?.pressed;
      const dpadDown = gp.buttons[13]?.pressed;
      const dpadLeft = gp.buttons[14]?.pressed;
      const dpadRight = gp.buttons[15]?.pressed;

      // 1. Movimiento Espacial 2D
      if (dpadRight || axisX > deadzone) {
        setFocusedIndex(prev => Math.min(itemCount - 1, prev + 1));
        lastActionTime.current = now;
      } else if (dpadLeft || axisX < -deadzone) {
        setFocusedIndex(prev => Math.max(0, prev - 1));
        lastActionTime.current = now;
      } else if (dpadDown || axisY > deadzone) {
        setFocusedIndex(prev => Math.min(itemCount - 1, prev + columns));
        lastActionTime.current = now;
      } else if (dpadUp || axisY < -deadzone) {
        setFocusedIndex(prev => Math.max(0, prev - columns));
        lastActionTime.current = now;
      }

      // 2. Botón Select (A en Xbox/Nintendo, X en PS)
      if (gp.buttons[0]?.pressed) {
        onSelect?.(focusedIndex);
        lastActionTime.current = now + 100;
      }

      // 3. Botón Back (B en Xbox/Nintendo, O en PS)
      if (gp.buttons[1]?.pressed) {
        onBack?.();
        lastActionTime.current = now + 100;
      }

      // 4. Gatillos L1/R1 o L2/R2 para paginación rápida
      if (gp.buttons[4]?.pressed || gp.buttons[6]?.pressed) {
        onPagePrev?.();
        lastActionTime.current = now + 150;
      }
      if (gp.buttons[5]?.pressed || gp.buttons[7]?.pressed) {
        onPageNext?.();
        lastActionTime.current = now + 150;
      }
    }

    rafId.current = requestAnimationFrame(pollGamepad);
  }, [columns, cooldownMs, deadzone, detectControllerType, focusedIndex, isConnected, itemCount, onBack, onPageNext, onPagePrev, onSelect]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', (e: any) => {
      setIsConnected(true);
      setControllerType(detectControllerType(e.gamepad.id));
    });
    window.addEventListener('gamepaddisconnected', () => {
      setIsConnected(false);
    });

    rafId.current = requestAnimationFrame(pollGamepad);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [detectControllerType, pollGamepad]);

  return {
    focusedIndex,
    setFocusedIndex,
    controllerType,
    isConnected,
    buttonPrompts: CONTROLLER_GLYPHS[controllerType]
  };
}
