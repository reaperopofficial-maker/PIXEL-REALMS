import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';
import { getPlayerSave, savePlayerData, PlayerSaveData, addItemToInventory } from '../playerSave';
import { getEnemyForStage, EnemyConfig } from '../data/enemies';
import { GameItem, RARITY_COLORS } from '../data/items';
import { getStoredSettings } from '../settings';

interface SkillState {
  id: string;
  name: string;
  icon: string;
  cooldownMs: number;
  lastUsedTime: number;
}

export class BattleScene extends Phaser.Scene {
  private player!: PlayerSaveData;
  private enemy!: EnemyConfig;

  // Game Objects
  private heroSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private heroOriginX = 95;
  private heroOriginY = 410;
  private enemyOriginX = 295;
  private enemyOriginY = 405;

  // Hero HUD
  private heroHpFill!: Phaser.GameObjects.Graphics;
  private heroHpText!: Phaser.GameObjects.Text;
  private heroXpFill!: Phaser.GameObjects.Graphics;
  private heroLevelText!: Phaser.GameObjects.Text;
  private heroNameText!: Phaser.GameObjects.Text;
  private coinCountText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;

  // Enemy HUD
  private enemyHpFill!: Phaser.GameObjects.Graphics;
  private enemyHpText!: Phaser.GameObjects.Text;
  private enemyNameText!: Phaser.GameObjects.Text;
  private enemyLevelText!: Phaser.GameObjects.Text;
  private enemyHudContainer!: Phaser.GameObjects.Container;

  // Combat State
  private isActionLocked = false;
  private isBattleOver = false;
  private autoBattleEnabled = false;
  private autoBattleTimer?: Phaser.Time.TimerEvent;
  private autoBattleBtn!: PixelButton;
  private enemyAttackTimer?: Phaser.Time.TimerEvent;

  // Skills
  private skillsDrawerOpen = false;
  private skillsContainer!: Phaser.GameObjects.Container;
  private skillStates: Record<string, SkillState> = {
    power_strike: { id: 'power_strike', name: 'Power Slash', icon: 'icon_power_strike', cooldownMs: 6000, lastUsedTime: -10000 },
    fireball: { id: 'fireball', name: 'Fireball', icon: 'icon_fireball', cooldownMs: 8500, lastUsedTime: -10000 },
    heal: { id: 'heal', name: 'Holy Heal', icon: 'icon_heal', cooldownMs: 11000, lastUsedTime: -10000 },
  };
  private skillCooldownTexts: Record<string, Phaser.GameObjects.Text> = {};
  private skillButtons: Record<string, Phaser.GameObjects.Image> = {};

  // Action Buttons
  private attackBtn!: PixelButton;
  private skillsToggleBtn!: PixelButton;
  private inventoryBtn!: PixelButton;
  private retreatBtn!: PixelButton;

  constructor() {
    super('BattleScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.player = getPlayerSave();
    this.enemy = getEnemyForStage(this.player.currentStage);

    this.isActionLocked = false;
    this.isBattleOver = false;
    this.autoBattleEnabled = false;

    // 1. Dungeon Chamber Background
    this.add.image(width / 2, height / 2, 'dungeon_battle_bg');

    // 2. Animated Torches on Dungeon Pillars
    const torchLeft = this.add.sprite(32, 210, 'torch_sheet').play('torch_flame');
    const torchRight = this.add.sprite(width - 32, 210, 'torch_sheet').play('torch_flame');
    const glowLeft = this.add.image(32, 205, 'torch_glow').setBlendMode(Phaser.BlendModes.ADD);
    const glowRight = this.add.image(width - 32, 205, 'torch_glow').setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: [glowLeft, glowRight],
      alpha: { from: 0.6, to: 0.95 },
      scale: { from: 0.95, to: 1.05 },
      duration: 180,
      yoyo: true,
      repeat: -1,
    });

    // Ambient rising embers
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        if (this.scene.isActive('BattleScene')) {
          this.spawnDungeonEmber(32, 200);
          this.spawnDungeonEmber(width - 32, 200);
        }
      },
    });

    // 3. Create Characters
    this.createCharacters();

    // 4. Create Top HUD (Hero & Enemy bars, coins, level)
    this.createTopHud(width);
    this.createEnemyHud();

    // 5. Create Bottom Combat Control Panel
    this.createControlPanel(width, height);

    // 6. Create Skills Drawer / Sub-panel
    this.createSkillsPanel(width, height);

    // Start encounter intro transition
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Initial enemy counter-attack timer loop
    this.scheduleNextEnemyAttack();
  }

  update(time: number): void {
    this.updateSkillCooldowns(time);
  }

  private createCharacters(): void {
    // Hero Sprite (Scale 2.2x)
    this.heroSprite = this.add.sprite(this.heroOriginX, this.heroOriginY, 'hero_battle_sheet', 0);
    this.heroSprite.setScale(2.2);

    // Hero breathing/idle tween
    this.tweens.add({
      targets: this.heroSprite,
      y: this.heroOriginY - 2,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Enemy Sprite
    this.enemySprite = this.add.sprite(this.enemyOriginX, this.enemyOriginY, this.enemy.spriteKey, 0);
    this.enemySprite.setScale(this.enemy.scale);

    const animKey = `${this.enemy.id.replace('shadow_', '').replace('skeletal_', '').replace('crypt_', '').replace('forgotten_', '')}_idle`;
    if (this.anims.exists(animKey)) {
      this.enemySprite.play(animKey);
    } else {
      this.tweens.add({
        targets: this.enemySprite,
        y: this.enemyOriginY - 3,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createTopHud(width: number): void {
    // Top Bar Plate
    const hudY = 16;
    const bgPlate = this.add.graphics();
    bgPlate.fillStyle(0x0a0c18, 0.88);
    bgPlate.fillRect(8, hudY, width - 16, 76);
    bgPlate.lineStyle(2, 0xd97706, 0.8);
    bgPlate.strokeRect(8, hudY, width - 16, 76);

    // Dungeon Chamber Title
    this.stageText = this.add.text(width / 2, hudY + 12, `DUNGEON B1 · CHAMBER ${this.player.currentStage}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#fde047',
    });
    this.stageText.setOrigin(0.5, 0.5);

    // Coin Counter with Icon
    this.add.image(width - 70, hudY + 12, 'pixel_coin');
    this.coinCountText = this.add.text(width - 58, hudY + 12, `${this.player.coins}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#fef08a',
    });
    this.coinCountText.setOrigin(0, 0.5);

    // Hero Name & Level
    this.heroNameText = this.add.text(18, hudY + 28, `${this.player.name}`, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '10px',
      color: '#38bdf8',
    });

    this.heroLevelText = this.add.text(125, hudY + 28, `LV.${this.player.level}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00f0ff',
    });

    // Hero HP Bar
    const hpBarX = 18;
    const hpBarY = hudY + 44;
    const barW = 160;
    const barH = 12;

    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x181a2e, 1);
    hpBg.fillRect(hpBarX, hpBarY, barW, barH);
    hpBg.lineStyle(1, 0x475569, 1);
    hpBg.strokeRect(hpBarX, hpBarY, barW, barH);

    this.heroHpFill = this.add.graphics();

    this.heroHpText = this.add.text(hpBarX + barW / 2, hpBarY + barH / 2, `HP: ${this.player.hp}/${this.player.maxHp}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffffff',
    });
    this.heroHpText.setOrigin(0.5, 0.5);
    this.heroHpText.setShadow(1, 1, '#000000', 0, true, true);

    this.updateHeroHpBar(false);

    // Hero XP Bar (Slim cyan bar below HP)
    const xpBarY = hpBarY + 16;
    const xpBg = this.add.graphics();
    xpBg.fillStyle(0x0e101f, 1);
    xpBg.fillRect(hpBarX, xpBarY, barW, 6);

    this.heroXpFill = this.add.graphics();
    this.updateHeroXpBar();

    const xpLabel = this.add.text(hpBarX + barW + 8, xpBarY + 3, `XP`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#38bdf8',
    });
    xpLabel.setOrigin(0, 0.5);
  }

  private createEnemyHud(): void {
    this.enemyHudContainer = this.add.container(this.enemyOriginX, this.enemyOriginY - 65);

    // Enemy Name & Level
    this.enemyNameText = this.add.text(0, -18, this.enemy.name, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '11px',
      color: '#f87171',
      align: 'center',
    });
    this.enemyNameText.setOrigin(0.5, 0.5);

    this.enemyLevelText = this.add.text(0, -5, `LV.${this.enemy.level} · ${this.enemy.title}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#cbd5e1',
      align: 'center',
    });
    this.enemyLevelText.setOrigin(0.5, 0.5);

    // Enemy HP Bar
    const barW = 100;
    const barH = 10;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x181a2e, 1);
    barBg.fillRect(-barW / 2, 7, barW, barH);
    barBg.lineStyle(1, 0xef4444, 0.8);
    barBg.strokeRect(-barW / 2, 7, barW, barH);
    this.enemyHudContainer.add(barBg);

    this.enemyHpFill = this.add.graphics();
    this.enemyHudContainer.add(this.enemyHpFill);

    this.enemyHpText = this.add.text(0, 12, `${this.enemy.hp}/${this.enemy.maxHp}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffffff',
    });
    this.enemyHpText.setOrigin(0.5, 0.5);
    this.enemyHpContainerItemsAdd();

    this.updateEnemyHpBar(false);
  }

  private enemyHpContainerItemsAdd(): void {
    this.enemyHudContainer.add(this.enemyNameText);
    this.enemyHudContainer.add(this.enemyLevelText);
    this.enemyHudContainer.add(this.enemyHpText);
  }

  private createControlPanel(width: number, height: number): void {
    const panelY = height - 120;

    // Bottom Control Panel Plate
    const panelPlate = this.add.graphics();
    panelPlate.fillStyle(0x0a0c18, 0.94);
    panelPlate.fillRect(6, panelY, width - 12, 110);
    panelPlate.lineStyle(2, 0xd97706, 0.85);
    panelPlate.strokeRect(6, panelY, width - 12, 110);

    // 1. Primary ATTACK Button
    this.attackBtn = new PixelButton(this, {
      x: width / 2 - 82,
      y: panelY + 32,
      text: '⚔️ ATTACK',
      width: 165,
      height: 46,
      fontSize: '11px',
      textColor: '#fef08a',
      isPrimary: true,
      onClick: () => this.handlePlayerAttack(),
    });

    // 2. SKILLS Button
    this.skillsToggleBtn = new PixelButton(this, {
      x: width / 2 + 82,
      y: panelY + 32,
      text: '✨ SKILLS',
      width: 145,
      height: 46,
      fontSize: '11px',
      textColor: '#38bdf8',
      onClick: () => this.toggleSkillsDrawer(),
    });

    // 3. AUTO BATTLE Button (Row 2, Left)
    this.autoBattleBtn = new PixelButton(this, {
      x: 72,
      y: panelY + 80,
      text: '⚡ AUTO',
      width: 104,
      height: 38,
      fontSize: '8px',
      textColor: '#94a3b8',
      onClick: () => this.toggleAutoBattle(),
    });

    // 4. INVENTORY / GEAR Button (Row 2, Center)
    this.inventoryBtn = new PixelButton(this, {
      x: width / 2,
      y: panelY + 80,
      text: '🎒 GEAR',
      width: 104,
      height: 38,
      fontSize: '8px',
      textColor: '#38bdf8',
      onClick: () => this.openInventory(),
    });

    // 5. RETREAT Button (Row 2, Right)
    this.retreatBtn = new PixelButton(this, {
      x: width - 72,
      y: panelY + 80,
      text: '🏃 FLEE',
      width: 104,
      height: 38,
      fontSize: '8px',
      textColor: '#ef4444',
      onClick: () => this.handleRetreat(),
    });
  }

  private createSkillsPanel(width: number, height: number): void {
    this.skillsContainer = this.add.container(0, height - 195);
    this.skillsContainer.setVisible(false);

    // Skill bar backdrop
    const barBg = this.add.graphics();
    barBg.fillStyle(0x070914, 0.96);
    barBg.fillRect(10, 0, width - 20, 68);
    barBg.lineStyle(2, 0x00f0ff, 0.7);
    barBg.strokeRect(10, 0, width - 20, 68);
    this.skillsContainer.add(barBg);

    const skills = [
      { key: 'power_strike', label: 'POWER', sub: '2.2x DMG', icon: 'icon_power_strike', x: 70 },
      { key: 'fireball', label: 'FIREBALL', sub: 'MAG BURST', icon: 'icon_fireball', x: 195 },
      { key: 'heal', label: 'HEAL', sub: '+40% HP', icon: 'icon_heal', x: 320 },
    ];

    skills.forEach((s) => {
      // Icon button image
      const iconBtn = this.add.image(s.x, 26, s.icon);
      iconBtn.setDisplaySize(36, 36);
      iconBtn.setInteractive({ useHandCursor: true });
      this.skillsContainer.add(iconBtn);
      this.skillButtons[s.key] = iconBtn;

      iconBtn.on('pointerdown', () => {
        this.handleCastSkill(s.key);
      });

      // Label below icon
      const label = this.add.text(s.x, 52, s.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#fef08a',
        align: 'center',
      });
      label.setOrigin(0.5, 0.5);
      this.skillsContainer.add(label);

      // Cooldown overlay text
      const cdText = this.add.text(s.x, 26, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#ff4444',
        align: 'center',
      });
      cdText.setOrigin(0.5, 0.5);
      cdText.setShadow(1, 1, '#000000', 2, true, true);
      this.skillsContainer.add(cdText);
      this.skillCooldownTexts[s.key] = cdText;
    });
  }

  // Combat Execution
  private handlePlayerAttack(): void {
    if (this.isActionLocked || this.isBattleOver) return;
    this.isActionLocked = true;

    // 1. Hero dashes forward to enemy
    this.heroSprite.setFrame(1); // Dash frame
    soundSynth.playSwordSlash();

    this.tweens.add({
      targets: this.heroSprite,
      x: this.enemyOriginX - 45,
      duration: 160,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // 2. Slash strike frame
        this.heroSprite.setFrame(3); // Slash strike

        // Spawn crescent slash wave
        const slash = this.add.image(this.enemyOriginX - 10, this.enemyOriginY - 5, 'slash_arc_fx');
        slash.setScale(1.5);
        this.tweens.add({
          targets: slash,
          alpha: 0,
          scale: 2.0,
          duration: 180,
          onComplete: () => slash.destroy(),
        });

        // Calculate damage
        const variance = Phaser.Math.Between(-3, 4);
        const damage = Math.max(8, this.player.atk + this.player.equipment.weaponAtk + variance);
        const isCrit = Math.random() < 0.2;
        const totalDmg = isCrit ? Math.round(damage * 1.5) : damage;

        // Apply to enemy
        this.applyDamageToEnemy(totalDmg, isCrit);

        // 3. Dash back to original position
        this.time.delayedCall(140, () => {
          this.heroSprite.setFrame(0);
          this.tweens.add({
            targets: this.heroSprite,
            x: this.heroOriginX,
            duration: 180,
            ease: 'Quad.easeOut',
            onComplete: () => {
              this.isActionLocked = false;
            },
          });
        });
      },
    });
  }

  private handleCastSkill(skillKey: string): void {
    if (this.isActionLocked || this.isBattleOver) return;
    const skill = this.skillStates[skillKey];
    const now = this.time.now;
    if (now - skill.lastUsedTime < skill.cooldownMs) {
      soundSynth.playBack();
      return;
    }

    this.isActionLocked = true;
    skill.lastUsedTime = now;

    if (skillKey === 'power_strike') {
      this.executePowerStrike();
    } else if (skillKey === 'fireball') {
      this.executeFireball();
    } else if (skillKey === 'heal') {
      this.executeHealing();
    }
  }

  private executePowerStrike(): void {
    soundSynth.playPowerStrike();
    this.heroSprite.setFrame(2); // Windup

    this.tweens.add({
      targets: this.heroSprite,
      x: this.enemyOriginX - 40,
      duration: 180,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.heroSprite.setFrame(3);
        this.cameras.main.shake(150, 0.012);

        // Giant Golden Slash Arc
        const slash = this.add.image(this.enemyOriginX, this.enemyOriginY, 'slash_arc_fx');
        slash.setScale(2.4);
        slash.setTint(0xfde047);
        this.tweens.add({
          targets: slash,
          alpha: 0,
          scale: 3.2,
          duration: 220,
          onComplete: () => slash.destroy(),
        });

        const heavyDmg = Math.round((this.player.atk + this.player.equipment.weaponAtk) * 2.2);
        this.applyDamageToEnemy(heavyDmg, true);

        this.time.delayedCall(160, () => {
          this.heroSprite.setFrame(0);
          this.tweens.add({
            targets: this.heroSprite,
            x: this.heroOriginX,
            duration: 180,
            ease: 'Quad.easeOut',
            onComplete: () => {
              this.isActionLocked = false;
            },
          });
        });
      },
    });
  }

  private executeFireball(): void {
    soundSynth.playFireballCast();
    this.heroSprite.setFrame(2);

    // Spawn projectile from hero's hand
    const fb = this.add.image(this.heroOriginX + 30, this.heroOriginY - 10, 'fireball_projectile');
    fb.setScale(1.6);

    this.tweens.add({
      targets: fb,
      x: this.enemyOriginX,
      y: this.enemyOriginY - 5,
      rotation: Math.PI * 2,
      duration: 320,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        fb.destroy();
        this.cameras.main.shake(120, 0.008);

        // Fire explosion burst
        const burst = this.add.image(this.enemyOriginX, this.enemyOriginY - 5, 'fire_burst_fx');
        burst.setScale(1.8);
        this.tweens.add({
          targets: burst,
          scale: 2.8,
          alpha: 0,
          duration: 250,
          onComplete: () => burst.destroy(),
        });

        const fireDmg = Math.round((this.player.atk + 10) * 2.5);
        this.applyDamageToEnemy(fireDmg, false);

        this.heroSprite.setFrame(0);
        this.isActionLocked = false;
      },
    });
  }

  private executeHealing(): void {
    soundSynth.playHealSpell();
    this.heroSprite.setFrame(5); // Victory/Praise pose

    // Divine column of light on hero
    const pillar = this.add.image(this.heroOriginX, this.heroOriginY - 20, 'heal_pillar_fx');
    pillar.setBlendMode(Phaser.BlendModes.ADD);
    pillar.setScale(1.4);

    this.tweens.add({
      targets: pillar,
      alpha: { from: 1, to: 0 },
      scaleX: 2.0,
      duration: 650,
      onComplete: () => pillar.destroy(),
    });

    // Heal amount (40% of Max HP)
    const healAmt = Math.round(this.player.maxHp * 0.4);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
    savePlayerData(this.player);

    this.updateHeroHpBar(true);
    this.showFloatingText(this.heroOriginX, this.heroOriginY - 40, `+${healAmt} HP`, '#10b981');

    this.time.delayedCall(450, () => {
      this.heroSprite.setFrame(0);
      this.isActionLocked = false;
    });
  }

  private applyDamageToEnemy(damage: number, isCrit: boolean): void {
    soundSynth.playEnemyHit();
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);

    // Floating damage text
    const color = isCrit ? '#facc15' : '#ffffff';
    const prefix = isCrit ? 'CRIT! ' : '';
    this.showFloatingText(this.enemyOriginX, this.enemyOriginY - 40, `${prefix}-${damage}`, color);

    // Enemy hit reaction: flash red + recoil
    this.enemySprite.setTint(0xff0000);
    this.tweens.add({
      targets: this.enemySprite,
      x: this.enemyOriginX + 12,
      duration: 70,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.enemySprite.clearTint();
        this.enemySprite.setX(this.enemyOriginX);
      },
    });

    this.updateEnemyHpBar(true);

    if (this.enemy.hp <= 0) {
      this.handleEnemyDefeated();
    }
  }

  private scheduleNextEnemyAttack(): void {
    if (this.isBattleOver) return;

    this.enemyAttackTimer = this.time.addEvent({
      delay: this.enemy.attackSpeedMs,
      callback: () => {
        if (!this.isBattleOver && !this.isActionLocked && this.enemy.hp > 0) {
          this.executeEnemyAttack();
        } else {
          this.scheduleNextEnemyAttack();
        }
      },
    });
  }

  private executeEnemyAttack(): void {
    if (this.isBattleOver || this.enemy.hp <= 0) return;
    this.isActionLocked = true;

    // Enemy lunges toward hero
    this.tweens.add({
      targets: this.enemySprite,
      x: this.heroOriginX + 45,
      duration: 170,
      ease: 'Quad.easeIn',
      onComplete: () => {
        // Strike hero
        soundSynth.playEnemyHit();
        this.cameras.main.shake(100, 0.007);

        // Hero hurt frame and recoil
        this.heroSprite.setFrame(4);
        this.heroSprite.setTint(0xff0000);

        const variance = Phaser.Math.Between(-2, 3);
        const enemyDmg = Math.max(5, this.enemy.atk + variance);
        this.player.hp = Math.max(0, this.player.hp - enemyDmg);
        savePlayerData(this.player);

        this.updateHeroHpBar(true);
        this.showFloatingText(this.heroOriginX, this.heroOriginY - 40, `-${enemyDmg}`, '#ef4444');

        this.tweens.add({
          targets: this.heroSprite,
          x: this.heroOriginX - 10,
          duration: 90,
          yoyo: true,
          onComplete: () => {
            this.heroSprite.clearTint();
            this.heroSprite.setFrame(0);
            this.heroSprite.setX(this.heroOriginX);
          },
        });

        // Enemy returns to position
        this.tweens.add({
          targets: this.enemySprite,
          x: this.enemyOriginX,
          duration: 170,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.isActionLocked = false;
            if (this.player.hp <= 0) {
              this.handleHeroDefeated();
            } else {
              this.scheduleNextEnemyAttack();
            }
          },
        });
      },
    });
  }

  private handleEnemyDefeated(): void {
    this.isBattleOver = true;
    this.autoBattleEnabled = false;
    if (this.autoBattleTimer) this.autoBattleTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();

    // 1. Enemy Death Animation: Flash, smoke particles, and sink away
    this.enemySprite.setTint(0xffffff);
    soundSynth.playVictory();

    this.tweens.add({
      targets: this.enemySprite,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      y: this.enemyOriginY + 15,
      duration: 500,
      onComplete: () => {
        this.enemySprite.setVisible(false);
      },
    });

    // 2. Award Coins & XP
    const coinsWon = this.enemy.coinReward;
    const xpWon = this.enemy.xpReward;
    this.player.coins += coinsWon;
    this.player.totalEnemiesDefeated += 1;

    // Spawn floating coins that travel to the coin counter!
    this.spawnFlyingCoins(coinsWon);

    // Add XP and check Level Up
    const didLevelUp = this.addPlayerXp(xpWon);
    savePlayerData(this.player);

    // Roll for Loot & Equipment Drops
    const droppedItems: GameItem[] = [];

    // Stage/Enemy specific item drops into persistent player inventory
    if (this.enemy.id === 'shadow_slime') {
      if (Math.random() < 0.45) {
        droppedItems.push(addItemToInventory(this.player, 'acc_slime_core'));
      }
      if (Math.random() < 0.65) {
        droppedItems.push(addItemToInventory(this.player, 'mat_iron_ore', Phaser.Math.Between(1, 2)));
      }
      if (Math.random() < 0.4) {
        droppedItems.push(addItemToInventory(this.player, 'pot_lesser_hp', 1));
      }
    } else if (this.enemy.id === 'skeletal_warrior') {
      if (Math.random() < 0.4) {
        const template = Math.random() < 0.5 ? 'wpn_iron_sword' : 'helm_iron_helm';
        droppedItems.push(addItemToInventory(this.player, template));
      }
      if (Math.random() < 0.6) {
        droppedItems.push(addItemToInventory(this.player, 'mat_iron_ore', Phaser.Math.Between(2, 3)));
      }
      if (Math.random() < 0.4) {
        droppedItems.push(addItemToInventory(this.player, 'pot_lesser_hp', 1));
      }
    } else if (this.enemy.id === 'crypt_gargoyle') {
      if (Math.random() < 0.4) {
        droppedItems.push(addItemToInventory(this.player, 'arm_granite_carapace'));
      }
      if (Math.random() < 0.6) {
        droppedItems.push(addItemToInventory(this.player, 'mat_shadow_essence', Phaser.Math.Between(1, 2)));
      }
      if (Math.random() < 0.35) {
        droppedItems.push(addItemToInventory(this.player, 'pot_greater_hp', 1));
      }
    } else if (this.enemy.id === 'shadow_sorcerer') {
      if (Math.random() < 0.45) {
        const template = Math.random() < 0.5 ? 'acc_void_grimoire' : 'helm_shadow_horns';
        droppedItems.push(addItemToInventory(this.player, template));
      }
      if (Math.random() < 0.6) {
        droppedItems.push(addItemToInventory(this.player, 'mat_shadow_essence', Phaser.Math.Between(2, 3)));
      }
      if (Math.random() < 0.35) {
        droppedItems.push(addItemToInventory(this.player, 'mat_runic_crystal', 1));
      }
    } else if (this.enemy.id === 'forgotten_warlord') {
      // Dungeon Boss Drops
      droppedItems.push(addItemToInventory(this.player, 'wpn_forgotten_blade'));
      droppedItems.push(addItemToInventory(this.player, 'mat_runic_crystal', 2));
      droppedItems.push(addItemToInventory(this.player, 'pot_greater_hp', 2));
    } else {
      // Generic drop fallback
      if (Math.random() < 0.5) {
        droppedItems.push(addItemToInventory(this.player, 'mat_iron_ore', 1));
      }
    }

    savePlayerData(this.player);

    // Hero victory pose!
    this.heroSprite.setFrame(5);

    // Show Victory Screen after brief reward delay
    this.time.delayedCall(700, () => {
      this.showVictoryModal(coinsWon, xpWon, didLevelUp, droppedItems);
    });
  }

  private handleHeroDefeated(): void {
    this.isBattleOver = true;
    this.autoBattleEnabled = false;
    if (this.autoBattleTimer) this.autoBattleTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();

    soundSynth.playGameOver();
    this.heroSprite.setFrame(4);
    this.heroSprite.setTint(0x475569);

    this.tweens.add({
      targets: this.heroSprite,
      alpha: 0.4,
      y: this.heroOriginY + 8,
      duration: 600,
    });

    this.time.delayedCall(800, () => {
      this.showGameOverModal();
    });
  }

  private addPlayerXp(xpWon: number): boolean {
    this.player.xp += xpWon;
    let leveledUp = false;

    while (this.player.xp >= this.player.xpNeeded) {
      this.player.xp -= this.player.xpNeeded;
      this.player.level += 1;
      this.player.xpNeeded = this.player.level * 90;
      this.player.maxHp += 20;
      this.player.atk += 5;
      this.player.hp = this.player.maxHp; // Full heal on level up
      leveledUp = true;
    }

    this.updateHeroXpBar();
    this.updateHeroHpBar(true);
    this.heroLevelText.setText(`LV.${this.player.level}`);
    return leveledUp;
  }

  private spawnFlyingCoins(coinTotal: number): void {
    const coinCount = Math.min(8, Math.max(3, Math.floor(coinTotal / 5)));
    const targetX = this.scale.width - 70;
    const targetY = 28;

    for (let i = 0; i < coinCount; i++) {
      this.time.delayedCall(i * 70, () => {
        const coin = this.add.image(
          this.enemyOriginX + Phaser.Math.Between(-15, 15),
          this.enemyOriginY + Phaser.Math.Between(-15, 15),
          'pixel_coin'
        );
        coin.setScale(1.5);

        this.tweens.add({
          targets: coin,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            soundSynth.playCoinPickup();
            coin.destroy();
            this.coinCountText.setText(`${this.player.coins}`);
          },
        });
      });
    }
  }

  // Modals & Flows
  private showVictoryModal(coins: number, xp: number, didLevelUp: boolean, droppedItems: GameItem[]): void {
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x05070f, 0.82);
    overlay.fillRect(0, 0, width, height);

    const modal = this.add.image(width / 2, height / 2 - 10, 'pixel_panel_bg');
    modal.setDisplaySize(340, 400);

    // Header
    const title = this.add.text(width / 2, height / 2 - 175, 'VICTORY!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#fef08a',
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);

    const sub = this.add.text(width / 2, height / 2 - 148, `${this.enemy.name} Defeated`, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '11px',
      color: '#38bdf8',
    });
    sub.setOrigin(0.5, 0.5);

    // Rewards List
    const rewardLines = [
      `+${coins} Gold Coins`,
      `+${xp} Experience Points`,
    ];
    if (didLevelUp) {
      rewardLines.push(`🌟 LEVEL UP! You are now LV.${this.player.level}!`);
      soundSynth.playLevelUp();
    }
    if (droppedItems && droppedItems.length > 0) {
      droppedItems.forEach((item) => {
        const qtyStr = item.quantity > 1 ? ` (x${item.quantity})` : '';
        rewardLines.push(`🎁 Found: ${item.name}${qtyStr}`);
      });
    }

    const rewardsText = this.add.text(width / 2, height / 2 - 50, rewardLines.join('\n\n'), {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '10px',
      color: '#f8fafc',
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: 300, useAdvancedWrap: true },
    });
    rewardsText.setOrigin(0.5, 0.5);

    // 1. NEXT ENEMY Button
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 50,
      text: 'NEXT ENEMY ▶',
      width: 220,
      height: 44,
      fontSize: '11px',
      textColor: '#fef08a',
      isPrimary: true,
      onClick: () => {
        this.player.currentStage += 1;
        savePlayerData(this.player);
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.restart();
        });
      },
    });

    // 2. OPEN INVENTORY & FORGE Button
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 102,
      text: '🎒 INVENTORY & FORGE',
      width: 220,
      height: 40,
      fontSize: '9px',
      textColor: '#38bdf8',
      onClick: () => {
        savePlayerData(this.player);
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('InventoryScene', { returnScene: 'BattleScene' });
        });
      },
    });

    // 3. RETURN TO MENU Button
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 152,
      text: 'CAMP RETREAT',
      width: 180,
      height: 36,
      fontSize: '8px',
      textColor: '#94a3b8',
      onClick: () => {
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('MenuScene');
        });
      },
    });
  }

  private showGameOverModal(): void {
    const { width, height } = this.scale;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x05070f, 0.82);
    overlay.fillRect(0, 0, width, height);

    const modal = this.add.image(width / 2, height / 2 - 10, 'pixel_panel_bg');
    modal.setDisplaySize(320, 320);

    const title = this.add.text(width / 2, height / 2 - 130, 'FALLEN IN BATTLE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#ef4444',
      align: 'center',
    });
    title.setOrigin(0.5, 0.5);

    const desc = this.add.text(
      width / 2,
      height / 2 - 60,
      'Your armor cracked and your strength gave out.\n\nRevive with full health to challenge this chamber again!',
      {
        fontFamily: '"Silkscreen", monospace',
        fontSize: '11px',
        color: '#cbd5e1',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: 260, useAdvancedWrap: true },
      }
    );
    desc.setOrigin(0.5, 0.5);

    // RETRY Button (Restores HP and restarts current stage)
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 40,
      text: '⚔️ RETRY BATTLE',
      width: 210,
      height: 48,
      fontSize: '11px',
      textColor: '#fef08a',
      isPrimary: true,
      onClick: () => {
        this.player.hp = this.player.maxHp;
        savePlayerData(this.player);
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.restart();
        });
      },
    });

    // RETREAT TO MENU Button
    new PixelButton(this, {
      x: width / 2,
      y: height / 2 + 100,
      text: '◀ RETREAT TO MENU',
      width: 190,
      height: 42,
      fontSize: '9px',
      textColor: '#94a3b8',
      onClick: () => {
        this.player.hp = this.player.maxHp;
        savePlayerData(this.player);
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start('MenuScene');
        });
      },
    });
  }

  private openInventory(): void {
    if (this.isBattleOver) return;
    this.autoBattleEnabled = false;
    if (this.autoBattleTimer) this.autoBattleTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();
    soundSynth.playConfirm();

    // Auto save current state
    savePlayerData(this.player);

    this.cameras.main.fadeOut(160, 0, 0, 0);
    this.time.delayedCall(170, () => {
      this.scene.start('InventoryScene', { returnScene: 'BattleScene' });
    });
  }

  private handleRetreat(): void {
    if (this.isBattleOver) return;
    this.isBattleOver = true;
    this.autoBattleEnabled = false;
    if (this.autoBattleTimer) this.autoBattleTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();
    soundSynth.playBack();

    // Auto save current HP & stats
    savePlayerData(this.player);

    this.cameras.main.fadeOut(160, 0, 0, 0);
    this.time.delayedCall(170, () => {
      this.scene.start('MenuScene');
    });
  }

  private toggleAutoBattle(): void {
    this.autoBattleEnabled = !this.autoBattleEnabled;
    soundSynth.playToggle();

    if (this.autoBattleEnabled) {
      this.autoBattleBtn.setText('⚡ AUTO: ON');
      this.autoBattleBtn.setButtonColor('#00f0ff');

      // Loop auto actions
      this.autoBattleTimer = this.time.addEvent({
        delay: 550,
        loop: true,
        callback: () => {
          if (!this.autoBattleEnabled || this.isBattleOver || this.isActionLocked) return;

          // Priority 1: Heal if HP < 45%
          const healSkill = this.skillStates['heal'];
          if (
            this.player.hp <= this.player.maxHp * 0.45 &&
            this.time.now - healSkill.lastUsedTime >= healSkill.cooldownMs
          ) {
            this.handleCastSkill('heal');
            return;
          }

          // Priority 2: Power Strike if available
          const ps = this.skillStates['power_strike'];
          if (this.time.now - ps.lastUsedTime >= ps.cooldownMs) {
            this.handleCastSkill('power_strike');
            return;
          }

          // Priority 3: Fireball if available
          const fb = this.skillStates['fireball'];
          if (this.time.now - fb.lastUsedTime >= fb.cooldownMs) {
            this.handleCastSkill('fireball');
            return;
          }

          // Fallback: Basic attack
          this.handlePlayerAttack();
        },
      });
    } else {
      this.autoBattleBtn.setText('⚡ AUTO: OFF');
      this.autoBattleBtn.setButtonColor('#94a3b8');
      if (this.autoBattleTimer) {
        this.autoBattleTimer.remove();
      }
    }
  }

  private toggleSkillsDrawer(): void {
    this.skillsDrawerOpen = !this.skillsDrawerOpen;
    soundSynth.playClick();
    this.skillsContainer.setVisible(this.skillsDrawerOpen);
    this.skillsToggleBtn.setText(this.skillsDrawerOpen ? '✕ CLOSE' : '✨ SKILLS');
  }

  private updateSkillCooldowns(time: number): void {
    Object.keys(this.skillStates).forEach((key) => {
      const skill = this.skillStates[key];
      const elapsed = time - skill.lastUsedTime;
      const textObj = this.skillCooldownTexts[key];
      const btnObj = this.skillButtons[key];

      if (elapsed < skill.cooldownMs) {
        const remainingSec = Math.ceil((skill.cooldownMs - elapsed) / 1000);
        textObj.setText(`${remainingSec}s`);
        btnObj.setAlpha(0.4);
      } else {
        textObj.setText('');
        btnObj.setAlpha(1.0);
      }
    });
  }

  // Health Bars & UI Updates
  private updateHeroHpBar(animate: boolean): void {
    if (!this.heroHpFill) return;
    const hpBarX = 18;
    const hpBarY = 60;
    const barW = 160;
    const barH = 12;

    const pct = Math.max(0, Math.min(1, this.player.hp / this.player.maxHp));
    const targetW = Math.round(barW * pct);

    this.heroHpFill.clear();
    this.heroHpFill.fillStyle(pct > 0.3 ? 0x10b981 : 0xef4444, 1);
    this.heroHpFill.fillRect(hpBarX, hpBarY, targetW, barH);

    if (this.heroHpText) {
      this.heroHpText.setText(`HP: ${this.player.hp}/${this.player.maxHp}`);
    }
  }

  private updateHeroXpBar(): void {
    if (!this.heroXpFill) return;
    const xpBarX = 18;
    const xpBarY = 76;
    const barW = 160;
    const barH = 6;

    const pct = Math.max(0, Math.min(1, this.player.xp / this.player.xpNeeded));
    this.heroXpFill.clear();
    this.heroXpFill.fillStyle(0x00f0ff, 1);
    this.heroXpFill.fillRect(xpBarX, xpBarY, Math.round(barW * pct), barH);
  }

  private updateEnemyHpBar(animate: boolean): void {
    if (!this.enemyHpFill) return;
    const barW = 100;
    const barH = 10;
    const pct = Math.max(0, Math.min(1, this.enemy.hp / this.enemy.maxHp));

    this.enemyHpFill.clear();
    this.enemyHpFill.fillStyle(0xef4444, 1);
    this.enemyHpFill.fillRect(-barW / 2, 7, Math.round(barW * pct), barH);

    if (this.enemyHpText) {
      this.enemyHpText.setText(`${this.enemy.hp}/${this.enemy.maxHp}`);
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const floatText = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color,
      align: 'center',
    });
    floatText.setOrigin(0.5, 0.5);
    floatText.setShadow(1, 2, '#000000', 0, true, true);

    this.tweens.add({
      targets: floatText,
      y: y - 35,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }

  private spawnDungeonEmber(x: number, y: number): void {
    const ember = this.add.image(x + Phaser.Math.Between(-4, 4), y, 'spark_ember');
    ember.setScale(Phaser.Math.FloatBetween(0.8, 1.4));
    this.tweens.add({
      targets: ember,
      x: x + Phaser.Math.Between(-14, 14),
      y: y - Phaser.Math.Between(25, 50),
      alpha: 0,
      scale: 0.2,
      duration: Phaser.Math.Between(600, 1000),
      onComplete: () => ember.destroy(),
    });
  }
}
