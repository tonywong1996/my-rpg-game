import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import Decimal from 'decimal.js'

/**
 * 游戏引擎 Hook
 * 管理全局 Tick 心跳逻辑
 * 
 * 每秒自动增加修为
 */
export function useGameEngine() {
  const addCultivation = useGameStore((state) => state.addCultivation)
  const cultivation = useGameStore((state) => state.cultivation)

  // 每秒修为增长量
  const cultivationPerTick = new Decimal(1)

  // 使用 ref 防止 useEffect 重复执行
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // 每秒心跳，自动增加修为
    intervalRef.current = setInterval(() => {
      addCultivation(cultivationPerTick)
    }, 1000)

    // 清理定时器
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [addCultivation])

  return {
    cultivation,
  }
}
