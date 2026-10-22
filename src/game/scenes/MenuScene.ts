import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';
import { getStoredSettings } from '../settings';

export class MenuScene extends Phaser.Scene {
  private heroSprite!: Phaser.GameObjects.Sprite;
  private heroAura!: Phaser.GameObjects.Arc;
  private torchGlowLeft!: Phaser.GameObjects.Image;
  private torchGlowRight!: Phaser.GameObjects.Image;
  private particles: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    const settings = getStoredSettings();
    const isReducedMotion = settings.reducedMotion;
    const intensity = settings.animationIntensity;

    // 1. Deep Midnight Sky Gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x060813, 0x060813, 0x141838, 0x141838, 1);
    sky.fillRect(0, 0, width, height);

    // 2. Starry Sky Layer
    const starCount = intensity === 'minimal' ? 12 : (intensity === 'reduced' ? 25 : 45);
    for (let i = 0; i < starCount; i++) {
      const sx = Phaser.Math.Between(10, width - 10);
      const sy = Phaser.Math.Between(15, 230);
      const star = this.add.image(sx, sy, 'star_particle');
      star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.9));
      star.setScale(Phaser.Math.FloatBetween(0.7, 1.3));

      if (!isReducedMotion) {
        this.tweens.add({
          targets: star,
          alpha: Phaser.Math.FloatBetween(0.15, 1),
          scale: Phaser.Math.FloatBetween(0.6, 1.4),
          duration: Phaser.Math.Between(1200, 3000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Phaser.Math.Between(0, 2000),
        });
      }
    }

    // 3. Moon (Silver crescent with glowing cyan corona)
    const moonX = width - 60;
    const moonY = 70;
    const moonHalo = this.add.circle(moonX, moonY, 32, 0x38bdf8, 0.08);
    const moonBody = this.add.circle(moonX, moonY, 18, 0xe2e8f0, 0.9);
    // Dark silhouette cutout creating crescent shape
    const moonShadow = this.add.circle(moonX + 6, moonY - 3, 16, 0x070915, 1);

    if (!isReducedMotion) {
      this.tweens.add({
        targets: moonHalo,
        scale: 1.15,
        alpha: 0.14,
        duration: 3500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // 4. Distant Mountains Layer
    const mountains = this.add.image(width / 2, 240, 'mountain_layer');
    mountains.setOrigin(0.5, 0.5);

    // 5. Ruined Gothic Castle Layer
    const castle = this.add.image(width / 2, 280, 'castle_layer');
    castle.setOrigin(0.5, 0.5);

    // 6. Stone Parapet Balcony Terrace (Foreground Floor)
    const parapet = this.add.image(width / 2, height - 70, 'stone_parapet');
    parapet.setOrigin(0.5, 0);

    // 7. Torches on Left & Right Wall Pillars
    // Left Torch
    const torchLeft = this.add.sprite(50, 360, 'torch_sheet');
    torchLeft.play('torch_flame');
    this.torchGlowLeft = this.add.image(50, 350, 'torch_glow');
    this.torchGlowLeft.setBlendMode(Phaser.BlendModes.ADD);

    // Right Torch
    const torchRight = this.add.sprite(width - 50, 360, 'torch_sheet');
    torchRight.play('torch_flame');
    this.torchGlowRight = this.add.image(width - 50, 350, 'torch_glow');
    this.torchGlowRight.setBlendMode(Phaser.BlendModes.ADD);

    // Torch Flicker Tweens
    if (!isReducedMotion) {
      this.tweens.add({
        targets: [this.torchGlowLeft, this.torchGlowRight],
        alpha: { from: 0.65, to: 0.95 },
        scale: { from: 0.95, to: 1.08 },
        duration: 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // 8. Animated Embers rising from torches
    if (intensity !== 'minimal' && !isReducedMotion) {
      this.time.addEvent({
        delay: 350,
        loop: true,
        callback: () => {
          this.spawnTorchEmber(50, 345);
          this.spawnTorchEmber(width - 50, 345);
        },
      });
    }

    // 9. Animated Magical Floating Cyan Particles around Hero
    if (intensity !== 'minimal' && !isReducedMotion) {
      this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          this.spawnCyanMote(width / 2, 400);
        },
      });
    }

    // 10. Center Animated Hero: Shadow Knight
    const heroX = width / 2;
    const heroY = 380;

    // Glowing cyan runic aura beneath feet
    this.heroAura = this.add.circle(heroX, heroY + 24, 22, 0x00f0ff, 0.2);
    if (!isReducedMotion) {
      this.tweens.add({
        targets: this.heroAura,
        scaleX: 1.3,
        scaleY: 1.2,
        alpha: 0.38,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Hero Sprite (Scaled by 2.2x for crisp chunky pixel presence)
    this.heroSprite = this.add.sprite(heroX, heroY, 'hero_idle_sheet');
    this.heroSprite.setScale(2.2);
    this.heroSprite.play('hero_idle');

    // Hero interactive click (fun easter egg: sword shimmer sound and rune burst)
    this.heroSprite.setInteractive();
    this.heroSprite.on('pointerdown', () => {
      soundSynth.playSwordShimmer();
      this.spawnHeroRuneBurst(heroX, heroY);
      this.tweens.add({
        targets: this.heroSprite,
        scaleX: 2.35,
        scaleY: 2.35,
        duration: 120,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    });

    // 11. Main Title & Subtitle
    this.createHeader(width);

    // 12. Interactive Navigation Buttons
    this.createMenuButtons(width, height);

    // 13. Bottom Version Tag
    const versionLabel = this.add.text(width / 2, height - 16, 'Prototype v0.1 · 16-Bit Engine', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#64748b',
    });
    versionLabel.setOrigin(0.5, 0.5);

    // Fade in scene smoothly
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  private createHeader(width: number): void {
    const titleY = 100;

    // Ornamental header line flourish
    const flourish = this.add.graphics();
    flourish.fillStyle(0xd97706, 0.7);
    flourish.fillRect(width / 2 - 110, titleY - 32, 220, 2);
    flourish.fillStyle(0xfde047, 1);
    flourish.fillRect(width / 2 - 8, titleY - 34, 16, 6);
    flourish.fillStyle(0x00f0ff, 1);
    flourish.fillRect(width / 2 - 3, titleY - 33, 6, 4);

    // Game Title: PIXEL REALMS (Gothic retro pixel typography)
    const titleText = this.add.text(width / 2, titleY, 'PIXEL REALMS', {
      fontFamily: '"Press Start 2P", "Cinzel", monospace',
      fontSize: '22px',
      color: '#fef08a',
      align: 'center',
    });
    titleText.setOrigin(0.5, 0.5);
    titleText.setShadow(0, 3, '#0c0e1a', 0, true, true);
    titleText.setStroke('#854d0e', 4);

    // Subtitle: Shadow of the Forgotten King
    const subtitleText = this.add.text(width / 2, titleY + 28, 'Shadow of the Forgotten King', {
      fontFamily: '"Silkscreen", monospace, system-ui',
      fontSize: '10px',
      color: '#38bdf8',
      align: 'center',
    });
    subtitleText.setOrigin(0.5, 0.5);
    subtitleText.setShadow(0, 1, '#0284c7', 3, true, true);
  }

  private createMenuButtons(width: number, height: number): void {
    const playBtnY = height - 192;

    // 1. Large Animated PLAY GAME Button
    new PixelButton(this, {
      x: width / 2,
      y: playBtnY,
      text: '▶ PLAY GAME',
      width: 230,
      height: 48,
      fontSize: '12px',
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

    // 2. INVENTORY & FORGE Button
    const invBtnY = height - 138;
    new PixelButton(this, {
      x: width / 2,
      y: invBtnY,
      text: '🎒 INVENTORY & FORGE',
      width: 230,
      height: 42,
      fontSize: '9px',
      textColor: '#38bdf8',
      onClick: () => {
        soundSynth.playConfirm();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('InventoryScene', { returnScene: 'MenuScene' });
        });
      },
    });

    // 3. Secondary Buttons: SETTINGS, LORE, ABOUT
    const secBtnY = height - 86;
    const btnSpacing = 95;

    // Settings Button
    new PixelButton(this, {
      x: width / 2 - btnSpacing,
      y: secBtnY,
      text: 'SETTINGS',
      width: 86,
      height: 36,
      fontSize: '8px',
      textColor: '#cbd5e1',
      onClick: () => {
        soundSynth.playClick();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('SettingsScene');
        });
      },
    });

    // Lore Button
    new PixelButton(this, {
      x: width / 2,
      y: secBtnY,
      text: 'LORE',
      width: 86,
      height: 36,
      fontSize: '8px',
      textColor: '#cbd5e1',
      onClick: () => {
        soundSynth.playClick();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('IntroScene');
        });
      },
    });

    // About Button
    new PixelButton(this, {
      x: width / 2 + btnSpacing,
      y: secBtnY,
      text: 'ABOUT',
      width: 86,
      height: 36,
      fontSize: '8px',
      textColor: '#cbd5e1',
      onClick: () => {
        soundSynth.playClick();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('AboutScene');
        });
      },
    });
  }

  private spawnTorchEmber(x: number, y: number): void {
    const ember = this.add.image(x + Phaser.Math.Between(-4, 4), y, 'spark_ember');
    ember.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
    ember.setAlpha(0.9);

    this.tweens.add({
      targets: ember,
      x: x + Phaser.Math.Between(-16, 16),
      y: y - Phaser.Math.Between(30, 60),
      alpha: 0,
      scale: 0.3,
      duration: Phaser.Math.Between(700, 1200),
      ease: 'Quad.easeOut',
      onComplete: () => ember.destroy(),
    });
  }

  private spawnCyanMote(originX: number, originY: number): void {
    const moteX = originX + Phaser.Math.Between(-45, 45);
    const moteY = originY + Phaser.Math.Between(-20, 20);
    const mote = this.add.image(moteX, moteY, 'mote_cyan');
    mote.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
    mote.setAlpha(0.85);

    this.tweens.add({
      targets: mote,
      y: moteY - Phaser.Math.Between(40, 80),
      x: moteX + Phaser.Math.Between(-15, 15),
      alpha: 0,
      scale: 0.2,
      duration: Phaser.Math.Between(1400, 2200),
      ease: 'Sine.easeOut',
      onComplete: () => mote.destroy(),
    });
  }

  private spawnHeroRuneBurst(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 35;
      const mote = this.add.image(x, y - 10, 'mote_cyan');
      mote.setScale(1.6);
      this.tweens.add({
        targets: mote,
        x: x + Math.cos(angle) * dist,
        y: y - 10 + Math.sin(angle) * dist,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => mote.destroy(),
      });
    }
  }
}
