import React, { useState } from 'react'
import CharacterPortrait from './CharacterPortrait'
import { useGameStore, CharacterId } from '../store/useGameStore'

interface GameMenuProps {
  onEnterGame: () => void
  onSelectSave: () => void
}

/**
 * 游戏主菜单组件
 * 在封面之后显示，提供"进入游戏"和"存档选择"两个选项
 * 包含角色选择功能 - 两位少女剑修
 */
export default function GameMenu({ onEnterGame, onSelectSave }: GameMenuProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null)
  const setCharacter = useGameStore((state) => state.setCharacter)

  const handleSelectCharacter = (id: CharacterId) => {
    setSelectedCharacter(id)
    setCharacter(id)
  }

  const handleEnterGame = () => {
    if (!selectedCharacter) return
    setCharacter(selectedCharacter)
    onEnterGame()
  }

  const getCharacterName = (id: CharacterId) => {
    return id === 'azurlane_sword' ? '剑 灵 · 无 名' : '灵 剑 · 无 名'
  }

  const getCharacterDescription = (id: CharacterId) => {
    return id === 'azurlane_sword'
      ? '银色短发的少女剑修，翡翠绿眼眸中闪烁着得意的光芒。白色改良道袍融合水手服元素，裙摆流动着浅蓝色阵法图案。'
      : '银白短发的少女剑修，翡翠绿眼眸中透着灵动与狡黠。白色道袍随风飘扬，黑色百褶裙上流转着阵法光芒。'
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 动态渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* 背景光晕 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />

      {/* 装饰性粒子层 */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `pulse ${3 + Math.random() * 4}s infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 菜单内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        {/* 主标题 */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-[0.2em]">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            仙魔录
          </span>
        </h1>

        {/* 副标题 */}
        <p className="text-xs md:text-sm tracking-[0.8em] text-white/40 mb-10">
          仙魔殊途 · 一念成劫
        </p>

        {/* 角色选择区 */}
        <div className="mb-10">
          <p className="text-center text-xs text-white/30 tracking-widest mb-6">
            选 择 你 的 身 份
          </p>
          <div className="flex items-center gap-8 md:gap-16">
            {/* 剑灵·无名 (左) */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => handleSelectCharacter('azurlane_sword')}>
              <div className={`
                relative p-1 rounded-3xl transition-all duration-500
                ${selectedCharacter === 'azurlane_sword'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30 scale-110'
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CharacterPortrait
                  characterId="azurlane_sword"
                  selected={selectedCharacter === 'azurlane_sword'}
                  onClick={() => handleSelectCharacter('azurlane_sword')}
                />
                {selectedCharacter === 'azurlane_sword' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                    已选择
                  </div>
                )}
              </div>
              <p className={`text-sm tracking-wider transition-all duration-300 ${
                selectedCharacter === 'azurlane_sword' ? 'text-white font-semibold' : 'text-white/40'
              }`}>
                剑 灵 · 无 名
              </p>
            </div>

            {/* 灵剑·无名 (右) */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer" onClick={() => handleSelectCharacter('askzyu_sword')}>
              <div className={`
                relative p-1 rounded-3xl transition-all duration-500
                ${selectedCharacter === 'askzyu_sword'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 scale-110'
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CharacterPortrait
                  characterId="askzyu_sword"
                  selected={selectedCharacter === 'askzyu_sword'}
                  onClick={() => handleSelectCharacter('askzyu_sword')}
                />
                {selectedCharacter === 'askzyu_sword' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-full shadow-lg">
                    已选择
                  </div>
                )}
              </div>
              <p className={`text-sm tracking-wider transition-all duration-300 ${
                selectedCharacter === 'askzyu_sword' ? 'text-white font-semibold' : 'text-white/40'
              }`}>
                灵 剑 · 无 名
              </p>
            </div>
          </div>

          {/* 角色描述 */}
          {selectedCharacter && (
            <p className="mt-6 text-xs text-white/50 text-center max-w-md mx-auto leading-relaxed animate-fadeIn backdrop-blur-sm bg-white/5 rounded-2xl p-4">
              {getCharacterDescription(selectedCharacter)}
            </p>
          )}
        </div>

        {/* 菜单按钮组 */}
        <div className="flex flex-col items-center gap-4">
          {/* 进入游戏 - 需选择角色 */}
          <button
            onClick={handleEnterGame}
            disabled={!selectedCharacter}
            className={`
              group relative px-16 py-4 w-72 text-base font-bold tracking-[0.3em] rounded-2xl
              transition-all duration-500 overflow-hidden
              ${selectedCharacter
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'
              }
            `}
          >
            <span className="relative z-10">进入游戏</span>
            {selectedCharacter && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
          </button>

          {/* 存档选择 */}
          <button
            onClick={onSelectSave}
            className="group relative px-16 py-4 w-72 bg-white/5 text-white/60 text-base font-bold tracking-[0.3em] rounded-2xl
                       hover:bg-white/10 hover:text-white/80 hover:scale-105 active:scale-95 transition-all duration-300
                       border border-white/10 hover:border-white/20"
          >
            <span className="relative z-10">存档选择</span>
          </button>
        </div>

        {/* 底部提示 */}
        <p className="absolute bottom-8 text-xs text-white/20 tracking-widest">
          {selectedCharacter ? '✓ 选定身份，踏入修真之路' : '请先选择身份'}
        </p>
      </div>
    </div>
  )
}
