/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './game/GameConfig';
import { soundSynth } from './game/audio/SoundSynthesizer';
import { getStoredSettings, saveStoredSettings, subscribeSettings, GameSettings } from './game/settings';
import { Volume2, VolumeX, Maximize2, Shield, Sparkles } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = subscribeSettings((updated) => {
      setSettings({ ...updated });
    });

    // Initialize Phaser 3 game
    if (containerRef.current && !gameRef.current) {
      const config = createGameConfig(containerRef.current);
      gameRef.current = new Phaser.Game(config);

      // Refresh scale after initial DOM paint to ensure perfect centering in iframes
      setTimeout(() => {
        if (gameRef.current?.scale) {
          gameRef.current.scale.refresh();
        }
      }, 100);
    }

    // Window resize handler
    const handleResize = () => {
      if (gameRef.current?.scale) {
        gameRef.current.scale.refresh();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Prevent default gesture bouncing on mobile
    const preventTouch = (e: TouchEvent) => {
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('touchmove', preventTouch);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    const nextState = !(settings.sfxEnabled && settings.musicEnabled);
    const updated: GameSettings = {
      ...settings,
      sfxEnabled: nextState,
      musicEnabled: nextState,
    };
    saveStoredSettings(updated);
    if (nextState) {
      soundSynth.unlockAudio();
      soundSynth.playConfirm();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#05070e] flex flex-col items-center justify-center select-none text-slate-100 font-sans">
      {/* Desktop Arcade Frame Container */}
      <div className="relative w-full h-full max-w-[440px] max-h-[820px] sm:max-h-[760px] md:max-h-[800px] flex flex-col items-center justify-between sm:border sm:border-[#1e2345] sm:rounded-2xl sm:shadow-[0_0_50px_rgba(0,240,255,0.12)] bg-[#070915] sm:p-2 sm:my-auto">
        
        {/* Subtle Top Arcade Bezel Header (visible on tablets/desktop) */}
        <header className="w-full hidden sm:flex items-center justify-between px-3 py-1.5 border-b border-[#181c38] text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 tracking-wide text-[11px]">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '8px' }}>PIXEL REALMS</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title={settings.sfxEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="p-1.5 rounded hover:bg-[#181c38] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {settings.sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-1.5 rounded hover:bg-[#181c38] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Phaser 3 Viewport Canvas Container */}
        <main
          id="phaser-game-container"
          ref={containerRef}
          className="relative w-full h-full flex-1 min-h-0 min-w-0 flex items-center justify-center overflow-hidden touch-none"
          style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }}
        />

        {/* Bottom Arcade Bezel Sub-bar (hidden on pure mobile to maximize screen) */}
        <footer className="w-full hidden sm:flex items-center justify-between px-3 py-1 text-[9px] text-slate-500 border-t border-[#141830]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Part 1 Foundation
          </span>
          <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '7px' }}>
            PORTRAIT 390x640
          </span>
        </footer>
      </div>
    </div>
  );
}
