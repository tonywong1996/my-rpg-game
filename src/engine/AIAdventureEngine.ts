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
// Tool Schema — advance_story
// ============================

export const ADVANCE_STORY_TOOL_SCHEMA = {
  "type": "function" as const,
  "function": {
    "name": "advance_story",
    "description": "推进剧情。返回叙事文字和玩家选项。",
    "parameters": {
      "type": "object" as const,
      "properties": {
        "narrative": {
          "type": "string" as const,
          "description": "【上半区】叙事文字，80~150字。描述场景、NPC、玩家行动的结果。不要包含选项文字。"
        },
        "choices": {
          "type": "array" as const,
          "description": "【下半区气泡卡片】3个选项，每个8~15字，以'你'开头。应涵盖不同策略（直接、谨慎、观察）。",
          "minItems": 3,
          "maxItems": 3,
          "items": { "type": "string" as const }
        },
        "next_scene": {
          "type": "string" as const,
          "description": "下一场景ID，不变时填'same'。"
        },
        "npc_status_updates": {
          "type": "array" as const,
          "description": "NPC状态变化（好感度、情绪等），无变化时为空数组。",
          "items": {
            "type": "object" as const,
            "properties": {
              "npc_id": { "type": "string" as const },
              "affection": { "type": "number" as const, "minimum": -100, "maximum": 100 },
              "mood": { "type": "string" as const, "enum": ["happy", "angry", "sad", "neutral", "excited"] as const },
              "current_scene": { "type": "string" as const }
            },
            "required": ["npc_id", "mood"] as string[]
          }
        }
      },
      "required": ["narrative", "choices", "next_scene"] as string[]
    }
  }
}

// ============================
// 系统Prompt配置
// ============================

export const SYSTEM_PROMPT_TEMPLATE = `你是游戏《知识即是力量》的叙事引擎。玩家扮演小莉——16岁银发少女，能用物理学知识操控风。

你的唯一职责：调用 advance_story 函数，提供 narrative 和 choices。

【世界观与角色】
- 小莉：温柔、好奇、学霸。银白色低马尾，琥珀色眼眸。
- 能力来源：真实知识（伯努利原理、流体力学等） + 相信力。知识越深，能力越强。
- 当前能力：破风弹（穿透子弹）、气垫滑板（短距滑行）、真空弹（抽空空气）、空气护盾（偏转投射物）。
- 装备：改造老式步枪（父亲留下的）、便携气罐腰带（储存压缩空气）、防风护目镜。
- 战斗风格：远程射手，擅长利用气流和工程思维。尽量避免近身。
- 性格癖好：解题时转笔，紧张时摸马尾。

【叙事要求】
- 长度：80~150字。
- 风格：简洁、画面感、科学感。适当使用物理名词（气压、涡流、伯努利效应），但不晦涩。
- 禁止：选项文字、反问玩家、打破第四面墙。

【选项要求】
- 必须3个。
- 每个8~15字，以"你"开头。
- 应覆盖三种类型：一个利用知识/技能的（聪明解法），一个直接行动的（勇气/武力），一个观察/对话的（社交/探索）。
- 示例：
  - "你计算风向，用气垫滑板无声接近。"
  - "你端起改造步枪，警惕地瞄准灌木丛。"
  - "你蹲下身，仔细观察地上的脚印。"

【场景切换】
- 如果玩家留在当前场景，next_scene 填 "same"。
- 否则填短ID（如 "club_yard"、"forest_path"）。

【NPC状态更新】
- 当NPC情绪或好感明显变化时更新。例如：帮了NPC → affection +5，mood happy。
- 无变化传空数组。

【重要禁止项】
- 不输出任何函数调用以外的文字。
- 不在 narrative 中包含选项编号。
- 不计算数值战斗（如伤害、血量）。如果玩家选择攻击，叙事中描述效果即可，不涉及具体数字。`

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
      baseUrl: envBaseUrl || 'https://api.minimaxi.com/v1',
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
      baseUrl: 'https://api.minimaxi.com/v1',
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

  // 调用AI API（工具调用模式）
  async callAI(userInput: string): Promise<{
    narrative: string
    choices: Choice[]
    nextScene: string
    npcUpdates: Record<string, Partial<NPCStatus>>
  }> {
    const messages = [
      { role: 'system' as const, content: this.buildSystemPrompt() },
      ...this.storyHistory.slice(-10),
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
          tools: [ADVANCE_STORY_TOOL_SCHEMA],
          tool_choice: { type: 'function', function: { name: 'advance_story' } },
          temperature: 0.8,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0]?.message

      // 保存对话历史
      this.storyHistory.push(
        { role: 'user', content: userInput, timestamp: Date.now() },
        { role: 'assistant', content: JSON.stringify(aiMessage), timestamp: Date.now() }
      )

      // 解析工具调用
      return this.parseToolCall(aiMessage)
    } catch (error) {
      console.error('AI调用错误:', error)
      throw error
    }
  }

  // 解析工具调用响应
  private parseToolCall(aiMessage: any): {
    narrative: string
    choices: Choice[]
    nextScene: string
    npcUpdates: Record<string, Partial<NPCStatus>>
  } {
    const toolCall = aiMessage?.tool_calls?.[0]
    const argsStr = toolCall?.function?.arguments || '{}'

    console.log('===== AI Tool Call =====')
    console.log('Function:', toolCall?.function?.name)
    console.log('Arguments:', argsStr)
    console.log('========================')

    try {
      const args = JSON.parse(argsStr)

      // 解析 NPC 状态更新
      const npcUpdates: Record<string, Partial<NPCStatus>> = {}
      ;(args.npc_status_updates || []).forEach((update: any) => {
        const currentStatus = this.npcStatuses.get(update.npc_id)
        if (currentStatus) {
          if (update.affection !== undefined) {
            currentStatus.affection = Math.max(-100, Math.min(100, currentStatus.affection + update.affection))
          }
          if (update.mood) currentStatus.mood = update.mood
          if (update.current_scene) currentStatus.current_scene = update.current_scene
          npcUpdates[update.npc_id] = update
        }
      })

      // 构建 Choice 数组
      const choices: Choice[] = (args.choices || []).map((text: string, i: number) => ({
        id: `choice_${i + 1}`,
        text,
        effects: {},
        next_scene: args.next_scene || 'same'
      }))

      return {
        narrative: args.narrative || '',
        choices,
        nextScene: args.next_scene || 'same',
        npcUpdates
      }
    } catch (error) {
      console.error('解析Tool Call失败:', error)
      return {
        narrative: '【解析失败】AI响应格式异常',
        choices: [],
        nextScene: 'same',
        npcUpdates: {}
      }
    }
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
    nextScene: string
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
      const lastChoices = this.getLastChoices()
      if (lastChoices[choiceIndex]) {
        processedInput = lastChoices[choiceIndex].text

        // 应用选项效果
        const effects = lastChoices[choiceIndex].effects
        Object.entries(effects).forEach(([key, value]) => {
          if (key.includes('好感度') || key.includes('affection')) {
            const npcName = key.replace(/[好感度__affection]/g, '')
            const npcStatus = this.npcStatuses.get(npcName)
            if (npcStatus) {
              npcStatus.affection += value as number
            }
          } else if (key in this.playerStats) {
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

    // 如果 next_scene 不是 'same'，更新场景
    if (result.nextScene && result.nextScene !== 'same') {
      this.setCurrentScene(result.nextScene)
    }

    return {
      narrative: result.narrative,
      choices: result.choices,
      nextScene: result.nextScene
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
- 带一点神秘感：这个"低灵世界"秘密正在慢慢浮现

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
