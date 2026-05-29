import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Decimal from 'decimal.js'
import { loadWithMigration } from '../utils/migration'

export type CharacterId = 'azurlane_sword' | 'askzyu_sword' | 'xiaoli' | 'xiaoke'

export interface CharacterData {
  id: CharacterId
  name: string
  title: string
  description: string
}

// ============================
// 修仙装备系统
// ============================
export type EquipmentRarity = '凡品' | '法器' | '灵器' | '法宝' | '仙器'
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory'
export type EquipmentType = '剑' | '刀' | '枪' | '护甲' | '法袍' | '玉佩' | '戒指' | '葫芦'

export interface Equipment {
  id: string
  name: string
  slot: EquipmentSlot
  type: EquipmentType
  rarity: EquipmentRarity
  icon: string
  attack: number
  defense: number
  mp_bonus: number
  hp_bonus: number
  description: string
  equipped: boolean
}

// ============================
// 修仙技能系统
// ============================
export type SkillType = '剑诀' | '法术' | '心法'
export type SkillTarget = 'enemy' | 'self'

export interface Skill {
  id: string
  name: string
  type: SkillType
  icon: string
  description: string
  damage: number        // 基础伤害
  mpCost: number       // 灵力消耗
  healAmount: number   // 治疗量（如果是治疗技能）
  target: SkillTarget
  level: number
  maxLevel: number
  unlocked: boolean
  unlockCost: number   // 解锁所需修为
  levelUpCost: number  // 升级所需修为
}

// ============================
// 怪物与掉落
// ============================
export interface MonsterDrop {
  itemId: string       // 掉落物品ID
  chance: number       // 掉落概率 0-1
  minCount: number     // 最少掉落数量
  maxCount: number     // 最大掉落数量
}

export interface MonsterTemplate {
  name: string
  icon: string
  title: string        // 修仙风格称号
  hp: number
  mp: number
  level: number
  attack: number
  defense: number
  expReward: number
  goldReward: number
  drops: MonsterDrop[]
}

// ============================
// AI 战斗系统类型
// ============================
export interface Enemy {
  name: string
  hp: number
  attack: number
  defense?: number
  icon?: string
  title?: string
  level?: number
}

export interface CombatTrigger {
  enemy: Enemy
}

export interface AIOption {
  text: string
  type: 'dialogue' | 'combat' | 'free'
}

export interface BattleState {
  isBattling: boolean
  enemy: Enemy | null
  battleIntro: string  // 战斗引言（AI叙事）
}

export interface BattleUnit {
  id: string
  name: string
  nameOverride?: string   // AI故事角色专用名字（如"黑衣刺客"），野外怪物用name字段
  characterId: CharacterId
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  level: number
  attack: number
  defense: number
  isEnemy: boolean
  icon?: string
}

export type NavTab = 'system' | 'equipment' | 'skills' | 'quests'
export type GameMode = 'village' | 'battle' | 'postBattle'
export type VillageLocation = 'center' | 'shop' | 'smithy' | 'quest_center' | 'npc'

export interface ShopItem {
  id: string
  name: string
  icon: string
  description: string
  price: number
  effect: string
  bought: boolean
}

export interface Quest {
  id: string
  name: string
  icon: string
  description: string
  requirement: string
  progress: number
  maxProgress: number
  reward: number
  completed: boolean
  accepted: boolean
}

export interface NPCData {
  id: string
  name: string
  title: string
  avatar: string
  dialogues: string[]
  currentDialogueIndex: number
}

export interface LogEntry {
  id: number
  text: string
  type: 'system' | 'battle' | 'info' | 'loot'
  timestamp: number
}

// ============================
// 修仙装备数据
// ============================
export const ALL_EQUIPMENT: Equipment[] = [
  // 武器 - 剑类
  { id: 'wood_sword', name: '桃木剑', slot: 'weapon', type: '剑', rarity: '凡品', icon: '🪵', attack: 5, defense: 0, mp_bonus: 0, hp_bonus: 0, description: '入门级桃木剑，蕴含微弱灵力', equipped: true },
  { id: 'iron_sword', name: '玄铁剑', slot: 'weapon', type: '剑', rarity: '法器', icon: '🗡️', attack: 15, defense: 0, mp_bonus: 5, hp_bonus: 0, description: '玄铁打造，剑气凌厉', equipped: false },
  { id: 'spirit_sword', name: '灵风剑', slot: 'weapon', type: '剑', rarity: '灵器', icon: '⚔️', attack: 30, defense: 0, mp_bonus: 10, hp_bonus: 20, description: '风灵加持，剑出如风', equipped: false },
  { id: 'frost_sword', name: '寒霜剑', slot: 'weapon', type: '剑', rarity: '法宝', icon: '❄️', attack: 55, defense: 5, mp_bonus: 20, hp_bonus: 30, description: '千年寒冰所铸，冻结万物', equipped: false },
  { id: 'celestial_sword', name: '天罡剑', slot: 'weapon', type: '剑', rarity: '仙器', icon: '🌟', attack: 100, defense: 10, mp_bonus: 50, hp_bonus: 60, description: '上古仙兵，斩妖除魔', equipped: false },
  // 防具
  { id: 'cloth_robe', name: '粗布道袍', slot: 'armor', type: '法袍', rarity: '凡品', icon: '👕', attack: 0, defense: 3, mp_bonus: 0, hp_bonus: 10, description: '普通道袍，聊胜于无', equipped: true },
  { id: 'leather_armor', name: '兽皮甲', slot: 'armor', type: '护甲', rarity: '法器', icon: '🦺', attack: 0, defense: 8, mp_bonus: 5, hp_bonus: 30, description: '妖兽皮革制成，坚韧耐用', equipped: false },
  { id: 'spirit_robe', name: '灵纹法袍', slot: 'armor', type: '法袍', rarity: '灵器', icon: '👘', attack: 5, defense: 15, mp_bonus: 20, hp_bonus: 40, description: '刻有防御法阵，灵力流转', equipped: false },
  { id: 'celestial_armor', name: '天蚕宝甲', slot: 'armor', type: '护甲', rarity: '法宝', icon: '🛡️', attack: 10, defense: 30, mp_bonus: 30, hp_bonus: 80, description: '天蚕丝织就，刀枪不入', equipped: false },
  // 饰品
  { id: 'jade_pendant', name: '白玉佩', slot: 'accessory', type: '玉佩', rarity: '法器', icon: '📿', attack: 3, defense: 3, mp_bonus: 10, hp_bonus: 20, description: '温润白玉，养气凝神', equipped: false },
  { id: 'spirit_ring', name: '聚灵戒', slot: 'accessory', type: '戒指', rarity: '灵器', icon: '💍', attack: 8, defense: 5, mp_bonus: 25, hp_bonus: 30, description: '汇聚天地灵气，提升修为', equipped: false },
  { id: 'gourd_flask', name: '炼妖壶', slot: 'accessory', type: '葫芦', rarity: '法宝', icon: '🫙', attack: 15, defense: 10, mp_bonus: 40, hp_bonus: 50, description: '可收妖炼化，妙用无穷', equipped: false },
]

// ============================
// 修仙技能数据
// ============================
// 将所有技能标记为已解锁（测试模式）
const ALL_SKILLS: Skill[] = [
  // 剑诀系
  { id: 'basic_attack', name: '基础剑诀', type: '剑诀', icon: '⚔️', description: '以气御剑，对敌人造成基础伤害', damage: 12, mpCost: 0, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 0, levelUpCost: 100 },
  { id: 'sweeping_sword', name: '横扫千军', type: '剑诀', icon: '🌪️', description: '剑气横扫，造成大量伤害', damage: 30, mpCost: 10, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 500, levelUpCost: 300 },
  { id: 'sword_rain', name: '万剑归宗', type: '剑诀', icon: '🌧️', description: '万千剑影从天而降，威力惊人', damage: 60, mpCost: 25, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 2000, levelUpCost: 800 },
  // 法术系
  { id: 'heal_spell', name: '回春术', type: '法术', icon: '💚', description: '引天地灵气，恢复自身生命', damage: 0, mpCost: 15, healAmount: 25, target: 'self', level: 1, maxLevel: 5, unlocked: true, unlockCost: 400, levelUpCost: 250 },
  { id: 'ice_spell', name: '寒冰诀', type: '法术', icon: '🧊', description: '凝聚冰霜之力冰冻敌人', damage: 25, mpCost: 12, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 800, levelUpCost: 400 },
  { id: 'fire_spell', name: '烈火咒', type: '法术', icon: '🔥', description: '召唤烈焰焚烧敌人', damage: 45, mpCost: 20, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 1500, levelUpCost: 600 },
  // 心法系（被动增益）
  { id: 'body_refine', name: '炼体诀', type: '心法', icon: '💪', description: '淬炼肉身，最大HP+20/级', damage: 0, mpCost: 0, healAmount: 20, target: 'self', level: 1, maxLevel: 5, unlocked: true, unlockCost: 300, levelUpCost: 200 },
  { id: 'mind_cultivate', name: '凝神诀', type: '心法', icon: '🧠', description: '凝神静气，最大MP+15/级', damage: 0, mpCost: 0, healAmount: 15, target: 'self', level: 1, maxLevel: 5, unlocked: true, unlockCost: 600, levelUpCost: 300 },
  { id: 'sword_mind', name: '剑心诀', type: '心法', icon: '✨', description: '剑心通明，攻击力+10/级', damage: 10, mpCost: 0, healAmount: 0, target: 'self', level: 1, maxLevel: 5, unlocked: true, unlockCost: 1200, levelUpCost: 500 },
  
  // 新增高级技能
  { id: 'thunder_sword', name: '雷影剑诀', type: '剑诀', icon: '⚡', description: '引九天雷霆之力，造成巨额雷电伤害', damage: 45, mpCost: 18, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 2500, levelUpCost: 900 },
  { id: 'phoenix_fire', name: '凤凰火', type: '法术', icon: '🦅', description: '召唤凤凰真炎焚烧敌人，威力无穷', damage: 55, mpCost: 22, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 3000, levelUpCost: 1000 },
  { id: 'moon_heal', name: '月华术', type: '法术', icon: '🌙', description: '引月华之力，大量恢复自身生命', damage: 0, mpCost: 20, healAmount: 50, target: 'self', level: 1, maxLevel: 5, unlocked: true, unlockCost: 1800, levelUpCost: 700 },
  { id: 'shadow_step', name: '影步', type: '剑诀', icon: '👻', description: '如影随形，对敌人造成致命一击', damage: 40, mpCost: 15, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 2200, levelUpCost: 800 },
  { id: 'ice_barrier', name: '寒冰障', type: '法术', icon: '🛡️', description: '凝聚冰霜护盾，临时提升防御力', damage: 0, mpCost: 12, healAmount: 0, target: 'self', level: 1, maxLevel: 5, unlocked: true, unlockCost: 1500, levelUpCost: 600 },
  { id: 'void_sword', name: '虚空斩', type: '剑诀', icon: '🌀', description: '撕裂虚空的斩击，造成毁灭性伤害', damage: 75, mpCost: 30, healAmount: 0, target: 'enemy', level: 1, maxLevel: 5, unlocked: true, unlockCost: 4000, levelUpCost: 1200 },
]

// ============================
// 靶场训练目标
// ============================
export const ALL_MONSTERS: MonsterTemplate[] = [
  {
    name: '固定靶', icon: '🎯', title: '初级训练靶',
    hp: 60, mp: 10, level: 1, attack: 8, defense: 2,
    expReward: 15, goldReward: 8,
    drops: [
      { itemId: 'wood_sword', chance: 0.05, minCount: 1, maxCount: 1 },
      { itemId: 'hp_potion_s', chance: 0.3, minCount: 1, maxCount: 1 },
    ],
  },
  {
    name: '移动靶', icon: '🏃', title: '中级训练靶',
    hp: 45, mp: 20, level: 2, attack: 12, defense: 1,
    expReward: 20, goldReward: 10,
    drops: [
      { itemId: 'jade_pendant', chance: 0.05, minCount: 1, maxCount: 1 },
      { itemId: 'mp_potion_s', chance: 0.3, minCount: 1, maxCount: 1 },
    ],
  },
  {
    name: '无人机靶', icon: '🛸', title: '高速训练靶',
    hp: 90, mp: 15, level: 3, attack: 15, defense: 5,
    expReward: 30, goldReward: 15,
    drops: [
      { itemId: 'iron_sword', chance: 0.08, minCount: 1, maxCount: 1 },
      { itemId: 'leather_armor', chance: 0.08, minCount: 1, maxCount: 1 },
      { itemId: 'hp_potion_m', chance: 0.2, minCount: 1, maxCount: 1 },
    ],
  },
  {
    name: '风压测试机', icon: '💨', title: '高压训练器',
    hp: 110, mp: 12, level: 4, attack: 18, defense: 4,
    expReward: 35, goldReward: 25,
    drops: [
      { itemId: 'spirit_ring', chance: 0.05, minCount: 1, maxCount: 1 },
      { itemId: 'spirit_robe', chance: 0.05, minCount: 1, maxCount: 1 },
      { itemId: 'hp_potion_m', chance: 0.25, minCount: 1, maxCount: 2 },
    ],
  },
  {
    name: '装甲靶', icon: '🛡️', title: '重型训练靶',
    hp: 150, mp: 30, level: 5, attack: 22, defense: 8,
    expReward: 50, goldReward: 30,
    drops: [
      { itemId: 'spirit_sword', chance: 0.06, minCount: 1, maxCount: 1 },
      { itemId: 'frost_sword', chance: 0.03, minCount: 1, maxCount: 1 },
      { itemId: 'gourd_flask', chance: 0.04, minCount: 1, maxCount: 1 },
      { itemId: 'hp_potion_m', chance: 0.3, minCount: 1, maxCount: 2 },
    ],
  },
  {
    name: '全息模拟BOSS', icon: '👁️', title: '终极训练挑战',
    hp: 200, mp: 50, level: 7, attack: 30, defense: 12,
    expReward: 80, goldReward: 50,
    drops: [
      { itemId: 'celestial_sword', chance: 0.02, minCount: 1, maxCount: 1 },
      { itemId: 'celestial_armor', chance: 0.02, minCount: 1, maxCount: 1 },
      { itemId: 'spirit_ring', chance: 0.1, minCount: 1, maxCount: 1 },
      { itemId: 'hp_potion_m', chance: 0.4, minCount: 1, maxCount: 3 },
    ],
  },
]

interface GameState {
  // 角色选择
  character: CharacterData

  // 修为 - 核心资源
  cultivation: Decimal

  // 金币
  gold: number

  // 装备背包与已装备
  inventory: Equipment[]
  equipped: { weapon: Equipment | null; armor: Equipment | null; accessory: Equipment | null }

  // 技能
  skills: Skill[]

  // 游戏模式
  gameMode: GameMode
  villageLocation: VillageLocation

  // 商店
  shopItems: ShopItem[]

  // 任务
  quests: Quest[]

  // NPC
  npcs: NPCData[]

  // 战斗系统
  playerUnit: BattleUnit
  enemyUnit: BattleUnit
  battleLog: LogEntry[]
  currentTab: NavTab

  // 返回村庄的战利品消息
  villageMessage: string

  // 上次掉落记录
  lastLoot: { exp: number; gold: number; items: string[] }

  // 战后过渡界面
  postBattleNarrative: string
  postBattleLoot: { exp: number; gold: number; items: string[] }

  // AI故事系统
  aiStoryInitialized: boolean
  aiStoryHistory: {speaker: string, content: string}[]
  aiNPCs: {id: string, name: string, title: string}[]

  // AI战斗系统
  battleState: BattleState

  // 角色操作
  setCharacter: (id: CharacterId) => void

  // 修为操作
  setCultivation: (value: Decimal | number | string) => void
  addCultivation: (value: Decimal | number | string) => void
  getCultivation: () => Decimal

  // 金币操作
  addGold: (amount: number) => void
  spendGold: (amount: number) => boolean

  // 游戏模式切换
  setGameMode: (mode: GameMode) => void
  setVillageLocation: (loc: VillageLocation) => void
  goToBattle: () => void
  returnToVillage: () => void

  // 商店操作
  buyItem: (itemId: string) => boolean

  // 装备操作
  equipItem: (itemId: string) => void
  unequipItem: (slot: EquipmentSlot) => void
  addItemToInventory: (item: Equipment) => void
  getPlayerStats: () => { attack: number; defense: number; maxHp: number; maxMp: number }

  // 装备打造相关
  forgeWeapon: (slot: number) => boolean

  // 技能操作
  unlockSkill: (skillId: string) => boolean
  upgradeSkill: (skillId: string) => boolean
  getUnlockedSkills: () => Skill[]

  // 任务操作
  acceptQuest: (questId: string) => void
  updateQuestProgress: (questId: string, amount: number) => void
  claimQuestReward: (questId: string) => boolean

  // NPC操作
  advanceNPCDialogue: (npcId: string) => void
  resetNPCDialogue: (npcId: string) => void

  // 战斗操作
  attack: () => void
  useSkill: (skillId: string) => void
  addLog: (text: string, type: LogEntry['type']) => void
  setTab: (tab: NavTab) => void
  resetBattle: () => void

  // AI战斗操作
  startAIBattle: (enemy: Enemy, battleIntro: string) => void
  endAIBattle: () => void
  aiAttack: () => void

  // 通用操作
  reset: () => void
}

const STORAGE_KEY = 'my-rpg-game-save'

let logIdCounter = 1000

const CHARACTER_DB: Record<CharacterId, CharacterData> = {
  azurlane_sword: {
    id: 'azurlane_sword',
    name: '剑灵·无名',
    title: '剑 修',
    description: '银色短发的少女剑修，翡翠绿眼眸中闪烁着得意的光芒。白色改良道袍融合水手服元素，裙摆流动着浅蓝色阵法图案。背后6-8把小飞剑如扇形展开，脚踏透明冰晶巨剑，左手捏剑诀，右手持符咒。',
  },
  askzyu_sword: {
    id: 'askzyu_sword',
    name: '灵剑·无名',
    title: '灵 剑 士',
    description: '银白短发的少女剑修，翡翠绿眼眸中透着灵动与狡黠。白色道袍随风飘扬，黑色百褶裙上流转着阵法光芒。脚下冰晶巨剑悬浮，背后飞剑扇列如屏，手中符咒散发着神秘的光芒。',
  },
  xiaoli: {
    id: 'xiaoli',
    name: '小莉',
    title: '风 引 者',
    description: '银白低马尾的高二女生，琥珀色眼眸中总带着温和的好奇心。就读普通高中，成绩年级前三。父亲是前军队射击教官，母亲早逝。从小在靶场长大，枪法精准。一次擦枪时偶然将"伯努利原理"注入子弹，发现了用知识驱动风的秘密——从此开始用物理课本上的公式改造子弹和装备。战斗方式不是蛮力，而是工程思维。',
  },
  xiaoke: {
    id: 'xiaoke',
    name: '小可',
    title: '千 机 士',
    description: '蓝色短发的温柔大哥哥。中等家庭出身，从小就爱钻研机械，拆装各种装置。根据父亲设计的机械模型，经过多年改良，打造出了独一无二的千机伞——能变幻刀、盾、枪等多种形态。平时呆呆的不爱说话，但一到战斗中就会变得异常爆裂，喜欢贴身近战，令人难以招架。',
  },
}

const DEFAULT_CHARACTER_ID: CharacterId = 'xiaoli'

// 计算玩家属性（基于装备 + 心法加成）
function calculatePlayerStats(
  equipped: { weapon: Equipment | null; armor: Equipment | null; accessory: Equipment | null },
  skills: Skill[]
): { attack: number; defense: number; maxHp: number; maxMp: number } {
  let attack = 10   // 基础攻击
  let defense = 5   // 基础防御
  let maxHp = 120   // 基础HP
  let maxMp = 50    // 基础MP

  // 装备加成
  for (const eq of [equipped.weapon, equipped.armor, equipped.accessory]) {
    if (eq) {
      attack += eq.attack
      defense += eq.defense
      maxHp += eq.hp_bonus
      maxMp += eq.mp_bonus
    }
  }

  // 心法技能加成
  for (const skill of skills) {
    if (skill.unlocked && skill.type === '心法') {
      if (skill.id === 'body_refine') {
        maxHp += skill.healAmount * skill.level
      } else if (skill.id === 'mind_cultivate') {
        maxMp += skill.healAmount * skill.level
      } else if (skill.id === 'sword_mind') {
        attack += skill.damage * skill.level
      }
    }
  }

  return { attack, defense, maxHp, maxMp }
}

function createPlayerUnit(characterId: CharacterId): BattleUnit {
  const stats = calculatePlayerStats(
    {
      weapon: ALL_EQUIPMENT.find(e => e.id === 'wood_sword')!,
      armor: ALL_EQUIPMENT.find(e => e.id === 'cloth_robe')!,
      accessory: null,
    },
    ALL_SKILLS.filter(s => s.unlocked)
  )
  return {
    id: 'player',
    name: CHARACTER_DB[characterId].name,
    characterId,
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mp: stats.maxMp,
    maxMp: stats.maxMp,
    level: 1,
    attack: stats.attack,
    defense: stats.defense,
    isEnemy: false,
  }
}

function createEnemyUnit(level?: number): BattleUnit {
  const monsters = ALL_MONSTERS
  const idx = level !== undefined
    ? Math.min(level - 1, monsters.length - 1)
    : Math.floor(Math.random() * Math.min(3 + Math.floor(Math.random() * 3), monsters.length))
  const template = monsters[idx]
  return {
    id: 'enemy_' + Date.now(),
    name: template.name,
    characterId: 'azurlane_sword' as CharacterId,
    hp: template.hp + Math.floor(Math.random() * 20),
    maxHp: template.hp + Math.floor(Math.random() * 20),
    mp: template.mp,
    maxMp: template.mp,
    level: template.level,
    attack: template.attack,
    defense: template.defense,
    isEnemy: true,
    icon: template.icon,
  }
}

// 初始化商店物品
function createDefaultShopItems(): ShopItem[] {
  return [
    { id: 'hp_potion_s', name: '急救绷带', icon: '🩹', description: '恢复 40 HP', price: 40, effect: 'hp_40', bought: false },
    { id: 'hp_potion_m', name: '医疗包', icon: '🏥', description: '恢复 100 HP', price: 100, effect: 'hp_100', bought: false },
    { id: 'mp_potion_s', name: '小型压缩气罐', icon: '🫧', description: '恢复 30 压缩气', price: 50, effect: 'mp_30', bought: false },
    { id: 'mp_potion_m', name: '大型压缩气罐', icon: '🛢️', description: '恢复 80 压缩气', price: 130, effect: 'mp_80', bought: false },
    { id: 'hp_potion_l', name: '紧急医疗箱', icon: '🚑', description: '恢复 300 HP（救命装备）', price: 400, effect: 'hp_300', bought: false },
    { id: 'spirit_pill', name: '风能结晶', icon: '💎', description: '获得 200 风能经验', price: 250, effect: 'exp_200', bought: false },
  ]
}

// 初始化任务
function createDefaultQuests(): Quest[] {
  return [
    {
      id: 'quest_kill_wolves',
      name: '射击初体验',
      icon: '🎯',
      description: '靶场的基本功不能落下。完成 3 次固定靶射击。',
      requirement: '固定靶击破 0/3',
      progress: 0,
      maxProgress: 3,
      reward: 100,
      completed: false,
      accepted: false,
    },
    {
      id: 'quest_kill_monsters',
      name: '百发百中',
      icon: '💨',
      description: '各种靶型都要掌握。完成 5 次任意靶场训练。',
      requirement: '训练完成 0/5',
      progress: 0,
      maxProgress: 5,
      reward: 200,
      completed: false,
      accepted: false,
    },
    {
      id: 'quest_collect_exp',
      name: '风能积累',
      icon: '🌀',
      description: '在训练中积累 1000 风能经验，感受知识的力量。',
      requirement: '风能经验 0/1000',
      progress: 0,
      maxProgress: 1000,
      reward: 500,
      completed: false,
      accepted: false,
    },
  ]
}

// 初始化NPC
function createDefaultNPCs(): NPCData[] {
  return [
    {
      id: 'npc_dad',
      name: '老李（父亲）',
      title: '射击俱乐部主理人',
      avatar: '👨‍🔧',
      dialogues: [
        '莉莉，放学了？正好，我刚把后院的靶场整理好，你上次改的那把枪我帮你调了调瞄准镜。',
        '你妈留下的那本笔记...我翻到了一些关于空气流动的草图。也许对你有用，自己去车库找找看。',
        '对了，街口五金店的陈叔说最近郊外有些奇怪的动静，你去练枪的时候小心点。',
        '你这孩子，又在算那些我看不懂的公式。行吧，别搞太晚，晚饭我给你留着。',
      ],
      currentDialogueIndex: 0,
    },
    {
      id: 'npc_classmate',
      name: '小陈（同学）',
      title: '同班·物理课代表',
      avatar: '👦',
      dialogues: [
        '莉莉！你猜我昨天在图书馆找到了什么？——<流体力学精要>！里面有一章专门讲螺旋弹道的！',
        '我爸说上次你用压缩空气做的那个小装置，他拿去厂里给工程师看了，他们都说有意思。',
        '周末要不要一起去郊外？我知道有个废弃的工厂，里面的管道通风结构很特别。',
        '对了，物理老师让我问你，有没有兴趣参加下个月的科学竞赛？主题是"能源利用"。',
      ],
      currentDialogueIndex: 0,
    },
    {
      id: 'npc_shopkeeper',
      name: '陈叔',
      title: '街口五金店老板',
      avatar: '🧰',
      dialogues: [
        '哟，小莉来了！你要的密封圈和铜管我进货了，按老规矩给你算成本价。',
        '你爸上次来买气阀的时候，说到你最近在搞什么"压缩空气推进装置"，听起来挺唬人的！',
        '我年轻时候也爱捣鼓这些玩意儿，可惜没你那么聪明。你有什么不懂的尽管来问。',
        '听说郊外那个旧靶场要翻新了？你要是需要什么材料，跟我说一声就行。',
      ],
      currentDialogueIndex: 0,
    },
  ]
}

// 打怪掉落系统
function generateLoot(monsterName: string): { exp: number; gold: number; items: string[] } {
  const template = ALL_MONSTERS.find(m => m.name === monsterName)
  if (!template) return { exp: 10 + Math.floor(Math.random() * 10), gold: 5 + Math.floor(Math.random() * 8), items: [] }

  const exp = template.expReward + Math.floor(Math.random() * 10)
  const gold = template.goldReward + Math.floor(Math.random() * 8)
  const items: string[] = []

  // 掉落判定
  for (const drop of template.drops) {
    if (Math.random() < drop.chance) {
      const count = drop.minCount + Math.floor(Math.random() * (drop.maxCount - drop.minCount + 1))
      for (let i = 0; i < count; i++) {
        items.push(drop.itemId)
      }
    }
  }

  return { exp, gold, items }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      const defaultEquipped = {
        weapon: ALL_EQUIPMENT.find(e => e.id === 'wood_sword')!,
        armor: ALL_EQUIPMENT.find(e => e.id === 'cloth_robe')!,
        accessory: null as Equipment | null,
      }
      const defaultEnemy = createEnemyUnit(1)

      return {
        character: { ...CHARACTER_DB[DEFAULT_CHARACTER_ID] },
        cultivation: new Decimal(0),
        gold: 100,
        inventory: ALL_EQUIPMENT.filter(e => e.equipped === false).map(e => ({ ...e, equipped: false })),
        equipped: defaultEquipped,
        skills: ALL_SKILLS.map(s => ({ ...s })),
        gameMode: 'village',
        villageLocation: 'center',
        shopItems: createDefaultShopItems(),
        quests: createDefaultQuests(),
        npcs: createDefaultNPCs(),
        playerUnit: createPlayerUnit(DEFAULT_CHARACTER_ID),
        enemyUnit: defaultEnemy,
        battleLog: [],
        currentTab: 'system',
        villageMessage: '',
        lastLoot: { exp: 0, gold: 0, items: [] },
        postBattleNarrative: '',
        postBattleLoot: { exp: 0, gold: 0, items: [] },
        aiStoryInitialized: false,
        aiStoryHistory: [],
        aiNPCs: [],
        battleState: {
          isBattling: false,
          enemy: null,
          battleIntro: ''
        },

        setCharacter: (id: CharacterId) => {
          const charData = CHARACTER_DB[id]
          set({
            character: { ...charData },
            playerUnit: createPlayerUnit(id),
          })
        },

        setCultivation: (value: Decimal | number | string) => {
          const num = value instanceof Decimal ? value : new Decimal(value)
          set({ cultivation: num })
        },

        addCultivation: (value: Decimal | number | string) => {
          const num = value instanceof Decimal ? value : new Decimal(value)
          set((state) => ({
            cultivation: state.cultivation.add(num),
          }))
        },

        getCultivation: () => {
          return get().cultivation
        },

        addGold: (amount: number) => {
          set((state) => ({ gold: state.gold + amount }))
        },

        spendGold: (amount: number) => {
          const state = get()
          if (state.gold < amount) return false
          set({ gold: state.gold - amount })
          return true
        },

        setGameMode: (mode: GameMode) => {
          set({ gameMode: mode })
        },

        setVillageLocation: (loc: VillageLocation) => {
          set({ villageLocation: loc })
        },

        goToBattle: () => {
          const playerLevel = get().playerUnit.level
          const newEnemy = createEnemyUnit(playerLevel)
          set({
            gameMode: 'battle',
            enemyUnit: newEnemy,
            battleLog: [
              { id: ++logIdCounter, text: '你离开青石村，踏入荒野……', type: 'system', timestamp: Date.now() },
              { id: ++logIdCounter, text: `一只【${newEnemy.name}】（${newEnemy.icon}）出现了！`, type: 'battle', timestamp: Date.now() },
            ],
          })
        },

        returnToVillage: () => {
          const stats = get().getPlayerStats()
          set({
            gameMode: 'village',
            villageLocation: 'center',
            playerUnit: {
              ...get().playerUnit,
              hp: stats.maxHp,
              mp: stats.maxMp,
              maxHp: stats.maxHp,
              maxMp: stats.maxMp,
            },
            villageMessage: '你回到了青石村，体力已完全恢复。',
          })
          setTimeout(() => {
            set({ villageMessage: '' })
          }, 3000)
        },

        // === 商店操作 ===
        buyItem: (itemId: string) => {
          const state = get()
          const item = state.shopItems.find(i => i.id === itemId)
          if (!item || item.bought) return false
          if (state.gold < item.price) return false

          // 应用效果
          const effect = item.effect
          if (effect === 'hp_40') {
            const newHp = Math.min(state.playerUnit.hp + 40, state.playerUnit.maxHp)
            set({ playerUnit: { ...state.playerUnit, hp: newHp } })
          } else if (effect === 'hp_100') {
            const newHp = Math.min(state.playerUnit.hp + 100, state.playerUnit.maxHp)
            set({ playerUnit: { ...state.playerUnit, hp: newHp } })
          } else if (effect === 'hp_300') {
            const newHp = Math.min(state.playerUnit.hp + 300, state.playerUnit.maxHp)
            set({ playerUnit: { ...state.playerUnit, hp: newHp } })
          } else if (effect === 'mp_30') {
            const newMp = Math.min(state.playerUnit.mp + 30, state.playerUnit.maxMp)
            set({ playerUnit: { ...state.playerUnit, mp: newMp } })
          } else if (effect === 'mp_80') {
            const newMp = Math.min(state.playerUnit.mp + 80, state.playerUnit.maxMp)
            set({ playerUnit: { ...state.playerUnit, mp: newMp } })
          } else if (effect === 'exp_200') {
            get().addCultivation(200)
          }

          set({
            gold: state.gold - item.price,
            shopItems: state.shopItems.map(i =>
              i.id === itemId ? { ...i, bought: true } : i
            ),
          })
          return true
        },

        // === 装备操作 ===
        equipItem: (itemId: string) => {
          const state = get()
          const item = state.inventory.find(i => i.id === itemId)
          if (!item) return

          const slot = item.slot
          const oldEquipped = state.equipped[slot]

          const newInventory = state.inventory.filter(i => i.id !== itemId)
          if (oldEquipped) {
            newInventory.push({ ...oldEquipped, equipped: false })
          }

          const newEquipped = { ...state.equipped, [slot]: { ...item, equipped: true } as Equipment }
          const stats = calculatePlayerStats(newEquipped, state.skills)

          set({
            inventory: newInventory,
            equipped: newEquipped,
            playerUnit: {
              ...state.playerUnit,
              attack: stats.attack,
              defense: stats.defense,
              maxHp: stats.maxHp,
              maxMp: stats.maxMp,
              hp: Math.min(state.playerUnit.hp, stats.maxHp),
              mp: Math.min(state.playerUnit.mp, stats.maxMp),
            },
          })
        },

        unequipItem: (slot: EquipmentSlot) => {
          const state = get()
          const oldEquipped = state.equipped[slot]
          if (!oldEquipped) return

          const newEquipped = { ...state.equipped, [slot]: null }
          const stats = calculatePlayerStats(newEquipped, state.skills)

          set({
            inventory: [...state.inventory, { ...oldEquipped, equipped: false }],
            equipped: newEquipped,
            playerUnit: {
              ...state.playerUnit,
              attack: stats.attack,
              defense: stats.defense,
              maxHp: stats.maxHp,
              maxMp: stats.maxMp,
              hp: Math.min(state.playerUnit.hp, stats.maxHp),
              mp: Math.min(state.playerUnit.mp, stats.maxMp),
            },
          })
        },

        addItemToInventory: (item: Equipment) => {
          set((state) => ({
            inventory: [...state.inventory, { ...item, equipped: false }],
          }))
        },

        getPlayerStats: () => {
          const state = get()
          return calculatePlayerStats(state.equipped, state.skills)
        },

        // === 装备打造 ===
        forgeWeapon: (slot: number) => {
          const forgeCosts = [300, 500, 800]
          const forgeItems: Equipment[] = [
            { id: 'iron_sword', name: '玄铁剑', slot: 'weapon', type: '剑', rarity: '法器', icon: '🗡️', attack: 15, defense: 0, mp_bonus: 5, hp_bonus: 0, description: '玄铁打造，剑气凌厉', equipped: false },
            { id: 'spirit_sword', name: '灵风剑', slot: 'weapon', type: '剑', rarity: '灵器', icon: '⚔️', attack: 30, defense: 0, mp_bonus: 10, hp_bonus: 20, description: '风灵加持，剑出如风', equipped: false },
            { id: 'frost_sword', name: '寒霜剑', slot: 'weapon', type: '剑', rarity: '法宝', icon: '❄️', attack: 55, defense: 5, mp_bonus: 20, hp_bonus: 30, description: '千年寒冰所铸，冻结万物', equipped: false },
          ]

          const cost = forgeCosts[slot]
          const itemData = forgeItems[slot]
          if (!itemData || cost === undefined) return false

          if (get().gold < cost) return false

          // 检查是否已有该装备
          const state = get()
          if (state.inventory.find(i => i.id === itemData.id) || state.equipped.weapon?.id === itemData.id) {
            return false
          }

          set({
            gold: state.gold - cost,
            inventory: [...state.inventory, itemData],
          })
          return true
        },

        // === 技能操作 ===
        unlockSkill: (skillId: string) => {
          const state = get()
          const skill = state.skills.find(s => s.id === skillId)
          if (!skill || skill.unlocked) return false

          const cost = new Decimal(skill.unlockCost)
          if (state.cultivation.lt(cost)) return false

          // 应用心法等被动技能效果
          set({
            cultivation: state.cultivation.sub(cost),
            skills: state.skills.map(s =>
              s.id === skillId ? { ...s, unlocked: true } : s
            ),
          })

          // 重新计算玩家属性
          const newState = get()
          const stats = calculatePlayerStats(newState.equipped, newState.skills)
          set({
            playerUnit: {
              ...newState.playerUnit,
              attack: stats.attack,
              defense: stats.defense,
              maxHp: stats.maxHp,
              maxMp: stats.maxMp,
              hp: Math.min(newState.playerUnit.hp, stats.maxHp),
              mp: Math.min(newState.playerUnit.mp, stats.maxMp),
            },
          })
          return true
        },

        upgradeSkill: (skillId: string) => {
          const state = get()
          const skill = state.skills.find(s => s.id === skillId)
          if (!skill || !skill.unlocked || skill.level >= skill.maxLevel) return false

          // 按比例计算升级费用：基础值 * level^1.8，实现修为越高消耗越大
          const scaleFactor = Math.pow(skill.level, 1.8)
          const cost = new Decimal(Math.floor(skill.levelUpCost * scaleFactor))
          if (state.cultivation.lt(cost)) return false

          set({
            cultivation: state.cultivation.sub(cost),
            skills: state.skills.map(s =>
              s.id === skillId ? { ...s, level: s.level + 1 } : s
            ),
          })

          // 心法升级后重新计算属性
          if (skill.type === '心法') {
            const newState = get()
            const stats = calculatePlayerStats(newState.equipped, newState.skills)
            set({
              playerUnit: {
                ...newState.playerUnit,
                attack: stats.attack,
                defense: stats.defense,
                maxHp: stats.maxHp,
                maxMp: stats.maxMp,
              },
            })
          }
          return true
        },

        getUnlockedSkills: () => {
          return get().skills.filter(s => s.unlocked)
        },

        // === 任务操作 ===
        acceptQuest: (questId: string) => {
          set((state) => ({
            quests: state.quests.map(q =>
              q.id === questId ? { ...q, accepted: true } : q
            ),
          }))
        },

        updateQuestProgress: (questId: string, amount: number) => {
          set((state) => ({
            quests: state.quests.map(q => {
              if (q.id !== questId) return q
              const newProgress = Math.min(q.progress + amount, q.maxProgress)
              return { ...q, progress: newProgress, completed: newProgress >= q.maxProgress }
            }),
          }))
        },

        claimQuestReward: (questId: string) => {
          const state = get()
          const quest = state.quests.find(q => q.id === questId)
          if (!quest || !quest.completed) return false

          set({
            gold: state.gold + quest.reward,
            quests: state.quests.map(q =>
              q.id === questId ? { ...q, accepted: false, progress: 0, completed: false } : q
            ),
          })
          return true
        },

        // === NPC操作 ===
        advanceNPCDialogue: (npcId: string) => {
          set((state) => ({
            npcs: state.npcs.map(npc => {
              if (npc.id !== npcId) return npc
              const nextIndex = (npc.currentDialogueIndex + 1) % npc.dialogues.length
              return { ...npc, currentDialogueIndex: nextIndex }
            }),
          }))
        },

        resetNPCDialogue: (npcId: string) => {
          set((state) => ({
            npcs: state.npcs.map(npc =>
              npc.id === npcId ? { ...npc, currentDialogueIndex: 0 } : npc
            ),
          }))
        },

        // === 战斗操作 ===
        attack: () => {
          const state = get()
          const damage = Math.max(1, state.playerUnit.attack - state.enemyUnit.defense + Math.floor(Math.random() * 5))
          const newEnemyHp = Math.max(0, state.enemyUnit.hp - damage)
          const enemyName = state.enemyUnit.nameOverride || state.enemyUnit.name

          const logs: LogEntry[] = [
            ...state.battleLog,
            { id: ++logIdCounter, text: `你对【${enemyName}】造成 ${damage} 点伤害！`, type: 'battle', timestamp: Date.now() },
          ]

          if (newEnemyHp <= 0) {
            // 敌人被击败 - 进入战后过渡界面
            const enemyIcon = state.enemyUnit.icon || '💀'
            const loot = generateLoot(state.enemyUnit.name)
            const narrative = `战斗结束！\n\n你成功击败了【${enemyName}】${enemyIcon}！\n\n在激烈的交锋后，敌人终于倒下了。你从战斗中获得了宝贵的经验，是时候决定下一步的行动了。\n\n继续深入探索，还是返回青石村休整？`

            set({
              enemyUnit: { ...state.enemyUnit, hp: 0 },
              battleLog: logs,
              gameMode: 'postBattle',
              postBattleNarrative: narrative,
              postBattleLoot: loot,
              lastLoot: loot,
            })
            return
          }

          // 敌人反击
          const enemyDamage = Math.max(1, state.enemyUnit.attack - state.playerUnit.defense + Math.floor(Math.random() * 3))
          const newPlayerHp = Math.max(0, state.playerUnit.hp - enemyDamage)

          logs.push({
            id: ++logIdCounter,
            text: `【${enemyName}】对你造成 ${enemyDamage} 点伤害！`,
            type: 'battle',
            timestamp: Date.now(),
          })

          set({
            enemyUnit: { ...state.enemyUnit, hp: newEnemyHp },
            playerUnit: { ...state.playerUnit, hp: newPlayerHp },
            battleLog: logs,
          })
        },

        useSkill: (skillId: string) => {
          const state = get()
          const skill = state.skills.find(s => s.id === skillId)
          if (!skill || !skill.unlocked) return

          // 消耗MP
          if (state.playerUnit.mp < skill.mpCost) {
            state.addLog('灵力不足！', 'system')
            return
          }

          const logs: LogEntry[] = [...state.battleLog]
          const newMp = state.playerUnit.mp - skill.mpCost
          let newPlayerHp = state.playerUnit.hp
          let newEnemyHp = state.enemyUnit.hp
          const enemyName = state.enemyUnit.nameOverride || state.enemyUnit.name

          // --- 触发技能特效事件（在日志添加之前触发） ---
          const skillEffectEvent = new CustomEvent('rpg-skill-effect', {
            detail: { skillId, skill, playerUnit: state.playerUnit, enemyUnit: state.enemyUnit }
          })
          window.dispatchEvent(skillEffectEvent)

          if (skill.target === 'self') {
            // 治疗或增益
            const healAmount = skill.healAmount * skill.level
            newPlayerHp = Math.min(state.playerUnit.hp + healAmount, state.playerUnit.maxHp)
            logs.push({
              id: ++logIdCounter,
              text: `🧘 使用【${skill.name}】(Lv.${skill.level})，恢复 ${healAmount} HP！`,
              type: 'info',
              timestamp: Date.now(),
            })
          } else {
            // 攻击技能
            const damage = Math.max(1, skill.damage * skill.level - state.enemyUnit.defense + Math.floor(Math.random() * 5))
            newEnemyHp = Math.max(0, state.enemyUnit.hp - damage)
            logs.push({
              id: ++logIdCounter,
              text: `⚡ 使用【${skill.name}】(Lv.${skill.level})，对【${enemyName}】造成 ${damage} 点伤害！`,
              type: 'battle',
              timestamp: Date.now(),
            })
          }

          if (newEnemyHp <= 0 && skill.target === 'enemy') {
            // 敌人被击败 - 进入战后过渡界面
            const enemyIcon = state.enemyUnit.icon || '💀'
            const loot = generateLoot(state.enemyUnit.name)
            const narrative = `战斗结束！\n\n你使用【${skill.name}】(Lv.${skill.level}) 击败了【${enemyName}】${enemyIcon}！\n\n${skill.description}爆发出强大的力量，敌人应声倒下。你感受着体内灵力的流转，战斗的经验化作了成长的养分。\n\n继续深入探索，还是返回青石村休整？`

            set({
              enemyUnit: { ...state.enemyUnit, hp: 0 },
              playerUnit: { ...state.playerUnit, mp: newMp },
              battleLog: logs,
              gameMode: 'postBattle',
              postBattleNarrative: narrative,
              postBattleLoot: loot,
              lastLoot: loot,
            })
            return
          }

          // 敌人反击
          const enemyDamage = Math.max(1, state.enemyUnit.attack - state.playerUnit.defense + Math.floor(Math.random() * 3))
          newPlayerHp = Math.max(0, newPlayerHp - enemyDamage)

          logs.push({
            id: ++logIdCounter,
            text: `【${enemyName}】对你造成 ${enemyDamage} 点伤害！`,
            type: 'battle',
            timestamp: Date.now(),
          })

          set({
            enemyUnit: { ...state.enemyUnit, hp: newEnemyHp },
            playerUnit: { ...state.playerUnit, hp: newPlayerHp, mp: newMp },
            battleLog: logs,
          })
        },

        addLog: (text: string, type: LogEntry['type']) => {
          set((state) => ({
            battleLog: [...state.battleLog, { id: ++logIdCounter, text, type, timestamp: Date.now() }],
          }))
        },

        setTab: (tab: NavTab) => {
          set({ currentTab: tab })
        },

        resetBattle: () => {
          set({
            battleLog: [],
            enemyUnit: createEnemyUnit(1),
          })
        },

        // === AI战斗操作 ===
        startAIBattle: (enemy: Enemy, battleIntro: string) => {
          set({
            gameMode: 'battle',
            battleState: {
              isBattling: true,
              enemy: enemy,
              battleIntro: battleIntro
            }
          })
        },

        endAIBattle: () => {
          set({
            battleState: {
              isBattling: false,
              enemy: null,
              battleIntro: ''
            }
          })
        },

        aiAttack: () => {
          const state = get()
          if (!state.battleState.isBattling || !state.battleState.enemy) return

          const enemy = state.battleState.enemy
          // 玩家攻击力固定为10
          const playerAttack = 10
          const newEnemyHp = Math.max(0, enemy.hp - playerAttack)

          if (newEnemyHp <= 0) {
            // 敌人被击败
            set({
              battleState: {
                ...state.battleState,
                enemy: { ...enemy, hp: 0 }
              }
            })
          } else {
            // 更新敌人HP
            set({
              battleState: {
                ...state.battleState,
                enemy: { ...enemy, hp: newEnemyHp }
              }
            })
          }
        },

        reset: () => {
          const newDefault = {
            character: { ...CHARACTER_DB[DEFAULT_CHARACTER_ID] },
            cultivation: new Decimal(0),
            gold: 100,
            inventory: ALL_EQUIPMENT.filter(e => e.equipped === false).map(e => ({ ...e, equipped: false })),
            equipped: { ...defaultEquipped },
            skills: ALL_SKILLS.map(s => ({ ...s })),
            gameMode: 'village' as GameMode,
            villageLocation: 'center' as VillageLocation,
            shopItems: createDefaultShopItems(),
            quests: createDefaultQuests(),
            npcs: createDefaultNPCs(),
            playerUnit: createPlayerUnit(DEFAULT_CHARACTER_ID),
            enemyUnit: defaultEnemy,
            battleLog: [],
            currentTab: 'system' as NavTab,
            villageMessage: '',
            lastLoot: { exp: 0, gold: 0, items: [] },
            postBattleNarrative: '',
            postBattleLoot: { exp: 0, gold: 0, items: [] },
            aiStoryInitialized: false,
            aiStoryHistory: [],
            aiNPCs: [],
            battleState: {
              isBattling: false,
              enemy: null,
              battleIntro: ''
            },
          }
          set(newDefault)
        },
      }
    },
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        // zustand/persist v4 的 migrate 回调接收完整存储对象
        // localStorage 中数据格式为: { state: {...}, version: N }
        // 但 persistedState 可能已经是 unwrapped 的 state（取决于版本）
        let rawState: Record<string, unknown>

        // 处理不同的存储格式
        if (typeof persistedState === 'object' && persistedState !== null) {
          const obj = persistedState as Record<string, unknown>
          if (obj && typeof obj === 'object' && 'state' in obj) {
            // zustand 标准格式: { state: {...}, version: N }
            rawState = obj.state as Record<string, unknown>
          } else {
            // 已经是 unwrapped 的 state
            rawState = obj
          }
        } else {
          rawState = {}
        }

        // 运行版本迁移
        const migrated = loadWithMigration(rawState, version) as Record<string, unknown>

        // 确保 cultivation 从任意格式转换回 Decimal 对象
        // 可能的情况：字符串 "123"、数字 123、或序列化的 Decimal 对象 { s: 1, e: 0, d: [123] }
        if (migrated.cultivation == null) {
          migrated.cultivation = new Decimal(0)
        } else {
          const cult = migrated.cultivation
          if (typeof cult === 'string') {
            migrated.cultivation = new Decimal(cult)
          } else if (typeof cult === 'number') {
            migrated.cultivation = new Decimal(cult)
          } else if (typeof cult === 'object') {
            try {
              const obj = cult as { s?: number; e?: number; d?: number[] }
              if (obj.d && obj.d.length > 0) {
                const str = obj.d.join('')
                migrated.cultivation = new Decimal(obj.s === 1 ? str : '-' + str)
              } else {
                migrated.cultivation = new Decimal(0)
              }
            } catch {
              migrated.cultivation = new Decimal(0)
            }
          } else {
            migrated.cultivation = new Decimal(0)
          }
        }

        // 确保其他必要字段是正确类型
        if (typeof migrated.gold !== 'number') {
          migrated.gold = 100
        }
        return migrated as unknown as GameState
      },
      // merge 函数每次 hydration 时都会调用，负责将持久化状态与初始状态合并
      // 这里确保 cultivation 总是 Decimal 实例
      merge: (persistedState: unknown, currentState: GameState) => {
        const merged = {
          ...currentState,
          ...(persistedState as object),
        }
        // 确保 cultivation 是 Decimal 实例
        if (!(merged.cultivation instanceof Decimal)) {
          if (merged.cultivation == null) {
            merged.cultivation = new Decimal(0)
          } else if (typeof merged.cultivation === 'string') {
            merged.cultivation = new Decimal(merged.cultivation)
          } else if (typeof merged.cultivation === 'number') {
            merged.cultivation = new Decimal(merged.cultivation)
          } else if (typeof merged.cultivation === 'object') {
            try {
              const obj = merged.cultivation as { s?: number; e?: number; d?: number[] }
              if (obj.d && obj.d.length > 0) {
                const str = obj.d.join('')
                merged.cultivation = new Decimal(obj.s === 1 ? str : '-' + str)
              } else {
                merged.cultivation = new Decimal(0)
              }
            } catch {
              merged.cultivation = new Decimal(0)
            }
          } else {
            merged.cultivation = new Decimal(0)
          }
        }
        return merged as GameState
      },
    }
  )
)
