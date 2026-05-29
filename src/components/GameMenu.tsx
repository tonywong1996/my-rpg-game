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
    if (id === 'xiaoli') return '小 莉'
    if (id === 'xiaoke') return '小 可'
    return id === 'azurlane_sword' ? '剑 灵 · 无 名' : '灵 剑 · 无 名'
  }

  const getCharacterDescription = (id: CharacterId) => {
    if (id === 'xiaoli') {
      return '银发温柔的射击少女。就读于普通高中，家境一般但成绩优异，是班里的学霸。性格温柔好奇，对新鲜事物充满热情。从小跟着父亲在靶场练出了一手好枪法（射击技术 8/10）。梦想用双手保护重要的人。'
    }
    if (id === 'xiaoke') {
      return '蓝色短发的温柔大哥哥。中等家庭出身，从小就爱钻研机械，拆装各种装置。根据父亲设计的机械模型，经过多年改良，打造出了独一无二的千机伞——能变幻刀、盾、枪等多种形态。平时呆呆的不爱说话，但一到战斗中就会变得异常爆裂，喜欢贴身近战，令人难以招架。'
    }
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
      <div className="relative z-10 flex flex-col items-center w-full h-full px-4 pt-14 md:pt-20">
        {/* 主标题 */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-[0.2em]">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            仙魔录
          </span>
        </h1>

        {/* 副标题 */}
        <p className="text-xs md:text-sm tracking-[0.8em] text-white/40 mb-8 md:mb-10">
          仙魔殊途 · 一念成劫
        </p>

        {/* 角色选择区 */}
        <div>
          <p className="text-center text-xs text-white/30 tracking-widest mb-6">
            选 择 你 的 身 份
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {/* 小莉 (左) */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer flex-shrink-0" onClick={() => handleSelectCharacter('xiaoli')}>
              <div className={`
                relative p-1 rounded-3xl transition-all duration-500
                ${selectedCharacter === 'xiaoli'
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 shadow-lg shadow-pink-500/30'
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-400/20 to-rose-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CharacterPortrait
                  characterId="xiaoli"
                  selected={selectedCharacter === 'xiaoli'}
                  onClick={() => handleSelectCharacter('xiaoli')}
                />
              </div>
              <p className={`text-sm tracking-wider transition-all duration-300 ${
                selectedCharacter === 'xiaoli' ? 'text-white font-semibold' : 'text-white/40'
              }`}>
                小 莉
              </p>
            </div>

            {/* 小可 (右) */}
            <div className="flex flex-col items-center gap-3 group cursor-pointer flex-shrink-0" onClick={() => handleSelectCharacter('xiaoke')}>
              <div className={`
                relative p-1 rounded-3xl transition-all duration-500
                ${selectedCharacter === 'xiaoke'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-500 shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CharacterPortrait
                  characterId="xiaoke"
                  selected={selectedCharacter === 'xiaoke'}
                  onClick={() => handleSelectCharacter('xiaoke')}
                />
              </div>
              <p className={`text-sm tracking-wider transition-all duration-300 ${
                selectedCharacter === 'xiaoke' ? 'text-white font-semibold' : 'text-white/40'
              }`}>
                小 可
              </p>
            </div>
          </div>

          {/* 角色描述 - 固定占位，不撑开布局 */}
          <div className="mt-6 min-h-[80px] w-full max-w-md mx-auto">
            {selectedCharacter ? (
              <p className="text-xs text-white/50 text-center leading-relaxed animate-fadeIn backdrop-blur-sm bg-white/5 rounded-2xl p-4">
                {getCharacterDescription(selectedCharacter)}
              </p>
            ) : (
              <p className="text-xs text-white/20 text-center leading-relaxed p-4">
                点击角色查看介绍
              </p>
            )}
          </div>
        </div>

        {/* 菜单按钮组 */}
        <div className="flex flex-col items-center gap-4 mt-auto pb-16">
          {/* 进入游戏 - 需选择角色 */}
          <button
            onClick={handleEnterGame}
            disabled={!selectedCharacter}
            className={`
              group relative px-16 py-4 w-72 text-base font-bold tracking-[0.3em] rounded-2xl
              transition-all duration-500 overflow-hidden
              ${selectedCharacter
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 shadow-xl shadow-purple-500/25 hover:shadow-purple-400/40 hover:scale-105 active:scale-95 border border-white/20'
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
            className="group relative px-16 py-4 w-72 text-base font-bold tracking-[0.3em] rounded-2xl
                       bg-white/5 text-white/60 border border-white/10
                       hover:bg-white/10 hover:text-white/80 hover:border-purple-400/40 hover:scale-105 active:scale-95 
                       transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">存档选择</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
