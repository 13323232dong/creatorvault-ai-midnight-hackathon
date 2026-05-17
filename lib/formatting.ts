// 把数字格式化成美元，用于 UI 展示。
// 这只是前端显示格式，不改变真实计算值。
export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value)
}

// 钱包地址通常很长，页面上直接展示会影响可读性。
// 这里保留开头 6 位和结尾 4 位，例如 0xA11C...0000。
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
