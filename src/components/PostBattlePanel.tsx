import React from 'react'
import { useGameStore, ALL_EQUIPMENT, ALL_MONSTERS, Equipment, ShopItem } from '../store/useGameStore'

/**
 * 战后过渡界面组件
 * 显示战斗结果、获得的经验和金币，让玩家选择下一步
 */
export default function PostBattlePanel() {
  const store = useGameStore()
  const { postBattleNarrative, postBattleLoot, playerUnit, cultivation, getPlayerStats } = store
  const gold = useGameStore((state) => state.gold)

  // 获取物品名称（从装备数据中查找或显示原始ID）
  const getItemDisplayName = (itemId: string): string => {
    // 检查是否为装备
    const equipment: Equipment | undefined = ALL_EQUIPMENT.find((e: Equipment) => e.id === itemId)
    if (equipment) return `${equipment.icon} ${equipment.name}`
    
    // 检查是否为消耗品
    const shopItem: ShopItem | undefined = store.shopItems.find((s: ShopItem) => s.id === itemId)
    if (shopItem) return `${shopItem.icon} ${shopItem.name}`
    
    return itemId
  }

  // 处理继续战斗
  const handleContinueBattle = () => {
    // 先添加战利品（修为和金币）
    store.addGold(postBattleLoot.gold)
    store.addCultivation(postBattleLoot.exp)

    // 如果有掉落物品，添加到背包
    const itemCount = postBattleLoot.items.length
    if (itemCount > 0) {
      for (const itemId of postBattleLoot.items) {
        const equipTemplate: Equipment | undefined = ALL_EQUIPMENT.find((e: Equipment) => e.id === itemId)
        if (equipTemplate) {
          store.addItemToInventory({ ...equipTemplate })
        }
      }
    }

    // 恢复玩家状态并继续战斗
    const stats = getPlayerStats()
    useGameStore.setState({
      gameMode: 'battle',
      postBattleNarrative: '',
      postBattleLoot: { exp: 0, gold: 0, items: [] },
      playerUnit: {
        ...store.playerUnit,
        hp: stats.maxHp,
        mp: stats.maxMp,
        maxHp: stats.maxHp,
        maxMp: stats.maxMp,
      },
      enemyUnit: createNewEnemyStoreAware(),
      battleLog: [
        { id: Date.now() + 1, text: '你稍作调息，继续在荒野中前行……', type: 'system', timestamp: Date.now() },
      ],
    })
  }

  // 处理返回村庄
  const handleReturnToVillage = () => {
    // 计算战利品（如果还没有被领取）
    const loot = postBattleLoot

    // 恢复玩家状态
    const stats = getPlayerStats()
    useGameStore.setState({
      gameMode: 'village',
      villageLocation: 'center',
      playerUnit: {
        ...playerUnit,
        hp: stats.maxHp,
        mp: stats.maxMp,
        maxHp: stats.maxHp,
        maxMp: stats.maxMp,
      },
      postBattleNarrative: '',
      postBattleLoot: { exp: 0, gold: 0, items: [] },
    })

    // 添加获得的修为和金币
    store.addGold(loot.gold)
    store.addCultivation(loot.exp)

    // 添加掉落物品到背包
    const itemCount = loot.items.length
    if (itemCount > 0) {
      for (const itemId of loot.items) {
        const equipTemplate: Equipment | undefined = ALL_EQUIPMENT.find((e: Equipment) => e.id === itemId)
        if (equipTemplate) {
          store.addItemToInventory({ ...equipTemplate })
        }
      }
    }

    // 设置返回消息
    let msg = `你回到了青石村，获得了 ${loot.gold} 金币和 ${loot.exp} 点修为！`
    if (itemCount > 0) {
      const itemNames = loot.items.map(id => getItemDisplayName(id)).join('、')
      msg += ` 获得物品：${itemNames}`
    }
    useGameStore.setState({ villageMessage: msg })

    // 3秒后清除消息
    setTimeout(() => {
      useGameStore.setState({ villageMessage: '' })
    }, 3000)
  }

  // 处理继续探索（进入AI叙事模式）
  const handleContinueExplore = () => {
    // 先添加修为和金币
    store.addGold(postBattleLoot.gold)
    store.addCultivation(postBattleLoot.exp)

    // 添加掉落物品
    const itemCount = postBattleLoot.items.length
    if (itemCount > 0) {
      for (const itemId of postBattleLoot.items) {
        const equipTemplate: Equipment | undefined = ALL_EQUIPMENT.find((e: Equipment) => e.id === itemId)
        if (equipTemplate) {
          store.addItemToInventory({ ...equipTemplate })
        }
      }
    }

    // 重置战后状态 + 重置AI故事状态以便触发重新初始化获取故事叙述
    useGameStore.setState({
      postBattleNarrative: '',
      postBattleLoot: { exp: 0, gold: 0, items: [] },
      aiStoryInitialized: false,
      aiStoryHistory: [],
      aiNPCs: [],
    })

    // 设置消息并触发切换到AI故事模式
    useGameStore.setState({ villageMessage: '你收起战利品，继续深入荒野探索...' })

    // 触发进入 AI 故事模式的自定义事件
    const navigateToAIStory = new CustomEvent('navigate-to-ai-story')
    window.dispatchEvent(navigateToAIStory)
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a12]">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12121c] border-b border-[#2a2a3a]">
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6a6a8a]">⚔️ 战斗胜利</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#4a9a6a]">修为: {cultivation.toString()}</span>
          <span className="text-[#c4a86a]">金币: {gold}</span>
          <span className="text-[#6a8aca]">HP: {playerUnit.hp}/{playerUnit.maxHp}</span>
          <span className="text-[#8a6aca]">MP: {playerUnit.mp}/{playerUnit.maxMp}</span>
        </div>
      </div>

      {/* 战后叙述内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-[#1a1a2a] rounded-xl border border-[#2a4a3a] p-6 mb-4">
          <h2 className="text-lg font-bold text-[#c4a86a] mb-4 flex items-center gap-2">
            <span>🎉</span>
            <span>战斗胜利</span>
          </h2>
          
          <div className="prose prose-invert">
            {postBattleNarrative.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-[#c4b896] leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* 战利品展示 */}
        <div className="bg-[#1a1a2a] rounded-xl border border-[#2a4a3a] p-4 mb-4">
          <h3 className="text-sm font-bold text-[#c4a86a] mb-3">📦 获得奖励</h3>
          <div className="flex flex-wrap gap-3">
            {/* 修为 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0a2a1a] rounded-lg border border-[#2a4a2a]">
              <span className="text-lg">✨</span>
              <span className="text-[#4a9a6a] font-medium">+{postBattleLoot.exp} 修为</span>
            </div>
            {/* 金币 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a0a] rounded-lg border border-[#4a4a2a]">
              <span className="text-lg">💰</span>
              <span className="text-[#c4a86a] font-medium">+{postBattleLoot.gold} 金币</span>
            </div>
            {/* 掉落物品 */}
            {postBattleLoot.items.length > 0 && (
              postBattleLoot.items.map((itemId, index) => (
                <div
                  key={`${itemId}-${index}`}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1a0a2e] rounded-lg border border-[#3a1a4a]"
                >
                  <span className="text-lg">🎒</span>
                  <span className="text-[#c47ac4] font-medium">{getItemDisplayName(itemId)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex-shrink-0 p-4 bg-[#12121c] border-t border-[#2a2a3a]">
        <div className="grid grid-cols-3 gap-3">
          {/* 继续战斗 */}
          <button
            onClick={handleContinueBattle}
            className="flex flex-col items-center gap-1 p-4 bg-gradient-to-b from-[#e94560] to-[#d63851] 
                       rounded-xl text-white hover:from-[#ff5566] hover:to-[#e94560] 
                       active:scale-95 transition-all duration-150 shadow-lg shadow-[#e94560]/20"
          >
            <span className="text-2xl">⚔️</span>
            <span className="text-xs font-bold">继续战斗</span>
            <span className="text-[10px] opacity-70">领取奖励继续挑战</span>
          </button>

          {/* 继续探索 */}
          <button
            onClick={handleContinueExplore}
            className="flex flex-col items-center gap-1 p-4 bg-gradient-to-b from-[#2a4a6a] to-[#1a3a5a] 
                       rounded-xl text-white hover:from-[#3a5a7a] hover:to-[#2a4a6a] 
                       active:scale-95 transition-all duration-150 shadow-lg shadow-[#3a8ac4]/20"
          >
            <span className="text-2xl">🌲</span>
            <span className="text-xs font-bold">继续探索</span>
            <span className="text-[10px] opacity-70">领取奖励深入荒野</span>
          </button>

          {/* 返回村庄 */}
          <button
            onClick={handleReturnToVillage}
            className="flex flex-col items-center gap-1 p-4 bg-gradient-to-b from-[#2a5a3a] to-[#1a4a2a] 
                       rounded-xl text-white hover:from-[#3a6a4a] hover:to-[#2a5a3a] 
                       active:scale-95 transition-all duration-150 shadow-lg shadow-[#2a4a3a]/20"
          >
            <span className="text-2xl">🏘️</span>
            <span className="text-xs font-bold">返回村庄</span>
            <span className="text-[10px] opacity-70">领取奖励回村休整</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// 从 store 的 ALL_MONSTERS 创建敌人（复用数据避免重复定义）
function createNewEnemyStoreAware() {
  const state = useGameStore.getState()
  const playerLevel = state.playerUnit.level || 1

  // 使用与 store 中 createEnemyUnit 相同的逻辑
  const monsters = ALL_MONSTERS

  // 根据玩家等级选择合适范围的怪物
  const maxIndex = Math.min(playerLevel + 1, monsters.length - 1)
  const idx = Math.floor(Math.random() * Math.min(maxIndex + 1, monsters.length))
  const template = monsters[idx]

  return {
    id: 'enemy_' + Date.now(),
    name: template.name,
    characterId: 'azurlane_sword' as const,
    hp: template.hp + Math.floor(Math.random() * 20),
    maxHp: template.hp + Math.floor(Math.random() * 20),
    mp: template.mp,
    maxMp: template.mp,
    level: template.level,
    attack: template.attack,
    defense: template.defense,
    isEnemy: true,
    icon: template.icon,
  }
}
