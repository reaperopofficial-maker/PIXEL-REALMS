import Phaser from 'phaser';

export class PixelArtTextures {
  public static generateAll(scene: Phaser.Scene): void {
    const textures = scene.textures;

    if (!textures.exists('hero_idle_sheet')) {
      this.generateHeroIdleSheet(scene);
    }
    if (!textures.exists('torch_sheet')) {
      this.generateTorchSheet(scene);
    }
    if (!textures.exists('torch_glow')) {
      this.generateTorchGlow(scene);
    }
    if (!textures.exists('crystal_cyan')) {
      this.generateCyanCrystal(scene);
    }
    if (!textures.exists('mountain_layer')) {
      this.generateMountainLayer(scene);
    }
    if (!textures.exists('castle_layer')) {
      this.generateCastleLayer(scene);
    }
    if (!textures.exists('stone_parapet')) {
      this.generateStoneParapet(scene);
    }
    if (!textures.exists('pixel_btn_normal')) {
      this.generateButtons(scene);
    }
    if (!textures.exists('pixel_panel_bg')) {
      this.generateStonePanel(scene);
    }
    if (!textures.exists('mote_cyan')) {
      this.generateParticles(scene);
    }
  }

  // Helper to draw a pixel grid from ascii matrix or color definitions
  private static createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  private static generateHeroIdleSheet(scene: Phaser.Scene): void {
    const frameW = 40;
    const frameH = 54;
    const frames = 4;
    const { canvas, ctx } = this.createCanvas(frameW * frames, frameH);

    // Palettes
    const c = {
      helmDark: '#121324',
      helmMid: '#242745',
      helmLight: '#3f4471',
      visorGlow: '#00f0ff',
      visorCore: '#e0ffff',
      armorDark: '#17192f',
      armorMid: '#2b2f56',
      armorHigh: '#4a5189',
      goldDark: '#936a18',
      goldMid: '#eab308',
      goldLight: '#fef08a',
      capeDark: '#2a0e2d',
      capeMid: '#4c1d56',
      capeLight: '#782885',
      swordHilt: '#713f12',
      bladeCore: '#e0f2fe',
      bladeEdge: '#38bdf8',
      bladeGlow: '#00f0ff',
      skin: '#e2d9cc',
      shadow: 'rgba(5, 7, 14, 0.65)',
    };

    for (let f = 0; f < frames; f++) {
      const ox = f * frameW;
      const breatheY = (f === 1 || f === 2) ? -1 : 0;
      const capeWave = (f % 2 === 0) ? 0 : (f === 1 ? 1 : 2);

      // Shadow underneath
      ctx.fillStyle = c.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 20, 50, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cape (behind body)
      ctx.fillStyle = c.capeDark;
      ctx.fillRect(ox + 10 - capeWave, 22 + breatheY, 18 + capeWave, 24);
      ctx.fillStyle = c.capeMid;
      ctx.fillRect(ox + 12 - capeWave, 24 + breatheY, 13 + capeWave, 21);
      ctx.fillStyle = c.capeLight;
      ctx.fillRect(ox + 14 - capeWave, 25 + breatheY, 3, 18);
      // Cape folds
      ctx.fillStyle = c.capeDark;
      ctx.fillRect(ox + 17, 28 + breatheY, 2, 16);

      // Greaves & Boots
      ctx.fillStyle = c.armorDark;
      ctx.fillRect(ox + 14, 38, 5, 11);
      ctx.fillRect(ox + 22, 38, 5, 11);
      ctx.fillStyle = c.armorMid;
      ctx.fillRect(ox + 13, 46, 6, 4);
      ctx.fillRect(ox + 22, 46, 6, 4);
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(ox + 14, 41, 4, 1);
      ctx.fillRect(ox + 23, 41, 4, 1);

      // Chestplate & Belt
      ctx.fillStyle = c.armorDark;
      ctx.fillRect(ox + 13, 22 + breatheY, 15, 16);
      ctx.fillStyle = c.armorMid;
      ctx.fillRect(ox + 15, 23 + breatheY, 11, 13);
      ctx.fillStyle = c.armorHigh;
      ctx.fillRect(ox + 17, 24 + breatheY, 6, 4);

      // Gold filigree on chest
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(ox + 19, 24 + breatheY, 2, 8);
      ctx.fillRect(ox + 16, 26 + breatheY, 8, 2);
      ctx.fillStyle = c.goldDark;
      ctx.fillRect(ox + 14, 34 + breatheY, 13, 3); // Belt
      ctx.fillStyle = c.goldLight;
      ctx.fillRect(ox + 19, 34 + breatheY, 3, 3); // Belt buckle

      // Pauldrons (Shoulders)
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(ox + 10, 20 + breatheY, 5, 6);
      ctx.fillRect(ox + 26, 20 + breatheY, 5, 6);
      ctx.fillStyle = c.goldLight;
      ctx.fillRect(ox + 11, 20 + breatheY, 3, 2);
      ctx.fillRect(ox + 27, 20 + breatheY, 3, 2);

      // Great Helm
      ctx.fillStyle = c.helmDark;
      ctx.fillRect(ox + 14, 8 + breatheY, 13, 13);
      ctx.fillStyle = c.helmMid;
      ctx.fillRect(ox + 15, 9 + breatheY, 11, 11);
      ctx.fillStyle = c.helmLight;
      ctx.fillRect(ox + 16, 10 + breatheY, 3, 4);

      // Horned crest
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(ox + 19, 5 + breatheY, 3, 4);
      ctx.fillRect(ox + 17, 4 + breatheY, 7, 2);
      ctx.fillRect(ox + 15, 2 + breatheY, 3, 3);
      ctx.fillRect(ox + 23, 2 + breatheY, 3, 3);

      // Visor with glowing cyan eye slit
      ctx.fillStyle = '#050710';
      ctx.fillRect(ox + 15, 14 + breatheY, 10, 3);
      ctx.fillStyle = c.visorGlow;
      ctx.fillRect(ox + 17, 15 + breatheY, 6, 1);
      ctx.fillStyle = c.visorCore;
      ctx.fillRect(ox + 19, 15 + breatheY, 2, 1);

      // Right Arm & Runic Blade (Held upright at slight hero angle)
      ctx.fillStyle = c.armorMid;
      ctx.fillRect(ox + 28, 23 + breatheY, 4, 8);
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(ox + 29, 29 + breatheY, 3, 3); // Gauntlet

      // Sword Hilt & Crossguard
      ctx.fillStyle = c.goldDark;
      ctx.fillRect(ox + 28, 30 + breatheY, 9, 2);
      ctx.fillStyle = c.goldLight;
      ctx.fillRect(ox + 31, 29 + breatheY, 3, 4);
      ctx.fillStyle = c.swordHilt;
      ctx.fillRect(ox + 32, 33 + breatheY, 2, 5); // Pommel grip
      ctx.fillStyle = c.goldMid;
      ctx.fillRect(ox + 31, 38 + breatheY, 4, 2); // Pommel gem

      // Glowing Cyan Blade
      ctx.fillStyle = c.bladeEdge;
      ctx.fillRect(ox + 31, 3 + breatheY, 3, 27);
      ctx.fillRect(ox + 32, 1 + breatheY, 1, 2); // Tip
      ctx.fillStyle = c.bladeCore;
      ctx.fillRect(ox + 32, 4 + breatheY, 1, 25);

      // Runic symbols glowing on blade
      const runeFlicker = (f % 2 === 0) ? c.bladeGlow : '#ffffff';
      ctx.fillStyle = runeFlicker;
      ctx.fillRect(ox + 32, 8 + breatheY, 1, 2);
      ctx.fillRect(ox + 32, 14 + breatheY, 1, 2);
      ctx.fillRect(ox + 32, 20 + breatheY, 1, 2);

      // Subtle cyan magical rune aura aura around sword
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.fillRect(ox + 30, 2 + breatheY, 5, 28);
    }

    const tex = scene.textures.addCanvas('hero_idle_sheet', canvas);
    if (tex) {
      for (let i = 0; i < frames; i++) {
        tex.add(i, 0, i * frameW, 0, frameW, frameH);
      }
    }
  }

  private static generateTorchSheet(scene: Phaser.Scene): void {
    const frameW = 20;
    const frameH = 36;
    const frames = 4;
    const { canvas, ctx } = this.createCanvas(frameW * frames, frameH);

    for (let f = 0; f < frames; f++) {
      const ox = f * frameW;

      // Iron wall sconce bracket
      ctx.fillStyle = '#1c1e2b';
      ctx.fillRect(ox + 8, 18, 4, 16);
      ctx.fillRect(ox + 5, 30, 10, 4);
      ctx.fillStyle = '#3a3f58';
      ctx.fillRect(ox + 6, 20, 8, 4);
      // Brazier cup
      ctx.fillStyle = '#1c1e2b';
      ctx.fillRect(ox + 4, 14, 12, 6);
      ctx.fillStyle = '#575f85';
      ctx.fillRect(ox + 5, 15, 10, 2);

      // Flickering flame frames
      const flameShiftX = (f === 1) ? 1 : (f === 3 ? -1 : 0);
      const flameHgt = (f % 2 === 0) ? 0 : 2;

      // Flame outer dark orange/red
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(ox + 6 + flameShiftX, 4 - flameHgt, 8, 12 + flameHgt);
      ctx.fillRect(ox + 7 + flameShiftX, 2 - flameHgt, 6, 4);
      ctx.fillRect(ox + 8 + flameShiftX, 0 - flameHgt, 4, 3);

      // Flame mid warm amber/orange
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ox + 7 + flameShiftX, 5 - flameHgt, 6, 9 + flameHgt);
      ctx.fillRect(ox + 8 + flameShiftX, 2 - flameHgt, 4, 4);

      // Flame core brilliant yellow/white
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(ox + 8 + flameShiftX, 6 - flameHgt, 4, 6 + flameHgt);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 9 + flameShiftX, 8, 2, 3);

      // Rising ember sparks
      if (f === 0 || f === 2) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(ox + 10, 1, 1, 2);
      } else {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(ox + 7, 0, 2, 2);
      }
    }

    const torchTex = scene.textures.addCanvas('torch_sheet', canvas);
    if (torchTex) {
      for (let i = 0; i < frames; i++) {
        torchTex.add(i, 0, i * frameW, 0, frameW, frameH);
      }
    }
  }

  private static generateTorchGlow(scene: Phaser.Scene): void {
    const size = 128;
    const { canvas, ctx } = this.createCanvas(size, size);
    const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 180, 50, 0.45)');
    grad.addColorStop(0.3, 'rgba(245, 130, 20, 0.22)');
    grad.addColorStop(0.7, 'rgba(180, 50, 10, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    scene.textures.addCanvas('torch_glow', canvas);
  }

  private static generateCyanCrystal(scene: Phaser.Scene): void {
    const w = 18;
    const h = 26;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Glowing cyan floating runic diamond
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.moveTo(9, 1);
    ctx.lineTo(16, 10);
    ctx.lineTo(9, 24);
    ctx.lineTo(2, 10);
    ctx.closePath();
    ctx.fill();

    // Inner facets
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(9, 2);
    ctx.lineTo(14, 10);
    ctx.lineTo(9, 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(9, 3);
    ctx.lineTo(8, 10);
    ctx.lineTo(9, 21);
    ctx.lineTo(13, 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#a5f3fc';
    ctx.fillRect(8, 8, 3, 5);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 5, 1, 3);

    scene.textures.addCanvas('crystal_cyan', canvas);
  }

  private static generateMountainLayer(scene: Phaser.Scene): void {
    const w = 390;
    const h = 200;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Distant mountain ridge (dark midnight indigo)
    ctx.fillStyle = '#0d1024';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, 80);
    ctx.lineTo(45, 45);
    ctx.lineTo(90, 85);
    ctx.lineTo(140, 30);
    ctx.lineTo(195, 75);
    ctx.lineTo(250, 20);
    ctx.lineTo(310, 70);
    ctx.lineTo(360, 40);
    ctx.lineTo(w, 85);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Mountain shading facets
    ctx.fillStyle = '#161a38';
    ctx.beginPath();
    ctx.moveTo(140, 30);
    ctx.lineTo(165, 75);
    ctx.lineTo(140, h);
    ctx.lineTo(110, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(250, 20);
    ctx.lineTo(285, 70);
    ctx.lineTo(260, h);
    ctx.lineTo(225, h);
    ctx.closePath();
    ctx.fill();

    // Mid-ground mountain ridge
    ctx.fillStyle = '#141733';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, 110);
    ctx.lineTo(60, 70);
    ctx.lineTo(120, 115);
    ctx.lineTo(180, 80);
    ctx.lineTo(240, 120);
    ctx.lineTo(320, 75);
    ctx.lineTo(w, 105);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    scene.textures.addCanvas('mountain_layer', canvas);
  }

  private static generateCastleLayer(scene: Phaser.Scene): void {
    const w = 390;
    const h = 220;
    const { canvas, ctx } = this.createCanvas(w, h);

    const wallColor = '#101227';
    const highlightWall = '#1e2247';
    const darkArch = '#080914';
    const windowGlow = '#f59e0b';

    ctx.fillStyle = wallColor;

    // Main central ruined keep / bastion
    ctx.fillRect(115, 60, 160, 160);
    // Left tower
    ctx.fillRect(30, 40, 55, 180);
    // Right high gothic spire tower
    ctx.fillRect(295, 20, 60, 200);

    // Spire roof peaks
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.lineTo(57, 10);
    ctx.lineTo(85, 40);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(295, 20);
    ctx.lineTo(325, -15);
    ctx.lineTo(355, 20);
    ctx.closePath();
    ctx.fill();

    // Crenellations (battlement teeth)
    for (let x = 115; x < 275; x += 16) {
      ctx.fillRect(x, 50, 10, 12);
    }
    for (let x = 32; x < 82; x += 12) {
      ctx.fillRect(x, 34, 7, 8);
    }

    // Broken collapsed wall section (ancient ruins look)
    ctx.fillStyle = '#0a0b18';
    ctx.fillRect(180, 52, 28, 18);
    ctx.fillRect(215, 56, 18, 14);

    // Stone brick detail accents
    ctx.fillStyle = highlightWall;
    ctx.fillRect(130, 80, 16, 4);
    ctx.fillRect(170, 95, 14, 4);
    ctx.fillRect(230, 85, 18, 4);
    ctx.fillRect(45, 65, 12, 4);
    ctx.fillRect(55, 110, 14, 4);
    ctx.fillRect(310, 50, 16, 4);
    ctx.fillRect(325, 90, 18, 4);

    // Arched gothic gate
    ctx.fillStyle = darkArch;
    ctx.beginPath();
    ctx.arc(195, 175, 24, Math.PI, 0);
    ctx.lineTo(219, 220);
    ctx.lineTo(171, 220);
    ctx.closePath();
    ctx.fill();

    // Distant torch / lantern window glows
    ctx.fillStyle = windowGlow;
    ctx.fillRect(52, 75, 5, 9);
    ctx.fillRect(320, 65, 5, 11);
    ctx.fillRect(150, 110, 6, 10);
    ctx.fillRect(240, 110, 6, 10);

    // Distant window crosses
    ctx.fillStyle = darkArch;
    ctx.fillRect(54, 75, 1, 9);
    ctx.fillRect(52, 79, 5, 1);
    ctx.fillRect(322, 65, 1, 11);
    ctx.fillRect(320, 70, 5, 1);

    scene.textures.addCanvas('castle_layer', canvas);
  }

  private static generateStoneParapet(scene: Phaser.Scene): void {
    const w = 390;
    const h = 130;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Stone floor base
    ctx.fillStyle = '#171933';
    ctx.fillRect(0, 30, w, h - 30);

    // Stone balustrade railing
    ctx.fillStyle = '#22254b';
    ctx.fillRect(0, 10, w, 20);
    ctx.fillStyle = '#2e3363';
    ctx.fillRect(0, 10, w, 4); // Railing top highlight

    // Balustrade stone pillars
    for (let x = 10; x < w; x += 32) {
      ctx.fillStyle = '#121429';
      ctx.fillRect(x + 2, 14, 12, 16);
      ctx.fillStyle = '#2b305f';
      ctx.fillRect(x, 12, 16, 3);
      ctx.fillRect(x, 28, 16, 3);
    }

    // Flagstone pavement tiles
    ctx.fillStyle = '#1c1f3d';
    for (let y = 34; y < h; y += 18) {
      ctx.fillStyle = '#0f1122';
      ctx.fillRect(0, y, w, 2); // Mortar groove
    }
    // Vertical stone grooves
    for (let x = 20; x < w; x += 48) {
      ctx.fillRect(x, 34, 2, 36);
      ctx.fillRect(x + 24, 70, 2, 60);
    }

    // Stone highlights
    ctx.fillStyle = '#2a2e57';
    ctx.fillRect(22, 36, 44, 2);
    ctx.fillRect(94, 54, 44, 2);
    ctx.fillRect(142, 36, 44, 2);
    ctx.fillRect(214, 54, 44, 2);
    ctx.fillRect(286, 36, 44, 2);

    scene.textures.addCanvas('stone_parapet', canvas);
  }

  private static generateButtons(scene: Phaser.Scene): void {
    const w = 220;
    const h = 48;

    // 1. Normal state (Dark iron gothic frame with gold accents)
    {
      const { canvas, ctx } = this.createCanvas(w, h);
      // Outer border
      ctx.fillStyle = '#0c0e1a';
      ctx.fillRect(0, 0, w, h);
      // Gold frame edge
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(2, 2, w - 4, h - 4);
      // Inner iron body
      ctx.fillStyle = '#1e213a';
      ctx.fillRect(4, 4, w - 8, h - 8);
      // Bevel highlights
      ctx.fillStyle = '#373c68';
      ctx.fillRect(4, 4, w - 8, 3);
      ctx.fillRect(4, 4, 3, h - 8);
      ctx.fillStyle = '#101221';
      ctx.fillRect(4, h - 7, w - 8, 3);
      ctx.fillRect(w - 7, 4, 3, h - 8);
      // Gold corner studs
      ctx.fillStyle = '#fde047';
      ctx.fillRect(5, 5, 3, 3);
      ctx.fillRect(w - 8, 5, 3, 3);
      ctx.fillRect(5, h - 8, 3, 3);
      ctx.fillRect(w - 8, h - 8, 3, 3);

      scene.textures.addCanvas('pixel_btn_normal', canvas);
    }

    // 2. Hover state (Cyan energetic runic highlight)
    {
      const { canvas, ctx } = this.createCanvas(w, h);
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = '#1e294b';
      ctx.fillRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, 4, w - 8, 3);
      ctx.fillRect(4, 4, 3, h - 8);
      ctx.fillStyle = '#0c162c';
      ctx.fillRect(4, h - 7, w - 8, 3);
      ctx.fillRect(w - 7, 4, 3, h - 8);
      // Cyan corner studs
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(5, 5, 3, 3);
      ctx.fillRect(w - 8, 5, 3, 3);
      ctx.fillRect(5, h - 8, 3, 3);
      ctx.fillRect(w - 8, h - 8, 3, 3);

      scene.textures.addCanvas('pixel_btn_hover', canvas);
    }

    // 3. Pressed state (Depressed shadow bevel)
    {
      const { canvas, ctx } = this.createCanvas(w, h);
      ctx.fillStyle = '#0a0b14';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = '#141628';
      ctx.fillRect(4, 4, w - 8, h - 8);
      // Depressed inner shadow
      ctx.fillStyle = '#090a13';
      ctx.fillRect(4, 4, w - 8, 4);
      ctx.fillRect(4, 4, 4, h - 8);
      ctx.fillStyle = '#222543';
      ctx.fillRect(4, h - 7, w - 8, 2);
      ctx.fillRect(w - 7, 4, 2, h - 8);

      scene.textures.addCanvas('pixel_btn_pressed', canvas);
    }

    // Secondary smaller button (140x40)
    {
      const sw = 150;
      const sh = 42;
      const { canvas, ctx } = this.createCanvas(sw, sh);
      ctx.fillStyle = '#0a0c16';
      ctx.fillRect(0, 0, sw, sh);
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 2, sw - 4, sh - 4);
      ctx.fillStyle = '#181b2f';
      ctx.fillRect(4, 4, sw - 8, sh - 8);
      ctx.fillStyle = '#2c3154';
      ctx.fillRect(4, 4, sw - 8, 2);
      ctx.fillStyle = '#0e0f1b';
      ctx.fillRect(4, sh - 6, sw - 8, 2);

      scene.textures.addCanvas('pixel_btn_secondary', canvas);
    }
  }

  private static generateStonePanel(scene: Phaser.Scene): void {
    const w = 340;
    const h = 460;
    const { canvas, ctx } = this.createCanvas(w, h);

    // Dark gothic slate background
    ctx.fillStyle = '#0a0c18';
    ctx.fillRect(0, 0, w, h);

    // Ornate gold/bronze outer rim
    ctx.fillStyle = '#946313';
    ctx.fillRect(3, 3, w - 6, h - 6);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(5, 5, w - 10, h - 10);

    // Deep stone interior
    ctx.fillStyle = '#14172b';
    ctx.fillRect(8, 8, w - 16, h - 16);

    // Subtle stone tile pattern
    ctx.fillStyle = '#101222';
    for (let y = 30; y < h - 20; y += 40) {
      ctx.fillRect(10, y, w - 20, 1);
    }
    for (let x = 50; x < w - 20; x += 60) {
      ctx.fillRect(x, 10, 1, h - 20);
    }

    // Corner ornate runic brackets
    const drawCorner = (cx: number, cy: number, flipX: boolean, flipY: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(0, 0, 16, 4);
      ctx.fillRect(0, 0, 4, 16);
      ctx.fillRect(6, 6, 6, 6);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(8, 8, 2, 2);
      ctx.restore();
    };

    drawCorner(10, 10, false, false);
    drawCorner(w - 10, 10, true, false);
    drawCorner(10, h - 10, false, true);
    drawCorner(w - 10, h - 10, true, true);

    // Header flourish bar
    ctx.fillStyle = '#b45309';
    ctx.fillRect(24, 60, w - 48, 2);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(w / 2 - 16, 58, 32, 6);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(w / 2 - 4, 59, 8, 4);

    scene.textures.addCanvas('pixel_panel_bg', canvas);
  }

  private static generateParticles(scene: Phaser.Scene): void {
    // 1. Cyan magical mote
    {
      const { canvas, ctx } = this.createCanvas(6, 6);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.fillRect(0, 0, 6, 6);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(1, 1, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 2, 2);
      scene.textures.addCanvas('mote_cyan', canvas);
    }

    // 2. Fire ember spark
    {
      const { canvas, ctx } = this.createCanvas(4, 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(0, 0, 4, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(1, 1, 2, 2);
      scene.textures.addCanvas('spark_ember', canvas);
    }

    // 3. Twinkling star
    {
      const { canvas, ctx } = this.createCanvas(5, 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(2, 0, 1, 5);
      ctx.fillRect(0, 2, 5, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 1, 1);
      scene.textures.addCanvas('star_particle', canvas);
    }

    // 4. Toggle switch ON
    {
      const { canvas, ctx } = this.createCanvas(52, 26);
      ctx.fillStyle = '#082f49';
      ctx.fillRect(0, 0, 52, 26);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(2, 2, 48, 22);
      // Active glowing knob on right
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(28, 4, 20, 18);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(32, 7, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(36, 11, 4, 4);
      scene.textures.addCanvas('toggle_on', canvas);
    }

    // 5. Toggle switch OFF
    {
      const { canvas, ctx } = this.createCanvas(52, 26);
      ctx.fillStyle = '#111322';
      ctx.fillRect(0, 0, 52, 26);
      ctx.fillStyle = '#232742';
      ctx.fillRect(2, 2, 48, 22);
      // Inactive dark knob on left
      ctx.fillStyle = '#474d75';
      ctx.fillRect(4, 4, 20, 18);
      ctx.fillStyle = '#6770a3';
      ctx.fillRect(6, 6, 8, 14);
      scene.textures.addCanvas('toggle_off', canvas);
    }
  }
}
