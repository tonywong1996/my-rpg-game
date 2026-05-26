import React, { useRef, useEffect } from 'react'
import { useGameStore, LogEntry } from '../store/useGameStore'

/**
 * 战斗日志/消息组件 - 游戏画面下半部分，导航栏上方
 * 显示游戏中的文字描述
 */
export default function TextLog() {
  const battleLog = useGameStore((state) => state.battleLog)
  const logEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新日志
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [battleLog.length])

  const getLogStyle = (entry: LogEntry) => {
    switch (entry.type) {
      case 'system':
        return 'text-white/40 italic'
      case 'battle':
        return 'text-white/80'
      case 'info':
        return 'text-cyan-400/80'
      case 'loot':
        return 'text-amber-400 font-medium'
      default:
        return 'text-white/60'
    }
  }

  const getLogIcon = (entry: LogEntry) => {
    switch (entry.type) {
      case 'system': return '⚙'
      case 'battle': return '⚔'
      case 'info': return 'ℹ'
      case 'loot': return '✨'
      default: return '•'
    }
  }

  const getLogBg = (entry: LogEntry) => {
    switch (entry.type) {
      case 'system':
        return 'bg-white/5'
      case 'battle':
        return 'bg-rose-500/10 border-l-2 border-rose-500/30'
      case 'info':
        return 'bg-cyan-500/10 border-l-2 border-cyan-500/30'
      case 'loot':
        return 'bg-amber-500/10 border-l-2 border-amber-500/30'
      default:
        return 'bg-white/5'
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900/50 min-h-0 backdrop-blur-xl border-t border-white/5">
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
        <span className="text-xs text-white/60 tracking-wider font-medium">战 斗 日 志</span>
        <div className="flex-1" />
        <span className="text-[10px] text-white/30">{battleLog.length} 条记录</span>
      </div>

      {/* 日志列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
        {battleLog.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-start gap-2 text-xs leading-relaxed px-3 py-1.5 rounded-xl animate-fadeIn ${getLogBg(entry)} ${getLogStyle(entry)}`}
          >
            <span className="text-sm flex-shrink-0 mt-0.5">{getLogIcon(entry)}</span>
            <span className="flex-1">{entry.text}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}
