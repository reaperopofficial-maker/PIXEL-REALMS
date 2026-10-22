import Phaser from 'phaser';
import { PixelButton } from '../ui/PixelButton';
import { soundSynth } from '../audio/SoundSynthesizer';
import {
  getPlayerSave,
  savePlayerData,
  PlayerSaveData,
  equipItem,
  unequipItem,
  useConsumable,
  upgradeItem,
  recalculateHeroStats,
} from '../playerSave';
import {
  GameItem,
  ItemCategory,
  EquipmentSlot,
  RARITY_COLORS,
  getItemStats,
  getNextUpgradeCost,
  ITEM_TEMPLATES,
} from '../data/items';

export class InventoryScene extends Phaser.Scene {
  private player!: PlayerSaveData;
  private returnSceneKey: string = 'MenuScene';

  // State
  private activeCategory: 'all' | ItemCategory = 'all';
  private selectedItem: GameItem | null = null;
  private isSelectedEquipped: boolean = false;
  private selectedEquipSlot: EquipmentSlot | null = null;
  private currentPage: number = 0;
  private readonly itemsPerPage = 18; // 6 columns x 3 rows

  // UI Containers & Elements
  private statsBarText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private equipSlotContainers: Record<EquipmentSlot, Phaser.GameObjects.Container> = {} as any;
  private gridContainer!: Phaser.GameObjects.Container;
  private detailCardContainer!: Phaser.GameObjects.Container;
  private categoryTabButtons: Phaser.GameObjects.Container[] = [];
  private pageIndicatorText!: Phaser.GameObjects.Text;

  constructor() {
    super('InventoryScene');
  }

  init(data: { returnScene?: string }): void {
    if (data && data.returnScene) {
      this.returnSceneKey = data.returnScene;
    } else {
      this.returnSceneKey = 'MenuScene';
    }
  }

  create(): void {
    const { width, height } = this.scale;
    this.player = getPlayerSave();
    recalculateHeroStats(this.player);

    // Default select equipped weapon or first inventory item
    if (this.player.equipped.weapon) {
      this.selectedItem = this.player.equipped.weapon;
      this.isSelectedEquipped = true;
      this.selectedEquipSlot = 'weapon';
    } else if (this.player.inventory.length > 0) {
      this.selectedItem = this.player.inventory[0];
      this.isSelectedEquipped = false;
      this.selectedEquipSlot = null;
    }

    // 1. Background
    const bg = this.add.graphics();
    bg.fillStyle(0x060813, 1);
    bg.fillRect(0, 0, width, height);

    // Subtle background dungeon stone pattern
    bg.fillStyle(0x0c0f24, 0.6);
    for (let y = 0; y < height; y += 32) {
      bg.fillRect(0, y, width, 1);
    }

    // 2. Top Header Bar
    this.createHeader(width);

    // 3. Hero Stats Overview Bar
    this.createHeroStatsBar(width);

    // 4. Equipped Gear Section
    this.createEquippedSection(width);

    // 5. Category Tabs
    this.createCategoryTabs(width);

    // 6. Inventory Slots Grid
    this.gridContainer = this.add.container(0, 0);
    this.renderInventoryGrid(width);

    // 7. Selected Item Detail Card
    this.detailCardContainer = this.add.container(0, 0);
    this.renderDetailCard(width, height);

    // Fade in
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  // --- 1. HEADER ---
  private createHeader(width: number): void {
    const headerY = 14;

    // Header plate
    const plate = this.add.graphics();
    plate.fillStyle(0x0f1225, 0.95);
    plate.fillRect(8, headerY, width - 16, 38);
    plate.lineStyle(1, 0x334155, 1);
    plate.strokeRect(8, headerY, width - 16, 38);

    // Back Button
    new PixelButton(this, {
      x: 52,
      y: headerY + 19,
      text: '◀ BACK',
      width: 76,
      height: 28,
      fontSize: '8px',
      textColor: '#94a3b8',
      onClick: () => {
        soundSynth.playBack();
        this.cameras.main.fadeOut(160, 0, 0, 0);
        this.time.delayedCall(170, () => {
          this.scene.start(this.returnSceneKey);
        });
      },
    });

    // Scene Title
    const title = this.add.text(width / 2 + 10, headerY + 19, 'ARMORY & FORGE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#fef08a',
    });
    title.setOrigin(0.5, 0.5);

    // Coin Count
    this.add.image(width - 66, headerY + 19, 'pixel_coin').setScale(1.1);
    this.coinsText = this.add.text(width - 54, headerY + 19, `${this.player.coins}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#fef08a',
    });
    this.coinsText.setOrigin(0, 0.5);
  }

  // --- 2. HERO STATS OVERVIEW ---
  private createHeroStatsBar(width: number): void {
    const barY = 56;
    const bg = this.add.graphics();
    bg.fillStyle(0x13172e, 0.9);
    bg.fillRect(8, barY, width - 16, 26);
    bg.lineStyle(1, 0x1e293b, 1);
    bg.strokeRect(8, barY, width - 16, 26);

    this.statsBarText = this.add.text(width / 2, barY + 13, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#e2e8f0',
      align: 'center',
    });
    this.statsBarText.setOrigin(0.5, 0.5);
    this.updateStatsBarText();
  }

  private updateStatsBarText(): void {
    const p = this.player;
    this.statsBarText.setText(`LV.${p.level}  ❤️${p.hp}/${p.maxHp}  ⚔️${p.atk} ATK  🛡️${p.def} DEF`);
    this.coinsText.setText(`${p.coins}`);
  }

  // --- 3. EQUIPPED GEAR SECTION ---
  private createEquippedSection(width: number): void {
    const sectionY = 88;
    const slots: { slot: EquipmentSlot; label: string; iconKey: string }[] = [
      { slot: 'weapon', label: 'WEAPON', iconKey: 'slot_icon_weapon' },
      { slot: 'armor', label: 'ARMOR', iconKey: 'slot_icon_armor' },
      { slot: 'helmet', label: 'HELMET', iconKey: 'slot_icon_helmet' },
      { slot: 'accessory', label: 'RELIC', iconKey: 'slot_icon_accessory' },
    ];

    const slotSpacing = 86;
    const startX = width / 2 - (slotSpacing * 1.5);

    slots.forEach((s, idx) => {
      const sx = startX + idx * slotSpacing;
      const sy = sectionY + 28;

      const container = this.add.container(sx, sy);
      this.equipSlotContainers[s.slot] = container;

      // Slot Label (e.g. WEAPON)
      const lbl = this.add.text(0, -28, s.label, {
        fontFamily: '"Silkscreen", monospace',
        fontSize: '8px',
        color: '#94a3b8',
      });
      lbl.setOrigin(0.5, 0.5);
      container.add(lbl);

      // Render the slot content
      this.refreshEquipSlot(s.slot);
    });
  }

  private refreshEquipSlot(slot: EquipmentSlot): void {
    const container = this.equipSlotContainers[slot];
    if (!container) return;

    // Clear previous dynamic slot children (keep the first label at index 0)
    while (container.list.length > 1) {
      const child = container.list[1];
      container.remove(child, true);
    }

    const item = this.player.equipped[slot];
    const isSelected = this.isSelectedEquipped && this.selectedEquipSlot === slot;

    // Frame
    const frameKey = isSelected
      ? 'slot_frame_selected'
      : (item ? 'slot_frame_equipped' : 'slot_frame_empty');

    const frame = this.add.image(0, 0, frameKey);
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      soundSynth.playClick();
      if (item) {
        this.selectedItem = item;
        this.isSelectedEquipped = true;
        this.selectedEquipSlot = slot;
      } else {
        // Filter to this slot category to help player equip gear
        this.activeCategory = slot;
        this.currentPage = 0;
        this.updateCategoryTabs();
        this.renderInventoryGrid(this.scale.width);
      }
      this.refreshAllEquipSlots();
      this.renderDetailCard(this.scale.width, this.scale.height);
    });
    container.add(frame);

    if (item) {
      // Item Icon
      const icon = this.add.image(0, 0, item.icon);
      icon.setScale(1.15);
      container.add(icon);

      // Upgrade level text badge if > 0
      if (item.upgradeLevel > 0) {
        const upTxt = this.add.text(-16, -16, `+${item.upgradeLevel}`, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '6px',
          color: '#fde047',
        });
        upTxt.setShadow(1, 1, '#000000', 0, true, true);
        container.add(upTxt);
      }

      // Rarity indicator dot
      const dot = this.add.circle(15, -15, 3, RARITY_COLORS[item.rarity].hex);
      container.add(dot);
    } else {
      // Silhouette placeholder
      const silhouetteKey = `slot_icon_${slot}`;
      const sil = this.add.image(0, 0, silhouetteKey);
      container.add(sil);
    }
  }

  private refreshAllEquipSlots(): void {
    const slots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'accessory'];
    slots.forEach((s) => this.refreshEquipSlot(s));
  }

  // --- 4. CATEGORY TABS ---
  private createCategoryTabs(width: number): void {
    const tabY = 155;
    const categories: { key: 'all' | ItemCategory; label: string }[] = [
      { key: 'all', label: 'ALL' },
      { key: 'weapon', label: 'WPN' },
      { key: 'armor', label: 'ARM' },
      { key: 'helmet', label: 'HLM' },
      { key: 'accessory', label: 'ACC' },
      { key: 'potion', label: 'POT' },
      { key: 'material', label: 'MAT' },
    ];

    const tabWidth = 48;
    const spacing = 52;
    const startX = width / 2 - (spacing * 3);

    categories.forEach((cat, idx) => {
      const cx = startX + idx * spacing;
      const tabContainer = this.add.container(cx, tabY);
      (tabContainer as any).categoryKey = cat.key;
      this.categoryTabButtons.push(tabContainer);

      const tabBg = this.add.graphics();
      tabContainer.add(tabBg);

      const tabText = this.add.text(0, 0, cat.label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#94a3b8',
      });
      tabText.setOrigin(0.5, 0.5);
      tabContainer.add(tabText);

      // Hit area for tab
      const hit = this.add.zone(0, 0, tabWidth, 24);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        soundSynth.playClick();
        this.activeCategory = cat.key;
        this.currentPage = 0;
        this.updateCategoryTabs();
        this.renderInventoryGrid(width);
      });
      tabContainer.add(hit);
    });

    this.updateCategoryTabs();
  }

  private updateCategoryTabs(): void {
    this.categoryTabButtons.forEach((tabContainer) => {
      const catKey = (tabContainer as any).categoryKey;
      const isActive = this.activeCategory === catKey;
      const tabBg = tabContainer.list[0] as Phaser.GameObjects.Graphics;
      const tabText = tabContainer.list[1] as Phaser.GameObjects.Text;

      tabBg.clear();
      if (isActive) {
        tabBg.fillStyle(0x0284c7, 0.9);
        tabBg.fillRoundedRect(-24, -12, 48, 24, 3);
        tabBg.lineStyle(1, 0x00f0ff, 1);
        tabBg.strokeRoundedRect(-24, -12, 48, 24, 3);
        tabText.setColor('#fef08a');
      } else {
        tabBg.fillStyle(0x13172e, 0.7);
        tabBg.fillRoundedRect(-24, -12, 48, 24, 3);
        tabBg.lineStyle(1, 0x334155, 0.8);
        tabBg.strokeRoundedRect(-24, -12, 48, 24, 3);
        tabText.setColor('#94a3b8');
      }
    });
  }

  // --- 5. INVENTORY GRID ---
  private getFilteredItems(): GameItem[] {
    if (this.activeCategory === 'all') {
      return this.player.inventory;
    }
    return this.player.inventory.filter((i) => i.category === this.activeCategory);
  }

  private renderInventoryGrid(width: number): void {
    this.gridContainer.removeAll(true);

    const filtered = this.getFilteredItems();
    const cols = 6;
    const rows = 3;
    const slotSpacing = 56;
    const gridStartX = width / 2 - (slotSpacing * 2.5);
    const gridStartY = 196;

    const totalPages = Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    if (this.currentPage >= totalPages) {
      this.currentPage = totalPages - 1;
    }

    const startIdx = this.currentPage * this.itemsPerPage;
    const pageItems = filtered.slice(startIdx, startIdx + this.itemsPerPage);

    // Render slots for the 18 grid cells
    for (let i = 0; i < this.itemsPerPage; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = gridStartX + col * slotSpacing;
      const sy = gridStartY + row * slotSpacing;

      const item = pageItems[i] as GameItem | undefined;
      const isSelected = !this.isSelectedEquipped && item && this.selectedItem?.id === item.id;

      // Slot frame
      const frameKey = isSelected ? 'slot_frame_selected' : 'slot_frame_empty';
      const slotFrame = this.add.image(sx, sy, frameKey);
      this.gridContainer.add(slotFrame);

      if (item) {
        slotFrame.setInteractive({ useHandCursor: true });
        slotFrame.on('pointerdown', () => {
          soundSynth.playClick();
          this.selectedItem = item;
          this.isSelectedEquipped = false;
          this.selectedEquipSlot = null;
          this.refreshAllEquipSlots();
          this.renderInventoryGrid(width);
          this.renderDetailCard(width, this.scale.height);
        });

        // Item Icon
        const icon = this.add.image(sx, sy, item.icon);
        icon.setScale(1.15);
        this.gridContainer.add(icon);

        // Upgrade level text badge if > 0
        if (item.upgradeLevel > 0) {
          const upTxt = this.add.text(sx - 18, sy - 18, `+${item.upgradeLevel}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '6px',
            color: '#fde047',
          });
          upTxt.setShadow(1, 1, '#000000', 0, true, true);
          this.gridContainer.add(upTxt);
        }

        // Quantity text badge if stackable (> 1)
        if (item.quantity > 1) {
          const qtyTxt = this.add.text(sx + 18, sy + 8, `x${item.quantity}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '6px',
            color: '#ffffff',
          });
          qtyTxt.setOrigin(1, 0);
          qtyTxt.setShadow(1, 1, '#000000', 0, true, true);
          this.gridContainer.add(qtyTxt);
        }

        // Rarity corner pip
        const rColor = RARITY_COLORS[item.rarity];
        const pip = this.add.circle(sx + 16, sy - 16, 2.5, rColor.hex);
        this.gridContainer.add(pip);
      }
    }

    // Pagination controls below grid (Y: 348)
    const pagerY = 352;
    if (totalPages > 1) {
      // Prev button
      const prevBtn = this.add.text(width / 2 - 60, pagerY, '◀ PREV', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: this.currentPage > 0 ? '#38bdf8' : '#475569',
      });
      prevBtn.setOrigin(0.5, 0.5);
      if (this.currentPage > 0) {
        prevBtn.setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => {
          soundSynth.playClick();
          this.currentPage--;
          this.renderInventoryGrid(width);
        });
      }
      this.gridContainer.add(prevBtn);

      // Page text
      this.pageIndicatorText = this.add.text(width / 2, pagerY, `${this.currentPage + 1}/${totalPages}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#fef08a',
      });
      this.pageIndicatorText.setOrigin(0.5, 0.5);
      this.gridContainer.add(this.pageIndicatorText);

      // Next button
      const nextBtn = this.add.text(width / 2 + 60, pagerY, 'NEXT ▶', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: this.currentPage < totalPages - 1 ? '#38bdf8' : '#475569',
      });
      nextBtn.setOrigin(0.5, 0.5);
      if (this.currentPage < totalPages - 1) {
        nextBtn.setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => {
          soundSynth.playClick();
          this.currentPage++;
          this.renderInventoryGrid(width);
        });
      }
      this.gridContainer.add(nextBtn);
    } else if (filtered.length === 0) {
      const emptyNotice = this.add.text(width / 2, gridStartY + 45, 'No items in this category', {
        fontFamily: '"Silkscreen", monospace',
        fontSize: '10px',
        color: '#64748b',
      });
      emptyNotice.setOrigin(0.5, 0.5);
      this.gridContainer.add(emptyNotice);
    }
  }

  // --- 6. SELECTED ITEM DETAIL CARD ---
  private renderDetailCard(width: number, height: number): void {
    this.detailCardContainer.removeAll(true);

    const cardY = 368;
    const cardH = height - cardY - 12; // ~260px

    // Card background panel
    const panel = this.add.graphics();
    panel.fillStyle(0x0c0f22, 0.96);
    panel.fillRoundedRect(10, cardY, width - 20, cardH, 4);
    panel.lineStyle(2, 0xd97706, 0.9);
    panel.strokeRoundedRect(10, cardY, width - 20, cardH, 4);
    this.detailCardContainer.add(panel);

    const item = this.selectedItem;
    if (!item) {
      const emptyTxt = this.add.text(
        width / 2,
        cardY + cardH / 2,
        'Select any equipment, potion,\nor material to inspect and forge.',
        {
          fontFamily: '"Silkscreen", monospace',
          fontSize: '11px',
          color: '#64748b',
          align: 'center',
          lineSpacing: 6,
        }
      );
      emptyTxt.setOrigin(0.5, 0.5);
      this.detailCardContainer.add(emptyTxt);
      return;
    }

    const rColor = RARITY_COLORS[item.rarity];
    const isEquipped = this.isSelectedEquipped;

    // Item Icon in large frame
    const iconFrame = this.add.image(38, cardY + 36, 'slot_frame_empty');
    iconFrame.setScale(1.25);
    this.detailCardContainer.add(iconFrame);

    const icon = this.add.image(38, cardY + 36, item.icon);
    icon.setScale(1.6);
    this.detailCardContainer.add(icon);

    // Item Title & Upgrade
    const titleStr = `${item.name}${item.upgradeLevel > 0 ? ` +${item.upgradeLevel}` : ''}`;
    const titleText = this.add.text(68, cardY + 20, titleStr, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: rColor.text,
    });
    this.detailCardContainer.add(titleText);

    // Category / Rarity Subtitle
    const categoryName = item.category.toUpperCase();
    const rarityName = item.rarity.toUpperCase();
    const equippedTag = isEquipped ? ' · [EQUIPPED]' : '';
    const subText = this.add.text(68, cardY + 36, `${rarityName} ${categoryName}${equippedTag}`, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '8px',
      color: isEquipped ? '#00f0ff' : '#94a3b8',
    });
    this.detailCardContainer.add(subText);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(1, 0x1e293b, 1);
    div.lineBetween(18, cardY + 62, width - 18, cardY + 62);
    this.detailCardContainer.add(div);

    // Stats Section
    const statsY = cardY + 70;
    if (item.category === 'potion') {
      const healText = this.add.text(20, statsY, `🧪 Restores +${item.healAmount || 0} HP`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#34d399',
      });
      this.detailCardContainer.add(healText);

      const stackText = this.add.text(width - 20, statsY, `Stock: x${item.quantity}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#fef08a',
      });
      stackText.setOrigin(1, 0);
      this.detailCardContainer.add(stackText);
    } else if (item.category === 'material') {
      const matText = this.add.text(20, statsY, `⚒️ Crafting & Forging Material`, {
        fontFamily: '"Silkscreen", monospace',
        fontSize: '9px',
        color: '#fbbf24',
      });
      this.detailCardContainer.add(matText);

      const stackText = this.add.text(width - 20, statsY, `Stock: x${item.quantity}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#fef08a',
      });
      stackText.setOrigin(1, 0);
      this.detailCardContainer.add(stackText);
    } else {
      // Equipment item (Weapon, Armor, Helmet, Accessory)
      const dynamicStats = getItemStats(item);
      const statParts: string[] = [];
      if (dynamicStats.atk > 0) statParts.push(`⚔️ +${dynamicStats.atk} ATK`);
      if (dynamicStats.def > 0) statParts.push(`🛡️ +${dynamicStats.def} DEF`);
      if (dynamicStats.hp > 0) statParts.push(`❤️ +${dynamicStats.hp} HP`);

      const statsDisplay = this.add.text(20, statsY, statParts.join('   '), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#fef08a',
      });
      this.detailCardContainer.add(statsDisplay);

      // Stat Comparison Delta vs currently equipped item in this slot!
      if (item.slot) {
        const currentlyEquipped = this.player.equipped[item.slot];
        let compareLines: string[] = [];

        if (isEquipped) {
          compareLines.push('Currently Active Equipment');
        } else if (!currentlyEquipped) {
          compareLines.push('Slot currently empty (full stat bonus gain)');
        } else {
          const currStats = getItemStats(currentlyEquipped);
          const dAtk = dynamicStats.atk - currStats.atk;
          const dDef = dynamicStats.def - currStats.def;
          const dHp = dynamicStats.hp - currStats.hp;

          const diffs: string[] = [];
          if (dAtk !== 0) diffs.push(`${dAtk > 0 ? '▲ +' : '▼ '}${dAtk} ATK`);
          if (dDef !== 0) diffs.push(`${dDef > 0 ? '▲ +' : '▼ '}${dDef} DEF`);
          if (dHp !== 0) diffs.push(`${dHp > 0 ? '▲ +' : '▼ '}${dHp} HP`);

          if (diffs.length === 0) {
            compareLines.push('Identical stats to currently equipped');
          } else {
            compareLines.push(`Delta vs Equipped: ${diffs.join(', ')}`);
          }
        }

        const deltaText = this.add.text(20, statsY + 16, compareLines.join('\n'), {
          fontFamily: '"Silkscreen", monospace',
          fontSize: '8px',
          color: '#38bdf8',
        });
        this.detailCardContainer.add(deltaText);
      }
    }

    // Lore Description
    const descText = this.add.text(20, statsY + 36, item.description, {
      fontFamily: '"Silkscreen", monospace',
      fontSize: '8px',
      color: '#cbd5e1',
      lineSpacing: 4,
      wordWrap: { width: width - 40, useAdvancedWrap: true },
    });
    this.detailCardContainer.add(descText);

    // Action Buttons Row (Y: cardY + cardH - 36)
    const btnY = cardY + cardH - 28;
    this.createActionButtons(item, isEquipped, width, btnY);
  }

  // --- 7. ACTION BUTTONS (Equip, Unequip, Use, Upgrade) ---
  private createActionButtons(
    item: GameItem,
    isEquipped: boolean,
    width: number,
    btnY: number
  ): void {
    // 1. Potion: USE Button
    if (item.category === 'potion') {
      const isFullHp = this.player.hp >= this.player.maxHp;
      new PixelButton(this, {
        x: width / 2,
        y: btnY,
        text: isFullHp ? 'HP FULL' : `CONSUME (+${item.healAmount || 0} HP)`,
        width: 220,
        height: 38,
        fontSize: '9px',
        textColor: isFullHp ? '#64748b' : '#34d399',
        isPrimary: !isFullHp,
        onClick: () => {
          if (isFullHp) return;
          const res = useConsumable(this.player, item.id);
          if (res.success) {
            soundSynth.playHealSpell();
            this.showFloatingNotice(width / 2, btnY - 20, `+${res.healAmount} HP`, '#34d399');
            this.updateStatsBarText();
            // If item depleted, clear selection
            if (!this.player.inventory.some((i) => i.id === item.id)) {
              this.selectedItem = null;
            }
            this.renderInventoryGrid(width);
            this.renderDetailCard(width, this.scale.height);
          } else {
            this.showFloatingNotice(width / 2, btnY - 20, res.message, '#ef4444');
          }
        },
      });
      return;
    }

    // 2. Material: Informational notice
    if (item.category === 'material') {
      const matNotice = this.add.text(
        width / 2,
        btnY,
        'Use this material in the Forge to upgrade weapons and armor.',
        {
          fontFamily: '"Silkscreen", monospace',
          fontSize: '8px',
          color: '#94a3b8',
          align: 'center',
        }
      );
      matNotice.setOrigin(0.5, 0.5);
      this.detailCardContainer.add(matNotice);
      return;
    }

    // 3. Equipment: EQUIP / UNEQUIP + FORGE UPGRADE Buttons
    const canUpgrade = item.upgradeLevel < item.maxUpgradeLevel;
    const upgradeCost = canUpgrade ? getNextUpgradeCost(item) : null;
    const matName = upgradeCost?.materialId ? ITEM_TEMPLATES[upgradeCost.materialId]?.name : '';

    const hasCoins = upgradeCost ? this.player.coins >= upgradeCost.coins : false;
    const hasMat = upgradeCost?.materialId
      ? (this.player.inventory.find((i) => i.templateId === upgradeCost.materialId)?.quantity || 0) >= upgradeCost.materialCount
      : true;
    const canAfford = hasCoins && hasMat;

    if (isEquipped) {
      // Unequip Button + Upgrade Button
      new PixelButton(this, {
        x: width / 2 - 82,
        y: btnY,
        text: 'UNEQUIP',
        width: 140,
        height: 38,
        fontSize: '9px',
        textColor: '#cbd5e1',
        onClick: () => {
          if (!item.slot) return;
          soundSynth.playClick();
          unequipItem(this.player, item.slot);
          this.isSelectedEquipped = false;
          this.selectedEquipSlot = null;
          this.selectedItem = item;
          this.updateStatsBarText();
          this.refreshAllEquipSlots();
          this.renderInventoryGrid(width);
          this.renderDetailCard(width, this.scale.height);
          this.showFloatingNotice(width / 2, btnY - 30, 'Gear Unequipped', '#94a3b8');
        },
      });

      // Upgrade Button
      new PixelButton(this, {
        x: width / 2 + 82,
        y: btnY,
        text: canUpgrade ? `FORGE +${item.upgradeLevel + 1}` : 'MAX LEVEL',
        width: 140,
        height: 38,
        fontSize: '8px',
        textColor: canAfford ? '#fde047' : '#64748b',
        isPrimary: canAfford,
        onClick: () => {
          this.handleUpgradeItem(item, width, btnY);
        },
      });
    } else {
      // Equip Button + Upgrade Button
      new PixelButton(this, {
        x: width / 2 - 82,
        y: btnY,
        text: 'EQUIP',
        width: 140,
        height: 38,
        fontSize: '9px',
        textColor: '#fef08a',
        isPrimary: true,
        onClick: () => {
          soundSynth.playConfirm();
          equipItem(this.player, item.id);
          this.isSelectedEquipped = true;
          this.selectedEquipSlot = item.slot || null;
          this.updateStatsBarText();
          this.refreshAllEquipSlots();
          this.renderInventoryGrid(width);
          this.renderDetailCard(width, this.scale.height);
          this.showFloatingNotice(width / 2, btnY - 30, 'Equipped!', '#00f0ff');
        },
      });

      new PixelButton(this, {
        x: width / 2 + 82,
        y: btnY,
        text: canUpgrade ? `FORGE +${item.upgradeLevel + 1}` : 'MAX LEVEL',
        width: 140,
        height: 38,
        fontSize: '8px',
        textColor: canAfford ? '#fde047' : '#64748b',
        onClick: () => {
          this.handleUpgradeItem(item, width, btnY);
        },
      });
    }

    // Cost hint line above action buttons
    if (canUpgrade && upgradeCost) {
      const matReq = upgradeCost.materialId
        ? ` · ${upgradeCost.materialCount}x ${matName}`
        : '';
      const costHint = this.add.text(
        width / 2,
        btnY - 26,
        `Forge Cost: ${upgradeCost.coins}🪙${matReq}`,
        {
          fontFamily: '"Silkscreen", monospace',
          fontSize: '8px',
          color: canAfford ? '#fbbf24' : '#ef4444',
          align: 'center',
        }
      );
      costHint.setOrigin(0.5, 0.5);
      this.detailCardContainer.add(costHint);
    }
  }

  private handleUpgradeItem(item: GameItem, width: number, btnY: number): void {
    const res = upgradeItem(this.player, item);
    if (res.success) {
      soundSynth.playLevelUp();
      this.showFloatingNotice(width / 2, btnY - 30, res.message, '#fde047');
      this.updateStatsBarText();
      this.refreshAllEquipSlots();
      this.renderInventoryGrid(width);
      this.renderDetailCard(width, this.scale.height);
    } else {
      soundSynth.playBack();
      this.showFloatingNotice(width / 2, btnY - 30, res.message, '#ef4444');
    }
  }

  private showFloatingNotice(x: number, y: number, text: string, color: string): void {
    const floatText = this.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color,
      align: 'center',
    });
    floatText.setOrigin(0.5, 0.5);
    floatText.setShadow(1, 2, '#000000', 0, true, true);

    this.tweens.add({
      targets: floatText,
      y: y - 28,
      alpha: 0,
      duration: 850,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }
}
