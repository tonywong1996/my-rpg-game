import React from 'react'
import { useGameStore } from '../store/useGameStore'

/**
 * 装备铺面板 - 打造/强化装备
 */
export default function SmithyPanel() {
  const gold = useGameStore((state) => state.gold)
  const forgeWeapon = useGameStore((state) => state.forgeWeapon)
  const setVillageLocation = useGameStore((state) => state.setVillageLocation)

  const forgeOptions = [
    { name: '精铁长剑', icon: '🗡️', desc: '攻击 +25', cost: 300, slot: 0 },
    { name: '玄铁重剑', icon: '⚔️', desc: '攻击 +45', cost: 500, slot: 1 },
    { name: '寒冰剑', icon: '❄️', desc: '攻击 +80', cost: 800, slot: 2 },
  ]

  const handleForge = (slot: number) => {
    forgeWeapon(slot)
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[92%] max-w-lg bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-2xl border border-[#ff8c00]/30 shadow-2xl shadow-[#ff8c00]/10 overflow-hidden animate-scale-in">
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff4500] via-[#ff8c00] to-[#ffd700]" />
        
        {/* 标题 */}
        <div className="px-5 pt-6 pb-4 text-center border-b border-[#3a2a1a]/50">
          <div className="text-4xl mb-2">🔨</div>
          <h2 className="text-lg font-bold text-[#ff8c00] tracking-widest">铁 匠 铺</h2>
          <p className="text-[11px] text-[#a0a0b0]/50 mt-1 tracking-wider">锻造神兵利器</p>
        </div>

        <div className="mx-4 mt-3 mb-2 px-4 py-2 bg-[#0f0f1a]/80 rounded-lg border border-[#2a2a1a]/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#a0a0b0]/60">当前金币</span>
            <span className="text-sm text-[#ffd700] font-bold">🪙 {gold}</span>
          </div>
        </div>

        {/* 装备列表 */}
        <div className="p-4 space-y-2.5 max-h-[45vh] overflow-y-auto custom-scrollbar">
          <p className="text-[10px] text-[#a0a0b0]/40 tracking-widest text-center mb-3">—— 可锻造装备 ——</p>
          
          {forgeOptions.map((option) => {
            const canAfford = gold >= option.cost
            return (
              <div
                key={option.slot}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200
                  ${canAfford
                    ? 'bg-[#0f0f1a] border-[#2a2a4a] hover:border-[#ff8c00]/50 hover:bg-[#1a1a2e]'
                    : 'bg-[#0f0f1a]/50 border-[#1a1a3a]/50 opacity-50'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg
                    ${canAfford ? 'bg-[#2a1a0a]' : 'bg-[#1a1a1a]'}`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${canAfford ? 'text-[#f5f0c4]' : 'text-[#a0a0b0]/50'}`}>
                      {option.name}
                    </p>
                    <p className={`text-[10px] ${canAfford ? 'text-[#e94560]' : 'text-[#a0a0b0]/30'}`}>
                      {option.desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => canAfford && handleForge(option.slot)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-all duration-200
                    ${canAfford
                      ? 'bg-gradient-to-r from-[#ff8c00] to-[#ff6600] text-white hover:from-[#ffa033] hover:to-[#ff7711] active:scale-95 shadow-lg shadow-[#ff8c00]/30'
                      : 'bg-[#1a1a1a] text-[#a0a0b0]/30 cursor-not-allowed'
                    }`}
                >
                  {canAfford ? `🪙 ${option.cost} 打造` : '金币不足'}
                </button>
              </div>
            )
          })}
        </div>

        {/* 关闭按钮 */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setVillageLocation('center')}
            className="w-full py-2.5 text-xs text-[#a0a0b0] bg-[#16213e] rounded-lg
                       hover:bg-[#1a2744] hover:text-[#f5f0c4] active:scale-[0.98] transition-all duration-200"
          >
            离开铁匠铺
          </button>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] text-[#a0a0b0]/20 tracking-wider">青石村 · 铁匠铺</span>
            <span className="text-[9px] text-[#a0a0b0]/20">以火淬炼，以心铸剑</span>
          </div>
        </div>
      </div>
    </div>
  )
}
