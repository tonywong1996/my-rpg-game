import React from 'react'
import { useGameStore } from '../store/useGameStore'

/**
 * 任务中心面板 - 增强版
 * 更大尺寸，更精美的视觉效果，更好的交互体验
 */
export default function QuestCenterPanel() {
  const quests = useGameStore((state) => state.quests)
  const gold = useGameStore((state) => state.gold)
  const acceptQuest = useGameStore((state) => state.acceptQuest)
  const claimQuestReward = useGameStore((state) => state.claimQuestReward)
  const setVillageLocation = useGameStore((state) => state.setVillageLocation)

  const handleClose = () => {
    setVillageLocation('center')
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0a1a]/60 backdrop-blur-sm">
      <div className="w-[92%] max-w-lg bg-gradient-to-b from-[#0f1f2f] to-[#09121c] rounded-2xl border border-[#3a6a9a]/50 shadow-2xl shadow-[#3a8ac4]/20 overflow-hidden animate-scale-in">
        {/* 顶部装饰光带 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3a8ac4] to-transparent" />
        
        {/* 标题区 */}
        <div className="relative px-5 pt-6 pb-4 text-center border-b border-[#1a3a5a]/50">
          <div className="absolute top-3 right-3">
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#0a1a2a] hover:bg-[#1a3a5a] text-[#a0a0b0] hover:text-white transition-all text-xs border border-[#2a4a6a]/50 hover:border-[#3a8ac4]/50"
            >
              ✕
            </button>
          </div>
          <div className="text-4xl mb-2">📜</div>
          <h2 className="text-lg font-bold text-[#3a8ac4] tracking-widest">任 务 中 心</h2>
          <p className="text-[11px] text-[#a0a0b0]/50 mt-1 tracking-wider">
            完成悬赏 · 获取 <span className="text-[#ffd700] font-bold">金币</span> 与 <span className="text-[#5ac8fa] font-bold">风能经验</span>
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a1a2a]/80 rounded-full border border-[#1a3a5a]/50">
            <span className="text-[10px] text-[#a0a0b0]/60">当前金币</span>
            <span className="text-sm text-[#ffd700] font-bold">🪙 {gold}</span>
          </div>
        </div>

        {/* 任务列表 - 加大间距和尺寸 */}
        <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
          {quests.map((quest, index) => (
            <div
              key={quest.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                quest.completed
                  ? 'bg-gradient-to-b from-[#0a2a1a]/60 to-[#061a0e] border-[#2a6a3a]/60 shadow-lg shadow-[#2a6a3a]/10'
                  : quest.accepted
                  ? 'bg-gradient-to-b from-[#0a1a2a]/60 to-[#060e1a] border-[#1a4a6a]/60 shadow-lg shadow-[#1a4a6a]/10'
                  : 'bg-gradient-to-b from-[#12122a]/60 to-[#0c0c18] border-[#1a2a4a]/40 hover:border-[#3a8ac4]/40 hover:shadow-lg hover:shadow-[#3a8ac4]/5'
              }`}
            >
              {/* 任务编号 */}
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#0a0a1a] border border-[#1a2a4a] flex items-center justify-center">
                <span className="text-[9px] text-[#a0a0b0]/60 font-mono">{index + 1}</span>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  quest.completed
                    ? 'bg-[#0a2a1a] border border-[#2a6a3a]/50'
                    : quest.accepted
                    ? 'bg-[#0a1a2a] border border-[#1a4a6a]/50'
                    : 'bg-[#0a0a1a] border border-[#1a2a4a]/50'
                }`}>
                  {quest.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold tracking-wider ${
                      quest.completed ? 'text-[#4a8a4a]' : 'text-[#f5f0c4]'
                    }`}>
                      {quest.name}
                    </h4>
                    {quest.completed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#4a8a4a] bg-[#0a2a1a] rounded-full border border-[#2a6a3a]/50">
                        ✓ 已完成
                      </span>
                    )}
                    {quest.accepted && !quest.completed && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#3a8ac4] bg-[#0a1a2a] rounded-full border border-[#1a4a6a]/50">
                        进行中
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#a0a0b0]/70 mt-1 leading-relaxed">{quest.description}</p>
                  <p className="text-[9px] text-[#a0a0b0]/40 mt-0.5 font-mono">{quest.requirement}</p>
                  
                  {/* 进度条 - 加粗放大 */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#0a0a1a] rounded-full overflow-hidden border border-[#1a1a3a]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          quest.completed
                            ? 'bg-gradient-to-r from-[#4a8a4a] to-[#6aaa6a]'
                            : 'bg-gradient-to-r from-[#3a8ac4] to-[#5ab8ff]'
                        }`}
                        style={{
                          width: `${quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[#a0a0b0]/60 font-mono font-bold whitespace-nowrap">
                      {quest.progress} / {quest.maxProgress}
                    </span>
                  </div>

                  {/* 奖励和操作 */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#a0a0b0]/50">奖励</span>
                      <span className="px-2 py-0.5 bg-[#1a1a0a] rounded text-[10px] text-[#ffd700] font-bold border border-[#3a3a1a]/50">
                        🪙 {quest.reward}
                      </span>
                      <span className="px-2 py-0.5 bg-[#1a0a0a] rounded text-[10px] text-[#e94560] font-bold border border-[#3a1a1a]/50">
                        ✨ {quest.reward}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!quest.accepted && !quest.completed && (
                        <button
                          onClick={() => acceptQuest(quest.id)}
                          className="px-4 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-[#3a8ac4] to-[#2a6a9a] text-white
                                     hover:from-[#4a9ad4] hover:to-[#3a8ac4] active:scale-95 transition-all duration-200
                                     shadow-lg shadow-[#3a8ac4]/30"
                        >
                          接受任务
                        </button>
                      )}
                      {quest.completed && (
                        <button
                          onClick={() => claimQuestReward(quest.id)}
                          className="px-4 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-[#ffd700] to-[#ffaa00] text-[#1a0a00]
                                     hover:from-[#ffe44d] hover:to-[#ffbb33] active:scale-95 transition-all duration-200
                                     shadow-lg shadow-[#ffd700]/30"
                        >
                          领取奖励
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="px-5 py-3 bg-[#050a12]/80 border-t border-[#1a3a5a]/30">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#a0a0b0]/30 tracking-wider">射击俱乐部 · 训练任务</span>
            <span className="text-[9px] text-[#a0a0b0]/20">任务数量: {quests.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
