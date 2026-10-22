import Phaser from 'phaser';
import { soundSynth } from '../audio/SoundSynthesizer';

export interface PixelButtonConfig {
  x: number;
  y: number;
  text: string;
  width?: number;
  height?: number;
  fontSize?: string;
  textColor?: string;
  textureNormal?: string;
  textureHover?: string;
  texturePressed?: string;
  isPrimary?: boolean;
  onClick: () => void;
}

export class PixelButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private isPressed = false;
  private normalTex: string;
  private hoverTex: string;
  private pressedTex: string;
  private pulseTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, config: PixelButtonConfig) {
    super(scene, config.x, config.y);

    this.normalTex = config.textureNormal || (config.isPrimary ? 'pixel_btn_normal' : 'pixel_btn_secondary');
    this.hoverTex = config.textureHover || 'pixel_btn_hover';
    this.pressedTex = config.texturePressed || 'pixel_btn_pressed';

    const w = config.width || (config.isPrimary ? 220 : 150);
    const h = config.height || (config.isPrimary ? 48 : 42);

    this.bg = scene.add.image(0, 0, this.normalTex);
    this.bg.setDisplaySize(w, h);
    this.add(this.bg);

    const fontSize = config.fontSize || (config.isPrimary ? '13px' : '11px');
    const color = config.textColor || (config.isPrimary ? '#fef08a' : '#cbd5e1');

    this.label = scene.add.text(0, 0, config.text, {
      fontFamily: '"Press Start 2P", monospace, system-ui',
      fontSize,
      color,
      align: 'center',
    });
    this.label.setOrigin(0.5, 0.5);
    this.label.setShadow(1, 2, '#000000', 0, true, true);
    this.add(this.label);

    // Make both the background image and container interactive
    this.setSize(w, h);
    const hitRect = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.setInteractive(hitRect, Phaser.Geom.Rectangle.Contains);
    this.bg.setInteractive({ useHandCursor: true });

    const handlePointerDown = () => {
      this.isPressed = true;
      this.bg.setTexture(this.pressedTex);
      this.label.setY(2);
      soundSynth.playClick();
    };

    const handlePointerUp = () => {
      const wasPressed = this.isPressed;
      this.isPressed = false;
      this.bg.setTexture(this.normalTex);
      this.label.setY(0);

      if (wasPressed) {
        config.onClick();
      }
    };

    const handlePointerOver = () => {
      this.bg.setTexture(this.hoverTex);
      this.label.setColor('#ffffff');
      this.label.setShadow(0, 0, '#00f0ff', 4, true, true);
    };

    const handlePointerOut = () => {
      this.bg.setTexture(this.normalTex);
      this.label.setColor(color);
      this.label.setShadow(1, 2, '#000000', 0, true, true);
      this.label.setY(0);
      // Brief timeout before canceling pressed state so minor touch finger slips don't cancel taps
      setTimeout(() => {
        this.isPressed = false;
      }, 250);
    };

    // Listen on container
    this.on('pointerdown', handlePointerDown);
    this.on('pointerup', handlePointerUp);
    this.on('pointerover', handlePointerOver);
    this.on('pointerout', handlePointerOut);

    // Also listen on bg image as backup
    this.bg.on('pointerdown', handlePointerDown);
    this.bg.on('pointerup', handlePointerUp);
    this.bg.on('pointerover', handlePointerOver);
    this.bg.on('pointerout', handlePointerOut);

    // Primary button gentle pulse (scale internal children instead of container to preserve hit detection)
    if (config.isPrimary) {
      this.pulseTween = scene.tweens.add({
        targets: [this.bg, this.label],
        scaleX: '*=1.025',
        scaleY: '*=1.025',
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    scene.add.existing(this);
  }

  public setText(text: string): void {
    this.label.setText(text);
  }

  public setButtonColor(color: string): void {
    this.label.setColor(color);
  }
}
