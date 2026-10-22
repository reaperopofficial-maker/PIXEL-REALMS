import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';

export class AdventurePreviewScene extends Phaser.Scene {
  constructor() {
    super('AdventurePreviewScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Atmospheric dark dungeon sky
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060814, 0x060814, 0x16122c, 0x16122c, 1);
    bg.fillRect(0, 0, width, height);

    // Distant mountain & ruined castle backdrop
    this.add.image(width / 2, 220, 'mountain_layer').setAlpha(0.65);
    this.add.image(width / 2, 250, 'castle_layer');

    // Stone terrace
    this.add.image(width / 2, 380, 'stone_parapet').setDisplaySize(width, 100);

    // Torches
    const t1 = this.add.sprite(45, 340, 'torch_sheet').play('torch_flame');
    const g1 = this.add.image(45, 335, 'torch_glow').setBlendMode(Phaser.BlendModes.ADD);
    const t2 = this.add.sprite(width - 45, 340, 'torch_sheet').play('torch_flame');
    const g2 = this.add.image(width - 45, 335, 'torch_glow').setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: [g1, g2],
      alpha: { from: 0.6, to: 0.9 },
      duration: 200,
      yoyo: true,
      repeat: -1,
    });

    // Shadow Knight Hero standing guard on the terrace
    const hero = this.add.sprite(width / 2, 345, 'hero_idle_sheet');
    hero.setScale(2.0);
    hero.play('hero_idle');

    // Stone Modal Announcement Box
    const panel = this.add.image(width / 2, 490, 'pixel_panel_bg');
    panel.setDisplaySize(330, 260);

    // Section Header
    const title = this.add.text(width / 2, 390, 'ADVENTURE STAGING', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#fef08a',
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);

    // Exact Prompt Message
    const message =
      'Your adventure begins here. Combat and exploration will be added in the next development stage.';

    const messageObj = this.add.text(width / 2, 442, message, {
      fontFamily: '"Silkscreen", monospace, system-ui',
      fontSize: '11px',
      color: '#e2e8f0',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 280, useAdvancedWrap: true },
    });
    messageObj.setOrigin(0.5, 0.5);

    // Working START BATTLE button
    new PixelButton(this, {
      x: width / 2,
      y: 508,
      text: '⚔️ START BATTLE',
      width: 220,
      height: 46,
      fontSize: '11px',
      textColor: '#fef08a',
      isPrimary: true,
      onClick: () => {
        soundSynth.playConfirm();
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('BattleScene');
        });
      },
    });

    // Working BACK TO MENU button
    new PixelButton(this, {
      x: width / 2,
      y: 565,
      text: '◀ BACK TO MENU',
      width: 190,
      height: 40,
      fontSize: '9px',
      textColor: '#94a3b8',
      onClick: () => {
        soundSynth.playBack();
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });

    // Fade in
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }
}
