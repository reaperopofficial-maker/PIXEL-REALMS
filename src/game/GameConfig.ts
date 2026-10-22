import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { IntroScene } from './scenes/IntroScene';
import { AdventurePreviewScene } from './scenes/AdventurePreviewScene';
import { SettingsScene } from './scenes/SettingsScene';
import { AboutScene } from './scenes/AboutScene';
import { BattleScene } from './scenes/BattleScene';
import { InventoryScene } from './scenes/InventoryScene';

export function createGameConfig(container: string | HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: container,
    width: 390,
    height: 640,
    backgroundColor: '#05070e',
    pixelArt: true,
    antialias: false,
    antialiasGL: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 390,
      height: 640,
    },
    scene: [
      BootScene,
      MenuScene,
      IntroScene,
      AdventurePreviewScene,
      BattleScene,
      InventoryScene,
      SettingsScene,
      AboutScene,
    ],
    audio: {
      noAudio: true, // We use custom high-performance Web Audio API synth
    },
    input: {
      touch: {
        capture: true,
      },
    },
  };
}
