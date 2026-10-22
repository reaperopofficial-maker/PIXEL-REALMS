export interface LootItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'relic' | 'potion';
  statBonus: string;
  bonusValue: number;
  rarity: 'common' | 'rare' | 'epic';
}

export interface EnemyConfig {
  id: string;
  name: string;
  title: string;
  stage: number;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  spriteKey: string;
  scale: number;
  coinReward: number;
  xpReward: number;
  lootDrop?: LootItem;
  dropChance: number;
  attackSpeedMs: number;
}

export const DUNGEON_ENEMIES: Omit<EnemyConfig, 'hp'>[] = [
  {
    id: 'shadow_slime',
    name: 'Shadow Slime',
    title: 'Dungeon Pest',
    stage: 1,
    level: 1,
    maxHp: 75,
    atk: 10,
    spriteKey: 'slime_sheet',
    scale: 2.2,
    coinReward: 15,
    xpReward: 35,
    dropChance: 0.45,
    attackSpeedMs: 1400,
    lootDrop: {
      id: 'slime_core',
      name: 'Glowing Slime Core',
      type: 'relic',
      statBonus: '+10 Max HP',
      bonusValue: 10,
      rarity: 'common',
    },
  },
  {
    id: 'skeletal_warrior',
    name: 'Skeletal Warrior',
    title: 'Crypt Sentry',
    stage: 2,
    level: 2,
    maxHp: 130,
    atk: 18,
    spriteKey: 'skeleton_sheet',
    scale: 2.2,
    coinReward: 30,
    xpReward: 60,
    dropChance: 0.4,
    attackSpeedMs: 1300,
    lootDrop: {
      id: 'bone_blade',
      name: 'Crypt Bone Blade',
      type: 'weapon',
      statBonus: '+8 ATK',
      bonusValue: 8,
      rarity: 'rare',
    },
  },
  {
    id: 'crypt_gargoyle',
    name: 'Gargoyle Fiend',
    title: 'Stone Stalker',
    stage: 3,
    level: 3,
    maxHp: 210,
    atk: 25,
    spriteKey: 'gargoyle_sheet',
    scale: 2.3,
    coinReward: 55,
    xpReward: 95,
    dropChance: 0.35,
    attackSpeedMs: 1200,
    lootDrop: {
      id: 'stone_carapace',
      name: 'Granite Carapace',
      type: 'armor',
      statBonus: '+35 Max HP',
      bonusValue: 35,
      rarity: 'rare',
    },
  },
  {
    id: 'shadow_sorcerer',
    name: 'Shadow Necromancer',
    title: 'Death Cultist',
    stage: 4,
    level: 4,
    maxHp: 290,
    atk: 34,
    spriteKey: 'necromancer_sheet',
    scale: 2.2,
    coinReward: 90,
    xpReward: 140,
    dropChance: 0.35,
    attackSpeedMs: 1150,
    lootDrop: {
      id: 'forbidden_grimoire',
      name: 'Void Grimoire',
      type: 'relic',
      statBonus: '+15 ATK & +20 HP',
      bonusValue: 15,
      rarity: 'epic',
    },
  },
  {
    id: 'forgotten_warlord',
    name: 'The Forgotten Knight',
    title: 'Fallen Champion',
    stage: 5,
    level: 5,
    maxHp: 460,
    atk: 45,
    spriteKey: 'boss_sheet',
    scale: 2.5,
    coinReward: 180,
    xpReward: 250,
    dropChance: 0.7,
    attackSpeedMs: 1100,
    lootDrop: {
      id: 'shadow_relic_blade',
      name: 'Forgotten King Blade',
      type: 'weapon',
      statBonus: '+25 ATK',
      bonusValue: 25,
      rarity: 'epic',
    },
  },
];

export function getEnemyForStage(stage: number): EnemyConfig {
  const baseIndex = (stage - 1) % DUNGEON_ENEMIES.length;
  const loopCount = Math.floor((stage - 1) / DUNGEON_ENEMIES.length);
  const base = DUNGEON_ENEMIES[baseIndex];

  const scaleFactor = 1 + loopCount * 0.7;
  const level = base.level + loopCount * 5;
  const maxHp = Math.round(base.maxHp * scaleFactor);
  const atk = Math.round(base.atk * scaleFactor);
  const coinReward = Math.round(base.coinReward * scaleFactor);
  const xpReward = Math.round(base.xpReward * scaleFactor);

  return {
    ...base,
    stage,
    level,
    hp: maxHp,
    maxHp,
    atk,
    coinReward,
    xpReward,
  };
}
