import Phaser from 'phaser';

export class BattleTextures {
  public static generateAll(scene: Phaser.Scene): void {
    const textures = scene.textures;

    if (!textures.exists('hero_battle_sheet')) {
      this.generateHeroBattleSheet(scene);
    }
    if (!textures.exists('dungeon_battle_bg')) {
      this.generateDungeonBg(scene);
    }
    if (!textures.exists('slash_arc_fx')) {
      this.generateCombatVfx(scene);
    }
    if (!textures.exists('slime_sheet')) {
      this.generateEnemies(scene);
    }
    if (!textures.exists('icon_power_strike')) {
      this.generateSkillAndUiIcons(scene);
    }
  }

  private static createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // 1. Hero Battle Spritesheet (6 frames: 0:Idle, 1:Dash, 2:Windup, 3:Slash, 4:Hurt, 5:Victory)
  private static generateHeroBattleSheet(scene: Phaser.Scene): void {
    const fw = 48;
    const fh = 56;
    const frames = 6;
    const { canvas, ctx } = this.createCanvas(fw * frames, fh);

    const c = {
      helmDark: '#121324',
      helmMid: '#242745',
      helmLight: '#3f4471',
      visorGlow: '#00f0ff',
      armorDark: '#17192f',
      armorMid: '#2b2f56',
      goldDark: '#936a18',
      goldMid: '#eab308',
      goldLight: '#fef08a',
      capeDark: '#2a0e2d',
      capeMid: '#5c1f67',
      bladeCore: '#e0f2fe',
      bladeEdge: '#38bdf8',
      bladeGlow: '#00f0ff',
      shadow: 'rgba(5, 7, 14, 0.6)',
      hurtRed: '#ef4444',
    };

    for (let f = 0; f < frames; f++) {
      const ox = f * fw;
      const isHurt = f === 4;
      const isVictory = f === 5;
      const isDash = f === 1;
      const isSlash = f === 3;
      const isWindup = f === 2;

      // Base shadow
      ctx.fillStyle = c.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 22, 51, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cape
      ctx.fillStyle = isHurt ? '#7f1d1d' : c.capeDark;
      const capeWave = isDash ? -4 : (isSlash ? -2 : 0);
      ctx.fillRect(ox + 10 + capeWave, 24, 18, 24);
      ctx.fillStyle = isHurt ? '#b91c1c' : c.capeMid;
      ctx.fillRect(ox + 12 + capeWave, 26, 12, 20);

      // Legs / Greaves
      ctx.fillStyle = c.armorDark;
      if (isDash) {
        ctx.fillRect(ox + 12, 42, 6, 10);
        ctx.fillRect(ox + 24, 40, 7, 10);
      } else {
        ctx.fillRect(ox + 15, 41, 6, 10);
        ctx.fillRect(ox + 24, 41, 6, 10);
      }
      ctx.fillStyle = c.armorMid;
      ctx.fillRect(ox + (isDash ? 11 : 14), 48, 7, 4);
      ctx.fillRect(ox + (isDash ? 25 : 24), 48, 7, 4);

      // Torso / Plate
      const bodyX = isHurt ? ox + 14 : (isDash ? ox + 18 : ox + 16);
      ctx.fillStyle = isHurt ? c.hurtRed : c.armorDark;
      ctx.fillRect(bodyX, 23, 16, 18);
      ctx.fillStyle = isHurt ? '#fca5a5' : c.armorMid;
      ctx.fillRect(bodyX + 2, 25, 12, 14);
      // Gold emblem on chest
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(bodyX + 7, 26, 2, 8);
      ctx.fillRect(bodyX + 4, 28, 8, 2);

      // Pauldrons (Shoulders)
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(bodyX - 3, 22, 5, 6);
      ctx.fillRect(bodyX + 14, 22, 5, 6);
      ctx.fillStyle = c.goldLight;
      ctx.fillRect(bodyX - 2, 22, 3, 2);
      ctx.fillRect(bodyX + 15, 22, 3, 2);

      // Helm & Horns
      const helmY = isHurt ? 10 : (isDash ? 12 : 9);
      ctx.fillStyle = c.helmDark;
      ctx.fillRect(bodyX + 1, helmY, 14, 14);
      ctx.fillStyle = isHurt ? '#fca5a5' : c.helmMid;
      ctx.fillRect(bodyX + 3, helmY + 2, 10, 10);
      // Horns
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(bodyX + 6, helmY - 4, 4, 4);
      ctx.fillRect(bodyX + 2, helmY - 5, 3, 3);
      ctx.fillRect(bodyX + 11, helmY - 5, 3, 3);
      // Visor Glow
      ctx.fillStyle = '#05070e';
      ctx.fillRect(bodyX + 4, helmY + 6, 9, 3);
      ctx.fillStyle = isHurt ? '#ff0000' : c.visorGlow;
      ctx.fillRect(bodyX + 5, helmY + 7, 7, 1);

      // Sword & Arm Positions
      if (isVictory) {
        // Blade raised high triumphantly!
        ctx.fillStyle = c.goldMid;
        ctx.fillRect(bodyX + 14, 18, 4, 6);
        ctx.fillRect(bodyX + 12, 16, 8, 2);
        // Blade vertical up into the air
        ctx.fillStyle = c.bladeEdge;
        ctx.fillRect(bodyX + 15, 0, 3, 16);
        ctx.fillStyle = c.bladeCore;
        ctx.fillRect(bodyX + 16, 1, 1, 15);
        ctx.fillStyle = c.bladeGlow;
        ctx.fillRect(bodyX + 14, 0, 5, 16);
      } else if (isSlash) {
        // Blade extended forward in a powerful horizontal cleave!
        ctx.fillStyle = c.goldMid;
        ctx.fillRect(bodyX + 16, 28, 6, 4);
        ctx.fillStyle = c.goldDark;
        ctx.fillRect(bodyX + 22, 25, 2, 10);
        // Extended blade forward
        ctx.fillStyle = c.bladeEdge;
        ctx.fillRect(bodyX + 24, 27, 20, 5);
        ctx.fillStyle = c.bladeCore;
        ctx.fillRect(bodyX + 24, 29, 19, 1);
        ctx.fillStyle = c.bladeGlow;
        ctx.fillRect(bodyX + 42, 26, 4, 7);
      } else if (isWindup) {
        // Blade pulled back ready to strike
        ctx.fillStyle = c.goldMid;
        ctx.fillRect(bodyX - 2, 26, 5, 5);
        ctx.fillStyle = c.goldDark;
        ctx.fillRect(bodyX - 6, 28, 4, 2);
        // Blade tilted upward backwards
        ctx.fillStyle = c.bladeEdge;
        ctx.fillRect(bodyX - 8, 8, 4, 20);
        ctx.fillStyle = c.bladeCore;
        ctx.fillRect(bodyX - 7, 9, 2, 18);
      } else if (isDash) {
        // Blade held forward at charge angle
        ctx.fillStyle = c.goldMid;
        ctx.fillRect(bodyX + 14, 28, 5, 5);
        ctx.fillStyle = c.bladeEdge;
        ctx.fillRect(bodyX + 19, 26, 16, 4);
        ctx.fillStyle = c.bladeCore;
        ctx.fillRect(bodyX + 20, 27, 14, 2);
      } else {
        // Idle: Blade held forward at ready guard
        ctx.fillStyle = c.goldMid;
        ctx.fillRect(bodyX + 14, 28, 4, 6);
        ctx.fillStyle = c.goldDark;
        ctx.fillRect(bodyX + 16, 26, 7, 2);
        ctx.fillStyle = c.bladeEdge;
        ctx.fillRect(bodyX + 18, 8, 3, 18);
        ctx.fillStyle = c.bladeCore;
        ctx.fillRect(bodyX + 19, 9, 1, 16);
        ctx.fillStyle = c.bladeGlow;
        ctx.fillRect(bodyX + 19, 12, 1, 2);
      }
    }

    const tex = scene.textures.addCanvas('hero_battle_sheet', canvas);
    if (tex) {
      for (let i = 0; i < frames; i++) {
        tex.add(i, 0, i * fw, 0, fw, fh);
      }
    }
  }

  // 2. Dungeon Battle Background
  private static generateDungeonBg(scene: Phaser.Scene): void {
    const w = 390;
    const h = 640;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Deep dark gothic wall
    ctx.fillStyle = '#070914';
    ctx.fillRect(0, 0, w, h);

    // Dungeon brick wall pattern
    ctx.fillStyle = '#0f1225';
    ctx.fillRect(0, 0, w, 390);

    ctx.fillStyle = '#171a33';
    for (let y = 30; y < 380; y += 22) {
      ctx.fillRect(0, y, w, 2);
      const offset = (y % 44 === 0) ? 0 : 25;
      for (let x = offset; x < w; x += 50) {
        ctx.fillRect(x, y - 20, 2, 22);
      }
    }

    // Gothic Arched Vault in background
    ctx.fillStyle = '#090b18';
    ctx.beginPath();
    ctx.arc(w / 2, 180, 80, Math.PI, 0);
    ctx.lineTo(w / 2 + 80, 380);
    ctx.lineTo(w / 2 - 80, 380);
    ctx.closePath();
    ctx.fill();

    // Arch brick trim
    ctx.strokeStyle = '#282d56';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Left and Right Giant Stone Pillars
    const drawPillar = (px: number) => {
      ctx.fillStyle = '#12152b';
      ctx.fillRect(px, 40, 42, 350);
      ctx.fillStyle = '#1c2042';
      ctx.fillRect(px + 4, 40, 34, 350);
      // Runic glow carvings on pillars
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(px + 18, 100, 6, 8);
      ctx.fillRect(px + 15, 140, 12, 4);
      ctx.fillRect(px + 18, 180, 6, 12);
      ctx.fillRect(px + 14, 220, 14, 4);
      ctx.fillRect(px + 18, 260, 6, 10);
      // Stone capitals
      ctx.fillStyle = '#2f3567';
      ctx.fillRect(px - 4, 40, 50, 10);
      ctx.fillRect(px - 4, 370, 50, 12);
    };
    drawPillar(12);
    drawPillar(w - 54);

    // Dungeon Stone Floor with cracked flagstones
    ctx.fillStyle = '#15172d';
    ctx.fillRect(0, 380, w, h - 380);

    // Floor stone perspective lines
    ctx.fillStyle = '#0b0d1a';
    ctx.fillRect(0, 380, w, 6);
    for (let y = 400; y < h; y += 32) {
      ctx.fillStyle = '#0e1020';
      ctx.fillRect(0, y, w, 2);
    }
    // Floor tiles
    ctx.fillStyle = '#1d213d';
    ctx.fillRect(30, 410, 80, 2);
    ctx.fillRect(150, 440, 90, 2);
    ctx.fillRect(260, 410, 90, 2);
    ctx.fillRect(80, 480, 110, 2);
    ctx.fillRect(220, 480, 120, 2);

    // Arcane summon circle in middle arena
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w / 2, 440, 130, 38, 0, 0, Math.PI * 2);
    ctx.stroke();

    scene.textures.addCanvas('dungeon_battle_bg', canvas);
  }

  // 3. Combat Visual Effects: Slash Arc, Fireball, Heal Pillar, Sparkles
  private static generateCombatVfx(scene: Phaser.Scene): void {
    // Slash Arc (crescent blade wave)
    {
      const { canvas, ctx } = this.createCanvas(56, 56);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(28, 28, 26, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.lineTo(28, 28);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(28, 28, 24, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.lineTo(28, 28);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(28, 28, 22, -Math.PI * 0.25, Math.PI * 0.25);
      ctx.lineTo(28, 28);
      ctx.fill();

      scene.textures.addCanvas('slash_arc_fx', canvas);
    }

    // Fireball Projectile
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Flame trail
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(17, 16, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(19, 16, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(21, 16, 3, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('fireball_projectile', canvas);
    }

    // Fire Burst Explosion
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.85)';
      ctx.beginPath();
      ctx.arc(24, 24, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(24, 24, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(24, 24, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(24, 24, 4, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('fire_burst_fx', canvas);
    }

    // Heal Pillar of Light
    {
      const { canvas, ctx } = this.createCanvas(44, 90);
      const grad = ctx.createLinearGradient(0, 0, 0, 90);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      grad.addColorStop(0.3, 'rgba(52, 211, 153, 0.6)');
      grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.7)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(6, 0, 32, 90);

      // Core ray
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 10, 12, 80);

      scene.textures.addCanvas('heal_pillar_fx', canvas);
    }
  }

  // 4. Enemy Spritesheets (4 frames each: 0:Idle, 1:Move/Prep, 2:Attack, 3:Hurt)
  private static generateEnemies(scene: Phaser.Scene): void {
    // A. Shadow Slime (32x32)
    {
      const fw = 32;
      const fh = 32;
      const frames = 4;
      const { canvas, ctx } = this.createCanvas(fw * frames, fh);

      for (let f = 0; f < frames; f++) {
        const ox = f * fw;
        const isAttack = f === 2;
        const isHurt = f === 3;
        const squish = (f === 1) ? 3 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(5, 7, 14, 0.5)';
        ctx.beginPath();
        ctx.ellipse(ox + 16, 29, 12 + squish, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Slime body (deep violet / indigo)
        ctx.fillStyle = isHurt ? '#ef4444' : '#3b0764';
        ctx.beginPath();
        ctx.ellipse(ox + 16, 20 + squish, 12 + squish, 10 - squish, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = isHurt ? '#fca5a5' : '#6b21a8';
        ctx.beginPath();
        ctx.ellipse(ox + 16, 21 + squish, 8 + squish, 6 - squish, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Cyan Eyes
        ctx.fillStyle = '#00f0ff';
        const eyeOffset = isAttack ? -2 : 0;
        ctx.fillRect(ox + 10 + eyeOffset, 18 + squish, 3, 3);
        ctx.fillRect(ox + 17 + eyeOffset, 18 + squish, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox + 11 + eyeOffset, 19 + squish, 1, 1);
        ctx.fillRect(ox + 18 + eyeOffset, 19 + squish, 1, 1);

        // Slime crown droplet
        ctx.fillStyle = isHurt ? '#ef4444' : '#581c87';
        ctx.fillRect(ox + 15, 10 + squish, 3, 3);
      }

      const tex = scene.textures.addCanvas('slime_sheet', canvas);
      if (tex) {
        for (let i = 0; i < frames; i++) {
          tex.add(i, 0, i * fw, 0, fw, fh);
        }
      }
    }

    // B. Skeletal Warrior (36x46)
    {
      const fw = 36;
      const fh = 46;
      const frames = 4;
      const { canvas, ctx } = this.createCanvas(fw * frames, fh);

      for (let f = 0; f < frames; f++) {
        const ox = f * fw;
        const isAtk = f === 2;
        const isHurt = f === 3;
        const bx = ox + 18;

        // Shadow
        ctx.fillStyle = 'rgba(5, 7, 14, 0.5)';
        ctx.beginPath();
        ctx.ellipse(bx, 42, 13, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bone Legs
        ctx.fillStyle = isHurt ? '#ef4444' : '#e2e8f0';
        ctx.fillRect(bx - 6, 30, 3, 11);
        ctx.fillRect(bx + 3, 30, 3, 11);

        // Pelvis & Spine
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx - 5, 27, 10, 3);
        ctx.fillRect(bx - 2, 18, 4, 9);
        // Ribs
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(bx - 7, 20, 14, 2);
        ctx.fillRect(bx - 6, 23, 12, 2);

        // Skull
        ctx.fillStyle = isHurt ? '#fca5a5' : '#f8fafc';
        ctx.fillRect(bx - 6, 7, 12, 11);
        // Eye sockets (red evil glow)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 4, 11, 3, 3);
        ctx.fillRect(bx + 1, 11, 3, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx - 3, 12, 1, 1);
        ctx.fillRect(bx + 2, 12, 1, 1);
        // Teeth
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 4, 16, 8, 2);

        // Sword arm
        ctx.fillStyle = '#d97706';
        if (isAtk) {
          // Thrust forward
          ctx.fillRect(bx - 14, 20, 12, 3);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(bx - 22, 19, 8, 5);
        } else {
          ctx.fillRect(bx - 12, 22, 4, 8);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(bx - 14, 12, 4, 14);
        }
      }

      const tex = scene.textures.addCanvas('skeleton_sheet', canvas);
      if (tex) {
        for (let i = 0; i < frames; i++) {
          tex.add(i, 0, i * fw, 0, fw, fh);
        }
      }
    }

    // C. Crypt Gargoyle (42x46)
    {
      const fw = 42;
      const fh = 46;
      const frames = 4;
      const { canvas, ctx } = this.createCanvas(fw * frames, fh);

      for (let f = 0; f < frames; f++) {
        const ox = f * fw;
        const isHurt = f === 3;
        const bx = ox + 21;

        // Shadow
        ctx.fillStyle = 'rgba(5, 7, 14, 0.5)';
        ctx.beginPath();
        ctx.ellipse(bx, 42, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone Wings
        ctx.fillStyle = isHurt ? '#b91c1c' : '#334155';
        ctx.beginPath();
        ctx.moveTo(bx, 20);
        ctx.lineTo(bx - 18, 6);
        ctx.lineTo(bx - 12, 28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx, 20);
        ctx.lineTo(bx + 18, 6);
        ctx.lineTo(bx + 12, 28);
        ctx.closePath();
        ctx.fill();

        // Stone Body
        ctx.fillStyle = isHurt ? '#ef4444' : '#475569';
        ctx.fillRect(bx - 8, 18, 16, 16);
        // Head & Horns
        ctx.fillStyle = isHurt ? '#fca5a5' : '#64748b';
        ctx.fillRect(bx - 7, 8, 14, 11);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx - 10, 5, 4, 5);
        ctx.fillRect(bx + 6, 5, 4, 5);
        // Ruby glowing eyes
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(bx - 5, 12, 3, 2);
        ctx.fillRect(bx + 2, 12, 3, 2);

        // Claws
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx - 8, 34, 5, 8);
        ctx.fillRect(bx + 3, 34, 5, 8);
      }

      const tex = scene.textures.addCanvas('gargoyle_sheet', canvas);
      if (tex) {
        for (let i = 0; i < frames; i++) {
          tex.add(i, 0, i * fw, 0, fw, fh);
        }
      }
    }

    // D. Shadow Necromancer (38x50)
    {
      const fw = 38;
      const fh = 50;
      const frames = 4;
      const { canvas, ctx } = this.createCanvas(fw * frames, fh);

      for (let f = 0; f < frames; f++) {
        const ox = f * fw;
        const isHurt = f === 3;
        const bx = ox + 19;

        // Shadow
        ctx.fillStyle = 'rgba(5, 7, 14, 0.5)';
        ctx.beginPath();
        ctx.ellipse(bx, 46, 13, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tattered Dark Robes
        ctx.fillStyle = isHurt ? '#7f1d1d' : '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(bx - 5, 18);
        ctx.lineTo(bx - 14, 44);
        ctx.lineTo(bx + 14, 44);
        ctx.lineTo(bx + 5, 18);
        ctx.closePath();
        ctx.fill();

        // Robe trim
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(bx - 2, 22, 4, 22);

        // Deep Hood
        ctx.fillStyle = isHurt ? '#ef4444' : '#0f172a';
        ctx.fillRect(bx - 8, 6, 16, 14);
        // Glowing void violet eyes
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(bx - 5, 12, 3, 2);
        ctx.fillRect(bx + 2, 12, 3, 2);

        // Bone Staff & Skull Orb
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx - 14, 10, 3, 34);
        // Floating purple magic orb
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(bx - 13, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - 14, 6, 2, 2);
      }

      const tex = scene.textures.addCanvas('necromancer_sheet', canvas);
      if (tex) {
        for (let i = 0; i < frames; i++) {
          tex.add(i, 0, i * fw, 0, fw, fh);
        }
      }
    }

    // E. The Forgotten Knight Boss (48x58)
    {
      const fw = 48;
      const fh = 58;
      const frames = 4;
      const { canvas, ctx } = this.createCanvas(fw * frames, fh);

      for (let f = 0; f < frames; f++) {
        const ox = f * fw;
        const isHurt = f === 3;
        const bx = ox + 24;

        // Shadow
        ctx.fillStyle = 'rgba(5, 7, 14, 0.6)';
        ctx.beginPath();
        ctx.ellipse(bx, 54, 18, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crimson Cape
        ctx.fillStyle = isHurt ? '#991b1b' : '#450a0a';
        ctx.fillRect(bx - 14, 22, 28, 28);

        // Heavy Iron Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 9, 38, 7, 14);
        ctx.fillRect(bx + 2, 38, 7, 14);
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx - 10, 48, 8, 4);
        ctx.fillRect(bx + 2, 48, 8, 4);

        // Heavy Black Plate
        ctx.fillStyle = isHurt ? '#ef4444' : '#1e293b';
        ctx.fillRect(bx - 11, 18, 22, 22);
        // Spiked Pauldrons
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx - 16, 17, 7, 8);
        ctx.fillRect(bx + 9, 17, 7, 8);

        // Horned Great Helm
        ctx.fillStyle = isHurt ? '#fca5a5' : '#0f172a';
        ctx.fillRect(bx - 8, 5, 16, 15);
        // Jagged Horns
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(bx - 12, 1, 4, 7);
        ctx.fillRect(bx + 8, 1, 4, 7);
        // Menacing Crimson Visor Slit
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(bx - 6, 12, 12, 2);

        // Flaming Zweihander Greatsword
        ctx.fillStyle = '#d97706';
        ctx.fillRect(bx - 18, 16, 4, 34);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(bx - 17, 18, 2, 30);
      }

      const tex = scene.textures.addCanvas('boss_sheet', canvas);
      if (tex) {
        for (let i = 0; i < frames; i++) {
          tex.add(i, 0, i * fw, 0, fw, fh);
        }
      }
    }
  }

  // 5. Skill Icons & UI Loot assets
  private static generateSkillAndUiIcons(scene: Phaser.Scene): void {
    // A. Skill: Power Strike Icon (36x36)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.fillStyle = '#1e213d';
      ctx.fillRect(0, 0, 36, 36);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(1, 1, 34, 34);
      ctx.fillStyle = '#0f1124';
      ctx.fillRect(3, 3, 30, 30);

      // Crossed gold blades
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(28, 28);
      ctx.lineTo(26, 30);
      ctx.lineTo(6, 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(28, 8);
      ctx.lineTo(8, 28);
      ctx.lineTo(10, 30);
      ctx.lineTo(30, 10);
      ctx.closePath();
      ctx.fill();

      // Impact spark
      ctx.fillStyle = '#f97316';
      ctx.fillRect(16, 16, 4, 4);

      scene.textures.addCanvas('icon_power_strike', canvas);
    }

    // B. Skill: Fireball Icon (36x36)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.fillStyle = '#1e213d';
      ctx.fillRect(0, 0, 36, 36);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(1, 1, 34, 34);
      ctx.fillStyle = '#0f1124';
      ctx.fillRect(3, 3, 30, 30);

      // Roaring Fireball
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(18, 18, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(18, 18, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(18, 18, 4, 0, Math.PI * 2);
      ctx.fill();

      scene.textures.addCanvas('icon_fireball', canvas);
    }

    // C. Skill: Healing Icon (36x36)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.fillStyle = '#1e213d';
      ctx.fillRect(0, 0, 36, 36);
      ctx.fillStyle = '#059669';
      ctx.fillRect(1, 1, 34, 34);
      ctx.fillStyle = '#0f1124';
      ctx.fillRect(3, 3, 30, 30);

      // Sacred Runic Cross
      ctx.fillStyle = '#10b981';
      ctx.fillRect(15, 7, 6, 22);
      ctx.fillRect(7, 15, 22, 6);
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(16, 8, 4, 20);
      ctx.fillRect(8, 16, 20, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(17, 17, 2, 2);

      scene.textures.addCanvas('icon_heal', canvas);
    }

    // D. Gold Coin (14x14)
    {
      const { canvas, ctx } = this.createCanvas(14, 14);
      ctx.fillStyle = '#854d0e';
      ctx.beginPath();
      ctx.arc(7, 7, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(7, 7, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(5, 5, 3, 3);
      scene.textures.addCanvas('pixel_coin', canvas);
    }

    // E. Treasure Chest (28x24)
    {
      const { canvas, ctx } = this.createCanvas(28, 24);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 28, 24);
      // Wood box
      ctx.fillStyle = '#78350f';
      ctx.fillRect(2, 2, 24, 20);
      // Iron bands
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 10, 24, 3);
      ctx.fillRect(6, 2, 3, 20);
      ctx.fillRect(19, 2, 3, 20);
      // Gold lock
      ctx.fillStyle = '#eab308';
      ctx.fillRect(12, 9, 4, 5);
      scene.textures.addCanvas('loot_chest', canvas);
    }
  }
}
