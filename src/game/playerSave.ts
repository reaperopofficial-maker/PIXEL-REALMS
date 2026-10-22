import { GameItem, EquipmentSlot, createItemInstance, getItemStats, getNextUpgradeCost, ITEM_TEMPLATES } from './data/items';

export interface EquippedGear {
  weapon: GameItem | null;
  armor: GameItem | null;
  helmet: GameItem | null;
  accessory: GameItem | null;
}

export interface PlayerSaveData {
  name: string;
  level: number;
  xp: number;
  xpNeeded: number;
  hp: number;
  maxHp: number;
  baseMaxHp: number;
  atk: number;
  baseAtk: number;
  def: number;
  baseDef: number;
  coins: number;
  currentStage: number;
  inventory: GameItem[];
  equipped: EquippedGear;
  totalEnemiesDefeated: number;
  // Legacy object for backwards compatibility
  equipment: {
    weapon: string;
    weaponAtk: number;
    armor: string;
    armorHp: number;
    relic: string;
  };
}

const PLAYER_SAVE_KEY = 'pixel_realms_player_save_v2';

export function createInitialPlayer(): PlayerSaveData {
  const starterWeapon = createItemInstance('wpn_iron_sword');
  const starterArmor = createItemInstance('arm_iron_armor');
  const starterHelm = createItemInstance('helm_iron_helm');
  const starterAccessory = createItemInstance('acc_obsidian_ring');

  const initialInventory: GameItem[] = [
    createItemInstance('wpn_rusty_sword'),
    createItemInstance('arm_leather_tunic'),
    createItemInstance('pot_lesser_hp', 3),
    createItemInstance('pot_greater_hp', 1),
    createItemInstance('mat_iron_ore', 5),
    createItemInstance('mat_shadow_essence', 2),
  ];

  const player: PlayerSaveData = {
    name: 'Shadow Guardian',
    level: 1,
    xp: 0,
    xpNeeded: 80,
    hp: 150,
    maxHp: 150,
    baseMaxHp: 100,
    atk: 28,
    baseAtk: 20,
    def: 8,
    baseDef: 5,
    coins: 75,
    currentStage: 1,
    inventory: initialInventory,
    equipped: {
      weapon: starterWeapon,
      armor: starterArmor,
      helmet: starterHelm,
      accessory: starterAccessory,
    },
    totalEnemiesDefeated: 0,
    equipment: {
      weapon: starterWeapon.name,
      weaponAtk: starterWeapon.atkBonus,
      armor: starterArmor.name,
      armorHp: starterArmor.hpBonus,
      relic: starterAccessory.name,
    },
  };

  recalculateHeroStats(player);
  return player;
}

type SaveListener = (data: PlayerSaveData) => void;
const saveListeners: Set<SaveListener> = new Set();

export function recalculateHeroStats(player: PlayerSaveData): void {
  let bonusAtk = 0;
  let bonusDef = 0;
  let bonusHp = 0;

  const slots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'accessory'];
  slots.forEach((s) => {
    const item = player.equipped[s];
    if (item) {
      const stats = getItemStats(item);
      bonusAtk += stats.atk;
      bonusDef += stats.def;
      bonusHp += stats.hp;
    }
  });

  player.maxHp = player.baseMaxHp + bonusHp;
  player.atk = player.baseAtk + bonusAtk;
  player.def = player.baseDef + bonusDef;

  if (player.hp > player.maxHp) {
    player.hp = player.maxHp;
  }

  // Update legacy view
  player.equipment = {
    weapon: player.equipped.weapon ? `${player.equipped.weapon.name}${player.equipped.weapon.upgradeLevel > 0 ? ` +${player.equipped.weapon.upgradeLevel}` : ''}` : 'Fists',
    weaponAtk: player.equipped.weapon ? getItemStats(player.equipped.weapon).atk : 0,
    armor: player.equipped.armor ? `${player.equipped.armor.name}${player.equipped.armor.upgradeLevel > 0 ? ` +${player.equipped.armor.upgradeLevel}` : ''}` : 'Rags',
    armorHp: player.equipped.armor ? getItemStats(player.equipped.armor).hp : 0,
    relic: player.equipped.accessory ? player.equipped.accessory.name : 'None',
  };
}

export function getPlayerSave(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(PLAYER_SAVE_KEY);
    if (!raw) {
      // Check for legacy v1 save to migrate
      const legacyRaw = localStorage.getItem('pixel_realms_player_save_v1');
      if (legacyRaw) {
        try {
          const leg = JSON.parse(legacyRaw);
          const fresh = createInitialPlayer();
          fresh.coins = Math.max(fresh.coins, Number(leg.coins) || 0);
          fresh.level = Math.max(fresh.level, Number(leg.level) || 1);
          fresh.currentStage = Math.max(fresh.currentStage, Number(leg.currentStage) || 1);
          recalculateHeroStats(fresh);
          savePlayerData(fresh);
          return fresh;
        } catch {}
      }
      const fresh = createInitialPlayer();
      savePlayerData(fresh);
      return fresh;
    }

    const parsed = JSON.parse(raw);
    const player: PlayerSaveData = {
      name: parsed.name || 'Shadow Guardian',
      level: Math.max(1, Number(parsed.level) || 1),
      xp: Math.max(0, Number(parsed.xp) || 0),
      xpNeeded: Math.max(50, Number(parsed.xpNeeded) || (Math.max(1, Number(parsed.level) || 1) * 80)),
      baseMaxHp: Math.max(80, Number(parsed.baseMaxHp) || 100),
      baseAtk: Math.max(15, Number(parsed.baseAtk) || 20),
      baseDef: Math.max(0, Number(parsed.baseDef) || 5),
      hp: Math.max(1, Number(parsed.hp) || 120),
      maxHp: Math.max(100, Number(parsed.maxHp) || 150),
      atk: Math.max(15, Number(parsed.atk) || 28),
      def: Math.max(0, Number(parsed.def) || 8),
      coins: Math.max(0, Number(parsed.coins) || 0),
      currentStage: Math.max(1, Number(parsed.currentStage) || 1),
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
      equipped: parsed.equipped || {
        weapon: null,
        armor: null,
        helmet: null,
        accessory: null,
      },
      totalEnemiesDefeated: Math.max(0, Number(parsed.totalEnemiesDefeated) || 0),
      equipment: parsed.equipment || {
        weapon: 'Iron Broadsword',
        weaponAtk: 14,
        armor: 'Iron Breastplate',
        armorHp: 60,
        relic: 'Obsidian Ring',
      },
    };

    recalculateHeroStats(player);
    return player;
  } catch (err) {
    console.warn('Failed to load player save:', err);
    return createInitialPlayer();
  }
}

export function savePlayerData(data: PlayerSaveData): void {
  try {
    recalculateHeroStats(data);
    localStorage.setItem(PLAYER_SAVE_KEY, JSON.stringify(data));
    saveListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('Error notifying save listener:', err);
      }
    });
  } catch (err) {
    console.warn('Failed to write player save:', err);
  }
}

export function subscribePlayerSave(listener: SaveListener): () => void {
  saveListeners.add(listener);
  return () => {
    saveListeners.delete(listener);
  };
}

// Inventory Operations
export function addItemToInventory(player: PlayerSaveData, templateId: string, quantity = 1): GameItem {
  const template = ITEM_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Invalid item template: ${templateId}`);
  }

  // If consumable or material, check if can stack
  if (template.category === 'potion' || template.category === 'material') {
    const existing = player.inventory.find((i) => i.templateId === templateId);
    if (existing) {
      existing.quantity += quantity;
      savePlayerData(player);
      return existing;
    }
  }

  // Otherwise create new item instance
  const newItem = createItemInstance(templateId, quantity);
  player.inventory.push(newItem);
  savePlayerData(player);
  return newItem;
}

export function removeItemFromInventory(player: PlayerSaveData, itemInstanceId: string, quantity = 1): boolean {
  const idx = player.inventory.findIndex((i) => i.id === itemInstanceId);
  if (idx === -1) return false;

  const item = player.inventory[idx];
  if (item.quantity > quantity) {
    item.quantity -= quantity;
  } else {
    player.inventory.splice(idx, 1);
  }

  savePlayerData(player);
  return true;
}

export function equipItem(player: PlayerSaveData, itemInstanceId: string): boolean {
  const idx = player.inventory.findIndex((i) => i.id === itemInstanceId);
  if (idx === -1) return false;

  const item = player.inventory[idx];
  if (!item.slot) return false;

  const slot = item.slot;
  const currentEquipped = player.equipped[slot];

  // Remove from inventory
  player.inventory.splice(idx, 1);

  // If already have equipped item in this slot, put it in inventory
  if (currentEquipped) {
    player.inventory.push(currentEquipped);
  }

  // Set new equipped item
  player.equipped[slot] = item;

  savePlayerData(player);
  return true;
}

export function unequipItem(player: PlayerSaveData, slot: EquipmentSlot): boolean {
  const item = player.equipped[slot];
  if (!item) return false;

  player.equipped[slot] = null;
  player.inventory.push(item);

  savePlayerData(player);
  return true;
}

export function useConsumable(player: PlayerSaveData, itemInstanceId: string): { success: boolean; message: string; healAmount?: number } {
  const idx = player.inventory.findIndex((i) => i.id === itemInstanceId);
  if (idx === -1) return { success: false, message: 'Item not found' };

  const item = player.inventory[idx];
  if (item.category !== 'potion' || !item.healAmount) {
    return { success: false, message: 'Item is not consumable' };
  }

  if (player.hp >= player.maxHp) {
    return { success: false, message: 'HP is already full!' };
  }

  const heal = item.healAmount;
  player.hp = Math.min(player.maxHp, player.hp + heal);

  // Decrement quantity
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    player.inventory.splice(idx, 1);
  }

  savePlayerData(player);
  return { success: true, message: `Restored ${heal} HP!`, healAmount: heal };
}

export function upgradeItem(player: PlayerSaveData, item: GameItem): { success: boolean; message: string } {
  if (item.upgradeLevel >= item.maxUpgradeLevel) {
    return { success: false, message: 'Max upgrade level reached!' };
  }

  const cost = getNextUpgradeCost(item);

  if (player.coins < cost.coins) {
    return { success: false, message: `Need ${cost.coins} Coins!` };
  }

  if (cost.materialId) {
    const mat = player.inventory.find((i) => i.templateId === cost.materialId);
    if (!mat || mat.quantity < cost.materialCount) {
      const matName = ITEM_TEMPLATES[cost.materialId]?.name || 'Material';
      return { success: false, message: `Need ${cost.materialCount}x ${matName}!` };
    }
    // Deduct material
    mat.quantity -= cost.materialCount;
    if (mat.quantity <= 0) {
      const matIdx = player.inventory.indexOf(mat);
      if (matIdx !== -1) player.inventory.splice(matIdx, 1);
    }
  }

  // Deduct coins
  player.coins -= cost.coins;
  item.upgradeLevel += 1;

  savePlayerData(player);
  return { success: true, message: `Upgraded to +${item.upgradeLevel}!` };
}
