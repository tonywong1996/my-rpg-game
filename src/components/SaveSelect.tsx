import React from 'react'
import { useGameStore } from '../store/useGameStore'
import { formatCultivation } from '../utils/format'

interface SaveSelectProps {
  onClose: () => void
  onLoadSave: () => void
}

/**
 * 存档选择组件
 * 显示已保存的存档信息，支持选择加载或开始新游戏
 */
export default function SaveSelect({ onClose, onLoadSave }: SaveSelectProps) {
  const cultivation = useGameStore((state) => state.cultivation)
  const reset = useGameStore((state) => state.reset)
  const deleteSave = useGameStore((state) => state.deleteSave)

  const hasSave = cultivation.greaterThan(0)

  const handleNewGame = () => {
    reset()
    onLoadSave()
  }

  const handleLoadSave = () => {
    onLoadSave()
  }

  const handleDeleteSave = () => {
    if (confirm('确定要删除存档吗？此操作不可恢复！')) {
      deleteSave()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* 弹窗容器 */}
      <div className="relative w-full max-w-md mx-4 bg-[#f5efe6] border border-[#c4b8a8] rounded-2xl shadow-2xl overflow-hidden">
        {/* 弹窗标题 */}
        <div className="px-6 py-5 border-b border-[#c4b8a8]">
          <h2 className="text-xl font-bold text-[#3d405b] tracking-wider text-center">
            选 择 存 档
          </h2>
        </div>

        {/* 存档列表 */}
        <div className="p-6">
          {/* 存档位 1 - 当前存档 */}
          <div className={`
            relative p-4 rounded-xl border transition-all duration-300
            ${hasSave 
              ? 'border-[#81b29a]/30 bg-[#ede8de] hover:border-[#81b29a]/60 hover:bg-[#e8e0d0] cursor-pointer' 
              : 'border-[#c4b8a8] bg-[#e8e0d0] opacity-50'
            }
          `}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#6b6b7b] tracking-wider">
                存档位 1
              </span>
              {hasSave && (
                <span className="text-xs text-[#81b29a] bg-[#81b29a]/10 px-2 py-0.5 rounded-full">
                  有存档
                </span>
              )}
              {!hasSave && (
                <span className="text-xs text-[#a09080] bg-[#a09080]/10 px-2 py-0.5 rounded-full">
                  空
                </span>
              )}
            </div>

            {hasSave && (
              <div className="space-y-1">
                <p className="text-lg font-bold text-[#e07a5f]">
                  修为: {formatCultivation(cultivation)}
                </p>
                <p className="text-xs text-[#6b6b7b]">
                  精确值: {cultivation.toString()}
                </p>
              </div>
            )}

            {!hasSave && (
              <p className="text-sm text-[#a09080]/50">
                暂无存档数据
              </p>
            )}

            {/* 操作按钮 */}
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                {hasSave && (
                  <button
                    onClick={handleLoadSave}
                    className="flex-1 px-3 py-2 text-sm bg-[#81b29a] text-white rounded-lg 
                               hover:bg-[#6a9a84] active:scale-95 transition-all font-medium tracking-wider"
                  >
                    加载存档
                  </button>
                )}
                <button
                  onClick={handleNewGame}
                  className={`${hasSave ? 'flex-1' : 'w-full'} px-3 py-2 text-sm 
                             border border-[#e07a5f] text-[#e07a5f] rounded-lg 
                             hover:bg-[#e07a5f]/10 active:scale-95 transition-all font-medium tracking-wider`}
                >
                  新开游戏
                </button>
              </div>
              {/* 删除存档按钮 */}
              {hasSave && (
                <button
                  onClick={handleDeleteSave}
                  className="w-full px-3 py-2 text-sm border border-[#c46060] text-[#c46060] rounded-lg 
                             hover:bg-[#c46060]/20 active:scale-95 transition-all font-medium tracking-wider"
                >
                  🗑 删除存档
                </button>
              )}
            </div>
          </div>

          {/* 提示信息 */}
          <p className="mt-4 text-xs text-[#a0a0b0]/40 text-center leading-relaxed">
            选择"加载存档"继续之前的旅程<br />
            选择"新开游戏"将重置所有数据重新开始
          </p>
        </div>

        {/* 关闭按钮 */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm text-[#a0a0b0] bg-transparent border border-[#16213e] 
                       rounded-lg hover:bg-[#16213e]/50 active:scale-95 transition-all tracking-wider"
          >
            返 回 菜 单
          </button>
        </div>
      </div>
    </div>
  )
}
