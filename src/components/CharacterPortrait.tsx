import React from 'react'
import { CharacterId } from '../store/useGameStore'
import azurlaneSwordImage from '../../assets/images/char_azurlane_sword_001.png'
import askzyuSwordImage from '../../assets/images/char_askzyu_sword_001.png'
import xiaoliImage from '../assets/images/char_xiaoli_001.jpg'
import xiaokeImage from '../assets/images/char_xiaoke_001.jpg'

interface CharacterPortraitProps {
  characterId: CharacterId
  selected?: boolean
  onClick?: () => void
}

/**
 * 角色头像组件
 * 根据 characterId 显示对应的角色立绘
 *
 * - azurlane_sword: Azur Lane风格少女剑修立绘
 * - askzyu_sword: Askzyu风格少女剑修立绘
 * - xiaoli: 温柔大姐姐 小莉
 */
export default function CharacterPortrait({ characterId, selected, onClick }: CharacterPortraitProps) {
  let imageSrc
  let altText
  let titleText

  if (characterId === 'azurlane_sword') {
    imageSrc = azurlaneSwordImage
    altText = '剑修·无名'
    titleText = '剑 修'
  } else if (characterId === 'xiaoli') {
    imageSrc = xiaoliImage
    altText = '小 莉'
    titleText = '风 引 者'
  } else if (characterId === 'xiaoke') {
    imageSrc = xiaokeImage
    altText = '小 可'
    titleText = '千 机 士'
  } else {
    imageSrc = askzyuSwordImage
    altText = '灵剑士·无名'
    titleText = '灵 剑 士'
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden cursor-pointer
        transition-all duration-300 group
        ${selected 
          ? 'ring-2 ring-[#3a8ac4] shadow-lg shadow-[#3a8ac4]/30' 
          : 'ring-2 ring-transparent hover:ring-[#3a8ac4]/50'
        }
      `}
    >
      {/* 角色立绘 */}
      <img
        src={imageSrc}
        alt={altText}
        className="w-full h-full object-cover"
        style={{ imageRendering: 'auto' }}
      />

      {/* 角色名叠加 */}
      <div className={`
        absolute bottom-0 left-0 right-0 py-1 px-2 text-center text-[8px] tracking-wider
        transition-all duration-300
        ${selected 
          ? 'bg-[#0d2818]/80 text-[#f5f0c4]' 
          : 'bg-black/60 text-[#a0a0b0]/70'
        }
      `}>
        {titleText}
      </div>

      {/* 悬停遮罩 */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

      {/* 选中指示器 */}
      {selected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-[#3a8ac4] rounded-full 
                        shadow-lg shadow-[#3a8ac4]/50" />
      )}
    </div>
  )
}
