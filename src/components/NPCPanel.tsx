import React, { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { useAIAdventureEngine, Choice } from '../engine/AIAdventureEngine'

/**
 * NPC对话面板 - AI增强版
 * 显示AI生成的NPC，点击可以与之对话，调用AI引擎生成对话内容
 */
export default function NPCPanel() {
  const setVillageLocation = useGameStore((state) => state.setVillageLocation)
  const aiNPCs = useGameStore((state) => state.aiNPCs)
  
  // AI引擎
  const {
    submitInput,
    currentNarrative,
    choices,
    isLoading,
    error,
  } = useAIAdventureEngine()

  // 当前对话的NPC
  const [activeNpc, setActiveNpc] = useState<{id: string, name: string, title: string} | null>(null)
  const [inputText, setInputText] = useState('')
  const [dialogueHistory, setDialogueHistory] = useState<{speaker: string, content: string}[]>([])
  const dialogueRef = useRef<HTMLDivElement>(null)

  // 监听AI响应
  useEffect(() => {
    if (currentNarrative && !isLoading && activeNpc) {
      setDialogueHistory(prev => {
        const lastContent = prev[prev.length - 1]?.content
        if (lastContent !== currentNarrative) {
          return [...prev, { speaker: activeNpc.name, content: currentNarrative }]
        }
        return prev
      })
    }
  }, [currentNarrative, isLoading, activeNpc])

  // 自动滚动
  useEffect(() => {
    if (dialogueRef.current) {
      dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight
    }
  }, [dialogueHistory])

  const handleClose = () => {
    setActiveNpc(null)
    setDialogueHistory([])
    setVillageLocation('center')
  }

  const handleNpcClick = (npc: {id: string, name: string, title: string}) => {
    setActiveNpc(npc)
    setDialogueHistory([])
    // 首次与NPC对话，调用AI生成开场
    setTimeout(() => {
      const initialPrompt = `【${npc.name}】是青石村的一位居民。请以这个NPC的身份说一段开场白，可以包括：
- 自我介绍
- 对玩家的态度
- 可能的请求或任务线索

请生成3个选项让玩家选择后续对话方向。`
      submitInput(initialPrompt)
    }, 100)
  }

  const handleChoice = async (choice: Choice, index: number) => {
    setDialogueHistory(prev => [...prev, { speaker: '你', content: choice.text }])
    await submitInput(String(index + 1))
  }

  const handleFreeInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading || !activeNpc) return

    const userInput = inputText.trim()
    setDialogueHistory(prev => [...prev, { speaker: '你', content: userInput }])
    setInputText('')
    await submitInput(userInput)
  }

  // 使用store中保存的NPC
  const displayNPCs = aiNPCs

  // 渲染对话模式
  if (activeNpc) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="w-[92%] max-w-lg h-[80%] flex flex-col bg-gradient-to-b from-[#1a0a1a] to-[#0a050a] rounded-2xl border border-[#5a3a6a]/40 shadow-2xl overflow-hidden">
          {/* 顶部 */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#3a1a4a]/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveNpc(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1a0a1a] hover:bg-[#3a1a4a] text-[#a0a0b0] hover:text-white transition-all text-xs"
              >
                ←
              </button>
              <div>
                <h3 className="text-sm font-bold text-[#c47ac4]">{activeNpc.name}</h3>
                <p className="text-[10px] text-[#a0a0b0]/50">{activeNpc.title}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1a0a1a] hover:bg-[#3a1a4a] text-[#a0a0b0] hover:text-white transition-all text-xs"
            >
              ✕
            </button>
          </div>

          {/* 对话内容 */}
          <div 
            ref={dialogueRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {dialogueHistory.map((msg, index) => (
              <div key={index} className="text-sm">
                <span className={`font-bold ${msg.speaker === '你' ? 'text-[#4a8a6a]' : 'text-[#c47ac4]'}`}>
                  {msg.speaker}:
                </span>
                <span className="text-[#c4b896] ml-1">{msg.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="text-[#6a6a8a] text-sm animate-pulse">⏳ AI思考中...</div>
            )}
            {error && (
              <div className="text-[#c46a6a] text-sm">❌ {error}</div>
            )}
          </div>

          {/* 选项区域 */}
          {choices.length > 0 && !isLoading && (
            <div className="px-4 py-3 bg-[#12121c] border-t border-[#2a2a3a]">
              <div className="space-y-2">
                {choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice, index)}
                    className="w-full p-3 text-left bg-[#1a1a2a] hover:bg-[#2a2a3a] 
                               border border-[#3a3a4a] hover:border-[#c47ac4] rounded-lg text-sm text-[#c4b896]
                               transition-all"
                  >
                    <span className="text-[#c47ac4] font-bold">{index + 1}.</span> {choice.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <form onSubmit={handleFreeInput} className="px-4 py-3 bg-[#12121c] border-t border-[#2a2a3a] flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入你想说的话..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg text-sm text-[#c4b896] placeholder-[#4a4a5a] focus:outline-none focus:border-[#c47ac4]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-[#3a2a4a] hover:bg-[#4a3a5a] text-[#c47ac4] rounded-lg text-sm disabled:opacity-50"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    )
  }

  // NPC列表模式
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-[92%] max-w-lg bg-gradient-to-b from-[#1a0a1a] to-[#0a050a] rounded-2xl border border-[#5a3a6a]/40 shadow-2xl overflow-hidden animate-scale-in">
        {/* 顶部装饰光带 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c47ac4] to-transparent" />
        
        {/* 标题区 */}
        <div className="relative px-5 pt-6 pb-4 text-center border-b border-[#3a1a4a]/50">
          <div className="absolute top-3 right-3">
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1a0a1a] hover:bg-[#3a1a4a] text-[#a0a0b0] hover:text-white transition-all text-xs border border-[#3a2a4a]/50 hover:border-[#c47ac4]/50"
            >
              ✕
            </button>
          </div>
          <div className="text-4xl mb-2">🏘️</div>
          <h2 className="text-lg font-bold text-[#c47ac4] tracking-widest">村 民</h2>
          <p className="text-[11px] text-[#a0a0b0]/50 mt-1 tracking-wider">
            点击村民开始对话，了解青石村的故事
          </p>
        </div>

        {/* NPC列表 */}
        <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
          {displayNPCs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📜</div>
              <p className="text-[#a0a0b0] text-sm mb-2">暂无村民信息</p>
              <p className="text-[#6a6a8a] text-xs">
                请先在下方与AI互动，了解青石村的故事
              </p>
            </div>
          ) : (
            displayNPCs.map((npc) => (
              <div
                key={npc.id}
                onClick={() => handleNpcClick(npc)}
                className="p-4 rounded-xl bg-gradient-to-b from-[#0f0a15] to-[#0a050f] border border-[#3a2a4a]/40 hover:border-[#5a3a6a]/50 transition-all duration-300 shadow-lg cursor-pointer hover:scale-[1.02]"
              >
                {/* NPC信息 */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a1a3a] to-[#1a0a2a] flex items-center justify-center border-2 border-[#5a3a6a]/30 shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#f5f0c4] tracking-wider">{npc.name}</h4>
                    <p className="text-[10px] text-[#c47ac4]/70 mt-0.5">{npc.title}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#c47ac4] to-[#a05aa0] rounded-full text-[10px] text-white font-bold">
                      对话 →
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部装饰 */}
        <div className="px-5 py-3 bg-[#0a050a]/80 border-t border-[#3a1a4a]/30">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#a0a0b0]/30 tracking-wider">青石村 · 居民名录</span>
            <span className="text-[9px] text-[#a0a0b0]/20">共 {displayNPCs.length} 位村民</span>
          </div>
        </div>
      </div>
    </div>
  )
}
