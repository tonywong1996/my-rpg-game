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
        {/* 背景 - 教室图片 */}
        <img
          src="/assets/images/classroom.png"
          alt="教室"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* 半透明遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000]/30 via-transparent to-[#000]/50" />

        {/* 顶部信息栏 */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2 bg-gradient-to-b from-[#f5efe6]/90 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#3d405b] font-bold tracking-wider">{character.name}</p>
              <p className="text-[10px] text-[#81b29a]">{character.title}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#6b6b7b]">修为</span>
                <span className="text-xs text-[#e07a5f] font-bold">{formatCultivation(cultivation)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#6b6b7b]">金币</span>
                <span className="text-xs text-[#d4a04a] font-bold">{gold}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 地点名称 */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 z-10 text-center">
          <h1 className="text-lg font-bold text-white tracking-[0.3em] drop-shadow-lg">
            教 室
          </h1>
          <p className="text-[10px] text-white/70 tracking-widest mt-0.5">
            知识即是力量
          </p>
        </div>

        {/* 建筑区域 */} 
        <div className="absolute bottom-[25%] left-0 right-0 z-10 flex items-center justify-center gap-4 px-2">
          <button
            onClick={() => handleBuildingClick('shop')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#e8c8a8] to-[#d4b090] rounded-lg border-2 border-[#c4a880]/50 flex items-center justify-center group-hover:border-[#d4a04a]/50 transition-all shadow-md">
              <span className="text-2xl md:text-3xl">🏪</span>
            </div>
            <span className="text-[10px] text-white group-hover:text-[#d4a04a] drop-shadow-md">商店</span>
          </button>

          <button
            onClick={() => handleBuildingClick('smithy')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#c8a878] to-[#a88858] rounded-lg border-2 border-[#b89868]/50 flex items-center justify-center group-hover:border-[#e07a5f]/50 transition-all shadow-md">
              <span className="text-2xl md:text-3xl">⚒️</span>
            </div>
            <span className="text-[10px] text-white group-hover:text-[#e07a5f] drop-shadow-md">装备铺</span>
          </button>

          <button
            onClick={() => handleBuildingClick('quest_center')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#a8c8b8] to-[#88b098] rounded-lg border-2 border-[#98b088]/50 flex items-center justify-center group-hover:border-[#81b29a]/50 transition-all shadow-md">
              <span className="text-2xl md:text-3xl">📜</span>
            </div>
            <span className="text-[10px] text-white group-hover:text-[#81b29a] drop-shadow-md">任务</span>
          </button>

          <button
            onClick={() => handleBuildingClick('npc')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#c8b8d8] to-[#a898b8] rounded-lg border-2 border-[#b8a8c8]/50 flex items-center justify-center group-hover:border-[#9a88b8]/50 transition-all shadow-md">
              <span className="text-2xl md:text-3xl">🏘️</span>
            </div>
            <span className="text-[10px] text-white group-hover:text-[#9a88b8] drop-shadow-md">NPC</span>
          </button>

          <button
            onClick={goToBattle}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-[#d8a878] to-[#c08858] rounded-lg border-2 border-[#c89868]/50 flex items-center justify-center group-hover:border-[#e07a5f]/50 transition-all shadow-md">
              <span className="text-2xl md:text-3xl">⚔️</span>
            </div>
            <span className="text-[10px] text-white group-hover:text-[#e07a5f] drop-shadow-md">锻炼</span>
          </button>
        </div>
      </div>

      {/* 下半部分 - AI叙事面板 */}
      <div className="h-[40%] min-h-[180px] flex flex-col bg-[#ede8de] border-t border-[#c4b8a8]">
        {/* 叙事内容 */}
        <div 
          ref={storyRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin"
        >
          {/* NPC显示 */}
          {npcCards.length > 0 && (
            <div className="flex gap-1 mb-2 overflow-x-auto">
              {npcCards.map(npc => (
                <div key={npc.id} className="flex-shrink-0 px-2 py-1 bg-[#d4c8b8] rounded text-[10px]">
                  <span className="text-[#8a7260]">{npc.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* 消息历史 */}
          {history.map((index, msg) => (
            <p key={index} className="text-sm leading-relaxed text-[#5a5060] whitespace-pre-wrap break-all">
              <span className={`font-bold ${msg.speaker === '你' ? 'text-[#81b29a]' : msg.speaker === '系统' ? 'text-[#8a7260]' : 'text-[#9a88b8]'}`}>
                {msg.speaker}:
              </span><span className="mr-1"></span>{msg.content}
            </p>
          ))}

          {isLoading && (
            <div className="text-[#a09080] text-sm animate-pulse">⏳ AI思考中...</div>
          )}

          {error && (
            <div className="text-[#c46060] text-sm">❌ {error}</div>
          )}
        </div>

        {/* 选项区域 */}
        {choices.length > 0 && !isLoading && (
          <div className="px-3 py-2 bg-[#e0d8cc] border-t border-[#c4b8a8] space-y-2">
            {choices.map((choice, index) => {
              const isBattleOption = checkBattleKeyword(choice.text)
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice, index)}
                  className="w-full px-3 py-2 text-left bg-[#f5efe6] hover:bg-[#ede8de] 
                             border border-[#c4b8a8] hover:border-[#81b29a] rounded text-[12px] text-[#5a5060]
                             transition-all whitespace-normal flex items-center justify-between"
                >
                  <span>
                    <span className="text-[#8a7260] font-bold">{index + 1}.</span> {choice.text}
                  </span>
                  {isBattleOption && (
                    <span className="ml-2 px-2 py-0.5 bg-[#e07a5f]/20 text-[#e07a5f] text-[10px] rounded font-bold">
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
          <form onSubmit={handleFreeInput} className="px-3 py-2 bg-[#e0d8cc] border-t border-[#c4b8a8] flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="说点什么..."
              disabled={isLoading}
              rows={2}
              className="flex-1 px-3 py-2 bg-[#f5efe6] border border-[#c4b8a8] rounded text-[12px] text-[#5a5060] placeholder-[#a09080] focus:outline-none focus:border-[#81b29a] resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-[#81b29a] hover:bg-[#6a9a84] text-white rounded text-[12px] disabled:opacity-50 self-end"
            >
              发送
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
