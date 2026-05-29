import React from 'react'
import coverImage from '../assets/images/cover_bedroom.jpg'

/**
 * 游戏封面组件
 * 使用 cover_bedroom.jpg 作为封面（碧蓝航线风格，猫耳耳机床上休闲）
 * object-cover 全屏填充，适配竖屏
 */
export default function GameCover() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1a1a2e]">
      {/* 封面背景图 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={coverImage}
          alt="游戏封面"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 渐暗遮罩 - 让文字按钮更清晰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a]/40 via-transparent to-[#0d0d1a]/40" />

      {/* 装饰性粒子层 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-pink-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              animation: `pulse ${3 + Math.random() * 4}s infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
