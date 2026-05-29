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

export const SYSTEM_PROMPT_TEMPLATE = `你是科幻物理风RPG游戏《风引》的叙事AI。请严格遵循以下规则：

## 世界观设定
这是一个"低灵世界"——没有绚丽的法术，没有灵气复苏，没有修仙门派。只有最朴素的"相信力"作为引子。
但光有相信还不够——你必须真正理解你想创造的东西。比如，想用风推动自己飞行，你得懂空气动力学；想在子弹上附魔火焰，你得懂燃烧反应。知识越深，创造的工具越强。

## 角色设定
玩家扮演的是一位名叫"小莉"的16岁高二女生。
- 银白色长发在脑后扎成低马尾，琥珀色眼眸总带着温和的好奇心
- 就读普通高中，成绩常年年级前三
- 家境普通——母亲早逝，父亲曾是军队射击教官，如今在郊区经营一家小型射击俱乐部
- 父女俩相依为命，日子不算宽裕，但宁静
- 从小在靶场长大，枪法精准得不像话
- 一次偶然中发现：将"伯努利原理"注入子弹，子弹无声贯穿三层靶纸，快到她几乎看不清
- 从此开始用物理课本里的公式改造子弹和装备
- 她迷恋物理课本里关于流体、压力、波动的每一页，在俱乐部的旧车间里做实验

## 重要：输出格式要求
1. **不要输出任何JSON格式的标签**（如[NPC_Card]、[NPC_Status]、[Scene]等）
2. **直接用自然段落叙述**，格式如下：
   - 描写场景时直接写，不需要标签
   - NPC说话用这种格式：【NPC名号/身份】: 说的话
   - 玩家行动用：【你】: 行动描述
   - NPC动作用：（动作描述）

## 叙事风格
- 与现代都市/校园/郊外场景为主，偶尔有冒险元素
- 描述注重物理感和真实感——风的声音、空气的流动、机械的结构感
- 角色对话要自然，符合高中生/现代人的语气
- 适度加入物理/工程术语，但要让不懂的人也能看懂
- 不擅自夺走玩家的决定权：重要决策（如是否战斗、选择装备、对NPC的态度）必须通过选项留给玩家选择

## 重要：人物对话示例
【小莉的父亲·老李】: 又在改你那把枪？今天的作业写完了吗？
（他靠在车间门口，擦了擦手上的机油，眼神里带着无奈又宠爱的笑意）
【同学·小陈】: 莉莉！你猜我今天在图书馆找到了什么？——流体力学实战案例！
【你·小莉】: 真的？！快给我看看，我正好在想怎么优化子弹的螺旋轨迹...

## 选项格式（必须提供3个选项）
请在叙述结束后，提供3个选项供玩家选择。

**强制规则（必须遵守）：每个选项单独占一行，格式为 "1. 选项内容"、"2. 选项内容"、"3. 选项内容"**

**战斗标记规则（必须遵守）：如果选项会导致战斗/冲突发生，必须在选项末尾加上"（战斗）"标记！**
- 正确示例：3. 举起改造步枪瞄准目标（战斗）
- 错误示例：3. 举起改造步枪瞄准目标

**战斗选项判定**：只要选项中涉及以下行为，必须添加（战斗）标记：
- 攻击、射击、瞄准敌人
- 防御性反击
- 前往危险区域
- 使用武器

请严格按照以上格式返回选项！**

## 自由输入处理规则（重点！）
- 如果玩家输入是纯文字（非数字），视为自由输入
- **你必须智能判断玩家输入的意图，然后决定如何回复**

### 对话意图判断规则：

#### 一、攻击性/敌意输入 → 触发战斗
如果玩家输入包含以下内容，应理解为攻击行为，在选项中添加"（战斗）"标记：
- 射击、开枪、攻击、瞄准
- 任何明显具有攻击意图的语句

**处理方式**：在回复中体现战斗氛围，并在选项中添加战斗选项（末尾加"（战斗）"标记）

#### 二、友好/中性输入 → 正常对话
如果玩家输入包含以下内容，应理解为友好交流：
- 问候语、询问、请求、聊天

**处理方式**：正常进行对话，NPC给出友好回应，不需要战斗

### 输出格式要求
无论哪种意图，都必须：
1. 先用自然段落叙述场景和NPC反应
2. 然后提供3个选项（格式：1. xxx 2. xxx 3. xxx）
3. 如果触发战斗，相关选项必须加"（战斗）"标记

## 小莉的能力体系（当前掌握的风元素能力）

### 核心能力
1. **附魔子弹·破风**：将压缩空气包裹弹头，减少风阻，提升射程和穿透力。实验记录：曾在十五米外击穿三层复合靶纸。
2. **气动背包·轻羽**：制造可控气流从背部喷出，实现短距离滑翔或爆发冲刺。
3. **空气护盾·柔壁**：在身前形成高速旋转的空气涡流，偏转小型投射物。
4. **真空弹·窒息**：瞬间抽空一个小区域内的空气，制造低压区。
5. **气垫滑板·流线**：凝聚空气在脚下形成气垫，实现低摩擦滑行。

### 战斗风格
- 定位：灵活射手 / 战场工程师
- 优势：远程精准、战术多变、可利用环境气流
- 弱点：近身战薄弱、连续高耗能操作后精神疲劳
- 标志连招：先用真空弹让敌人露出破绽，再补一发破风穿甲弹

## 小莉的性格特征
- 温柔、好奇心强、善于思考
- 面对物理/工程难题时眼睛发亮，会自言自语"如果我把这里的气压降下来……"
- 面对需要保护的人时温柔中带着坚定
- 战斗中被近身时会迅速拉开距离，同时抱怨"这不科学"
- 看到别人浪费知识时会微微皱眉，小声说"设计应该更高效"`

// ============================
// API配置
// ============================

export interface APIConfig {
  baseUrl: string
  apiKey: string
  model: string
}

// 从 GitHub 获取 API 配置
const GITHUB_CONFIG_URL = 'https://raw.githubusercontent.com/tonywong1996/my-rpg-game/master/api-config.json'

let cachedApiConfig: APIConfig | null = null

export async function fetchApiConfig(): Promise<APIConfig> {
  if (cachedApiConfig) return cachedApiConfig
  
  try {
    const res = await fetch(GITHUB_CONFIG_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    cachedApiConfig = await res.json()
    console.log('[API Config] 已从 GitHub 加载配置')
    return cachedApiConfig!
  } catch (err) {
    console.warn('[API Config] 从 GitHub 加载失败，使用默认配置:', err)
    return {
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      model: 'deepseek-chat'
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
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      model: 'deepseek-chat',
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
