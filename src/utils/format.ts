import Decimal from 'decimal.js'

/**
 * 格式化数字为可读字符串
 * 例如: 1234 -> "1,234", 1234567 -> "123.46万", 123456789 -> "1.23亿"
 */
export function formatNumber(value: Decimal | number | string): string {
  const num = value instanceof Decimal ? value : new Decimal(value)

  if (num.isNaN()) return '0'

  // 数字单位
  const units = [
    { threshold: new Decimal(1e8), suffix: '亿' },
    { threshold: new Decimal(1e4), suffix: '万' },
  ]

  for (const unit of units) {
    if (num.gte(unit.threshold)) {
      const divided = num.div(unit.threshold)
      return `${divided.toDecimalPlaces(2).toString()}${unit.suffix}`
    }
  }

  // 小于1万的数字，千位分隔
  return num.toDecimalPlaces(0).toNumber().toLocaleString('zh-CN')
}

/**
 * 格式化修为显示
 */
export function formatCultivation(value: Decimal | number | string): string {
  const num = value instanceof Decimal ? value : new Decimal(value)
  return formatNumber(num)
}

/**
 * 精度格式化（保留指定位数小数）
 */
export function formatPrecise(value: Decimal | number | string, decimals: number = 4): string {
  const num = value instanceof Decimal ? value : new Decimal(value)
  return num.toDecimalPlaces(decimals).toString()
}

/**
 * 简短格式化（用于快速显示）
 */
export function formatShort(value: Decimal | number | string): string {
  const num = value instanceof Decimal ? value : new Decimal(value)

  if (num.lt(1000)) return num.toDecimalPlaces(0).toString()

  const units = ['', '千', '万', '亿', '兆']
  const thousand = new Decimal(1000)
  let unitIndex = 0
  let temp = num

  while (temp.gte(thousand) && unitIndex < units.length - 1) {
    temp = temp.div(thousand)
    unitIndex++
  }

  return `${temp.toDecimalPlaces(unitIndex > 0 ? 2 : 0)}${units[unitIndex]}`
}
