import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';

export class AboutScene extends Phaser.Scene {
  constructor() {
    super('AboutScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05070e, 0x05070e, 0x0f1225, 0x0f1225, 1);
    bg.fillRect(0, 0, width, height);

    // Stone panel
    const panel = this.add.image(width / 2, height / 2, 'pixel_panel_bg');
    panel.setDisplaySize(340, 530);

    // Header
    const title = this.add.text(width / 2, height / 2 - 220, 'ABOUT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#fef08a',
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);

    const sub = this.add.text(width / 2, height / 2 - 195, 'Codename: Shadow of the Forgotten King', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '8px',
      color: '#38bdf8',
      align: 'center',
    });
    sub.setOrigin(0.5, 0.5);

    // Hero crest thumbnail
    const heroIcon = this.add.sprite(width / 2, height / 2 - 145, 'hero_idle_sheet');
    heroIcon.setScale(1.8);
    heroIcon.play('hero_idle');

    // Content cards
    const content =
      'PIXEL REALMS\n' +
      'Version: Prototype v0.1\n\n' +
      'A dark fantasy 2D pixel-art action RPG engineered for mobile-first web browsers.\n\n' +
      'Engine: Phaser 3 (Canvas / WebGL)\n' +
      'Audio: Procedural Web Audio Synth\n' +
      'Rendering: Crisp Integer Pixel Art\n\n' +
      'Part 1 delivers the atmospheric title menu, Shadow Knight hero animations, responsive portrait arcade viewport, and state management.';

    const descObj = this.add.text(width / 2, height / 2 + 10, content, {
      fontFamily: '"Silkscreen", monospace, system-ui',
      fontSize: '10px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: 270, useAdvancedWrap: true },
    });
    descObj.setOrigin(0.5, 0.5);

    // Status note
    const footerNote = this.add.text(width / 2, height / 2 + 140, 'Ready for Part 2 Combat Systems', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00f0ff',
      align: 'center',
    });
    footerNote.setOrigin(0.5, 0.5);

    // Working BACK Button
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 210,
      text: '◀ BACK TO MENU',
      width: 220,
      height: 48,
      fontSize: '11px',
      textColor: '#fde047',
      isPrimary: true,
      onClick: () => {
        soundSynth.playBack();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('MenuScene');
        });
      },
    });

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }
}
