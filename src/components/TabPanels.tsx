import React from 'react'
import Decimal from 'decimal.js'
import { useGameStore, NavTab, Equipment, EquipmentSlot, Skill } from '../store/useGameStore'
import { formatCultivation } from '../utils/format'

// 玻璃卡片组件
function GlassCard({ title, icon, color, children, className = '' }: {
  title: string
  icon: string
  color: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${className}`}>
      {/* 顶部彩色光条 */}
      <div className={`h-1 bg-gradient-to-r ${color}`} />
      {/* 背景光晕 */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 blur-3xl`} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{icon}</span>
          <h3 className={`text-sm font-bold tracking-widest bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {title}
          </h3>
        </div>
        {children}
      </div>
    </div>
  )
}

/**
 * 系统面板 - 显示角色信息、修为等
 */
function SystemPanel() {
  const cultivation = useGameStore((state) => state.cultivation)
  const character = useGameStore((state) => state.character)
  const playerUnit = useGameStore((state) => state.playerUnit)
  const reset = useGameStore((state) => state.reset)

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* 角色信息卡 */}
      <GlassCard title="角色信息" icon="👤" color="from-cyan-400 to-blue-500">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/50">姓名</span>
            <span className="text-sm text-white font-bold">{character.name}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/50">称号</span>
            <span className="text-sm bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-bold">
              {character.title}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/50">等级</span>
            <span className="text-sm text-white font-bold">Lv.{playerUnit.level}</span>
          </div>
        </div>
      </GlassCard>

      {/* HP/MP 状态卡 */}
      <GlassCard title="战斗状态" icon="💎" color="from-rose-400 to-pink-500">
        <div className="space-y-4">
          {/* HP 槽 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500/30 to-red-500/30 flex items-center justify-center text-xs">❤️</span>
                <span className="text-xs text-white/70">生命值</span>
              </div>
              <span className="text-xs text-rose-400 font-bold font-mono">{playerUnit.hp} / {playerUnit.maxHp}</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg shadow-rose-500/50"
                style={{ width: `${(playerUnit.hp / playerUnit.maxHp) * 100}%` }}
              />
            </div>
          </div>
          {/* MP 槽 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center text-xs">💧</span>
                <span className="text-xs text-white/70">灵力值</span>
              </div>
              <span className="text-xs text-blue-400 font-bold font-mono">{playerUnit.mp} / {playerUnit.maxMp}</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                style={{ width: `${(playerUnit.mp / playerUnit.maxMp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 修为面板 */}
      <GlassCard title="修为储存" icon="✨" color="from-purple-400 to-violet-500">
        <div className="text-center py-2">
          <p className="text-[10px] text-white/40 mb-3 tracking-wider">当前储存修为</p>
          <div className="inline-block px-8 py-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-white/10 shadow-inner">
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent drop-shadow-lg">
              {formatCultivation(cultivation ?? 0)}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 操作按钮 */}
      <button
        onClick={reset}
        className="w-full px-4 py-4 bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-400 text-sm font-bold tracking-wider rounded-2xl
                   border border-rose-500/30 hover:border-rose-500/50 hover:from-rose-500/30 hover:to-orange-500/30
                   active:scale-95 transition-all duration-300 backdrop-blur-xl"
      >
        🔄 重置修行
      </button>
    </div>
  )
}

/**
 * 装备稀有度颜色映射
 */
const rarityColors: Record<string, { text: string; bg: string; border: string }> = {
  '凡品': { text: 'text-[#a0a0b0]', bg: 'bg-[#1a1a1a]', border: 'border-[#2a2a2a]/50' },
  '法器': { text: 'text-[#3ac4a0]', bg: 'bg-[#0a1a1a]', border: 'border-[#1a3a3a]/50' },
  '灵器': { text: 'text-[#3a8ac4]', bg: 'bg-[#0a0a1a]', border: 'border-[#1a1a3a]/50' },
  '法宝': { text: 'text-[#c47ac4]', bg: 'bg-[#1a0a1a]', border: 'border-[#3a1a3a]/50' },
  '仙器': { text: 'text-[#ffd700]', bg: 'bg-[#1a1a0a]', border: 'border-[#3a3a1a]/50' },
}

/**
 * 装备面板 - 显示装备栏与背包
 */
function EquipmentPanel() {
  const equipped = useGameStore((state) => state.equipped)
  const inventory = useGameStore((state) => state.inventory)
  const equipItem = useGameStore((state) => state.equipItem)
  const unequipItem = useGameStore((state) => state.unequipItem)

  const renderEquipmentSlot = (slot: EquipmentSlot, item: Equipment | null, label: string, icon: string, noEquipText: string) => (
    <div className={`p-3 bg-[#0f0f1a] rounded-xl mb-2.5 border ${item ? 'border-[#2a2a4a]/70 hover:border-[#ff8c00]/30' : 'border-[#1a1a3a]/30'} transition-all`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${item ? 'bg-gradient-to-br from-[#2a1a0a] to-[#1a0a00] border border-[#3a2a1a]/50' : 'bg-[#0a0a12] border border-dashed border-[#1a1a3a]/30'}`}>
          {item ? item.icon : icon}
        </div>
        <div className="flex-1">
          {item ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#f5f0c4] font-bold tracking-wider">{item.name}</p>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${rarityColors[item.rarity]?.text || 'text-[#a0a0b0]'} ${rarityColors[item.rarity]?.bg || 'bg-[#1a1a1a]'} border ${rarityColors[item.rarity]?.border || 'border-[#2a2a2a]/50'}`}>
                  {item.rarity}
                </span>
              </div>
              <p className="text-[10px] text-[#a0a0b0]/60 mt-0.5">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {item.attack > 0 && <span className="text-[9px] text-[#e94560] font-mono">⚔ 攻击+{item.attack}</span>}
                {item.defense > 0 && <span className="text-[9px] text-[#3a8ac4] font-mono">🛡 防御+{item.defense}</span>}
                {item.hp_bonus > 0 && <span className="text-[9px] text-[#4a8a4a] font-mono">❤️ HP+{item.hp_bonus}</span>}
                {item.mp_bonus > 0 && <span className="text-[9px] text-[#3a8ac4] font-mono">💧 MP+{item.mp_bonus}</span>}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#a0a0b0]/40 font-bold tracking-wider">{label}</p>
              <p className="text-[10px] text-[#a0a0b0]/30 mt-0.5">{noEquipText}</p>
            </>
          )}
        </div>
        {item && (
          <button
            onClick={() => unequipItem(slot)}
            className="px-3 py-1.5 bg-[#3a1a1a]/50 hover:bg-[#4a2a2a]/70 text-[#e94560] text-[10px] font-bold rounded-lg border border-[#4a2a2a]/50 hover:border-[#e94560]/50 transition-all active:scale-95"
          >
            卸下
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* 装备栏 */}
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#12121f] rounded-2xl p-4 border border-[#2a2a4a]/50 shadow-lg shadow-[#0a0a1a]/50">
        <div className="flex items-center gap-1 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-[#ff8c00] to-[#ffd700] rounded-full" />
          <p className="text-xs text-[#ff8c00] tracking-widest font-bold">装 备 栏</p>
        </div>
        
        {renderEquipmentSlot('weapon', equipped.weapon, '武器', '🗡️', '未装备武器')}
        {renderEquipmentSlot('armor', equipped.armor, '防具', '👕', '未装备防具')}
        {renderEquipmentSlot('accessory', equipped.accessory, '饰品', '💍', '未装备饰品')}
      </div>

      {/* 背包 */}
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#12121f] rounded-2xl p-4 border border-[#2a2a4a]/50 shadow-lg shadow-[#0a0a1a]/50">
        <div className="flex items-center gap-1 mb-3">
          <div className="w-1 h-4 bg-gradient-to-b from-[#3a8ac4] to-[#5ab8ff] rounded-full" />
          <p className="text-xs text-[#3a8ac4] tracking-widest font-bold">背 包 ({inventory.length})</p>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[#a0a0b0]/30 text-sm">🈳</p>
            <p className="text-[10px] text-[#a0a0b0]/30 mt-2">背包空空如也</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {inventory.map((item) => (
              <div
                key={item.id + '_' + item.name}
                className="p-2.5 bg-[#0a0a1a] rounded-xl border border-[#1a1a3a]/30 hover:border-[#3a8ac4]/30 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a1a2a] to-[#0a0a1a] rounded-lg flex items-center justify-center text-base border border-[#2a2a3a]/30">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs text-[#f5f0c4] font-bold truncate">{item.name}</p>
                      <span className={`px-1 py-0.5 rounded text-[7px] font-bold ${rarityColors[item.rarity]?.text || 'text-[#a0a0b0]'} ${rarityColors[item.rarity]?.bg || 'bg-[#1a1a1a]'} border ${rarityColors[item.rarity]?.border || 'border-[#2a2a2a]/50'}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {item.attack > 0 && <span className="text-[8px] text-[#e94560] font-mono">⚔+{item.attack}</span>}
                      {item.defense > 0 && <span className="text-[8px] text-[#3a8ac4] font-mono">🛡+{item.defense}</span>}
                      {item.hp_bonus > 0 && <span className="text-[8px] text-[#4a8a4a] font-mono">❤️+{item.hp_bonus}</span>}
                      {item.mp_bonus > 0 && <span className="text-[8px] text-[#3a8ac4] font-mono">💧+{item.mp_bonus}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => equipItem(item.id)}
                    className="px-2.5 py-1.5 bg-[#0a1a2a] hover:bg-[#1a2a4a] text-[#3a8ac4] text-[9px] font-bold rounded-lg border border-[#1a2a4a]/50 hover:border-[#3a8ac4]/50 transition-all active:scale-95"
                  >
                    装备
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 技能类型颜色
 */
const skillTypeColors: Record<string, { text: string; border: string }> = {
  '剑诀': { text: 'text-[#e94560]', border: 'border-[#3a1a1a]/50' },
  '法术': { text: 'text-[#3a8ac4]', border: 'border-[#1a2a4a]/50' },
  '心法': { text: 'text-[#c47ac4]', border: 'border-[#2a1a3a]/50' },
}

/**
 * 技能面板 - 显示技能树与解锁/升级
 */
function SkillsPanel() {
  const skills = useGameStore((state) => state.skills)
  const cultivation = useGameStore((state) => state.cultivation)
  const unlockSkill = useGameStore((state) => state.unlockSkill)
  const upgradeSkill = useGameStore((state) => state.upgradeSkill)

  const groupedSkills = {
    '剑诀': skills.filter(s => s.type === '剑诀'),
    '法术': skills.filter(s => s.type === '法术'),
    '心法': skills.filter(s => s.type === '心法'),
  }

  /**
   * 计算按比例升级所需的修为
   */
  const getUpgradeCost = (skill: Skill): number => {
    return Math.floor(skill.levelUpCost * Math.pow(skill.level, 1.8))
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#12121f] rounded-2xl p-4 border border-[#2a2a4a]/50 shadow-lg shadow-[#0a0a1a]/50">
        <div className="flex items-center gap-1 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-[#c47ac4] to-[#e49ae4] rounded-full" />
          <p className="text-xs text-[#c47ac4] tracking-widest font-bold">技 能 树</p>
        </div>

        {(['剑诀', '法术', '心法'] as const).map((type) => (
          <div key={type} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${skillTypeColors[type]?.text || 'text-[#a0a0b0]'} bg-[#0f0f1a] border ${skillTypeColors[type]?.border || 'border-[#1a1a3a]/50'}`}>
                {type}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#1a1a3a] to-transparent" />
            </div>

            {groupedSkills[type].map((skill) => {
              // 兼容处理：确保 cultivation 是 Decimal 实例
              const cultValue = typeof cultivation?.lt === 'function' ? cultivation : new Decimal(Number(cultivation) || 0)
              const canAfford = !cultValue.lt(skill.unlockCost)
              const upgradeCost = getUpgradeCost(skill)
              const canLevelUp = !cultValue.lt(upgradeCost)
              const isMaxLevel = skill.level >= skill.maxLevel
              const typeColor = skillTypeColors[skill.type]?.text || 'text-[#a0a0b0]'

              return (
                <div
                  key={skill.id}
                  className={`p-3 bg-[#0f0f1a] rounded-xl mb-2 border transition-all ${
                    skill.unlocked
                      ? 'border-[#1a1a3a]/50 hover:border-[#c47ac4]/30'
                      : 'border-[#1a1a3a]/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        skill.unlocked
                          ? 'bg-gradient-to-br from-[#1a1a2e] to-[#0a0a1a] border-[#2a2a4a]/50'
                          : 'bg-gradient-to-br from-[#0a0a12] to-[#05050a] border-[#1a1a3a]/30'
                      }`}>
                        <span className={`text-base ${skill.unlocked ? '' : 'grayscale'}`}>{skill.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold tracking-wider ${skill.unlocked ? 'text-[#f5f0c4]' : 'text-[#a0a0b0]/50'}`}>
                            {skill.name}
                          </span>
                          {skill.unlocked && (
                            <span className="px-1.5 py-0.5 bg-[#1a1a2e] rounded text-[9px] text-[#c47ac4] font-bold border border-[#2a2a4a]/50">
                              Lv.{skill.level}/{skill.maxLevel}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] leading-relaxed ${skill.unlocked ? 'text-[#a0a0b0]/70' : 'text-[#a0a0b0]/40'}`}>
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 技能详细信息 */}
                  <div className="flex items-center gap-2 ml-[46px] flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] border ${skill.unlocked ? 'bg-[#0a0a1a] text-[#3a8ac4] border-[#1a1a3a]/50' : 'bg-[#0a0a12] text-[#a0a0b0]/30 border-[#1a1a3a]/20'}`}>
                      🔋 {skill.mpCost} MP
                    </span>
                    {skill.damage > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] border ${skill.unlocked ? 'bg-[#1a0a0a] text-[#e94560] border-[#3a1a1a]/50' : 'bg-[#0a0a12] text-[#a0a0b0]/30 border-[#1a1a3a]/20'}`}>
                        ⚔ {skill.damage * skill.level} 伤害
                      </span>
                    )}
                    {skill.healAmount > 0 && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] border ${skill.unlocked ? 'bg-[#0a1a0a] text-[#4a8a4a] border-[#1a3a1a]/50' : 'bg-[#0a0a12] text-[#a0a0b0]/30 border-[#1a1a3a]/20'}`}>
                        💚 恢复{skill.healAmount * skill.level} HP
                      </span>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 mt-2 ml-[46px]">
                    {!skill.unlocked ? (
                      <button
                        onClick={() => unlockSkill(skill.id)}
                        disabled={!canAfford}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all active:scale-95 ${
                          canAfford
                            ? 'bg-[#c47ac4]/20 text-[#c47ac4] border-[#c47ac4]/30 hover:bg-[#c47ac4]/30'
                            : 'bg-[#1a1a1a]/30 text-[#a0a0b0]/30 border-[#2a2a2a]/30 cursor-not-allowed'
                        }`}
                      >
                        🔓 解锁 ({skill.unlockCost} 修为)
                      </button>
                    ) : !isMaxLevel ? (
                      <button
                        onClick={() => upgradeSkill(skill.id)}
                        disabled={!canLevelUp}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all active:scale-95 ${
                          canLevelUp
                            ? 'bg-[#1a2a4a]/50 text-[#3a8ac4] border-[#2a4a6a]/50 hover:bg-[#2a4a6a]/50'
                            : 'bg-[#1a1a1a]/30 text-[#a0a0b0]/30 border-[#2a2a2a]/30 cursor-not-allowed'
                        }`}
                      >
                        ⬆ 升级 ({upgradeCost} 修为)
                      </button>
                    ) : (
                      <span className="px-3 py-1 text-[10px] text-[#4a8a4a] font-bold">✓ 已达最高级</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#a0a0b0]/40 text-center tracking-wider">击败敌人积累修为，解锁并升级技能</p>
    </div>
  )
}

/**
 * 任务面板 - 显示当前任务
 */
function QuestsPanel() {
  const quests = useGameStore((state) => state.quests)
  const acceptQuest = useGameStore((state) => state.acceptQuest)
  const claimQuestReward = useGameStore((state) => state.claimQuestReward)

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#12121f] rounded-2xl p-4 border border-[#2a2a4a]/50 shadow-lg shadow-[#0a0a1a]/50">
        <div className="flex items-center gap-1 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-[#ffd700] to-[#ffaa00] rounded-full" />
          <p className="text-xs text-[#ffd700] tracking-widest font-bold">当 前 任 务</p>
        </div>

        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`p-3.5 bg-[#0f0f1a] rounded-xl mb-3 border transition-all ${
              quest.completed
                ? 'border-[#4a8a4a]/50 hover:border-[#4a8a4a]/70'
                : quest.accepted
                  ? 'border-[#1a1a3a]/50 hover:border-[#ffd700]/30'
                  : 'border-[#1a1a3a]/30 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  quest.completed
                    ? 'bg-gradient-to-br from-[#0a1a0a] to-[#000a00] border-[#1a3a1a]/50'
                    : quest.accepted
                      ? 'bg-gradient-to-br from-[#2a2a0a] to-[#1a1a00] border-[#3a3a1a]/50'
                      : 'bg-gradient-to-br from-[#0a0a12] to-[#05050a] border-[#1a1a3a]/20'
                }`}>
                  <span className="text-base">{quest.icon}</span>
                </div>
                <div>
                  <span className={`text-sm font-bold tracking-wider ${quest.completed ? 'text-[#4a8a4a]' : quest.accepted ? 'text-[#ffd700]' : 'text-[#a0a0b0]/50'}`}>
                    {quest.name}
                  </span>
                  <p className={`text-[10px] leading-relaxed ${quest.accepted ? 'text-[#a0a0b0]/70' : 'text-[#a0a0b0]/40'}`}>
                    {quest.description}
                  </p>
                </div>
              </div>
              {quest.completed ? (
                <span className="px-2 py-1 bg-[#0a1a0a] rounded-lg text-[10px] text-[#4a8a4a] font-bold border border-[#1a3a1a]/50 whitespace-nowrap">✓ 完成</span>
              ) : quest.accepted ? (
                <span className="px-2 py-1 bg-[#0a1a2a] rounded-lg text-[10px] text-[#3a8ac4] font-bold border border-[#1a2a4a]/50 whitespace-nowrap">进行中</span>
              ) : (
                <span className="px-2 py-1 bg-[#1a1a1a] rounded-lg text-[10px] text-[#a0a0b0]/50 border border-[#2a2a2a]/50 whitespace-nowrap">未接取</span>
              )}
            </div>

            {/* 进度条 */}
            {quest.accepted && (
              <div className="mt-2.5 ml-[46px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-[#a0a0b0]/60">{quest.requirement.replace(/\d+/, String(quest.progress))}</span>
                  <span className="text-[10px] text-[#a0a0b0]/60 font-mono font-bold">{quest.progress}/{quest.maxProgress}</span>
                </div>
                <div className="h-2 bg-[#0a0a1a] rounded-full overflow-hidden border border-[#1a1a3a]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      quest.completed
                        ? 'bg-gradient-to-r from-[#4a8a4a] to-[#6aaa6a]'
                        : 'bg-gradient-to-r from-[#ffd700] to-[#ffaa00]'
                    }`}
                    style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="mt-2.5 ml-[46px] flex items-center gap-2">
              {!quest.accepted && !quest.completed ? (
                <button
                  onClick={() => acceptQuest(quest.id)}
                  className="px-3 py-1 bg-[#ffd700]/20 text-[#ffd700] text-[10px] font-bold rounded-lg border border-[#ffd700]/30 hover:bg-[#ffd700]/30 transition-all active:scale-95"
                >
                  📋 接取任务
                </button>
              ) : quest.completed ? (
                <button
                  onClick={() => claimQuestReward(quest.id)}
                  className="px-3 py-1 bg-[#4a8a4a]/20 text-[#4a8a4a] text-[10px] font-bold rounded-lg border border-[#4a8a4a]/30 hover:bg-[#4a8a4a]/30 transition-all active:scale-95"
                >
                  🎁 领取奖励 ({quest.reward} 🪙)
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {quests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#a0a0b0]/30 text-lg">📋</p>
            <p className="text-[10px] text-[#a0a0b0]/30 mt-2">暂无可用任务</p>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#a0a0b0]/40 text-center tracking-wider">完成更多战斗以推进任务进度</p>
    </div>
  )
}

/**
 * 标签面板容器 - 根据当前选中的 tab 显示对应内容
 */
export default function TabPanels() {
  const currentTab = useGameStore((state) => state.currentTab)

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-b from-[#0f0f1a] to-[#0a0a12]">
      {currentTab === 'system' && <SystemPanel />}
      {currentTab === 'equipment' && <EquipmentPanel />}
      {currentTab === 'skills' && <SkillsPanel />}
      {currentTab === 'quests' && <QuestsPanel />}
    </div>
  )
}
