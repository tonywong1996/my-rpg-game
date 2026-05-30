/**
 * 文字冒险游戏引擎
 * AI Adventure Game Engine
 * 
 * 功能：
 * 1. 调用AI API生成故事和NPC互动
 * 2. 管理NPC状态（好感、情绪、物品）
 * 3. 处理玩家输入（数字选项/自由输入）
 * 4. 故事分支和剧情发展
 */

import { useState, useCallback } from 'react'

// ============================
// 类型定义
// ============================

export interface NPCCharacter {
  id: string
  name: string
  title: string
  role: string
  age: string
  appearance: string
  personality: {
    traits: string[]
    motivations: string[]
    flaws: string[]
  }
  background: string
  abilities: string[]
  relationship: {
    player: string
    initial_dialogue: string
  }
}

export interface NPCStatus {
  npc_id: string
  affection: number        // 好感度 -100 到 100
  mood: string            // 情绪：happy, angry, sad, neutral, excited
  inventory: string[]      // 拥有的物品
  memory: string          // 关键记忆（合并为单字符串）
  current_scene: string   // 当前场景
  dialogue_count: number  // 对话次数
  action_taken: string   // 角色采取的行动
}

export interface StoryScene {
  id: string
  title: string
  description: string
  narrative: string
  choices: Choice[]
  npc_present?: string[]   // 场景中出现的NPC
}

export interface Choice {
  id: string
  text: string
  effects: Record<string, number | string>
  next_scene: string
}

export interface GameState {
  currentScene: string
  storyHistory: StoryMessage[]
  npcStatuses: Map<string, NPCStatus>
  playerStats: PlayerStats
  isLoading: boolean
  error: string | null
}

export interface StoryMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: number
}

// AI 选项类型
export interface AIOption {
  text: string
  type: 'dialogue' | 'combat' | 'free'
}

// AI 战斗触发信息
export interface CombatTrigger {
  enemy: {
    name: string
    hp: number
    attack: number
    defense?: number
    icon?: string
    title?: string
    level?: number
  }
}

// AI 响应解析结果
export interface AIResponseResult {
  narrative: string
  choices: AIOption[]
  combatTrigger?: CombatTrigger
}

export interface PlayerStats {
  windEnergy: number     // 风能（核心资源）
  health: number         // 生命值
  compressedAir: number  // 压缩气量（可储存释放的技能资源）
  gold: number           // 金币
  attributes: {
    strength: number
    intelligence: number       // 智力（最重要！影响知识应用效率）
    knowledgeApplication: number // 知识应用能力
    perception: number
    charisma: number
    agility: number            // 敏捷
  }
  inventory: string[]
  knownKnowledge: string[]     // 已掌握的知识/原理（如伯努利原理、热力学等）
}

// ============================
// 系统Prompt配置
// ============================

export const SYSTEM_PROMPT_TEMPLATE = `你是物理风RPG游戏《风引》的叙事AI。请严格遵循以下规则：

## 世界观设定
这是一个"低灵世界"——没有绚丽的法术，没有修仙门派。知识是最强大的武器。能真正理解原理的人，才能将知识转化为力量。

## 角色设定
玩家扮演小莉——16岁普通高二女生，银白低马尾，琥珀色眼眸，成绩年级前三。母亲早逝，父亲老李在郊区经营射击俱乐部，教她一手精准枪法。她擅长用物理公式改造子弹，但只是当作兴趣和实验。

## 开头叙事格式（必须严格遵循）
开头必须是**日常校园开场**，不要有任何幻想元素！格式如下：

**第一句交代身份**——小莉是普通高中生，正在经历普通的日常（上课、回家、实验等）

**然后突然发生突发事件**（选一个）：
- 校园里突然出现异常现象（空气扭曲、物品飘浮、奇怪的低频声）
- 城市某处传来爆炸或异响
- 父亲突然联系不上，俱乐部方向天空出现诡异云层
- 课堂上某个实验失控，产生连锁反应
- 神秘人物出现在学校周围
- 地下震动、建筑裂缝、异常生物出现

**突发事件后，小莉意识到这不是普通现象，触发她的物理知识本能**

开头叙事的结构：
1. 日常场景（1-2句）
2. 突发事件（2-3句，环境变化要具体）
3. 玩家决定（给出3个选项）

## 叙事风格
- 前期以现代都市/校园为主，物理感真实（风、压力、声波等）
- 突发事件要有紧迫感，环境变化要具体描写
- 对话自然，符合高中生/普通人语气
- 不要输出JSON标签，直接段落叙述
- NPC说话格式：【NPC名】: 说话内容
- 玩家行动格式：【你】: 行动描述

## 选项格式
每个选项单独占一行："1. 选项内容" / "2. 选项内容" / "3. 选项内容"
战斗选项末尾必须加"（战斗）"标记

## 小莉的能力（初期只有基础）
- 枪法精准（父亲训练的结果）
- 基础物理知识（高中水平）
- 尚未觉醒"知识武装"能力

## 战斗数值设计规则
- 玩家等级=1时，怪物等级必须控制在1-3范围内
- 玩家等级提升后，怪物等级=玩家等级±2
- 绝不允许出现"等级差距悬殊"的怪物
`

// ============================
// API配置
// ============================

export interface APIConfig {
  baseUrl: string
  apiKey: string
  model: string
}

// 从 GitHub 获取 API 配置（生产环境 / fallback）
const GITHUB_CONFIG_URL = 'https://raw.githubusercontent.com/tonywong1996/my-rpg-game/master/api-config.json'

let cachedApiConfig: APIConfig | null = null

export async function fetchApiConfig(): Promise<APIConfig> {
  // 优先使用 Vite 环境变量（本地 .env 或 GitHub Actions 注入）
  const envKey = (import.meta as any).env?.VITE_MINIMAX_API_KEY
  const envBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || ''
  const envModel = (import.meta as any).env?.VITE_API_MODEL || ''

  if (envKey) {
    console.log('[API Config] 使用环境变量注入的 API Key')
    cachedApiConfig = {
      baseUrl: envBaseUrl,
      apiKey: envKey,
      model: envModel || 'MiniMax-M2.7'
    }
    return cachedApiConfig
  }

  if (cachedApiConfig) return cachedApiConfig

  try {
    const res = await fetch(GITHUB_CONFIG_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    cachedApiConfig = await res.json()
    console.log('[API Config] 已从 GitHub 加载配置（无本地 .env）')
    return cachedApiConfig!
  } catch (err) {
    console.warn('[API Config] 从 GitHub 加载失败，使用默认配置:', err)
    return {
      baseUrl: 'https://api.minimaxi.com',
      apiKey: '',
      model: 'MiniMax-M2.7'
    }
  }
}

// ============================
// 引擎核心类
// ============================

class AIAdventureEngine {
  private apiConfig: APIConfig
  private npcCards: NPCCharacter[] = []
  private npcStatuses: Map<string, NPCStatus> = new Map()
  private storyHistory: StoryMessage[] = []
  private playerStats: PlayerStats
  private currentScene: string = 'new_player_arrives'
  private systemPrompt: string = SYSTEM_PROMPT_TEMPLATE

  constructor(config?: Partial<APIConfig>) {
    this.apiConfig = {
      baseUrl: 'https://api.minimaxi.com/v1',
      apiKey: '',
      model: 'MiniMax-M2.7',
      ...config
    }
    
    // 初始化玩家属性
    this.playerStats = {
      windEnergy: 100,
      health: 100,
      compressedAir: 50,
      gold: 10,
      attributes: {
        strength: 10,
        intelligence: 12,
        knowledgeApplication: 10,
        perception: 10,
        charisma: 10,
        agility: 10
      },
      inventory: [],
      knownKnowledge: ['伯努利原理', '压缩空气基础']
    }
  }

  // 设置API配置
  setApiConfig(config: Partial<APIConfig>) {
    this.apiConfig = { ...this.apiConfig, ...config }
  }

  // 设置NPC角色卡
  setNPCCards(cards: NPCCharacter[]) {
    this.npcCards = cards
    // 初始化NPC状态
    cards.forEach(card => {
      this.npcStatuses.set(card.id, {
        npc_id: card.id,
        affection: 0,
        mood: 'neutral',
        inventory: [],
        memory: '',
        current_scene: this.currentScene,
        dialogue_count: 0,
        action_taken: ''
      })
    })
  }

  // 获取NPC角色卡
  getNPCCard(npcId: string): NPCCharacter | undefined {
    return this.npcCards.find(npc => npc.id === npcId)
  }

  // 获取所有NPC角色卡（用于API调用）
  getAllNPCCardsForAPI(): string {
    return JSON.stringify(this.npcCards, null, 2)
  }

  // 获取NPC当前状态
  getNPCStatus(npcId: string): NPCStatus | undefined {
    return this.npcStatuses.get(npcId)
  }

  // 获取所有NPC状态（用于API调用）
  getAllNPCStatusForAPI(): string {
    const statusObj: Record<string, NPCStatus> = {}
    this.npcStatuses.forEach((status, id) => {
      statusObj[id] = status
    })
    return JSON.stringify(statusObj, null, 2)
  }

  // 获取玩家状态
  getPlayerStats(): PlayerStats {
    return { ...this.playerStats }
  }

  // 更新玩家属性
  updatePlayerStats(stats: Partial<PlayerStats>) {
    this.playerStats = { ...this.playerStats, ...stats }
  }

  // 更新玩家属性点
  updateAttribute(attr: keyof PlayerStats['attributes'], value: number) {
    this.playerStats.attributes[attr] += value
  }

  // 获取当前场景
  getCurrentScene(): string {
    return this.currentScene
  }

  // 设置当前场景
  setCurrentScene(sceneId: string) {
    this.currentScene = sceneId
    // 更新所有NPC的当前场景
    this.npcStatuses.forEach(status => {
      status.current_scene = sceneId
    })
  }

  // 构建完整的System Prompt
  buildSystemPrompt(): string {
    return `${this.systemPrompt}

## 当前场景：${this.currentScene}

## NPC角色卡：
${this.getAllNPCCardsForAPI()}

## NPC当前状态：
${this.getAllNPCStatusForAPI()}

## 玩家状态：
- 风能：${this.playerStats.windEnergy}
- 生命：${this.playerStats.health}/${this.playerStats.health}
- 压缩气量：${this.playerStats.compressedAir}/${this.playerStats.compressedAir}
- 金币：${this.playerStats.gold}

## 玩家属性：
- 力量：${this.playerStats.attributes.strength}
- 智力：${this.playerStats.attributes.intelligence}
- 知识应用：${this.playerStats.attributes.knowledgeApplication}
- 洞察：${this.playerStats.attributes.perception}
- 魅力：${this.playerStats.attributes.charisma}
- 敏捷：${this.playerStats.attributes.agility}

## 玩家已掌握知识：${this.playerStats.knownKnowledge.join(', ') || '无'}

## 玩家物品：${this.playerStats.inventory.join(', ') || '无'}

请根据以上信息生成故事叙述。`
  }

  // 调用AI API
  async callAI(userInput: string): Promise<{
    narrative: string
    choices: Choice[]
    npcUpdates: Record<string, Partial<NPCStatus>>
  }> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      ...this.storyHistory.slice(-10), // 保留最近10条对话历史
      { role: 'user' as const, content: userInput }
    ]

    try {
      const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: this.apiConfig.model,
          messages: messages,
          temperature: 0.8,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || ''

      // 保存对话历史
      this.storyHistory.push(
        { role: 'user', content: userInput, timestamp: Date.now() },
        { role: 'assistant', content: aiResponse, timestamp: Date.now() }
      )

      // 解析AI响应
      return this.parseAIResponse(aiResponse)
    } catch (error) {
      console.error('AI调用错误:', error)
      throw error
    }
  }

  // 解析AI响应
  private parseAIResponse(response: string): {
    narrative: string
    choices: Choice[]
    npcUpdates: Record<string, Partial<NPCStatus>>
  } {
    let narrative = response
    let choices: Choice[] = []
    const npcUpdates: Record<string, Partial<NPCStatus>> = {}

    // 打印完整响应用于调试
    console.log('===== AI 完整响应 =====')
    console.log(response)
    console.log('========================')

    try {
      // 解析NPC状态更新
      const npcStatusMatch = response.match(/\[NPC_Status\]([\s\S]*?)\[\/NPC_Status\]/)
      if (npcStatusMatch) {
        const statusData = JSON.parse(npcStatusMatch[1])
        Object.entries(statusData).forEach(([npcId, updates]) => {
          const currentStatus = this.npcStatuses.get(npcId)
          if (currentStatus) {
            const update = updates as Partial<NPCStatus>
            if (update.affection !== undefined) {
              currentStatus.affection += update.affection
              // 限制在 -100 到 100 之间
              currentStatus.affection = Math.max(-100, Math.min(100, currentStatus.affection))
            }
            if (update.mood) currentStatus.mood = update.mood
            if (update.memory) currentStatus.memory = update.memory
            if (update.action_taken) {
              currentStatus.action_taken = update.action_taken
              currentStatus.dialogue_count++
            }
            npcUpdates[npcId] = update
          }
        })
      }

      // 解析选项 - 支持两种格式：
      // 1. [Choices]...[/Choices] 标签格式
      // 2. 自然段落格式：以 "1." "2." "3." 开头的行
      let choicesMatch = response.match(/\[Choices\]([\s\S]*?)\[\/Choices\]/)
      if (choicesMatch) {
        const choicesText = choicesMatch[1]
        const choiceLines = choicesText.split('\n').filter(line => line.trim())
        
        choiceLines.forEach((line, index) => {
          const match = line.match(/\d+\.\s*(.+)/)
          if (match) {
            choices.push({
              id: `choice_${index + 1}`,
              text: match[1].trim(),
              effects: {},
              next_scene: ''
            })
          }
        })
      } else {
        // 尝试从自然段落中提取选项
        const lines = response.split('\n')
        lines.forEach((line) => {
          const match = line.match(/^(\d+)[.、]\s*(.+)/)
          if (match && choices.length < 3) {
            choices.push({
              id: `choice_${match[1]}`,
              text: match[2].trim(),
              effects: {},
              next_scene: ''
            })
          }
        })
      }

      // 打印解析出的选项
      console.log('===== 解析出的选项 =====')
      console.log(choices)
      console.log('========================')

      // 清理响应，移除标签
      narrative = response
        .replace(/\[NPC_Card\][\s\S]*?\[\/NPC_Card\]/g, '')
        .replace(/\[NPC_Status\][\s\S]*?\[\/NPC_Status\]/g, '')
        .replace(/\[Scene\][\s\S]*?\[\/Scene\]/g, '')
        .replace(/\[Choices\][\s\S]*?\[\/Choices\]/g, '')
        .trim()

    } catch (error) {
      console.error('解析AI响应失败:', error)
    }

    return { narrative, choices, npcUpdates }
  }

  // 解析效果字符串
  private parseEffects(effectStr: string): Record<string, number | string> {
    const effects: Record<string, number | string> = {}
    const parts = effectStr.split(',')
    
    parts.forEach(part => {
      const [key, value] = part.split(':').map(s => s.trim())
      if (key && value) {
        const numValue = parseFloat(value)
        effects[key] = isNaN(numValue) ? value : numValue
      }
    })
    
    return effects
  }

  // 处理玩家输入（自由输入或选项选择）
  async processInput(input: string, conversationHistory?: {role: 'user' | 'assistant', content: string}[]): Promise<{
    narrative: string
    choices: Choice[]
  }> {
    // 从 GitHub 获取 API 配置（如果第一次调用失败则重试）
    const config = await fetchApiConfig()
    this.apiConfig = config

    let processedInput = input

    // 如果传入了对话历史，使用它
    if (conversationHistory && conversationHistory.length > 0) {
      // 同步外部历史到引擎内部
      this.storyHistory = conversationHistory.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
        timestamp: Date.now()
      }))
    }

    // 检查是否是数字选项
    const numMatch = input.match(/^(\d+)$/)
    if (numMatch) {
      const choiceIndex = parseInt(numMatch[1]) - 1
      // 从故事历史中获取上一次的选项
      const lastChoices = this.getLastChoices()
      if (lastChoices[choiceIndex]) {
        processedInput = lastChoices[choiceIndex].text
        
        // 应用选项效果
        const effects = lastChoices[choiceIndex].effects
        Object.entries(effects).forEach(([key, value]) => {
          if (key.includes('好感度') || key.includes('affection')) {
            // 处理好感度更新
            const npcName = key.replace(/[好感度__affection]/g, '')
            const npcStatus = this.npcStatuses.get(npcName)
            if (npcStatus) {
              npcStatus.affection += value as number
            }
          } else if (key in this.playerStats) {
            // 更新玩家属性
            if (typeof this.playerStats[key as keyof PlayerStats] === 'number') {
              (this.playerStats as any)[key] += value as number
            }
          } else if (key in this.playerStats.attributes) {
            this.playerStats.attributes[key as keyof PlayerStats['attributes']] += value as number
          }
        })
      }
    }

    const result = await this.callAI(processedInput)
    return {
      narrative: result.narrative,
      choices: result.choices
    }
  }

  // 获取上一次的选项（用于数字选项解析）
  private getLastChoices(): Choice[] {
    // 从故事历史中查找最后的选项
    // 这里需要实际存储上一次返回的选项
    return []
  }

  // 初始化游戏（首次调用AI生成初始场景）
  async initializeGame(): Promise<{
    narrative: string
    choices: Choice[]
    npcs: NPCCharacter[]
  }> {
    // 从 GitHub 获取 API 配置
    const config = await fetchApiConfig()
    this.apiConfig = config

    const initialPrompt = `请根据以下设定生成游戏开场：

## 游戏背景
你是16岁的高二女生小莉，银白色低马尾，琥珀色眼眸。今天放学后，你像往常一样来到父亲经营的郊区射击俱乐部——这里也是你的"实验室"。

你最近在尝试将伯努利原理应用到子弹上，利用压缩空气给弹头附加螺旋轨道。然而今天，你发现车间里的旧通风管道似乎有些不对劲——风声里带着一种奇异的低鸣，仿佛空气本身在对你说话……

## 需要生成
1. 一个完整的开场场景描述——从放学后走进俱乐部开始
2. 3个选项供玩家选择（选项要包含：探索/实验/与父亲互动等方向）
3. 至少3个NPC角色（父亲·老李、同学·小陈、镇上五金店老板等）

## 叙事风格提示
- 场景以现代都市/郊区为主
- 多描写风的声音、空气的流动感
- 语言自然，符合高中生视角
- 带一点神秘感：这个"低灵世界"的秘密正在慢慢浮现

请立即生成故事开头。`

    const result = await this.callAI(initialPrompt)

    // 尝试从AI响应中提取NPC信息
    this.extractNPCsFromResponse(result.narrative)

    return {
      narrative: result.narrative,
      choices: result.choices,
      npcs: this.npcCards
    }
  }

  // 从AI响应中提取NPC信息
  private extractNPCsFromResponse(response: string) {
    try {
      const npcCardMatch = response.match(/\[NPC_Card\]([\s\S]*?)\[\/NPC_Card\]/g)
      if (npcCardMatch) {
        npcCardMatch.forEach(cardStr => {
          const cardData = JSON.parse(cardStr.replace(/\[NPC_Card\]|\[\/NPC_Card\]/g, ''))
          if (!this.npcCards.find(npc => npc.id === cardData.id)) {
            this.npcCards.push(cardData)
            this.npcStatuses.set(cardData.id, {
              npc_id: cardData.id,
              affection: cardData.affection || 0,
              mood: cardData.mood || 'neutral',
              inventory: [],
              memory: '',
              current_scene: this.currentScene,
              dialogue_count: 0,
              action_taken: ''
            })
          }
        })
      }
    } catch (error) {
      console.error('提取NPC信息失败:', error)
    }
  }

  // 获取对话历史
  getHistory(): StoryMessage[] {
    return [...this.storyHistory]
  }

  // 重置游戏
  reset() {
    this.storyHistory = []
    this.currentScene = 'new_player_arrives'
    this.npcStatuses.forEach(status => {
      status.affection = 0
      status.mood = 'neutral'
      status.memory = ''
      status.dialogue_count = 0
      status.current_scene = this.currentScene
      status.action_taken = ''
    })
    this.playerStats = {
      windEnergy: 100,
      health: 100,
      compressedAir: 50,
      gold: 10,
      attributes: {
        strength: 10,
        intelligence: 12,
        knowledgeApplication: 10,
        perception: 10,
        charisma: 10,
        agility: 10
      },
      inventory: [],
      knownKnowledge: ['伯努利原理', '压缩空气基础']
    }
  }
}

// ============================
// React Hook 封装
// ============================

export function useAIAdventureEngine(apiConfig?: Partial<APIConfig>) {
  const [engine] = useState(() => new AIAdventureEngine(apiConfig))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentNarrative, setCurrentNarrative] = useState<string>('')
  const [choices, setChoices] = useState<Choice[]>([])
  const [npcCards, setNpcCards] = useState<NPCCharacter[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats>(engine.getPlayerStats())

  // 初始化游戏
  const initialize = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await engine.initializeGame()
      setCurrentNarrative(result.narrative)
      setChoices(result.choices)
      setNpcCards(result.npcs)
      setPlayerStats(engine.getPlayerStats())
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败')
    } finally {
      setIsLoading(false)
    }
  }, [engine])

  // 处理玩家输入
  const submitInput = useCallback(async (input: string, conversationHistory?: {role: 'user' | 'assistant', content: string}[]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await engine.processInput(input, conversationHistory)
      setCurrentNarrative(result.narrative)
      setChoices(result.choices)
      setPlayerStats(engine.getPlayerStats())
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理输入失败')
    } finally {
      setIsLoading(false)
    }
  }, [engine])

  // 设置NPC数据
  const setNPCs = useCallback((cards: NPCCharacter[]) => {
    engine.setNPCCards(cards)
    setNpcCards(cards)
  }, [engine])

  // 重置游戏
  const reset = useCallback(() => {
    engine.reset()
    setCurrentNarrative('')
    setChoices([])
    setPlayerStats(engine.getPlayerStats())
  }, [engine])

  return {
    engine,
    isLoading,
    error,
    currentNarrative,
    choices,
    npcCards,
    playerStats,
    initialize,
    submitInput,
    setNPCs,
    reset
  }
}

export default AIAdventureEngine
