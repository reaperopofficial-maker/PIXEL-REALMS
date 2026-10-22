import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark background with subtle animated vignette
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05070e, 0x05070e, 0x0c0f1e, 0x0c0f1e, 1);
    bg.fillRect(0, 0, width, height);

    // Stone parchment plaque
    const panel = this.add.image(width / 2, height / 2, 'pixel_panel_bg');
    panel.setDisplaySize(340, 520);

    // Header Title
    const headerTitle = this.add.text(width / 2, height / 2 - 215, 'PROLOGUE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#fef08a',
      align: 'center',
    });
    headerTitle.setOrigin(0.5, 0.5);
    headerTitle.setShadow(0, 2, '#000000', 0, true, true);

    const subHeader = this.add.text(width / 2, height / 2 - 192, 'The Last Guardian', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '10px',
      color: '#38bdf8',
      align: 'center',
    });
    subHeader.setOrigin(0.5, 0.5);

    // Animated Runic Crest / Crystal Emblem
    const emblem = this.add.image(width / 2, height / 2 - 130, 'crystal_cyan');
    emblem.setScale(2.2);

    this.tweens.add({
      targets: emblem,
      y: height / 2 - 138,
      scaleX: 2.35,
      scaleY: 2.35,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Glowing aura behind crystal
    const aura = this.add.circle(width / 2, height / 2 - 130, 28, 0x00f0ff, 0.18);
    this.tweens.add({
      targets: aura,
      scale: 1.25,
      alpha: 0.35,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Exact Prompt Lore Text:
    const loreText =
      'You are the last guardian of a fallen kingdom.\n\n' +
      'Explore dangerous dungeons, defeat monsters, collect legendary equipment, and restore the lost realms.';

    const textObj = this.add.text(width / 2, height / 2 + 10, loreText, {
      fontFamily: '"Silkscreen", "Cinzel", monospace, system-ui',
      fontSize: '12px',
      color: '#e2e8f0',
      align: 'center',
      lineSpacing: 10,
      wordWrap: { width: 270, useAdvancedWrap: true },
    });
    textObj.setOrigin(0.5, 0.5);
    textObj.setShadow(0, 2, '#000000', 3, true, true);

    // Ancient rune divider
    const divider = this.add.graphics();
    divider.fillStyle(0xd97706, 0.6);
    divider.fillRect(width / 2 - 70, height / 2 + 105, 140, 2);
    divider.fillStyle(0x00f0ff, 0.9);
    divider.fillRect(width / 2 - 4, height / 2 + 104, 8, 4);

    // Working CONTINUE Button (Enters battle directly)
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 155,
      text: 'ENTER BATTLE ▶',
      width: 220,
      height: 48,
      fontSize: '11px',
      textColor: '#fef08a',
      isPrimary: true,
      onClick: () => {
        soundSynth.playConfirm();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('BattleScene');
        });
      },
    });

    // Working BACK TO MENU Button
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 215,
      text: '◀ BACK TO MENU',
      width: 190,
      height: 42,
      fontSize: '9px',
      textColor: '#94a3b8',
      onClick: () => {
        soundSynth.playBack();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('MenuScene');
        });
      },
    });

    // Fade in
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }
}
