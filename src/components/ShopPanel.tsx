import React from 'react'
import { useGameStore } from '../store/useGameStore'

/**
 * 商店面板组件
 * 在俱乐部中找到商店区域时弹出
 */
export default function ShopPanel() {
  const shopItems = useGameStore((state) => state.shopItems)
  const gold = useGameStore((state) => state.gold)
  const buyItem = useGameStore((state) => state.buyItem)
  const setVillageLocation = useGameStore((state) => state.setVillageLocation)

  const handleBuy = (itemId: string) => {
    buyItem(itemId)
  }

  const handleClose = () => {
    setVillageLocation('center')
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[90%] max-w-sm bg-gradient-to-b from-[#0f172a] to-[#0a0f1a] rounded-xl border border-[#3a6a9a]/60 shadow-2xl overflow-hidden">
        {/* 标题栏 */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#1a3050] to-[#0a1a30] border-b border-[#4a7aba]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔧</span>
              <h3 className="text-sm font-bold text-[#5ac8fa] tracking-wider">装备补给站</h3>
            </div>
            <button
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-[#0a1a30] hover:bg-[#1a3050] text-[#a0a0b0] hover:text-white transition-all text-xs border border-[#4a7aba]/40"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-[#a0a0b0]/60 mt-1">
            当前余额: <span className="text-[#ffd700] font-bold">{gold} 🪙</span>
          </p>
        </div>

        {/* 商品列表 */}
        <div className="p-3 space-y-2 max-h-[55vh] overflow-y-auto">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border transition-all duration-200 ${
                item.bought
                  ? 'bg-[#0a0f1a]/50 border-[#1a2a3a] opacity-50'
                  : 'bg-[#0f172a] border-[#2a4a6a]/40 hover:border-[#5ac8fa]/40 hover:bg-[#162035]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${item.bought ? 'text-[#a0a0b0]' : 'text-[#f5f0c4]'}`}>
                      {item.name}
                    </p>
                    <p className="text-[9px] text-[#a0a0b0]/70">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold ${gold >= item.price && !item.bought ? 'text-[#ffd700]' : 'text-[#e94560]'}`}>
                    {item.price}🪙
                  </span>
                  {item.bought ? (
                    <span className="text-[9px] text-[#4a8a4a] whitespace-nowrap">已购买</span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id)}
                      disabled={gold < item.price}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all duration-200 ${
                        gold >= item.price
                          ? 'bg-[#5ac8fa]/20 text-[#5ac8fa] border border-[#5ac8fa]/30 hover:bg-[#5ac8fa]/30 active:scale-95'
                          : 'bg-[#3a1a1a]/30 text-[#a0a0b0]/40 border border-[#3a1a1a]/50 cursor-not-allowed'
                      }`}
                    >
                      购买
                    </button>
                  )}
                </div>
              </div>
              
              {/* 物品效果标签 */}
              <div className="mt-1.5 flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-[#1a2a4a]/50 rounded text-[8px] text-[#5ac8fa] font-mono">
                  {item.effect.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 bg-[#0a0f1a]/80 border-t border-[#1a2a3a]">
          <p className="text-[9px] text-[#a0a0b0]/40 text-center tracking-wider">
            俱乐部补给站 · 装备维护与弹药补给
          </p>
        </div>
      </div>
    </div>
  )
}
