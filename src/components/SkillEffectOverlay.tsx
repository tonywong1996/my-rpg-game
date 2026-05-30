import React from 'react'

// 导入所有技能特效图片
import skillBasicAttack from '../../assets/images/skills/skill_basic_attack.png'
import skillSweepingSword from '../../assets/images/skills/skill_sweeping_sword.png'
import skillSwordRain from '../../assets/images/skills/skill_sword_rain.png'
import skillHealSpell from '../../assets/images/skills/skill_heal_spell.png'
import skillIceSpell from '../../assets/images/skills/skill_ice_spell.png'
import skillFireSpell from '../../assets/images/skills/skill_fire_spell.png'
import skillBodyRefine from '../../assets/images/skills/skill_body_refine.png'
import skillMindCultivate from '../../assets/images/skills/skill_mind_cultivate.png'
import skillSwordMind from '../../assets/images/skills/skill_sword_mind.png'
import skillThunderSword from '../../assets/images/skills/skill_thunder_sword.png'
import skillPhoenixFire from '../../assets/images/skills/skill_phoenix_fire.png'
import skillMoonHeal from '../../assets/images/skills/skill_moon_heal.png'
import skillShadowStep from '../../assets/images/skills/skill_shadow_step.png'
import skillIceBarrier from '../../assets/images/skills/skill_ice_barrier.png'
import skillVoidSword from '../../assets/images/skills/skill_void_sword.png'

// ==========================================
// 技能类型定义
// ==========================================

/** 攻击性技能（从左飞到右） */
const ATTACK_SKILLS = new Set([
  'basic_attack', 'sweeping_sword', 'sword_rain',
  'ice_spell', 'fire_spell', 'thunder_sword',
  'phoenix_fire', 'shadow_step', 'void_sword',
])

/** 治疗/增益性技能（原地闪烁） */
const SUPPORT_SKILLS = new Set([
  'heal_spell', 'moon_heal', 'body_refine',
  'mind_cultivate', 'sword_mind', 'ice_barrier',
])

function isAttackSkill(skillId: string): boolean {
  return ATTACK_SKILLS.has(skillId)
}

// ==========================================
// 技能图片映射
// ==========================================

/**
 * 技能ID到特效图片的映射
 */
const SKILL_EFFECT_IMAGES: Record<string, string> = {
  'basic_attack': skillBasicAttack,
  'sweeping_sword': skillSweepingSword,
  'sword_rain': skillSwordRain,
  'heal_spell': skillHealSpell,
  'ice_spell': skillIceSpell,
  'fire_spell': skillFireSpell,
  'body_refine': skillBodyRefine,
  'mind_cultivate': skillMindCultivate,
  'sword_mind': skillSwordMind,
  'thunder_sword': skillThunderSword,
  'phoenix_fire': skillPhoenixFire,
  'moon_heal': skillMoonHeal,
  'shadow_step': skillShadowStep,
  'ice_barrier': skillIceBarrier,
  'void_sword': skillVoidSword,
}

// ==========================================
// 攻击技能 - 从左向右飞行动画组件
// ==========================================

/**
 * 攻击技能飞行动画
 * 从屏幕左侧（玩家侧）迅速飞至右侧（敌人侧），伴随残影和尾迹
 */
function AttackSkillFlyEffect({ skillId, show }: { skillId: string; show: boolean }) {
  if (!show) return null

  const imageSrc = SKILL_EFFECT_IMAGES[skillId]
  if (!imageSrc) return null

  // 获取技能颜色用于尾迹
  const flashColors: Record<string, string> = {
    'basic_attack': '#ff8844',
    'sweeping_sword': '#44ffaa',
    'sword_rain': '#66ffcc',
    'ice_spell': '#00ccff',
    'fire_spell': '#ff4400',
    'thunder_sword': '#ffdd00',
    'phoenix_fire': '#ff6600',
    'shadow_step': '#8800ff',
    'void_sword': '#cc00ff',
  }
  const trailColor = flashColors[skillId] || '#ffffff'

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 飞行尾迹 - 多个半透明残影 */}
      <div className="absolute inset-0" style={{ animation: 'skill-trail 0.7s ease-in-out forwards' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 120 - i * 15,
              height: 120 - i * 15,
              top: '35%',
              left: `${10 + i * 15}%`,
              background: `radial-gradient(circle, ${trailColor}88 0%, ${trailColor}44 40%, transparent 70%)`,
              filter: `blur(${8 + i * 4}px)`,
              opacity: 0.6 - i * 0.1,
              animation: `trail-fade 0.7s ease-out ${i * 0.05}s forwards`,
            }}
          />
        ))}
      </div>

      {/* 主技能图像 - 从左飞到右 */}
      <div
        className="absolute"
        style={{
          top: '30%',
          left: '-20%',
          width: '180px',
          height: '180px',
          animation: 'skill-fly-attack 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          filter: `drop-shadow(0 0 30px ${trailColor}88) drop-shadow(0 0 60px ${trailColor}44)`,
        }}
      >
        <img
          src={imageSrc}
          alt={`技能: ${skillId}`}
          className="w-full h-full object-contain"
          style={{
            animation: 'skill-fly-scale-pulse 0.7s ease-out forwards',
            imageRendering: 'auto',
          }}
        />
      </div>

      {/* 击中爆炸闪光 */}
      <div
        className="absolute"
        style={{
          top: '28%',
          left: '70%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${trailColor}ff 0%, ${trailColor}66 30%, transparent 60%)`,
          animation: 'skill-hit-burst 0.5s ease-out 0.35s forwards',
          opacity: 0,
          filter: 'blur(5px)',
        }}
      />
    </div>
  )
}

// ==========================================
// 治疗技能 - 原地闪烁动画组件
// ==========================================

/**
 * 治疗/增益技能原地闪烁效果
 */
function SupportSkillCenterEffect({ skillId, show }: { skillId: string; show: boolean }) {
  if (!show) return null

  const imageSrc = SKILL_EFFECT_IMAGES[skillId]
  if (!imageSrc) return null

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      {/* 技能特效 - 圆形裁剪显示 */}
      <div className="relative w-48 h-48 md:w-64 md:h-64" style={{ animation: 'support-bloom 0.8s ease-out forwards' }}>
        {/* 外层辉光环 */}
        <div
          className="absolute inset-0 rounded-full animate-pulse-slow"
          style={{
            background: `radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)`,
          }}
        />
        {/* 圆形裁剪容器 */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'circle(42% at center)',
            WebkitClipPath: 'circle(42% at center)',
          }}
        >
          <img
            src={imageSrc}
            alt={`技能特效: ${skillId}`}
            className="w-full h-full object-cover animate-skill-effect-fade scale-150"
            style={{
              imageRendering: 'auto',
              filter: 'brightness(1.4) contrast(1.1) saturate(1.2) drop-shadow(0 0 20px rgba(255,255,255,0.4))',
            }}
          />
        </div>
        {/* 圆形边框装饰 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.08)',
          }}
        />
      </div>
    </div>
  )
}

/**
 * 技能特效覆盖层 - 主组件
 * 根据技能类型自动选择攻击飞行 或 治疗闪烁动画
 */
export function SkillEffectImage({ skillId, show }: { skillId: string; show: boolean }) {
  if (!show) return null

  if (isAttackSkill(skillId)) {
    return <AttackSkillFlyEffect skillId={skillId} show={true} />
  }

  return <SupportSkillCenterEffect skillId={skillId} show={true} />
}

/**
 * 根据技能ID获取对应的特效图片路径
 */
export function getSkillEffectImage(skillId: string): string | undefined {
  return SKILL_EFFECT_IMAGES[skillId]
}

/**
 * 技能特效全屏闪屏效果（配合图片显示）
 */
export function SkillEffectScreenFlash({ show, skillId }: { show: boolean; skillId: string }) {
  if (!show) return null

  // 根据技能类型获取对应的闪光颜色
  const flashColors: Record<string, string> = {
    'basic_attack': 'rgba(255, 136, 68, 0.3)',
    'sweeping_sword': 'rgba(68, 255, 170, 0.25)',
    'sword_rain': 'rgba(68, 255, 170, 0.3)',
    'heal_spell': 'rgba(68, 255, 136, 0.25)',
    'ice_spell': 'rgba(0, 204, 255, 0.3)',
    'fire_spell': 'rgba(255, 68, 0, 0.3)',
    'body_refine': 'rgba(255, 170, 0, 0.2)',
    'mind_cultivate': 'rgba(170, 100, 255, 0.2)',
    'sword_mind': 'rgba(255, 215, 0, 0.25)',
    'thunder_sword': 'rgba(255, 221, 0, 0.35)',
    'phoenix_fire': 'rgba(255, 68, 0, 0.35)',
    'moon_heal': 'rgba(100, 200, 255, 0.25)',
    'shadow_step': 'rgba(100, 0, 200, 0.3)',
    'ice_barrier': 'rgba(100, 200, 255, 0.25)',
    'void_sword': 'rgba(200, 0, 255, 0.35)',
  }

  const color = flashColors[skillId] || 'rgba(255, 255, 255, 0.2)'

  return (
    <div
      className="absolute inset-0 pointer-events-none z-15"
      style={{
        background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
        animation: isAttackSkill(skillId) ?
          'skill-flash-overlay-attack 0.7s ease-out forwards' :
          'skill-flash-overlay 0.6s ease-out forwards',
      }}
    />
  )
}
