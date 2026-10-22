export type ItemCategory = 'weapon' | 'armor' | 'helmet' | 'accessory' | 'potion' | 'material';
export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'accessory';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GameItem {
  id: string; // unique instance id
  templateId: string;
  name: string;
  category: ItemCategory;
  slot?: EquipmentSlot;
  rarity: ItemRarity;
  icon: string;
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  healAmount?: number;
  quantity: number;
  upgradeLevel: number;
  maxUpgradeLevel: number;
  upgradeCostCoins: number;
  upgradeMaterialId?: string;
  upgradeMaterialCount?: number;
  description: string;
}

export const RARITY_COLORS: Record<ItemRarity, { text: string; hex: number; border: string }> = {
  common: { text: '#cbd5e1', hex: 0xcbd5e1, border: '#475569' },
  uncommon: { text: '#34d399', hex: 0x34d399, border: '#059669' },
  rare: { text: '#38bdf8', hex: 0x38bdf8, border: '#0284c7' },
  epic: { text: '#c084fc', hex: 0xc084fc, border: '#9333ea' },
  legendary: { text: '#fde047', hex: 0xfde047, border: '#eab308' },
};

export const ITEM_TEMPLATES: Record<string, Omit<GameItem, 'id' | 'quantity' | 'upgradeLevel'>> = {
  // --- WEAPONS ---
  wpn_rusty_sword: {
    templateId: 'wpn_rusty_sword',
    name: 'Rusty Sword',
    category: 'weapon',
    slot: 'weapon',
    rarity: 'common',
    icon: 'item_rusty_sword',
    atkBonus: 6,
    defBonus: 0,
    hpBonus: 0,
    maxUpgradeLevel: 3,
    upgradeCostCoins: 30,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 1,
    description: 'A corroded iron blade forgotten in the crypts. Still sharp enough to cut.',
  },
  wpn_iron_sword: {
    templateId: 'wpn_iron_sword',
    name: 'Iron Broadsword',
    category: 'weapon',
    slot: 'weapon',
    rarity: 'uncommon',
    icon: 'item_iron_sword',
    atkBonus: 14,
    defBonus: 0,
    hpBonus: 10,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 60,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 2,
    description: 'Forged from high-grade iron ore. Well balanced and dependable.',
  },
  wpn_shadow_blade: {
    templateId: 'wpn_shadow_blade',
    name: 'Shadow Blade',
    category: 'weapon',
    slot: 'weapon',
    rarity: 'rare',
    icon: 'item_shadow_blade',
    atkBonus: 25,
    defBonus: 0,
    hpBonus: 25,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 120,
    upgradeMaterialId: 'mat_shadow_essence',
    upgradeMaterialCount: 2,
    description: 'Infused with dark umbral energy. Glows faintly with a cold cyan flame.',
  },
  wpn_forgotten_blade: {
    templateId: 'wpn_forgotten_blade',
    name: 'Forgotten King Blade',
    category: 'weapon',
    slot: 'weapon',
    rarity: 'legendary',
    icon: 'item_forgotten_blade',
    atkBonus: 50,
    defBonus: 5,
    hpBonus: 60,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 250,
    upgradeMaterialId: 'mat_runic_crystal',
    upgradeMaterialCount: 2,
    description: 'The ancient royal zweihander of the Forgotten Monarch. Unleashes sheer ruin.',
  },

  // --- ARMOR ---
  arm_leather_tunic: {
    templateId: 'arm_leather_tunic',
    name: 'Leather Tunic',
    category: 'armor',
    slot: 'armor',
    rarity: 'common',
    icon: 'item_leather_armor',
    atkBonus: 0,
    defBonus: 3,
    hpBonus: 25,
    maxUpgradeLevel: 3,
    upgradeCostCoins: 25,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 1,
    description: 'Simple stitched beast hide. Provides light protection against claws.',
  },
  arm_iron_armor: {
    templateId: 'arm_iron_armor',
    name: 'Iron Breastplate',
    category: 'armor',
    slot: 'armor',
    rarity: 'uncommon',
    icon: 'item_iron_armor',
    atkBonus: 0,
    defBonus: 8,
    hpBonus: 60,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 70,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 2,
    description: 'Solid tempered breastplate forged by kingdom armorsmiths.',
  },
  arm_granite_carapace: {
    templateId: 'arm_granite_carapace',
    name: 'Granite Carapace',
    category: 'armor',
    slot: 'armor',
    rarity: 'rare',
    icon: 'item_granite_armor',
    atkBonus: 0,
    defBonus: 16,
    hpBonus: 110,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 130,
    upgradeMaterialId: 'mat_shadow_essence',
    upgradeMaterialCount: 2,
    description: 'Carved from petrified gargoyle stone. Impenetrable to common strikes.',
  },

  // --- HELMETS ---
  helm_leather_cap: {
    templateId: 'helm_leather_cap',
    name: 'Leather Coif',
    category: 'helmet',
    slot: 'helmet',
    rarity: 'common',
    icon: 'item_leather_helm',
    atkBonus: 0,
    defBonus: 2,
    hpBonus: 15,
    maxUpgradeLevel: 3,
    upgradeCostCoins: 20,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 1,
    description: 'Reinforced leather hood that absorbs blunt impacts.',
  },
  helm_iron_helm: {
    templateId: 'helm_iron_helm',
    name: 'Iron Great Helm',
    category: 'helmet',
    slot: 'helmet',
    rarity: 'uncommon',
    icon: 'item_iron_helm',
    atkBonus: 0,
    defBonus: 6,
    hpBonus: 40,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 60,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 2,
    description: 'A full-face slotted helmet with thick cheek guards.',
  },
  helm_shadow_horns: {
    templateId: 'helm_shadow_horns',
    name: 'Shadow Horned Helm',
    category: 'helmet',
    slot: 'helmet',
    rarity: 'rare',
    icon: 'item_shadow_helm',
    atkBonus: 8,
    defBonus: 10,
    hpBonus: 75,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 120,
    upgradeMaterialId: 'mat_shadow_essence',
    upgradeMaterialCount: 2,
    description: 'Crested with demonic obsidian horns. Sharpens the wearer combat focus.',
  },

  // --- ACCESSORIES ---
  acc_obsidian_ring: {
    templateId: 'acc_obsidian_ring',
    name: 'Obsidian Ring',
    category: 'accessory',
    slot: 'accessory',
    rarity: 'uncommon',
    icon: 'item_ring_obsidian',
    atkBonus: 6,
    defBonus: 4,
    hpBonus: 20,
    maxUpgradeLevel: 3,
    upgradeCostCoins: 50,
    upgradeMaterialId: 'mat_iron_ore',
    upgradeMaterialCount: 1,
    description: 'Polished volcanic glass set with a dormant magical rune.',
  },
  acc_slime_core: {
    templateId: 'acc_slime_core',
    name: 'Glowing Slime Core',
    category: 'accessory',
    slot: 'accessory',
    rarity: 'rare',
    icon: 'item_slime_core',
    atkBonus: 4,
    defBonus: 6,
    hpBonus: 65,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 90,
    upgradeMaterialId: 'mat_shadow_essence',
    upgradeMaterialCount: 2,
    description: 'The pulsating cyan heart of an elder dungeon slime. Radiates vitality.',
  },
  acc_void_grimoire: {
    templateId: 'acc_void_grimoire',
    name: 'Void Grimoire',
    category: 'accessory',
    slot: 'accessory',
    rarity: 'epic',
    icon: 'item_void_grimoire',
    atkBonus: 18,
    defBonus: 8,
    hpBonus: 80,
    maxUpgradeLevel: 5,
    upgradeCostCoins: 160,
    upgradeMaterialId: 'mat_runic_crystal',
    upgradeMaterialCount: 2,
    description: 'Forbidden dark tome whispering ancient alchemical secrets to its wielder.',
  },

  // --- POTIONS ---
  pot_lesser_hp: {
    templateId: 'pot_lesser_hp',
    name: 'Lesser Healing Potion',
    category: 'potion',
    rarity: 'common',
    icon: 'item_pot_red',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    healAmount: 45,
    maxUpgradeLevel: 0,
    upgradeCostCoins: 0,
    description: 'A crimson vial brewed from dungeon blood-moss. Restores 45 HP instantly.',
  },
  pot_greater_hp: {
    templateId: 'pot_greater_hp',
    name: 'Greater Healing Potion',
    category: 'potion',
    rarity: 'uncommon',
    icon: 'item_pot_greater',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    healAmount: 100,
    maxUpgradeLevel: 0,
    upgradeCostCoins: 0,
    description: 'A concentrated elixir of life. Restores 100 HP immediately.',
  },

  // --- MATERIALS ---
  mat_iron_ore: {
    templateId: 'mat_iron_ore',
    name: 'Iron Ore',
    category: 'material',
    rarity: 'common',
    icon: 'item_ore_iron',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    maxUpgradeLevel: 0,
    upgradeCostCoins: 0,
    description: 'Dense metal ore mined from the deep subterranean catacombs. Used to reinforce gear.',
  },
  mat_shadow_essence: {
    templateId: 'mat_shadow_essence',
    name: 'Shadow Essence',
    category: 'material',
    rarity: 'rare',
    icon: 'item_shadow_essence',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    maxUpgradeLevel: 0,
    upgradeCostCoins: 0,
    description: 'Crystallized dark mist gathered from slain nether beasts. Imbues items with shadow potency.',
  },
  mat_runic_crystal: {
    templateId: 'mat_runic_crystal',
    name: 'Runic Crystal',
    category: 'material',
    rarity: 'epic',
    icon: 'item_runic_crystal',
    atkBonus: 0,
    defBonus: 0,
    hpBonus: 0,
    maxUpgradeLevel: 0,
    upgradeCostCoins: 0,
    description: 'A brilliant gemstone inscribed with ancient glyphs. Enhances legendary equipment.',
  },
};

let instanceCounter = Date.now();

export function createItemInstance(templateId: string, quantity = 1, upgradeLevel = 0): GameItem {
  const template = ITEM_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Unknown item template: ${templateId}`);
  }
  instanceCounter++;
  return {
    ...template,
    id: `${templateId}_${instanceCounter}_${Math.floor(Math.random() * 1000)}`,
    quantity,
    upgradeLevel,
  };
}

// Compute dynamic stats accounting for upgrade level
export function getItemStats(item: GameItem): { atk: number; def: number; hp: number } {
  const mult = 1 + item.upgradeLevel * 0.25;
  return {
    atk: Math.round(item.atkBonus * mult),
    def: Math.round(item.defBonus * mult),
    hp: Math.round(item.hpBonus * mult),
  };
}

// Get cost for next upgrade
export function getNextUpgradeCost(item: GameItem): { coins: number; materialId?: string; materialCount: number } {
  const scale = 1 + item.upgradeLevel * 0.6;
  return {
    coins: Math.round(item.upgradeCostCoins * scale),
    materialId: item.upgradeMaterialId,
    materialCount: (item.upgradeMaterialCount || 1) + Math.floor(item.upgradeLevel / 2),
  };
}
