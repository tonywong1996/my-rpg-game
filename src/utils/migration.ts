/**
 * 版本迁移系统
 * 用于处理 localStorage 中存档数据的版本升级
 */

import Decimal from 'decimal.js'

const CURRENT_VERSION = 2

interface GameSaveData {
  version: number
  cultivation: string
  [key: string]: unknown
}

/**
 * 执行版本迁移
 */
export function migrateSaveData(data: Record<string, unknown>): GameSaveData {
  let version = (data.version as number) || 0

  // 从旧版本逐步迁移到新版本
  if (version < 1) {
    data = migrateV0ToV1(data)
    version = 1
  }

  // v1 -> v2: zustand persist 默认以 { state: {...}, version: N } 格式存储
  // 确保关键字段完整
  if (version < 2) {
    data = migrateV1ToV2(data)
    version = 2
  }

  return data as unknown as GameSaveData
}

/**
 * v0 -> v1: 初始化版本号，确保 cultivation 为 Decimal 字符串格式
 */
function migrateV0ToV1(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data }

  // 确保有版本号
  result.version = 1

  // 确保 cultivation 存在且为有效数字字符串
  if (!result.cultivation) {
    result.cultivation = new Decimal(0).toString()
  } else {
    try {
      const val = new Decimal(result.cultivation as string)
      result.cultivation = val.toString()
    } catch {
      result.cultivation = new Decimal(0).toString()
    }
  }

  return result
}

/**
 * v1 -> v2: zustand persist 的 migrate 回调返回整个 state 对象
 * 不需要特殊的转换，只需确保 version 设置为 2
 */
function migrateV1ToV2(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data }
  result.version = 2

  // 确保 cultivation 字段存在
  if (!result.cultivation) {
    result.cultivation = new Decimal(0).toString()
  } else {
    try {
      const val = new Decimal(result.cultivation as string)
      result.cultivation = val.toString()
    } catch {
      result.cultivation = new Decimal(0).toString()
    }
  }

  // 确保 gameMode 等关键字段存在默认值
  if (!result.gameMode) {
    result.gameMode = 'village'
  }
  if (!result.gold) {
    result.gold = 100
  }
  if (!result.currentTab) {
    result.currentTab = 'system'
  }
  if (!result.villageLocation) {
    result.villageLocation = 'center'
  }

  return result
}

/**
 * 获取当前存档版本
 */
export function getCurrentVersion(): number {
  return CURRENT_VERSION
}

/**
 * 加载存档并进行版本迁移
 * 兼容 zustand persist 的 migrate 回调签名 (persistedState, version) => GameState
 */
export function loadWithMigration(persistedState: unknown, version?: number): unknown {
  // 如果传入的是 persistedState + version 格式 (zustand persist migrate 回调)
  if (version !== undefined) {
    const data = persistedState as Record<string, unknown>
    data.version = version
    return migrateSaveData(data)
  }

  // 旧式调用: (storageKey) => GameSaveData
  try {
    const storageKey = persistedState as string
    const raw = localStorage.getItem(storageKey)
    if (!raw) {
      return {
        version: CURRENT_VERSION,
        cultivation: new Decimal(0).toString(),
      }
    }

    const data = JSON.parse(raw) as Record<string, unknown>
    const migrated = migrateSaveData(data)
    return migrated
  } catch {
    return {
      version: CURRENT_VERSION,
      cultivation: new Decimal(0).toString(),
    }
  }
}
