import React, { useEffect, useState } from 'react'
import { useGameStore, BattleUnit } from '../store/useGameStore'
import azurlaneSwordImage from '../../assets/images/char_azurlane_sword_001.png'
import askzyuSwordImage from '../../assets/images/char_askzyu_sword_001.png'
import { SkillEffectImage, SkillEffectScreenFlash } from './SkillEffectOverlay'

/**
 * 获取角色立绘路径
 */
function getCharacterImage(unit: BattleUnit): string {
  if (unit.isEnemy) return ''
  if (unit.characterId === 'azurlane_sword') return azurlaneSwordImage
  if (unit.characterId === 'askzyu_sword') return askzyuSwordImage
  return azurlaneSwordImage
}

// ============================
// 技能特效系统
// ============================

/** 特效类型 */
type EffectType = 'fire' | 'ice' | 'thunder' | 'wind' | 'heal' | 'sword' | 'shadow' | 'void' | 'shield'

/** 根据技能ID获取特效类型 */
function getEffectType(skillId: string): EffectType {
  switch (skillId) {
    case 'basic_attack': return 'sword'
    case 'sweeping_sword': return 'wind'
    case 'sword_rain': return 'wind'
    case 'heal_spell': return 'heal'
    case 'ice_spell': return 'ice'
    case 'ice_barrier': return 'shield'
    case 'fire_spell': return 'fire'
    case 'thunder_sword': return 'thunder'
    case 'phoenix_fire': return 'fire'
    case 'moon_heal': return 'heal'
    case 'shadow_step': return 'shadow'
    case 'void_sword': return 'void'
    default: return 'sword'
  }
}

/** 根据特效类型获取颜色 */
function getEffectColor(effect: EffectType): string {
  switch (effect) {
    case 'fire': return '#ff4400, #ff8800, #ffcc00'
    case 'ice': return '#00ccff, #44aaff, #88ddff'
    case 'thunder': return '#ffdd00, #aaff00, #ffffff'
    case 'wind': return '#44ffaa, #88ffcc, #ccffee'
    case 'heal': return '#44ff88, #88ffaa, #ccffdd'
    case 'sword': return '#ff8844, #ffaa66, #ffcc88'
    case 'shadow': return '#4400aa, #6600cc, #8800ff'
    case 'void': return '#ff00ff, #8800ff, #4400cc'
    case 'shield': return '#88ccff, #aaddff, #cceeff'
    default: return '#ffffff, #aaaaaa, #666666'
  }
}

/**
 * 技能特效粒子动画
 */
function SkillEffectParticles({ effect, show }: { effect: EffectType; show: boolean }) {
  if (!show) return null

  const colors = getEffectColor(effect).split(', ')
  const particleCount = 20

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 主闪光 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-0"
        style={{
          background: `radial-gradient(circle, ${colors[0]}, ${colors[1]}, transparent)`,
          filter: 'blur(10px)',
          animation: `skill-flash 0.6s ease-out forwards`,
        }}
      />

      {/* 粒子群 */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * 360
        const distance = 60 + Math.random() * 100
        const size = 4 + Math.random() * 8
        return (
          <div
            key={i}
            className="absolute rounded-full opacity-0"
            style={{
              width: size,
              height: size,
              top: '50%',
              left: '50%',
              background: colors[i % colors.length],
              boxShadow: `0 0 ${size * 2}px ${colors[i % colors.length]}`,
              animation: `skill-particle 0.8s ease-out forwards`,
              animationDelay: `${Math.random() * 0.2}s`,
              '--angle': `${angle}deg`,
              '--distance': `${distance}px`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}

/**
 * 技能特效 - 屏幕边缘发光
 */
function SkillEffectBorder({ effect, show }: { effect: EffectType; show: boolean }) {
  if (!show) return null

  const colors = getEffectColor(effect).split(', ')

  return (
    <div
      className="absolute inset-0 pointer-events-none z-15 opacity-0"
      style={{
        animation: `skill-border 0.8s ease-out forwards`,
        boxShadow: `inset 0 0 60px ${colors[0]}, inset 0 0 120px ${colors[1]}`,
      }}
    />
  )
}

/**
 * 漂浮伤害数字
 */
function FloatingDamage({ damage, isHeal, show, targetSide }: { damage: number; isHeal: boolean; show: boolean; targetSide: 'player' | 'enemy' }) {
  if (!show) return null

  return (
    <div
      className={`absolute top-1/3 pointer-events-none z-30 font-bold text-2xl
                   ${isHeal ? 'text-[#44ff88]' : 'text-[#ff4444]'}
                   animate-float-up`}
      style={{ left: targetSide === 'enemy' ? '70%' : '30%' }}
    >
      {isHeal ? `+${damage}` : `-${damage}`}
    </div>
  )
}

/**
 * 攻击闪动效果
 */
function AttackFlash({ show, isPlayer }: { show: boolean; isPlayer: boolean }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div
        className="w-full h-full opacity-0"
        style={{
          animation: `flash-${isPlayer ? 'player' : 'enemy'} 0.3s ease-out forwards`,
        }}
      />
    </div>
  )
}

// ============================
// 角色绘制组件
// ============================

/**
 * 获取角色显示名称（AI故事角色用nameOverride，野外怪物用name）
 */
function getDisplayName(unit: BattleUnit): string {
  return unit.nameOverride || unit.name
}

/**
 * 单个战斗单位的角色绘制
 */
function BattleCharacter({ unit, isPlayer, isHit }: { unit: BattleUnit; isPlayer: boolean; isHit: boolean }) {
  const hpPercent = (unit.hp / unit.maxHp) * 100
  const mpPercent = (unit.mp / unit.maxMp) * 100
  const charImage = getCharacterImage(unit)

  return (
    <div className={`flex flex-col items-center ${isHit ? 'hit-white-flash' : ''}`}>
      {/* 敌人被击中时额外抖动 */}
      {!isPlayer && isHit && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ animation: 'hit-shake 0.5s ease-out forwards' }}
        >
          <div className="absolute inset-0 bg-white/30 rounded-full"
            style={{ animation: 'hit-white-flash 0.5s ease-out forwards' }} />
        </div>
      )}

      {/* 角色名称标签 */}
      <div className="whitespace-nowrap mb-1">
        <span className="text-xs font-bold tracking-wider text-[#f5f0c4] drop-shadow-lg">
          {getDisplayName(unit)}
        </span>
        <span className="text-[10px] text-[#a0a0b0] ml-1">Lv.{unit.level}</span>
      </div>

      {/* 角色形象 */}
      <div>
        {isPlayer && charImage ? (
          // 玩家角色立绘
          <div className="w-36 h-36 md:w-44 md:h-44 animate-battle-idle-player">
            <img
              src={charImage}
              alt={unit.name}
              className="w-full h-full object-cover rounded-xl shadow-lg shadow-[#3a8ac4]/20"
              style={{ imageRendering: 'auto', transform: 'scaleX(-1)' }}
            />
          </div>
        ) : (
          // 像素SVG角色（玩家后备 + 敌人）
          <div
            className={`w-28 h-28 md:w-36 md:h-36 animate-battle-idle-${isPlayer ? 'player' : 'enemy'}`}
            style={{ imageRendering: 'pixelated' }}
          >
            <svg viewBox="0 0 64 64" className="w-full h-full">
              {isPlayer ? (
                // 玩家角色（SVG后备方案）
                <>
                  <rect x="14" y="20" width="36" height="34" rx="3" fill="#5a6b6b" />
                  <rect x="18" y="12" width="28" height="22" fill="#c4a882" rx="3" />
                  <rect x="14" y="2" width="36" height="12" fill="#2a3a3a" rx="3" />
                  <rect x="20" y="1" width="3" height="14" fill="#8a7a66" />
                  <rect x="41" y="1" width="3" height="14" fill="#8a7a66" />
                  <rect x="22" y="20" width="6" height="4" fill="#fff" />
                  <rect x="36" y="20" width="6" height="4" fill="#fff" />
                  <rect x="24" y="21" width="3" height="2" fill="#1a2a2a" />
                  <rect x="37" y="21" width="3" height="2" fill="#1a2a2a" />
                  <rect x="26" y="28" width="12" height="2" fill="#3a2a2a" />
                  <rect x="18" y="34" width="28" height="3" fill="#6a7b7b" />
                </>
              ) : (
                // 敌人角色
                <>
                  {unit.name === '山魈' && (
                    <>
                      <rect x="10" y="8" width="44" height="46" fill="#4a6b3a" rx="4" />
                      <rect x="16" y="14" width="32" height="24" fill="#5a7b4a" rx="3" />
                      <rect x="20" y="20" width="6" height="5" fill="#ff0000" />
                      <rect x="38" y="20" width="6" height="5" fill="#ff0000" />
                      <rect x="22" y="21" width="2" height="3" fill="#ff4444" />
                      <rect x="40" y="21" width="2" height="3" fill="#ff4444" />
                      <rect x="22" y="30" width="20" height="6" fill="#2a0a0a" />
                      <rect x="22" y="30" width="20" height="2" fill="#8a0a0a" />
                      <rect x="22" y="30" width="3" height="4" fill="#fff" />
                      <rect x="39" y="30" width="3" height="4" fill="#fff" />
                      <rect x="8" y="12" width="6" height="4" fill="#3a5a2a" />
                      <rect x="50" y="12" width="6" height="4" fill="#3a5a2a" />
                      <rect x="14" y="6" width="36" height="4" fill="#3a5a2a" />
                    </>
                  )}
                  {unit.name === '野狼' && (
                    <>
                      <rect x="8" y="16" width="48" height="32" fill="#6b6b5a" rx="6" />
                      <rect x="12" y="20" width="40" height="22" fill="#7a7a6a" rx="4" />
                      <rect x="16" y="24" width="6" height="4" fill="#ffff00" />
                      <rect x="42" y="24" width="6" height="4" fill="#ffff00" />
                      <rect x="18" y="25" width="2" height="2" fill="#1a1a0a" />
                      <rect x="44" y="25" width="2" height="2" fill="#1a1a0a" />
                      <rect x="24" y="32" width="16" height="4" fill="#3a3a2a" />
                      <rect x="12" y="8" width="8" height="10" fill="#5a5a4a" />
                      <rect x="44" y="8" width="8" height="10" fill="#5a5a4a" />
                      <rect x="0" y="30" width="8" height="4" fill="#5a5a4a" />
                    </>
                  )}
                  {unit.name === '毒蛇' && (
                    <>
                      <rect x="4" y="24" width="56" height="16" fill="#4a6b3a" rx="8" />
                      <rect x="6" y="26" width="52" height="12" fill="#5a7b4a" rx="6" />
                      <rect x="16" y="26" width="4" height="6" fill="#00ff00" />
                      <rect x="44" y="26" width="4" height="6" fill="#00ff00" />
                      <rect x="17" y="28" width="2" height="2" fill="#0a1a0a" />
                      <rect x="45" y="28" width="2" height="2" fill="#0a1a0a" />
                      <rect x="54" y="30" width="6" height="2" fill="#ff0000" />
                      <rect x="56" y="28" width="2" height="6" fill="#ff0000" />
                      <rect x="22" y="28" width="4" height="4" fill="#4a6b3a" />
                      <rect x="30" y="28" width="4" height="4" fill="#4a6b3a" />
                      <rect x="38" y="28" width="4" height="4" fill="#4a6b3a" />
                    </>
                  )}
                  {unit.name === '盗匪' && (
                    <>
                      <rect x="12" y="8" width="40" height="44" fill="#3a2a1a" rx="3" />
                      <rect x="14" y="14" width="36" height="24" fill="#4a3a2a" rx="3" />
                      <rect x="20" y="20" width="6" height="4" fill="#fff" />
                      <rect x="38" y="20" width="6" height="4" fill="#fff" />
                      <rect x="22" y="21" width="3" height="2" fill="#0a0a0a" />
                      <rect x="39" y="21" width="3" height="2" fill="#0a0a0a" />
                      <rect x="14" y="10" width="36" height="6" fill="#6b2d2d" rx="2" />
                      <rect x="14" y="8" width="36" height="3" fill="#8a3d3d" />
                      <rect x="18" y="26" width="6" height="1" fill="#6b4a3a" />
                      <rect x="46" y="30" width="6" height="18" fill="#6b6b6b" />
                      <rect x="48" y="28" width="2" height="4" fill="#8a8a8a" />
                    </>
                  )}

                  {/* 新增怪物：妖兽 */}
                  {unit.name === '妖兽' && (
                    <>
                      <rect x="8" y="4" width="48" height="48" fill="#3a1a2a" rx="6" />
                      <rect x="12" y="10" width="40" height="30" fill="#4a2a3a" rx="4" />
                      <rect x="16" y="16" width="8" height="6" fill="#ff4400" />
                      <rect x="40" y="16" width="8" height="6" fill="#ff4400" />
                      <rect x="18" y="17" width="4" height="4" fill="#ff8800" />
                      <rect x="42" y="17" width="4" height="4" fill="#ff8800" />
                      <rect x="18" y="28" width="28" height="8" fill="#2a0a1a" />
                      <rect x="18" y="28" width="28" height="2" fill="#8a0a2a" />
                      <rect x="6" y="8" width="4" height="20" fill="#2a1a1a" />
                      <rect x="54" y="8" width="4" height="20" fill="#2a1a1a" />
                      <rect x="24" y="40" width="4" height="10" fill="#2a1a1a" />
                      <rect x="36" y="40" width="4" height="10" fill="#2a1a1a" />
                    </>
                  )}

                  {/* 新增怪物：心魔 */}
                  {unit.name === '心魔' && (
                    <>
                      <rect x="6" y="8" width="52" height="48" fill="#1a0a2a" rx="8" />
                      <rect x="10" y="14" width="44" height="30" fill="#2a1a3a" rx="6" />
                      <rect x="16" y="20" width="10" height="8" fill="#8800ff" />
                      <rect x="38" y="20" width="10" height="8" fill="#8800ff" />
                      <rect x="18" y="22" width="6" height="4" fill="#ff00ff" />
                      <rect x="40" y="22" width="6" height="4" fill="#ff00ff" />
                      <rect x="20" y="34" width="24" height="6" fill="#3a1a4a" />
                      <rect x="28" y="34" width="8" height="2" fill="#ff00ff" />
                      <rect x="2" y="16" width="6" height="24" fill="#1a0a2a" rx="2" />
                      <rect x="56" y="16" width="6" height="24" fill="#1a0a2a" rx="2" />
                      <rect x="26" y="46" width="4" height="8" fill="#1a0a2a" />
                      <rect x="34" y="46" width="4" height="8" fill="#1a0a2a" />
                      <rect x="14" y="2" width="36" height="8" fill="#2a1a3a" rx="4" />
                    </>
                  )}

                  {/* 通用敌人（未匹配到的） */}
                  {!['山魈', '野狼', '毒蛇', '盗匪', '妖兽', '心魔'].includes(unit.name) && (
                    <>
                      <rect x="10" y="10" width="44" height="44" fill="#3a2a3a" rx="5" />
                      <rect x="16" y="16" width="32" height="24" fill="#4a3a4a" rx="4" />
                      <rect x="20" y="22" width="6" height="4" fill="#ff6666" />
                      <rect x="38" y="22" width="6" height="4" fill="#ff6666" />
                      <rect x="22" y="23" width="3" height="2" fill="#1a0a0a" />
                      <rect x="39" y="23" width="3" height="2" fill="#1a0a0a" />
                      <rect x="22" y="34" width="20" height="4" fill="#4a3a3a" />
                    </>
                  )}
                </>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* HP 和 MP 条 - 统一在角色下方 */}
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#e94560] font-bold w-5">HP</span>
          <div className="w-24 h-3 bg-[#1a0a0a] rounded-full overflow-hidden border border-[#3a1a1a]">
            <div
              className="h-full bg-gradient-to-r from-[#e94560] to-[#ff6b6b] transition-all duration-300 rounded-full"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-[#e94560] font-mono">{unit.hp}/{unit.maxHp}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#3a8ac4] font-bold w-5">MP</span>
          <div className="w-24 h-3 bg-[#0a0a1a] rounded-full overflow-hidden border border-[#1a1a3a]">
            <div
              className="h-full bg-gradient-to-r from-[#3a8ac4] to-[#5ab8ff] transition-all duration-300 rounded-full"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-[#3a8ac4] font-mono">{unit.mp}/{unit.maxMp}</span>
        </div>
      </div>

      {/* 玩家技能图标 - 在角色下方显示已解锁的技能 */}
      {isPlayer && <SkillIcons />}
    </div>
  )
}

/**
 * 技能图标组件 - 在角色下方显示已解锁的技能图标
 * 第一行：攻击技能，第二行：buff/技能
 */
function SkillIcons() {
  const skills = useGameStore((state) => state.skills)
  const useSkill = useGameStore((state) => state.useSkill)
  const playerUnit = useGameStore((state) => state.playerUnit)

  const unlockedSkills = skills.filter(s => s.unlocked && s.id !== 'basic_attack')

  // 分离攻击技能和 buff 技能
  const attackSkills = unlockedSkills.filter(s => !isSupportSkill(s.id))
  const buffSkills = unlockedSkills.filter(s => isSupportSkill(s.id))

  if (unlockedSkills.length === 0) return null

  const canUseSkill = (skill: typeof unlockedSkills[0]) => {
    return playerUnit.mp >= skill.mpCost && playerUnit.hp > 0
  }

  const renderButton = (skill: typeof unlockedSkills[0]) => (
    <button
      key={skill.id}
      onClick={() => useSkill(skill.id)}
      disabled={!canUseSkill(skill)}
      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs border transition-all
                 ${canUseSkill(skill)
                   ? 'bg-[#1a0a2e]/80 text-[#c47ac4] border-[#3a1a4a]/60 hover:bg-[#2a1a3e] hover:border-[#c47ac4]/50 cursor-pointer active:scale-90'
                   : 'bg-[#0a0a12]/50 text-[#a0a0b0]/30 border-[#1a1a3a]/30 cursor-not-allowed'
                 }`}
      title={`${skill.name} (Lv.${skill.level} | MP: ${skill.mpCost})`}
    >
      {skill.icon}
    </button>
  )

  return (
    <div className="mt-2 flex flex-col items-center gap-1">
      {/* 第一行：攻击技能 */}
      {attackSkills.length > 0 && (
        <div className="flex items-center gap-1.5">
          {attackSkills.map(renderButton)}
        </div>
      )}
      {/* 第二行：buff 技能 */}
      {buffSkills.length > 0 && (
        <div className="flex items-center gap-1.5">
          {buffSkills.map(renderButton)}
        </div>
      )}
    </div>
  )
}

/** 日志文本到技能ID的全局映射 */
const SKILL_NAME_TO_ID: Record<string, string> = {
  '基础剑诀': 'basic_attack',
  '横扫千军': 'sweeping_sword',
  '万剑归宗': 'sword_rain',
  '回春术': 'heal_spell',
  '寒冰诀': 'ice_spell',
  '烈火咒': 'fire_spell',
  '炼体诀': 'body_refine',
  '凝神诀': 'mind_cultivate',
  '剑心诀': 'sword_mind',
  '雷影剑诀': 'thunder_sword',
  '凤凰火': 'phoenix_fire',
  '月华术': 'moon_heal',
  '影步': 'shadow_step',
  '寒冰障': 'ice_barrier',
  '虚空斩': 'void_sword',
}

/** 判断技能是否是治疗/增益/护盾类（作用在己方） */
function isSupportSkill(skillId: string): boolean {
  const supportIds = ['heal_spell', 'moon_heal', 'body_refine', 'mind_cultivate', 'ice_barrier', 'sword_mind']
  return supportIds.includes(skillId)
}

// ============================
// 战斗场景主组件
// ============================

/**
 * 战斗场景组件 - 游戏画面上半部分
 * 显示敌我双方角色，带 HP/MP 条和动态技能特效
 */
export default function BattleScene() {
  const { playerUnit, enemyUnit } = useGameStore()
  const [attacking, setAttacking] = useState<'player' | 'enemy' | null>(null)
  const [showEffect, setShowEffect] = useState<EffectType | null>(null)
  const [showSkillImage, setShowSkillImage] = useState<string | null>(null)
  const [showDamage, setShowDamage] = useState<{ damage: number; isHeal: boolean; targetSide: 'player' | 'enemy' } | null>(null)
  const [hitTarget, setHitTarget] = useState<'enemy' | 'player' | null>(null)

  // 监听 useSkill 触发的自定义事件（直接从 store 中的 useSkill 函数 dispatch）
  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent
      const { skillId } = event.detail || {}
      if (!skillId) return

      // 从 SKILL_NAME_TO_ID 反向查找或者直接使用 skillId
      const normalizedSkillId = skillId
      const isSupport = isSupportSkill(normalizedSkillId)

      // 玩家攻击动画 - 攻击技能晃动玩家侧，治疗技能则不动
      if (!isSupport) {
        setAttacking('player')
        setTimeout(() => setAttacking(null), 800)

        // 敌人被击中 - 在技能飞到中途（约350ms后）触发抖动和闪白
        setTimeout(() => {
          setHitTarget('enemy')
          setTimeout(() => setHitTarget(null), 500)
        }, 350)
      }

      // CSS 粒子特效（攻/辅都能看到）
      setShowEffect(getEffectType(normalizedSkillId))
      // 技能图片特效
      setShowSkillImage(normalizedSkillId)
      setTimeout(() => {
        setShowEffect(null)
        setShowSkillImage(null)
      }, 800)

      // 尝试从日志匹配伤害/治疗数字（日志可能还未更新，所以用 setTimeout）
      setTimeout(() => {
        const state = useGameStore.getState()
        const lastLog = state.battleLog[state.battleLog.length - 1]
        if (!lastLog) return
        const text = lastLog.text

        if (text.includes('恢复')) {
          const healMatch = text.match(/恢复\s*(\d+)\s*HP/)
          setShowDamage({
            damage: healMatch ? parseInt(healMatch[1]) : 0,
            isHeal: true,
            targetSide: 'player', // 治疗作用在己方
          })
          setTimeout(() => setShowDamage(null), 1000)
        } else if (text.includes('造成')) {
          const damageMatch = text.match(/造成\s*(\d+)\s*点/)
          setShowDamage({
            damage: damageMatch ? parseInt(damageMatch[1]) : 0,
            isHeal: false,
            targetSide: 'enemy', // 伤害作用在敌方
          })
          setTimeout(() => setShowDamage(null), 1000)
        }
      }, 50)
    }

    window.addEventListener('rpg-skill-effect', handler)
    return () => window.removeEventListener('rpg-skill-effect', handler)
  }, [])

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#0a0a1a] via-[#0d2818] to-[#1a0a2e] overflow-hidden">
      {/* 地面 */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1a2a1a] to-transparent" />

      {/* 装饰粒子 */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-[#f5f0c4] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 技能特效 - CSS 粒子 */}
      {showEffect && (
        <>
          <SkillEffectParticles effect={showEffect} show={true} />
          <SkillEffectBorder effect={showEffect} show={true} />
        </>
      )}

      {/* 技能特效 - 图片（基于生成的精灵图） */}
      {showSkillImage && (
        <>
          {/* 技能图片特效 */}
          <SkillEffectImage skillId={showSkillImage} show={true} />
          {/* 全屏闪光 */}
          <SkillEffectScreenFlash skillId={showSkillImage} show={true} />
        </>
      )}

      {/* 漂浮伤害数字 - 根据技能类型定位到玩家或敌人侧 */}
      {showDamage && (
        <FloatingDamage
          damage={showDamage.damage}
          isHeal={showDamage.isHeal}
          show={true}
          targetSide={showDamage.targetSide}
        />
      )}

      {/* 攻击闪动效果 */}
      {attacking === 'enemy' && <AttackFlash show={true} isPlayer={true} />}
      {attacking === 'player' && <AttackFlash show={true} isPlayer={false} />}

      {/* 敌我布局 */}
      <div className="relative z-10 flex items-center justify-around h-full px-4 pt-4 pb-8">
        {/* 玩家 - 左侧 */}
        <div className={`transition-transform duration-200 ${attacking === 'player' ? 'translate-x-4' : ''}`}>
          <BattleCharacter unit={playerUnit} isPlayer={true} isHit={hitTarget === 'player'} />
        </div>

        {/* VS 标识 */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e94560] to-[#6b2d8c]
                         flex items-center justify-center shadow-lg shadow-[#e94560]/30
                         animate-pulse-slow">
            <span className="text-[10px] font-bold text-white tracking-widest">VS</span>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-[#e94560]/50 to-transparent" />
        </div>

        {/* 敌人 - 右侧 */}
        <div className={`transition-transform duration-200 ${attacking === 'enemy' ? '-translate-x-4' : ''}`}>
          <BattleCharacter unit={enemyUnit} isPlayer={false} isHit={hitTarget === 'enemy'} />
        </div>
      </div>

      {/* 顶部渐变遮罩 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a0a1a] to-transparent pointer-events-none" />
    </div>
  )
}
