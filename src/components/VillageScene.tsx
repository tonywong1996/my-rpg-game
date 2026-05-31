import React, { useState, useEffect } from 'react'
import { useGameStore, VillageLocation } from '../store/useGameStore'
import { formatCultivation } from '../utils/format'
import { useAIAdventureEngine, Choice } from '../engine/AIAdventureEngine'

/**
 * 解析 narrative 文本，返回带样式的 JSX
 * 处理：**粗体** / __粗体__、\n 换行、\n\n 段落、特殊符号
 */
function renderNarrative(text: string): React.ReactNode[] {
  // 按 \n\n 分割段落
  const paragraphs = text.split(/\n\n+/)
  return paragraphs.map((para, pi) => {
    // 按 \n 分割行
    const lines = para.split(/\n/)
    return (
      <p key={pi} className={`text-xs text-[#3d405b] leading-relaxed ${pi > 0 ? 'mt-2' : ''}`}>
        {lines.map((line, li) => {
          // 解析 **粗体** 和 __粗体__
          const parts: React.ReactNode[] = []
          let remaining = line
          let partIdx = 0
          while (remaining) {
            // 匹配 **bold** 或 __bold__
            const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)$/) ||
              remaining.match(/^([\s\S]*?)__(.+?)__([\s\S]*)$/)
            if (boldMatch) {
              if (boldMatch[1]) parts.push(boldMatch[1])
              parts.push(<strong key={`b${pi}${li}${partIdx++}`} className="font-bold text-[#3d405b]">{boldMatch[2]}</strong>)
              remaining = boldMatch[3] || ''
            } else {
              parts.push(remaining)
              break
            }
          }
          return (
            <React.Fragment key={li}>
              {li > 0 && <br />}
              {parts.length > 0 ? parts : line}
            </React.Fragment>
          )
        })}
      </p>
    )
  })
}

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
    submitInputStreaming,
    currentNarrative,
    choices,
    npcCards,
    playerStats,
    isLoading,
    error,
    streamingText,
  } = useAIAdventureEngine()

  const [inputText, setInputText] = useState('')
  const [narrativeText, setNarrativeText] = useState(() => {
    const store = useGameStore.getState()
    if (store.aiStoryInitialized && store.aiStoryNarrative) {
      return store.aiStoryNarrative
    }
    return ''
  })

  // 从store恢复choices（刷新后仍能显示）
  const [restoredChoices, setRestoredChoices] = useState<Choice[]>(() => {
    const store = useGameStore.getState()
    if (store.aiStoryInitialized && store.aiStoryChoices.length > 0) {
      return store.aiStoryChoices as unknown as Choice[]
    }
    return []
  })

  // choices更新时保存到store
  useEffect(() => {
    if (choices.length > 0) {
      useGameStore.setState({ aiStoryChoices: choices as unknown as {id: string, text: string}[] })
      setRestoredChoices(choices)
    }
  }, [choices])

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

  // 监听narrative变化和streamingText，并保存到store
  useEffect(() => {
    if (streamingText) {
      // 流式进行中：实时显示渐进文字
      setNarrativeText(streamingText)
      useGameStore.setState({ aiStoryNarrative: streamingText })
    } else if (currentNarrative && !isLoading) {
      // 流式结束：使用最终解析结果
      setNarrativeText(currentNarrative)
      useGameStore.setState({ aiStoryNarrative: currentNarrative })
    }
  }, [streamingText, currentNarrative, isLoading])

  // 处理选择
  const handleChoice = async (choice: Choice, index: number) => {
    await submitInputStreaming(String(index + 1))
  }

  // 处理自由输入
  const handleFreeInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading) return

    setInputText('')
    await submitInputStreaming(inputText.trim())
  }

  // 建筑点击处理
  const handleBuildingClick = (location: VillageLocation) => {
    setVillageLocation(location)
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* 上半部分 - 教室地图，上下结构：顶部信息+地点 | 叙事 */}
      <div className="relative h-[60%] min-h-0 flex flex-col overflow-hidden">
        {/* 背景 - 教室图片 */}
        <img
          src="/assets/images/classroom.png"
          alt="教室"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 8:2 覆盖层 */}
        <div className="absolute inset-0 flex flex-row">

          {/* 左侧 8 - 信息栏 + 地点 + 叙事 */}
          <div className="flex-[8] relative flex flex-col">
            {/* 半透明遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000]/30 via-transparent to-[#000]/50 pointer-events-none" />

            {/* 顶部信息栏 */}
            <div className="relative z-10 px-4 pt-3 pb-2 bg-gradient-to-b from-[#f5efe6]/90 to-transparent flex-shrink-0">
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

            {/* 地点名称 + 叙事文字 */}
            <div className="relative z-10 flex flex-col flex-1 px-3 pt-1 pb-2">
              <div className="text-center">
                <h1 className="text-lg font-bold text-white tracking-[0.3em] drop-shadow-lg">
                  教 室
                </h1>
                <p className="text-[10px] text-white/70 tracking-widest mt-0.5">
                  知识即是力量
                </p>
              </div>
              {/* 叙事文字展示区 */}
              {narrativeText && (
                <div className="mt-2 px-2 py-2 bg-[#f5efe6]/85 rounded-lg border border-[#c4b8a8] overflow-y-auto flex-1 max-h-[60%]">
                  {renderNarrative(narrativeText)}
                </div>
              )}
            </div>
          </div>

          {/* 右侧 2 - 建筑按钮垂直排列 */}
          <div className="flex-[2] flex flex-col items-center justify-center gap-2 p-2 border-l border-[#c4b8a8]/30">
            <p className="text-[10px] text-white/60 font-bold tracking-wider mb-1">功能</p>

            {/* 商店已隐藏
            <button
              onClick={() => handleBuildingClick('shop')}
              className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#e8c8a8] to-[#d4b090] rounded-lg border border-[#c4a880]/50 flex items-center justify-center group hover:border-[#d4a04a]/50 transition-all shadow-md"
            >
              <span className="text-xl md:text-2xl">🏪</span>
            </button>
            <span className="text-[10px] text-white/70">商店</span>
*/}

            <button
              onClick={() => handleBuildingClick('smithy')}
              className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#c8a878] to-[#a88858] rounded-lg border border-[#b89868]/50 flex items-center justify-center group hover:border-[#e07a5f]/50 transition-all shadow-md"
            >
              <span className="text-xl md:text-2xl">⚒️</span>
            </button>
            <span className="text-[10px] text-white/70">装备铺</span>

            <button
              onClick={() => handleBuildingClick('quest_center')}
              className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#a8c8b8] to-[#88b098] rounded-lg border border-[#98b088]/50 flex items-center justify-center group hover:border-[#81b29a]/50 transition-all shadow-md"
            >
              <span className="text-xl md:text-2xl">📜</span>
            </button>
            <span className="text-[10px] text-white/70">任务</span>

            <button
              onClick={() => handleBuildingClick('npc')}
              className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#c8b8d8] to-[#a898b8] rounded-lg border border-[#b8a8c8]/50 flex items-center justify-center group hover:border-[#9a88b8]/50 transition-all shadow-md"
            >
              <span className="text-xl md:text-2xl">🏘️</span>
            </button>
            <span className="text-[10px] text-white/70">NPC</span>

            <button
              onClick={goToBattle}
              className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-b from-[#d8a878] to-[#c08858] rounded-lg border border-[#c89868]/50 flex items-center justify-center group hover:border-[#e07a5f]/50 transition-all shadow-md"
            >
              <span className="text-xl md:text-2xl">⚔️</span>
            </button>
            <span className="text-[10px] text-white/70">锻炼</span>
          </div>
        </div>
      </div>

      {/* 下半部分 - 叙事面板 6:4 分割：左侧头像6 | 右侧选项+输入4 */}
      <div className="h-[40%] flex flex-row bg-[#f5efe6] border-t border-[#c4b8a8]">
        {/* 左侧 4 - 角色头像（变形铺满） */}
        <div className="flex-[4] overflow-hidden bg-[#e8dfd3]">
          <img
            src={`/assets/images/char_xiaoli_classroom.jpg`}
            alt={character.name}
            className="w-full h-full"
          />
        </div>

        {/* 右侧 6 - 选项区：有选项时显示选项，无选项时显示自由输入 */}
        <div className="flex-[6] flex flex-col bg-[#f5efe6]">
          {/* 选择按钮（气泡卡片）或输入框 */}
          {(restoredChoices.length > 0 || choices.length > 0) && !isLoading && (
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 flex flex-col">
              <div className="flex flex-col gap-2">
                {(restoredChoices.length > 0 ? restoredChoices : choices).map((choice, index) => (
                    <div
                      key={choice.id}
                      onClick={() => handleChoice(choice, index)}
                      className="w-full px-4 py-3 rounded-2xl cursor-pointer transition-all text-sm bg-[#ebe4d8] border border-[#b8b0a0] hover:border-[#c4a86a]"
                    >
                      <span className="font-bold text-[#3d405b]">
                        {index + 1}.
                      </span>
                      <span className="ml-2 text-[#5a5060]">
                        {choice.text}
                      </span>
                    </div>
                ))}
              </div>
            </div>
          )}

          {choices.length === 0 && !isLoading && (
            <form onSubmit={handleFreeInput} className="flex-1 flex items-center p-3 border-t border-[#c4b8a8]">
              <div className="flex gap-2 w-full">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="说点什么..."
                  disabled={isLoading}
                  rows={2}
                  className="flex-[8] px-3 py-2 bg-[#ebe4d8] border border-[#c4b8a8] hover:border-[#c4a86a] rounded-lg
                             text-sm text-[#3d405b] placeholder-[#8a8078]
                             focus:outline-none focus:border-[#c4a86a] resize-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="flex-[4] px-2 bg-[#81b29a] hover:bg-[#6a9a84] text-white rounded-lg text-sm font-bold disabled:opacity-50 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  发
                </button>
              </div>
            </form>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center text-[#8a8078] text-sm animate-pulse">⏳ AI思考中...</div>
          )}
        </div>
      </div>
    </div>
  )
}
