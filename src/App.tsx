import { useState, useEffect } from 'react'
import { useGameStore } from './store/useGameStore'
import { useGameEngine } from './engine/useGameEngine'
import GameCover from './components/GameCover'
import GameMenu from './components/GameMenu'
import SaveSelect from './components/SaveSelect'
import BattleScene from './components/BattleScene'
import TextLog from './components/TextLog'
import NavigationBar from './components/NavigationBar'
import TabPanels from './components/TabPanels'
import VillageScene from './components/VillageScene'
import ShopPanel from './components/ShopPanel'
import QuestCenterPanel from './components/QuestCenterPanel'
import NPCPanel from './components/NPCPanel'
import SmithyPanel from './components/SmithyPanel'
import AIStoryPanel from './components/AIStoryPanel'
import PostBattlePanel from './components/PostBattlePanel'

type Screen = 'cover' | 'menu' | 'game' | 'saveSelect' | 'aiStory'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('cover')
  
  // 启动游戏引擎（始终运行）
  useGameEngine()

  // 监听导航到 AI 故事模式的事件
  useEffect(() => {
    const handleNavigateToAIStory = () => {
      setCurrentScreen('aiStory')
    }
    
    // 监听从 AI 故事模式切换到游戏界面的事件（战斗触发时）
    const handleNavigateToGame = () => {
      setCurrentScreen('game')
    }
    
    window.addEventListener('navigate-to-ai-story', handleNavigateToAIStory)
    window.addEventListener('navigate-to-game', handleNavigateToGame)
    
    return () => {
      window.removeEventListener('navigate-to-ai-story', handleNavigateToAIStory)
      window.removeEventListener('navigate-to-game', handleNavigateToGame)
    }
  }, [])

  // 从 store 获取状态
  const gameMode = useGameStore((state) => state.gameMode)
  const villageLocation = useGameStore((state) => state.villageLocation)
  const villageMessage = useGameStore((state) => state.villageMessage)
  const currentTab = useGameStore((state) => state.currentTab)
  const attack = useGameStore((state) => state.attack)
  const useSkill = useGameStore((state) => state.useSkill)
  const returnToVillage = useGameStore((state) => state.returnToVillage)
  const goToBattle = useGameStore((state) => state.goToBattle)
  const skills = useGameStore((state) => state.skills)
  const playerUnit = useGameStore((state) => state.playerUnit)

  // 点击封面 → 进入菜单
  const handleCoverClick = () => {
    setCurrentScreen('menu')
  }

  // 菜单 - 进入游戏（返回Village模式）
  const handleEnterGame = () => {
    setCurrentScreen('game')
  }

  // 菜单 - 打开存档选择
  const handleSelectSave = () => {
    setCurrentScreen('saveSelect')
  }

  // 存档选择 - 加载存档进入游戏
  const handleLoadSave = () => {
    setCurrentScreen('game')
  }

  // 存档选择 - 返回菜单
  const handleCloseSave = () => {
    setCurrentScreen('menu')
  }

  // 游戏主界面 - 返回菜单
  const handleBackToMenu = () => {
    setCurrentScreen('menu')
  }

  // 封面模式
  if (currentScreen === 'cover') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <GameCover />
        
        {/* 开始按钮 - 点击进入菜单 */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <button
            onClick={handleCoverClick}
            className="px-8 py-2.5 bg-[#3a8ac4] text-white text-base font-bold rounded-lg 
                       hover:bg-[#4a9ad4] active:scale-95 transition-all 
                       shadow-lg shadow-[#3a8ac4]/30 tracking-[0.3em] ml-2"
            style={{ imageRendering: 'pixelated' }}
          >
            踏入修真
          </button>
          <p className="text-[10px] text-[#f5f0c4]/40 tracking-widest">
            点击进入 · 一念成劫
          </p>
        </div>
      </div>
    )
  }

  // 游戏主菜单
  if (currentScreen === 'menu') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <GameMenu
          onEnterGame={handleEnterGame}
          onSelectSave={handleSelectSave}
        />
      </div>
    )
  }

  // 存档选择弹窗（在菜单之上）
  if (currentScreen === 'saveSelect') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <GameMenu
          onEnterGame={handleEnterGame}
          onSelectSave={handleSelectSave}
        />
        <SaveSelect
          onClose={handleCloseSave}
          onLoadSave={handleLoadSave}
        />
      </div>
    )
  }

  // AI故事模式
  if (currentScreen === 'aiStory') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <AIStoryPanel onBack={handleBackToMenu} />
      </div>
    )
  }

  // ============ 游戏主界面 ============
  // 根据 gameMode 切换显示新手村或战斗场景
  
  const showTabContent = currentTab !== 'system'

  // 新手村模式
  if (gameMode === 'village') {
    return (
      <div className="relative w-full h-screen bg-[#0f0f1a] overflow-hidden">
        {/* 新手村场景 */}
        <VillageScene />

        {/* 顶部返回菜单按钮 */}
        <button
          onClick={handleBackToMenu}
          className="absolute top-1 left-2 z-20 px-2 py-1 bg-[#0a0a1a]/60 text-[#a0a0b0] text-[10px] rounded-md
                     border border-[#1a1a3a] hover:bg-[#1a1a2e] hover:text-[#f5f0c4] transition-all duration-200"
        >
          ← 菜单
        </button>

        {/* 返回村庄提示消息 */}
        {villageMessage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 animate-fade-in-out">
            <div className="px-6 py-3 bg-[#0a2a1a]/90 backdrop-blur-sm rounded-xl border border-[#2a4a2a]/50 shadow-lg shadow-[#2a4a2a]/10">
              <p className="text-sm text-[#4a8a4a] font-bold text-center tracking-wider whitespace-nowrap">
                {villageMessage}
              </p>
            </div>
          </div>
        )}

        {/* 商店面板 */}
        {villageLocation === 'shop' && <ShopPanel />}

        {/* 任务中心面板 */}
        {villageLocation === 'quest_center' && <QuestCenterPanel />}

        {/* 装备铺面板 */}
        {villageLocation === 'smithy' && <SmithyPanel />}

        {/* NPC对话面板 */}
        {villageLocation === 'npc' && <NPCPanel />}
      </div>
    )
  }

  // 战斗模式（原有的战斗界面）
  if (gameMode === 'battle') {
    return (
      <div className="flex flex-col w-full h-screen bg-[#0f0f1a] overflow-hidden">
        {/* 上半部分 - 战斗场景 */}
        <div className="relative h-[50vh] min-h-[280px] flex-shrink-0">
          <BattleScene />
          
          {/* 返回按钮 - 悬浮在左上角 */}
          <button
            onClick={handleBackToMenu}
            className="absolute top-2 left-2 z-20 px-3 py-1.5 bg-[#0a0a1a]/80 text-[#a0a0b0] text-xs rounded-lg
                       border border-[#1a1a3a] hover:bg-[#1a1a2e] hover:text-[#f5f0c4] transition-all duration-200"
          >
            ← 返回菜单
          </button>
        </div>

        {/* 下半部分 - 战斗日志 / 面板 */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0f0f1a]">
          {/* 日志区域或面板内容 */}
          {showTabContent ? <TabPanels /> : <TextLog />}

          {/* 底部操作栏 - 面板切换 + 回村 */}
          <div className="flex-shrink-0 px-3 py-2 bg-[#0a0a1a] border-t border-[#1a1a3a]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => useGameStore.getState().setTab('system')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
                           ${showTabContent
                             ? 'bg-[#1a1a2e] text-[#3a8ac4] border-[#3a8ac4]/30 hover:bg-[#16213e]'
                             : 'bg-[#16213e]/50 text-[#a0a0b0]/50 border-[#1a1a3a]'
                           }`}
              >
                面板
              </button>
              <div className="flex-1" />
              <button
                onClick={returnToVillage}
                className="px-3 py-2 rounded-lg text-[10px] text-[#4a8a4a] border border-[#2a4a2a]/50 
                           bg-[#0a1a0a]/50 hover:bg-[#0a2a1a] hover:text-[#6aaa6a] transition-all duration-200"
              >
                🏘 回村休整
              </button>
            </div>
          </div>

          {/* 底部导航栏 */}
          <NavigationBar />
        </div>
      </div>
    )
  }

  // 战后过渡界面
  if (gameMode === 'postBattle') {
    return (
      <div className="relative w-full h-screen bg-[#0f0f1a] overflow-hidden">
        <PostBattlePanel />
        
        {/* 返回按钮 - 悬浮在左上角 */}
        <button
          onClick={handleBackToMenu}
          className="absolute top-2 left-2 z-20 px-3 py-1.5 bg-[#0a0a1a]/80 text-[#a0a0b0] text-xs rounded-lg
                     border border-[#1a1a3a] hover:bg-[#1a1a2e] hover:text-[#f5f0c4] transition-all duration-200"
        >
          ← 返回菜单
        </button>
      </div>
    )
  }

  // 默认返回村庄
  return null
}

export default App
