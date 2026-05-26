import React, { useState, useEffect, useRef } from 'react'
import { useAIAdventureEngine, Choice, PlayerStats, NPCCharacter, AIOption } from '../engine/AIAdventureEngine'
import { useGameStore, Enemy } from '../store/useGameStore'

interface AIStoryPanelProps {
  onBack?: () => void
}

// 扩展 Choice 类型以支持战斗标记
interface ExtendedChoice extends Choice {
  isCombat?: boolean
}

// 检测玩家输入是否为攻击性语言
const detectAggressiveInput = (input: string): { isAggressive: boolean, enemyName?: string } => {
  const aggressiveKeywords = [
    '看剑', '受死', '纳命来', '杀', '斩', '砍', '去死', 
    '滚开', '让开', '闪开', '吃我一剑', '一剑', '出招',
    '教训', '干掉', '杀了', '斩妖', '除魔', '灭'
  ]
  
  const lowerInput = input.toLowerCase()
  
  for (const keyword of aggressiveKeywords) {
    if (lowerInput.includes(keyword)) {
      // 尝试提取敌人名称
      let enemyName = '敌人'
      if (lowerInput.includes('小鬼')) enemyName = '小鬼'
      else if (lowerInput.includes('老头')) enemyName = '老头'
      else if (lowerInput.includes('村长')) enemyName = '村长'
      else if (lowerInput.includes(' NPC') || lowerInput.includes('npc')) enemyName = 'NPC'
      
      return { isAggressive: true, enemyName }
    }
  }
  
  return { isAggressive: false }
}

export default function AIStoryPanel({ onBack }: AIStoryPanelProps) {
  const store = useGameStore()
  
  const {
    initialize,
    submitInput,
    currentNarrative,
    choices,
    npcCards,
    playerStats,
    isLoading,
    error,
    reset
  } = useAIAdventureEngine()

  const [inputText, setInputText] = useState('')
  const storyRef = useRef<HTMLDivElement>(null)
  
  // 解析选项中的战斗标记
  const [parsedChoices, setParsedChoices] = useState<ExtendedChoice[]>([])

  // 使用store中的历史，或者初始化为空
  const [history, setHistory] = useState<{role: string, content: string}[]>(() => {
    // 如果已经有初始化过的故事，加载它
    if (store.aiStoryInitialized && store.aiStoryHistory.length > 0) {
      return store.aiStoryHistory.map(item => ({
        role: 'assistant',
        content: item.content
      }))
    }
    return []
  })

  // 如果store有NPC数据，加载它们
  const [storedNpcCards, setStoredNpcCards] = useState<NPCCharacter[]>(() => {
    if (store.aiNPCs.length > 0) {
      return store.aiNPCs as unknown as NPCCharacter[]
    }
    return []
  })

  // 解析选项中的战斗标记
  useEffect(() => {
    const parsed = choices.map(choice => ({
      ...choice,
      // 检查选项文本是否包含战斗标记
      isCombat: choice.text.includes('（战斗）') || choice.text.includes('(战斗)')
    }))
    setParsedChoices(parsed)
  }, [choices])

  // 初始化游戏 - 只在首次进入且未初始化时调用
  useEffect(() => {
    if (!store.aiStoryInitialized) {
      // 首次进入，调用AI生成初始故事
      initialize().then(() => {
        // 标记为已初始化并保存到store
        useGameStore.setState({ aiStoryInitialized: true })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只运行一次

  // 监听narrative变化，自动添加到历史并保存到store
  useEffect(() => {
    if (currentNarrative && !isLoading) {
      setHistory(prev => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg?.content !== currentNarrative) {
          const newHistory = [...prev, { role: 'assistant', content: currentNarrative }]
          // 保存到store
          const newStoryHistory = newHistory.map(msg => ({
            speaker: 'AI',
            content: msg.content
          }))
          // 使用zustand的方式更新（因为aiStoryHistory是可选的）
          useGameStore.setState({ 
            aiStoryHistory: newStoryHistory,
            aiNPCs: npcCards as unknown as {id: string, name: string, title: string}[]
          })
          return newHistory
        }
        return prev
      })
    }
  }, [currentNarrative, isLoading, store, npcCards])

  // 自动滚动到最新消息
  useEffect(() => {
    if (storyRef.current) {
      storyRef.current.scrollTop = storyRef.current.scrollHeight
    }
  }, [history])

  // 处理战斗触发
  const handleCombatTrigger = (choice: ExtendedChoice) => {
    // 移除"（战斗）"标记来获取敌人名称
    const enemyName = choice.text.replace('（战斗）', '').replace('(战斗)', '').trim()
    
    // 创建敌人对象
    const enemy: Enemy = {
      name: enemyName || '敌人',
      hp: 100,
      attack: 15,
      level: Math.floor(Math.random() * 3) + 1,
      icon: '👹'
    }
    
    // 开启AI战斗
    store.startAIBattle(enemy, `遭遇了${enemy.name}！`)
    
    // 返回游戏主界面（会自动切换到战斗模式）
    if (onBack) {
      onBack()
    }
  }

  // 处理选择
  const handleChoice = async (choice: ExtendedChoice, index: number) => {
    // 如果是战斗选项，先触发战斗
    if (choice.isCombat) {
      handleCombatTrigger(choice)
      return
    }
    
    const userInput = `${index + 1}. ${choice.text}`
    setHistory(prev => {
      const newHistory = [...prev, { role: 'user', content: choice.text }]
      // 保存到store
      const newStoryHistory = newHistory.map(msg => ({
        speaker: msg.role === 'user' ? '玩家' : 'AI',
        content: msg.content
      }))
      useGameStore.setState({ aiStoryHistory: newStoryHistory })
      return newHistory
    })
    
    await submitInput(String(index + 1))
  }

  // 处理自由输入
  const handleFreeInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading) return

    const userInput = inputText.trim()
    
    // 检测是否为攻击性输入
    const detection = detectAggressiveInput(userInput)
    if (detection.isAggressive) {
      // 是攻击性输入，直接触发战斗
      const enemy: Enemy = {
        name: detection.enemyName || '敌人',
        hp: 100,
        attack: 15,
        level: Math.floor(Math.random() * 3) + 1,
        icon: '👹'
      }
      
      // 先添加用户消息到历史
      setHistory(prev => {
        const newHistory = [...prev, { role: 'user', content: userInput }]
        const newStoryHistory = newHistory.map(msg => ({
          speaker: msg.role === 'user' ? '玩家' : 'AI',
          content: msg.content
        }))
        useGameStore.setState({ aiStoryHistory: newStoryHistory })
        return newHistory
      })
      
      // 触发战斗
      store.startAIBattle(enemy, `遭遇了${enemy.name}！`)
      setInputText('')
      
      // 返回游戏主界面（会自动切换到战斗模式）
      if (onBack) {
        onBack()
      }
      return
    }

    // 正常对话
    setHistory(prev => {
      const newHistory = [...prev, { role: 'user', content: userInput }]
      // 保存到store
      const newStoryHistory = newHistory.map(msg => ({
        speaker: msg.role === 'user' ? '玩家' : 'AI',
        content: msg.content
      }))
      useGameStore.setState({ aiStoryHistory: newStoryHistory })
      return newHistory
    })
    setInputText('')

    await submitInput(userInput)
  }

  // 显示的NPC卡片 - 优先使用store中的
  const displayNpcCards = store.aiNPCs.length > 0 
    ? store.aiNPCs as unknown as NPCCharacter[]
    : npcCards

  return (
    <div className="flex flex-col h-full bg-[#0a0a12] text-[#c4b896]">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12121c] border-b border-[#2a2a3a]">
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6a6a8a]">📖 青石村</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#4a9a6a]">修为: {playerStats.cultivation}</span>
          <span className="text-[#c4a86a]">金币: {playerStats.gold}</span>
          <span className="text-[#6a8aca]">HP: {playerStats.health}</span>
          <span className="text-[#8a6aca]">MP: {playerStats.mana}</span>
        </div>
      </div>

      {/* 故事内容区域 */}
      <div 
        ref={storyRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2a3a]"
      >
        {/* NPC角色显示 */}
        {displayNpcCards.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {displayNpcCards.map(npc => (
              <div 
                key={npc.id}
                className="flex-shrink-0 px-3 py-1.5 bg-[#1a1a2a] rounded-lg border border-[#2a2a3a] text-xs"
              >
                <span className="text-[#c4a86a]">{npc.name}</span>
                <span className="text-[#6a6a8a] ml-1">· {npc.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* 消息历史 */}
        {history.map((msg, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              msg.role === 'user' 
                ? 'ml-8 bg-[#1a2a2a] border-l-2 border-[#4a8a6a]'
                : msg.role === 'system'
                ? 'bg-[#1a1a2a] border-l-4 border-[#c4a86a]'
                : 'mr-8 bg-[#2a1a2a] border-l-2 border-[#8a6a9a]'
            }`}
          >
            <p className="text-base leading-loose whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#6a6a8a] text-sm">
            <span className="animate-pulse">⏳ AI正在思考...</span>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="p-3 bg-[#2a1a1a] border border-[#8a4a4a] rounded-lg text-[#c46a6a] text-sm">
            ❌ {error}
          </div>
        )}
      </div>

      {/* 选项区域 */}
      {parsedChoices.length > 0 && !isLoading && (
        <div className="p-3 bg-[#12121c] border-t border-[#2a2a3a]">
          <p className="text-sm text-[#c4a86a] mb-3 font-bold">请选择你的行动：</p>
          <div className="space-y-3">
            {parsedChoices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice, index)}
                className={`w-full p-4 text-left rounded-lg transition-all duration-200 group ${
                  choice.isCombat 
                    ? 'bg-[#2a1a1a] hover:bg-[#3a2a2a] border border-[#8a4a4a] hover:border-[#ca6a6a]' 
                    : 'bg-[#1a1a2a] hover:bg-[#2a2a3a] border border-[#3a3a4a] hover:border-[#c4a86a]'
                }`}
              >
                <div className={`font-bold text-lg mb-2 block ${choice.isCombat ? 'text-[#ca6a6a]' : 'text-[#c4a86a]'}`}>
                  {index + 1}
                  {choice.isCombat && <span className="ml-2 text-xs">⚔️ 战斗</span>}
                </div>
                <div className={`text-base leading-relaxed block ${choice.isCombat ? 'text-[#eaa]' : 'text-[#c4b896]'}`}>
                  {choice.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 自由输入区域 */}
      <form onSubmit={handleFreeInput} className="p-3 bg-[#12121c] border-t border-[#2a2a3a]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入你想说的话..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#1a1a2a] border border-[#2a2a3a] rounded-lg
                       text-[#c4b896] placeholder-[#4a4a5a] text-sm
                       focus:outline-none focus:border-[#c4a86a] focus:ring-1 focus:ring-[#c4a86a]
                       disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2 bg-[#2a4a3a] hover:bg-[#3a5a4a] text-[#8aba9a] 
                       rounded-lg text-sm font-medium transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
        <p className="text-[10px] text-[#4a4a5a] mt-1">
          提示：也可以直接输入数字(1/2/3)选择选项
        </p>
      </form>
    </div>
  )
}
