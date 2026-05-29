import React from 'react'
import coverImage from '../assets/images/modern_cultivation_cover.jpg'

/**
 * 游戏封面组件
 * 使用 modern_cultivation_cover.jpg 作为封面（碧蓝航线风格，现代化修仙）
 * object-contain 确保图片完整显示不变形
 */
export default function GameCover() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0d0d1a]">
      {/* 封面背景图 - modern_cultivation_cover.jpg */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={coverImage}
          alt="游戏封面"
          className="w-full h-full object-contain"
        />
      </div>

      {/* 渐暗遮罩 - 底部渐变让文字按钮更清晰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a]/60 via-transparent to-[#0d0d1a]/60" />

      {/* 装饰性粒子层 - 紫色灵光粒子 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
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
    </div>
  )
}
