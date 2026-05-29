import React from 'react'
import { useGameStore } from '../store/useGameStore'

/**
 * 改装车间面板 - 武器改装/升级
 */
export default function SmithyPanel() {
  const gold = useGameStore((state) => state.gold)
  const forgeWeapon = useGameStore((state) => state.forgeWeapon)
  const setVillageLocation = useGameStore((state) => state.setVillageLocation)

  const forgeOptions = [
    { name: '气流稳定器 Mk.I', icon: '🌀', desc: '射击精度 +25%', cost: 300, slot: 0 },
    { name: '压缩气罐升级', icon: '💨', desc: '风能储存 +45%', cost: 500, slot: 1 },
    { name: '螺旋弹道系统', icon: '⚡', desc: '子弹穿透力 +80%', cost: 800, slot: 2 },
  ]

  const handleForge = (slot: number) => {
    forgeWeapon(slot)
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[92%] max-w-lg bg-gradient-to-b from-[#0a1a2a] to-[#050a12] rounded-2xl border border-[#3ac8fa]/30 shadow-2xl shadow-[#3ac8fa]/10 overflow-hidden animate-scale-in">
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3ac8fa] via-[#5ac8fa] to-[#8ad8ff]" />
        
        {/* 标题 */}
        <div className="px-5 pt-6 pb-4 text-center border-b border-[#1a3a5a]/50">
          <div className="text-4xl mb-2">🔩</div>
          <h2 className="text-lg font-bold text-[#5ac8fa] tracking-widest">改 装 车 间</h2>
          <p className="text-[11px] text-[#a0a0b0]/50 mt-1 tracking-wider">升级装备 · 优化风能效率</p>
        </div>

        <div className="mx-4 mt-3 mb-2 px-4 py-2 bg-[#0a0f1a]/80 rounded-lg border border-[#1a2a3a]/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#a0a0b0]/60">当前余额</span>
            <span className="text-sm text-[#ffd700] font-bold">🪙 {gold}</span>
          </div>
        </div>

        {/* 装备列表 */}
        <div className="p-4 space-y-2.5 max-h-[45vh] overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-[#a0a0b0]/40 tracking-widest text-center mb-3">—— 可改装项目 ——</p>
          
          {forgeOptions.map((option) => {
            const canAfford = gold >= option.cost
            return (
              <div
                key={option.slot}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200
                  ${canAfford
                    ? 'bg-[#0a1525] border-[#1a3a5a] hover:border-[#5ac8fa]/50 hover:bg-[#0f1f35]'
                    : 'bg-[#0a0f1a]/50 border-[#1a2a3a]/50 opacity-50'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg
                    ${canAfford ? 'bg-[#0a2035]' : 'bg-[#0a0f1a]'}`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${canAfford ? 'text-[#f5f0c4]' : 'text-[#a0a0b0]/50'}`}>
                      {option.name}
                    </p>
                    <p className={`text-[10px] ${canAfford ? 'text-[#5ac8fa]' : 'text-[#a0a0b0]/30'}`}>
                      {option.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => canAfford && handleForge(option.slot)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-all duration-200
                    ${canAfford
                      ? 'bg-gradient-to-r from-[#5ac8fa] to-[#3a8ac4] text-white hover:from-[#7ad8ff] hover:to-[#5ac8fa] active:scale-95 shadow-lg shadow-[#5ac8fa]/30'
                      : 'bg-[#0a0f1a] text-[#a0a0b0]/30 cursor-not-allowed'
                    }`}
                >
                  {canAfford ? `🪙 ${option.cost} 升级` : '余额不足'}
                </button>
              </div>
            )
          })}
        </div>

        {/* 关闭按钮 */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setVillageLocation('center')}
            className="w-full py-2.5 text-xs text-[#a0a0b0] bg-[#0a1a2a] rounded-lg
                       hover:bg-[#0f2035] hover:text-[#f5f0c4] active:scale-[0.98] transition-all duration-200"
          >
            离开改装车间
          </button>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] text-[#a0a0b0]/20 tracking-wider">俱乐部 · 改装车间</span>
            <span className="text-[9px] text-[#a0a0b0]/20">用知识改造你的装备</span>
          </div>
        </div>
      </div>
    </div>
  )
}
