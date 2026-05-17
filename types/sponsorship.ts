// SponsorshipRecord 是一条赞助/收入记录。
// 这是 proof 的原始输入之一，真实隐私项目里它属于敏感数据。
export type SponsorshipRecord = {
  // 记录 ID。
  id: string
  // 赞助方显示名称。私密赞助时不应该公开展示真实名称。
  sponsorLabel: string
  // 赞助方钱包地址，可选。真实业务里这往往是敏感关联信息。
  sponsorAddress?: string
  // 赞助金额，当前 MVP 统一换算成美元方便演示。
  amountUsd: number
  // 是否私密。true 表示公开报告隐藏身份和具体金额。
  isPrivate: boolean
  // 创建日期。
  createdAt: string
}
