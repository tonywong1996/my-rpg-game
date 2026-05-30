import React from 'react'
import { useGameStore, NavTab } from '../store/useGameStore'

interface NavItem {
  id: NavTab
  label: string
  icon: string
  color: string
}

const navItems: NavItem[] = [
  { id: 'system', label: '系统', icon: '⚙', color: 'from-cyan-400 to-blue-500' },
  { id: 'equipment', label: '装备', icon: '🗡', color: 'from-orange-400 to-amber-500' },
  { id: 'skills', label: '技能', icon: '⚡', color: 'from-purple-400 to-pink-500' },
  { id: 'quests', label: '任务', icon: '📜', color: 'from-yellow-400 to-orange-500' },
]

/**
 * 导航栏组件 - 底部导航
 * 系统、装备、技能、任务
 */
export default function NavigationBar() {
  const currentTab = useGameStore((state) => state.currentTab)
  const setTab = useGameStore((state) => state.setTab)

  return (
    <nav className="relative flex items-center justify-around bg-[#0a0a1a]/90 backdrop-blur-xl border-t border-white/5 px-2 py-2">
      {/* 顶部发光线条 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {navItems.map((item) => {
        const isActive = currentTab === item.id
        const activeColor = item.color

        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`
              relative flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl
              transition-all duration-300 group
              ${isActive
                ? 'scale-105'
                : 'text-white/40 hover:text-white/70 hover:scale-102'
              }
            `}
          >
            {/* 背景光晕 - 激活时显示 */}
            {isActive && (
              <div className={`absolute inset-0 bg-gradient-to-br ${activeColor} opacity-15 rounded-2xl blur-xl`} />
            )}

            {/* 玻璃拟态背景 */}
            <div className={`
              absolute inset-0 rounded-2xl transition-all duration-300
              ${isActive
                ? 'bg-white/10 border border-white/20 shadow-lg shadow-black/20'
                : 'bg-white/5 border border-white/5 hover:bg-white/10'
              }
            `} />

            {/* 图标容器 */}
            <div className={`
              relative w-10 h-10 rounded-xl flex items-center justify-center
              transition-all duration-300
              ${isActive
                ? `bg-gradient-to-br ${activeColor} shadow-lg shadow-${item.color.split('-')[1]}-500/30`
                : 'bg-white/5'
              }
            `}>
              <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-125 drop-shadow-lg' : ''}`}>
                {item.icon}
              </span>
            </div>

            {/* 标签 */}
            <span className={`
              relative text-[11px] tracking-wider font-medium transition-all duration-300
              ${isActive
                ? 'text-white font-semibold drop-shadow-md'
                : 'text-white/50'
              }
            `}>
              {item.label}
            </span>

            {/* 底部指示器 */}
            {isActive && (
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${activeColor} rounded-full shadow-lg shadow-white/50`} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
