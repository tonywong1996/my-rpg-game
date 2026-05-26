// 清除旧版localStorage持久化数据，确保技能解锁等新配置生效
const STORAGE_KEY = 'my-rpg-game-save'
try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const data = JSON.parse(raw)
    // 如果版本低于当前版本，则清除旧存档重新开始
    if (typeof data === 'object' && data !== null) {
      const version = (data as { version?: number }).version ?? 0
      if (version < 2) {
        localStorage.removeItem(STORAGE_KEY)
        console.log('[main] 旧版存档已清除，使用全新游戏数据')
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
} catch {
  // 解析失败则清除
  localStorage.removeItem(STORAGE_KEY)
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
