import Phaser from 'phaser';

export class InventoryTextures {
  public static generateAll(scene: Phaser.Scene): void {
    const textures = scene.textures;

    if (!textures.exists('slot_frame_empty')) {
      this.generateSlotFrames(scene);
    }
    if (!textures.exists('slot_icon_weapon')) {
      this.generateSlotSilhouettes(scene);
    }
    if (!textures.exists('item_rusty_sword')) {
      this.generateItemIcons(scene);
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

  // --- SLOT FRAMES ---
  private static generateSlotFrames(scene: Phaser.Scene): void {
    const size = 44;

    // 1. Empty/Default Slot Frame
    {
      const { canvas, ctx } = this.createCanvas(size, size);
      // Dark slate background
      ctx.fillStyle = '#0f1224';
      ctx.fillRect(0, 0, size, size);

      // Inner inset
      ctx.fillStyle = '#161a33';
      ctx.fillRect(2, 2, size - 4, size - 4);

      // Subtle inner dark bevel
      ctx.fillStyle = '#0a0d1b';
      ctx.fillRect(4, 4, size - 8, size - 8);

      // Outer border
      ctx.strokeStyle = '#2b325c';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);

      // Corner rivets
      ctx.fillStyle = '#4b5585';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(size - 4, 2, 2, 2);
      ctx.fillRect(2, size - 4, 2, 2);
      ctx.fillRect(size - 4, size - 4, 2, 2);

      scene.textures.addCanvas('slot_frame_empty', canvas);
    }

    // 2. Selected Slot Frame (Glow Gold/Cyan)
    {
      const { canvas, ctx } = this.createCanvas(size, size);
      ctx.fillStyle = '#1e1c38';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#181f3b';
      ctx.fillRect(2, 2, size - 4, size - 4);

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);

      // Inner cyan highlight border
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(3, 3, size - 6, size - 6);

      // Bright corner notches
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, 4, 2);
      ctx.fillRect(0, 0, 2, 4);
      ctx.fillRect(size - 4, 0, 4, 2);
      ctx.fillRect(size - 2, 0, 2, 4);
      ctx.fillRect(0, size - 2, 4, 2);
      ctx.fillRect(0, size - 4, 2, 4);
      ctx.fillRect(size - 4, size - 2, 4, 2);
      ctx.fillRect(size - 2, size - 4, 2, 4);

      scene.textures.addCanvas('slot_frame_selected', canvas);
    }

    // 3. Equipped Slot Frame (Ornate Gold/Amber)
    {
      const { canvas, ctx } = this.createCanvas(size, size);
      ctx.fillStyle = '#14172e';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#1e2445';
      ctx.fillRect(2, 2, size - 4, size - 4);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(size - 5, 3, 2, 2);
      ctx.fillRect(3, size - 5, 2, 2);
      ctx.fillRect(size - 5, size - 5, 2, 2);

      scene.textures.addCanvas('slot_frame_equipped', canvas);
    }
  }

  // --- SLOT SILHOUETTES (Empty slot placeholders) ---
  private static generateSlotSilhouettes(scene: Phaser.Scene): void {
    const s = 32;

    // Weapon Silhouette
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      // Blade diagonal
      for (let i = 0; i < 14; i++) {
        ctx.fillRect(10 + i, 22 - i, 2, 2);
        ctx.fillRect(11 + i, 21 - i, 2, 2);
      }
      // Tip
      ctx.fillRect(24, 8, 2, 2);
      // Crossguard
      ctx.fillRect(7, 20, 6, 2);
      ctx.fillRect(11, 24, 2, 6);
      // Pommel
      ctx.fillRect(5, 26, 3, 3);
      scene.textures.addCanvas('slot_icon_weapon', canvas);
    }

    // Armor Silhouette
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      // Neckline
      ctx.fillRect(12, 7, 8, 2);
      // Shoulders / Pauldrons
      ctx.fillRect(6, 9, 20, 4);
      // Torso
      ctx.fillRect(8, 13, 16, 12);
      // Waist
      ctx.fillRect(10, 25, 12, 3);
      scene.textures.addCanvas('slot_icon_armor', canvas);
    }

    // Helmet Silhouette
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      // Dome
      ctx.fillRect(10, 6, 12, 3);
      ctx.fillRect(8, 9, 16, 5);
      // Visor brow
      ctx.fillRect(7, 14, 18, 4);
      // Cheeks
      ctx.fillRect(8, 18, 4, 7);
      ctx.fillRect(20, 18, 4, 7);
      ctx.fillRect(14, 23, 4, 3);
      scene.textures.addCanvas('slot_icon_helmet', canvas);
    }

    // Accessory Silhouette
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
      // Ring circle
      ctx.beginPath();
      ctx.arc(16, 17, 8, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
      ctx.stroke();
      // Gem top
      ctx.fillRect(14, 6, 4, 4);
      scene.textures.addCanvas('slot_icon_accessory', canvas);
    }
  }

  // --- ITEM ICONS (32x32) ---
  private static generateItemIcons(scene: Phaser.Scene): void {
    const s = 32;

    // 1. Rusty Sword
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Corroded blade
      ctx.fillStyle = '#78350f';
      for (let i = 0; i < 12; i++) {
        ctx.fillRect(9 + i, 21 - i, 3, 3);
      }
      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 11; i += 2) {
        ctx.fillRect(10 + i, 20 - i, 2, 2);
      }
      // Notches / dull spots
      ctx.fillStyle = '#451a03';
      ctx.fillRect(16, 14, 2, 2);
      ctx.fillRect(12, 18, 2, 2);
      // Tip
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(21, 9, 2, 2);
      // Guard & Hilt
      ctx.fillStyle = '#713f12';
      ctx.fillRect(6, 21, 6, 3);
      ctx.fillRect(9, 24, 3, 5);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(6, 27, 4, 3);
      scene.textures.addCanvas('item_rusty_sword', canvas);
    }

    // 2. Iron Broadsword
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Steel Blade
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 13; i++) {
        ctx.fillRect(9 + i, 22 - i, 3, 3);
      }
      // Shiny Blade Center Ridge
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 12; i++) {
        ctx.fillRect(10 + i, 21 - i, 2, 2);
      }
      // Tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(22, 9, 2, 2);
      // Crossguard (Steel with gold tips)
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, 21, 8, 3);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(5, 20, 2, 4);
      ctx.fillRect(13, 24, 2, 4);
      // Grip & Pommel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 24, 3, 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(6, 27, 4, 3);
      scene.textures.addCanvas('item_iron_sword', canvas);
    }

    // 3. Shadow Blade
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Dark blade body
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 13; i++) {
        ctx.fillRect(9 + i, 22 - i, 4, 4);
      }
      // Glowing Cyan Edge & Spine
      ctx.fillStyle = '#00f0ff';
      for (let i = 0; i < 13; i++) {
        ctx.fillRect(11 + i, 21 - i, 2, 2);
      }
      ctx.fillStyle = '#a5f3fc';
      ctx.fillRect(22, 9, 3, 3);
      // Runic glyphs along blade
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14, 17, 2, 2);
      ctx.fillRect(18, 13, 2, 2);
      // Dark gothic guard
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(6, 21, 7, 3);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(5, 20, 2, 3);
      // Grip & Pommel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, 24, 3, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(6, 27, 4, 3);
      scene.textures.addCanvas('item_shadow_blade', canvas);
    }

    // 4. Forgotten King Blade (Zweihander)
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Royal gold aura around blade
      ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
      for (let i = 0; i < 14; i++) {
        ctx.fillRect(8 + i, 23 - i, 6, 6);
      }
      // Massive dark rune blade
      ctx.fillStyle = '#1e1b4b';
      for (let i = 0; i < 14; i++) {
        ctx.fillRect(9 + i, 23 - i, 4, 4);
      }
      // Glowing cyan & gold twin edges
      ctx.fillStyle = '#00f0ff';
      for (let i = 0; i < 13; i++) {
        ctx.fillRect(10 + i, 22 - i, 2, 2);
      }
      ctx.fillStyle = '#fef08a';
      for (let i = 2; i < 12; i += 3) {
        ctx.fillRect(11 + i, 21 - i, 2, 2);
      }
      // Tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(23, 8, 3, 3);
      // Ornate Royal Crossguard
      ctx.fillStyle = '#eab308';
      ctx.fillRect(5, 22, 10, 4);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 25, 3, 4);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(6, 28, 4, 3);
      scene.textures.addCanvas('item_forgotten_blade', canvas);
    }

    // 5. Leather Armor
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Outer brown shape
      ctx.fillStyle = '#5a3014';
      ctx.fillRect(8, 7, 16, 18);
      // Shoulder straps
      ctx.fillRect(6, 8, 4, 4);
      ctx.fillRect(22, 8, 4, 4);
      // Tunic body highlights
      ctx.fillStyle = '#92400e';
      ctx.fillRect(9, 9, 14, 15);
      // Neck cutout
      ctx.fillStyle = '#0f1224';
      ctx.fillRect(13, 7, 6, 3);
      // Belt with brass buckle
      ctx.fillStyle = '#291407';
      ctx.fillRect(8, 19, 16, 3);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(14, 19, 4, 3);
      // Stitched seams
      ctx.fillStyle = '#d97706';
      ctx.fillRect(10, 12, 1, 6);
      ctx.fillRect(21, 12, 1, 6);
      scene.textures.addCanvas('item_leather_armor', canvas);
    }

    // 6. Iron Breastplate
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Steel shadow base
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(7, 7, 18, 19);
      // Steel plate
      ctx.fillStyle = '#64748b';
      ctx.fillRect(8, 8, 16, 17);
      // Pauldrons
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(5, 7, 5, 5);
      ctx.fillRect(22, 7, 5, 5);
      // Chest specular highlight
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(10, 10, 5, 7);
      ctx.fillRect(17, 10, 5, 7);
      // Neck cutout
      ctx.fillStyle = '#0f1224';
      ctx.fillRect(13, 7, 6, 3);
      // Center armor ridge
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(15, 9, 2, 14);
      // Gold trim rivets
      ctx.fillStyle = '#eab308';
      ctx.fillRect(8, 23, 2, 2);
      ctx.fillRect(22, 23, 2, 2);
      scene.textures.addCanvas('item_iron_armor', canvas);
    }

    // 7. Granite Carapace (Gargoyle stone)
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Heavy dark stone base
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(6, 6, 20, 20);
      // Granite stone plates
      ctx.fillStyle = '#44403c';
      ctx.fillRect(7, 7, 18, 18);
      // Jagged gargoyle pauldrons
      ctx.fillStyle = '#57534e';
      ctx.fillRect(4, 5, 5, 7);
      ctx.fillRect(23, 5, 5, 7);
      // Glowing green/cyan magical cracks
      ctx.fillStyle = '#34d399';
      ctx.fillRect(10, 11, 4, 1);
      ctx.fillRect(13, 12, 2, 4);
      ctx.fillRect(18, 14, 4, 1);
      ctx.fillRect(15, 18, 3, 1);
      ctx.fillRect(12, 19, 1, 3);
      // Neck cutout
      ctx.fillStyle = '#0f1224';
      ctx.fillRect(13, 6, 6, 3);
      scene.textures.addCanvas('item_granite_armor', canvas);
    }

    // 8. Leather Helmet
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(9, 8, 14, 16);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(10, 9, 12, 14);
      // Ear guards
      ctx.fillRect(8, 15, 3, 7);
      ctx.fillRect(21, 15, 3, 7);
      // Face opening
      ctx.fillStyle = '#0f1224';
      ctx.fillRect(12, 14, 8, 8);
      // Chin strap
      ctx.fillStyle = '#b45309';
      ctx.fillRect(11, 22, 10, 2);
      scene.textures.addCanvas('item_leather_helm', canvas);
    }

    // 9. Iron Great Helm
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Base dome
      ctx.fillStyle = '#334155';
      ctx.fillRect(9, 7, 14, 18);
      // Highlight body
      ctx.fillStyle = '#64748b';
      ctx.fillRect(10, 8, 12, 16);
      // Top crest ridge
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(15, 5, 2, 10);
      // Visor T-slit (Black with faint glow)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, 14, 10, 2);
      ctx.fillRect(15, 14, 2, 7);
      // Eye glow
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(13, 14, 2, 1);
      ctx.fillRect(17, 14, 2, 1);
      // Brass breath holes
      ctx.fillStyle = '#eab308';
      ctx.fillRect(12, 19, 1, 1);
      ctx.fillRect(19, 19, 1, 1);
      scene.textures.addCanvas('item_iron_helm', canvas);
    }

    // 10. Shadow Horned Helm
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Demon horns curving out
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5, 5, 4, 3);
      ctx.fillRect(7, 8, 3, 4);
      ctx.fillRect(23, 5, 4, 3);
      ctx.fillRect(22, 8, 3, 4);
      // Helm skull base
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(9, 9, 14, 16);
      ctx.fillStyle = '#312e81';
      ctx.fillRect(10, 10, 12, 14);
      // Glowing Cyan Visor Eyes
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(11, 15, 4, 2);
      ctx.fillRect(17, 15, 4, 2);
      // Runic Horn Runes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(6, 6, 2, 2);
      ctx.fillRect(24, 6, 2, 2);
      scene.textures.addCanvas('item_shadow_helm', canvas);
    }

    // 11. Obsidian Ring
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Ring shadow
      ctx.beginPath();
      ctx.arc(16, 18, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      // Ring band
      ctx.beginPath();
      ctx.arc(16, 18, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Inner hole
      ctx.beginPath();
      ctx.arc(16, 18, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f1224';
      ctx.fill();
      // Glowing Obsidian Gem at top
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(13, 7, 6, 6);
      ctx.fillStyle = '#e879f9';
      ctx.fillRect(14, 8, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 9, 2, 2);
      scene.textures.addCanvas('item_ring_obsidian', canvas);
    }

    // 12. Slime Core
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Glowing outer halo
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      // Gelatinous outer membrane
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(16, 16, 9, 0, Math.PI * 2);
      ctx.fill();
      // Core glowing heart
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(16, 16, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 13, 3, 3);
      scene.textures.addCanvas('item_slime_core', canvas);
    }

    // 13. Void Grimoire
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Book cover (Dark Purple)
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(7, 6, 18, 20);
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(8, 7, 16, 18);
      // Parchment pages edge
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(23, 8, 2, 16);
      // Gold corner fittings
      ctx.fillStyle = '#eab308';
      ctx.fillRect(8, 7, 3, 3);
      ctx.fillRect(8, 22, 3, 3);
      // Arcane All-Seeing Eye Sigil
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.ellipse(15, 16, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.fillRect(14, 15, 2, 2);
      scene.textures.addCanvas('item_void_grimoire', canvas);
    }

    // 14. Lesser Healing Potion
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Glass bottle outline
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(13, 7, 6, 4); // Neck
      ctx.fillRect(10, 11, 12, 14); // Body
      // Cork stopper
      ctx.fillStyle = '#b45309';
      ctx.fillRect(14, 5, 4, 3);
      // Ruby red liquid
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(11, 14, 10, 10);
      // Liquid highlight / shine
      ctx.fillStyle = '#f87171';
      ctx.fillRect(12, 15, 2, 6);
      // Glass reflection
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 12, 2, 4);
      scene.textures.addCanvas('item_pot_red', canvas);
    }

    // 15. Greater Healing Potion
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Ornate Gold banded flask
      ctx.fillStyle = '#eab308';
      ctx.fillRect(12, 6, 8, 4);
      ctx.fillRect(9, 10, 14, 16);
      // Cork
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, 4, 4, 3);
      // Glowing Magenta potion
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(10, 13, 12, 12);
      // Sparkle core
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(12, 15, 4, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 16, 2, 2);
      ctx.fillRect(17, 12, 2, 5);
      scene.textures.addCanvas('item_pot_greater', canvas);
    }

    // 16. Iron Ore
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Dark rock cluster
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(8, 10, 16, 14);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(9, 11, 14, 12);
      // Metallic iron veins
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(10, 13, 4, 3);
      ctx.fillRect(15, 11, 5, 3);
      ctx.fillRect(13, 17, 6, 3);
      // Shiny glint
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, 14, 1, 1);
      ctx.fillRect(16, 12, 1, 1);
      ctx.fillRect(15, 18, 1, 1);
      scene.textures.addCanvas('item_ore_iron', canvas);
    }

    // 17. Shadow Essence
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Dark mist cloud
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.arc(16, 15, 7, 0, Math.PI * 2);
      ctx.fill();
      // Cyan magical core
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(14, 13, 4, 4);
      ctx.fillStyle = '#a5f3fc';
      ctx.fillRect(15, 14, 2, 2);
      // Floating motes
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(8, 10, 2, 2);
      ctx.fillRect(22, 12, 2, 2);
      ctx.fillRect(11, 23, 2, 2);
      scene.textures.addCanvas('item_shadow_essence', canvas);
    }

    // 18. Runic Crystal
    {
      const { canvas, ctx } = this.createCanvas(s, s);
      // Hexagonal Faceted Gem
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.moveTo(16, 5);
      ctx.lineTo(24, 11);
      ctx.lineTo(24, 21);
      ctx.lineTo(16, 27);
      ctx.lineTo(8, 21);
      ctx.lineTo(8, 11);
      ctx.closePath();
      ctx.fill();

      // Gem Faces
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(10, 12, 12, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(12, 9, 8, 6);
      // Bright facet highlight
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(13, 9, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 10, 2, 2);
      scene.textures.addCanvas('item_runic_crystal', canvas);
    }
  }
}
