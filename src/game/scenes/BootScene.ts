import Phaser from 'phaser';
import { PixelArtTextures } from '../graphics/PixelArtTextures';
import { BattleTextures } from '../graphics/BattleTextures';
import { InventoryTextures } from '../graphics/InventoryTextures';
import { soundSynth } from '../audio/SoundSynthesizer';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    // Generate all procedural pixel textures into Phaser's Texture Manager
    PixelArtTextures.generateAll(this);
    BattleTextures.generateAll(this);
    InventoryTextures.generateAll(this);

    // Create Hero Idle Animation (Menu)
    if (!this.anims.exists('hero_idle')) {
      this.anims.create({
        key: 'hero_idle',
        frames: this.anims.generateFrameNumbers('hero_idle_sheet', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Create Torch Flame Animation
    if (!this.anims.exists('torch_flame')) {
      this.anims.create({
        key: 'torch_flame',
        frames: this.anims.generateFrameNumbers('torch_sheet', { start: 0, end: 3 }),
        frameRate: 7,
        repeat: -1,
      });
    }

    // Register Enemy Idle Animations
    const enemySheets = ['slime', 'skeleton', 'gargoyle', 'necromancer', 'boss'];
    enemySheets.forEach((name) => {
      if (!this.anims.exists(`${name}_idle`)) {
        this.anims.create({
          key: `${name}_idle`,
          frames: this.anims.generateFrameNumbers(`${name}_sheet`, { start: 0, end: 1 }),
          frameRate: 3,
          repeat: -1,
        });
      }
    });

    // Try starting atmospheric wind sound if user has enabled it
    this.input.once('pointerdown', () => {
      soundSynth.unlockAudio();
      soundSynth.startWindAmbiance();
    });

    // Proceed to Menu Scene
    this.scene.start('MenuScene');
  }
}
