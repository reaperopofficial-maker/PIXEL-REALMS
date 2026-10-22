import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';
import { getStoredSettings, saveStoredSettings, GameSettings } from '../settings';

export class SettingsScene extends Phaser.Scene {
  private currentSettings!: GameSettings;
  private sfxToggleBtn!: Phaser.GameObjects.Image;
  private sfxStatusText!: Phaser.GameObjects.Text;
  private musicToggleBtn!: Phaser.GameObjects.Image;
  private musicStatusText!: Phaser.GameObjects.Text;
  private motionToggleBtn!: Phaser.GameObjects.Image;
  private motionStatusText!: Phaser.GameObjects.Text;

  private fullBtn!: PixelButton;
  private reducedBtn!: PixelButton;
  private minimalBtn!: PixelButton;

  constructor() {
    super('SettingsScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.currentSettings = getStoredSettings();

    // Dark backdrop
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05070e, 0x05070e, 0x0e1122, 0x0e1122, 1);
    bg.fillRect(0, 0, width, height);

    // Stone panel
    const panel = this.add.image(width / 2, height / 2, 'pixel_panel_bg');
    panel.setDisplaySize(340, 530);

    // Header
    const title = this.add.text(width / 2, height / 2 - 220, 'SETTINGS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#fef08a',
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);

    const subtitle = this.add.text(width / 2, height / 2 - 195, 'Audio & Display Preferences', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '9px',
      color: '#38bdf8',
      align: 'center',
    });
    subtitle.setOrigin(0.5, 0.5);

    // 1. Sound FX Toggle Row
    const row1Y = height / 2 - 140;
    this.createToggleRow(
      row1Y,
      'SOUND FX',
      this.currentSettings.sfxEnabled,
      (newVal) => {
        this.currentSettings.sfxEnabled = newVal;
        this.persist();
        soundSynth.playToggle();
        this.updateSFXDisplay();
      },
      (btn, text) => {
        this.sfxToggleBtn = btn;
        this.sfxStatusText = text;
      }
    );

    // 2. Music & Wind Ambiance Toggle Row
    const row2Y = height / 2 - 75;
    this.createToggleRow(
      row2Y,
      'MUSIC & WIND',
      this.currentSettings.musicEnabled,
      (newVal) => {
        this.currentSettings.musicEnabled = newVal;
        this.persist();
        soundSynth.playToggle();
        this.updateMusicDisplay();
      },
      (btn, text) => {
        this.musicToggleBtn = btn;
        this.musicStatusText = text;
      }
    );

    // 3. Animation Intensity Row
    const row3Y = height / 2 - 10;
    const fxLabel = this.add.text(width / 2 - 130, row3Y - 14, 'FX INTENSITY', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '11px',
      color: '#e2e8f0',
    });
    fxLabel.setOrigin(0, 0.5);

    const btnY = row3Y + 16;
    const btnW = 86;
    const btnH = 34;

    this.fullBtn = new PixelButton(this, {
      x: width / 2 - 90,
      y: btnY,
      text: 'FULL',
      width: btnW,
      height: btnH,
      fontSize: '8px',
      textColor: this.currentSettings.animationIntensity === 'full' ? '#00f0ff' : '#94a3b8',
      onClick: () => this.setIntensity('full'),
    });

    this.reducedBtn = new PixelButton(this, {
      x: width / 2,
      y: btnY,
      text: 'MED',
      width: btnW,
      height: btnH,
      fontSize: '8px',
      textColor: this.currentSettings.animationIntensity === 'reduced' ? '#00f0ff' : '#94a3b8',
      onClick: () => this.setIntensity('reduced'),
    });

    this.minimalBtn = new PixelButton(this, {
      x: width / 2 + 90,
      y: btnY,
      text: 'MIN',
      width: btnW,
      height: btnH,
      fontSize: '8px',
      textColor: this.currentSettings.animationIntensity === 'minimal' ? '#00f0ff' : '#94a3b8',
      onClick: () => this.setIntensity('minimal'),
    });

    // 4. Reduced Motion Toggle Row
    const row4Y = height / 2 + 80;
    this.createToggleRow(
      row4Y,
      'REDUCE MOTION',
      this.currentSettings.reducedMotion,
      (newVal) => {
        this.currentSettings.reducedMotion = newVal;
        this.persist();
        soundSynth.playToggle();
        this.updateMotionDisplay();
      },
      (btn, text) => {
        this.motionToggleBtn = btn;
        this.motionStatusText = text;
      }
    );

    // Persistent storage status note
    const storageNote = this.add.text(width / 2, height / 2 + 150, 'Preferences saved to LocalStorage', {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '8px',
      color: '#64748b',
      align: 'center',
    });
    storageNote.setOrigin(0.5, 0.5);

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

  private createToggleRow(
    y: number,
    label: string,
    initialVal: boolean,
    onToggle: (val: boolean) => void,
    assignRefs: (btn: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text) => void
  ): void {
    const { width } = this.scale;

    const labelObj = this.add.text(width / 2 - 130, y, label, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '11px',
      color: '#e2e8f0',
    });
    labelObj.setOrigin(0, 0.5);

    const toggleX = width / 2 + 105;
    const btn = this.add.image(toggleX, y, initialVal ? 'toggle_on' : 'toggle_off');
    btn.setDisplaySize(48, 24);
    btn.setInteractive();

    const text = this.add.text(toggleX - 35, y, initialVal ? 'ON' : 'OFF', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: initialVal ? '#00f0ff' : '#64748b',
    });
    text.setOrigin(1, 0.5);

    btn.on('pointerdown', () => {
      const isCurrentlyOn = btn.texture.key === 'toggle_on';
      const nextVal = !isCurrentlyOn;
      onToggle(nextVal);
    });

    assignRefs(btn, text);
  }

  private updateSFXDisplay(): void {
    const on = this.currentSettings.sfxEnabled;
    this.sfxToggleBtn.setTexture(on ? 'toggle_on' : 'toggle_off');
    this.sfxStatusText.setText(on ? 'ON' : 'OFF');
    this.sfxStatusText.setColor(on ? '#00f0ff' : '#64748b');
  }

  private updateMusicDisplay(): void {
    const on = this.currentSettings.musicEnabled;
    this.musicToggleBtn.setTexture(on ? 'toggle_on' : 'toggle_off');
    this.musicStatusText.setText(on ? 'ON' : 'OFF');
    this.musicStatusText.setColor(on ? '#00f0ff' : '#64748b');
  }

  private updateMotionDisplay(): void {
    const on = this.currentSettings.reducedMotion;
    this.motionToggleBtn.setTexture(on ? 'toggle_on' : 'toggle_off');
    this.motionStatusText.setText(on ? 'ON' : 'OFF');
    this.motionStatusText.setColor(on ? '#00f0ff' : '#64748b');
  }

  private setIntensity(intensity: 'full' | 'reduced' | 'minimal'): void {
    this.currentSettings.animationIntensity = intensity;
    this.persist();
    soundSynth.playClick();

    this.fullBtn.setButtonColor(intensity === 'full' ? '#00f0ff' : '#94a3b8');
    this.reducedBtn.setButtonColor(intensity === 'reduced' ? '#00f0ff' : '#94a3b8');
    this.minimalBtn.setButtonColor(intensity === 'minimal' ? '#00f0ff' : '#94a3b8');
  }

  private persist(): void {
    saveStoredSettings(this.currentSettings);
  }
}
