import React, { useState, useEffect, useRef } from 'react'
import { useGameStore, VillageLocation } from '../store/useGameStore'
import { formatCultivation } from '../utils/format'
import { useAIAdventureEngine, Choice } from '../engine/AIAdventureEngine'

/**
 * 新手村场景组件
 * 显示青石村地图和交互建筑，下方集成AI叙事面板
 */
export default function VillageScene() {
  const character = useGameStore((state) => state.character)
  const cultivation = useGameStore((state) => state.cultivation)
  const gold = useGameStore((state) => state.gold)
  const playerUnit = useGameStore((state) => state.playerUnit)
  const setVillageLocation = useGameStore((state) => state.setVillageLocation)
  const goToBattle = useGameStore((state) => state.goToBattle)

  // AI引擎
  const {
    initialize,
    submitInput,
    currentNarrative,
    choices,
    npcCards,
    playerStats,
    isLoading,
    error,
  } = useAIAdventureEngine()

  const [inputText, setInputText] = useState('')
  const [history, setHistory] = useState<{speaker: string, content: string}[]>(() => {
    // 从store加载保存的故事历史
    const store = useGameStore.getState()
    if (store.aiStoryInitialized && store.aiStoryHistory.length > 0) {
      return store.aiStoryHistory.map(item => ({
        speaker: item.speaker,
        content: item.content
      }))
    }
    return []
  })
  const storyRef = useRef<HTMLDivElement>(null)

  // 初始化AI故事 - 只在首次进入且未初始化时调用
  useEffect(() => {
    const store = useGameStore.getState()
    if (!store.aiStoryInitialized) {
      initialize().then(() => {
        // 标记为已初始化并保存到store
        useGameStore.setState({ 
          aiStoryInitialized: true,
          aiNPCs: npcCards as unknown as {id: string, name: string, title: string}[]
        })
      })
    }
  }, [initialize, npcCards])

  // 解析AI响应，提取说话者信息
  const parseNarrative = (text: string) => {
    const messages: {speaker: string, content: string}[] = []
    const lines = text.split('\n')
    let currentSpeaker = '系统'
    let currentContent = ''
    
    for (const line of lines) {
      // 检测说话者格式：【名字】: 说话内容
      const speakerMatch = line.match(/^【(.+?)】[:：]\s*(.+)$/)
      if (speakerMatch) {
        // 保存上一条消息
        if (currentContent) {
          messages.push({ speaker: currentSpeaker, content: currentContent.trim() })
        }
        currentSpeaker = speakerMatch[1]
        currentContent = speakerMatch[2]
      } else if (line.match(/^（.+）$/) || line.match(/^\(.+\)$/)) {
        // 动作描写 (xxx) 或 （xxx）
        if (currentContent) {
          currentContent += '\n' + line
        }
      } else if (line.trim()) {
        // 普通叙述
        if (currentSpeaker === '系统' && currentContent) {
          currentContent += '\n' + line
        } else if (currentContent) {
          currentContent += '\n' + line
        } else {
          currentContent = line
        }
      }
    }
    
    // 保存最后一条消息
    if (currentContent) {
      messages.push({ speaker: currentSpeaker, content: currentContent.trim() })
    }
    
    return messages
  }

  // 监听narrative变化，并保存到store
  useEffect(() => {
    if (currentNarrative && !isLoading) {
      const newMessages = parseNarrative(currentNarrative)
      setHistory(prev => {
        const lastContent = prev[prev.length - 1]?.content
        // 只有当内容不同时才添加
        if (newMessages.length > 0 && newMessages[0].content !== lastContent) {
          const updatedHistory = [...prev, ...newMessages]
          // 保存到store
          useGameStore.setState({
            aiStoryHistory: updatedHistory,
            aiNPCs: npcCards as unknown as {id: string, name: string, title: string}[]
          })
          return updatedHistory
        }
        return prev
      })
    }
  }, [currentNarrative, isLoading, npcCards])

  // 自动滚动
  useEffect(() => {
    if (storyRef.current) {
      storyRef.current.scrollTop = storyRef.current.scrollHeight
    }
  }, [history])

  // 检测是否是战斗相关选项（检测选项末尾是否有 "（战斗）" 标记）
  const checkBattleKeyword = (text: string): boolean => {
    // 检测选项末尾是否包含 （战斗） 标记
    return /（战斗）\s*$/.test(text) || /(战斗)\s*$/.test(text)
  }

  // 处理选择
  const handleChoice = async (choice: Choice, index: number) => {
    const isBattleOption = checkBattleKeyword(choice.text)
    
    if (isBattleOption) {
      // 直接进入战斗
      goToBattle()
      return
    }
    
    const newHistory = [...history, { speaker: '你', content: choice.text }]
    setHistory(newHistory)
    // 保存到store
    useGameStore.setState({ aiStoryHistory: newHistory })
    // 转换历史格式并传递给AI
    const aiHistory = history.map(msg => ({
      role: msg.speaker === '你' ? 'user' as const : 'assistant' as const,
      content: `${msg.speaker}: ${msg.content}`
    }))
    await submitInput(String(index + 1), aiHistory)
  }

  // 处理自由输入
  const handleFreeInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading) return

    const userInput = inputText.trim()
    const isBattleInput = checkBattleKeyword(userInput)
    
    if (isBattleInput) {
      // 直接进入战斗
      setInputText('')
      goToBattle()
      return
    }

    const newHistory = [...history, { speaker: '你', content: userInput }]
    setHistory(newHistory)
    // 保存到store
    useGameStore.setState({ aiStoryHistory: newHistory })
    setInputText('')
    // 转换历史格式并传递给AI
    const aiHistory = history.map(msg => ({
      role: msg.speaker === '你' ? 'user' as const : 'assistant' as const,
      content: `${msg.speaker}: ${msg.content}`
    }))
    await submitInput(userInput, aiHistory)
  }

  // 建筑点击处理
  const handleBuildingClick = (location: VillageLocation) => {
    setVillageLocation(location)
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* 上半部分 - 地图 */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* 背景 - 地图图片 */}
        <img
          src="/assets/images/village_bg_new.png"
          alt="青石村"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* 半透明遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000]/40 via-transparent to-[#000]/60" />

        {/* 顶部信息栏 */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2 bg-gradient-to-b from-[#0a0a1a]/90 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#f5f0c4] font-bold tracking-wider">{character.name}</p>
              <p className="text-[10px] text-[#3a8ac4]">{character.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#a0a0b0]">修为</span>
                <span className="text-xs text-[#e94560] font-bold">{formatCultivation(cultivation)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#a0a0b0]">金币</span>
                <span className="text-xs text-[#ffd700] font-bold">{gold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 地点名称 */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-10 text-center">
          <h1 className="text-lg font-bold text-[#f5f0c4] tracking-[0.3em] drop-shadow-lg">
            青 石 村
          </h1>
          <p className="text-[10px] text-[#a0a0b0]/60 tracking-widest mt-0.5">
            新手修士的起航之地
          </p>
        </div>

        {/* 建筑区域 */} 
        <div className="absolute bottom-[25%] left-0 right-0 z-10 flex items-center justify-center gap-4 px-2">
          <button
            onClick={() => handleBuildingClick('shop')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#2a1a0a] to-[#1a0a00] rounded-lg border-2 border-[#4a2a1a]/50 flex items-center justify-center group-hover:border-[#ffd700]/50 transition-all">
              <span className="text-2xl md:text-3xl">🏪</span>
            </div>
            <span className="text-[10px] text-[#f5f0c4] group-hover:text-[#ffd700]">商店</span>
          </button>

          <button
            onClick={() => handleBuildingClick('smithy')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#2a1a00] to-[#1a0a00] rounded-lg border-2 border-[#4a3a1a]/50 flex items-center justify-center group-hover:border-[#ff8c00]/50 transition-all">
              <span className="text-2xl md:text-3xl">⚒️</span>
            </div>
            <span className="text-[10px] text-[#f5f0c4] group-hover:text-[#ff8c00]">装备铺</span>
          </button>

          <button
            onClick={() => handleBuildingClick('quest_center')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#0a1a2a] to-[#000a1a] rounded-lg border-2 border-[#1a2a4a]/50 flex items-center justify-center group-hover:border-[#3a8ac4]/50 transition-all">
              <span className="text-2xl md:text-3xl">📜</span>
            </div>
            <span className="text-[10px] text-[#f5f0c4] group-hover:text-[#3a8ac4]">任务</span>
          </button>

          <button
            onClick={() => handleBuildingClick('npc')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#1a0a1a] to-[#0a000a] rounded-lg border-2 border-[#3a1a3a]/50 flex items-center justify-center group-hover:border-[#c47ac4]/50 transition-all">
              <span className="text-2xl md:text-3xl">🏘️</span>
            </div>
            <span className="text-[10px] text-[#f5f0c4] group-hover:text-[#c47ac4]">NPC</span>
          </button>

          <button
            onClick={goToBattle}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#2a0a0a] to-[#1a0000] rounded-lg border-2 border-[#4a1a1a]/50 flex items-center justify-center group-hover:border-[#e94560]/50 transition-all">
              <span className="text-2xl md:text-3xl">⚔️</span>
            </div>
            <span className="text-[10px] text-[#f5f0c4] group-hover:text-[#e94560]">锻炼</span>
          </button>
        </div>
      </div>

      {/* 下半部分 - AI叙事面板 */}
      <div className="h-[45%] min-h-[200px] flex flex-col bg-[#0a0a12] border-t border-[#2a2a3a]">
        {/* 叙事内容 */}
        <div 
          ref={storyRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin"
        >
          {/* NPC显示 */}
          {npcCards.length > 0 && (
            <div className="flex gap-1 mb-2 overflow-x-auto">
              {npcCards.map(npc => (
                <div key={npc.id} className="flex-shrink-0 px-2 py-1 bg-[#1a1a2a] rounded text-[10px]">
                  <span className="text-[#c4a86a]">{npc.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* 消息历史 */}
          {history.map((msg, index) => (
            <p key={index} className="text-sm leading-relaxed text-[#c4b896] whitespace-pre-wrap break-all">
              <span className={`font-bold ${msg.speaker === '你' ? 'text-[#4a8a6a]' : msg.speaker === '系统' ? 'text-[#c4a86a]' : 'text-[#8a6a9a]'}`}>
                {msg.speaker}:
              </span><span className="mr-1"></span>{msg.content}
            </p>
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
          <div className="px-3 py-2 bg-[#12121c] border-t border-[#2a2a3a] space-y-2">
            {choices.map((choice, index) => {
              const isBattleOption = checkBattleKeyword(choice.text)
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice, index)}
                  className="w-full px-3 py-2 text-left bg-[#1a1a2a] hover:bg-[#2a2a3a] 
                             border border-[#3a3a4a] hover:border-[#c4a86a] rounded text-[12px] text-[#c4b896]
                             transition-all whitespace-normal flex items-center justify-between"
                >
                  <span>
                    <span className="text-[#c4a86a] font-bold">{index + 1}.</span> {choice.text}
                  </span>
                  {isBattleOption && (
                    <span className="ml-2 px-2 py-0.5 bg-[#e94560]/20 text-[#e94560] text-[10px] rounded font-bold">
                      战斗
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* 输入区域 - 只有在没有选项时显示 */}
        {choices.length === 0 && !isLoading && (
          <form onSubmit={handleFreeInput} className="px-3 py-2 bg-[#12121c] border-t border-[#2a2a3a] flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="说点什么..."
              disabled={isLoading}
              rows={2}
              className="flex-1 px-3 py-2 bg-[#1a1a2a] border border-[#2a2a3a] rounded text-[12px] text-[#c4b896] placeholder-[#4a4a5a] focus:outline-none focus:border-[#c4a86a] resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-[#2a4a3a] hover:bg-[#3a5a4a] text-[#8aba9a] rounded text-[12px] disabled:opacity-50 self-end"
            >
              发送
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
