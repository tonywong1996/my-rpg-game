import React from 'react'
import coverImage from '../../assets/images/char_modern_qipao_001.png'

/**
 * 游戏封面组件
 * 使用 char_modern_qipao_001.png 作为封面立绘
 * 
 * 气韵：现代仙侠风格女性角色封面立绘，高开叉旗袍，
 *       傲慢藐视姿势，背后悬浮神器法宝，史诗天空背景
 * 色彩：#ffffff #1a1a2e #4a3a6e #ffd700 #c8b8d8 #2a1a4e
 * 情绪：傲慢、性感、霸气、仙侠、时尚、威严
 */
export default function GameCover() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a1a2e]">
      {/* 封面背景图 - char_modern_qipao_001.png */}
      <img 
        src={coverImage}
        alt="游戏封面"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 渐暗遮罩 - 底部和两侧渐变让文字更清晰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/30 via-transparent to-[#0d2818]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/40 via-transparent to-[#1a1a2e]/40" />

      {/* 装饰性粒子层 - 模拟金色灵光粒子 */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#ffd700] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 标题区域 - 底部居中，文字优化 */}
      <div className="absolute bottom-[18%] left-0 right-0 flex flex-col items-center">
        <h1 
          className="text-4xl md:text-5xl font-bold tracking-[0.5em] text-[#ffd700] ml-4"
          style={{
            textShadow: '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3), 0 4px 16px rgba(0,0,0,0.8)',
            fontFamily: '"Noto Serif SC", "STSong", "SimSun", serif',
          }}
        >
          修真
        </h1>
        <p className="mt-4 text-sm md:text-base tracking-[0.6em] text-[#c8b8d8]/80" style={{ fontFamily: '"Noto Serif SC", "STKaiti", "KaiTi", serif' }}>
          仙魔殊途&nbsp;·&nbsp;一念成劫
        </p>
      </div>
    </div>
  )
}
