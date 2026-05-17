# CreatorVault AI Privacy Edition - 需求文档

更新时间：2026-05-07

## 1. 项目目标

CreatorVault AI Privacy Edition 是一个面向创作者的隐私收入证明产品。

它帮助创作者向品牌方、DAO、社区或合作伙伴证明：

- 自己有真实收入
- 自己有真实支持者
- 自己满足某个收入/影响力门槛

同时不暴露：

- 每个赞助人是谁
- 每笔赞助金额
- 完整收入流水
- 私密客户/品牌合作关系

## 2. 目标用户

### 2.1 创作者

包括：

- 内容创作者
- 独立开发者
- 开源维护者
- DAO 贡献者
- 自由职业者
- Web3 KOL

需求：

- 证明自己的收入能力
- 获取品牌合作
- 向社区证明资金透明
- 保护赞助人和客户隐私

### 2.2 品牌方 / 赞助方

需求：

- 判断创作者是否有真实影响力
- 判断是否值得合作
- 不需要看到全部隐私数据，只需要可信结论

### 2.3 社区 / DAO

需求：

- 了解创作者或贡献者是否满足资助条件
- 验证收入/支持者门槛
- 避免过度披露个人收入明细

## 3. 核心用户故事

### Story 1：创作者生成收入证明

作为创作者 Alice，
我想证明我过去 30 天收入超过 1000 美元，
但不想公开每个赞助人和每笔金额，
这样我可以安全地向品牌方申请合作。

验收标准：

- 页面显示 Alice 的公开资料。
- 页面显示证明条件：monthly income >= 1000。
- 页面显示证明结果：passed。
- 页面不展示完整收入流水。
- 页面明确标注哪些数据是 private，哪些数据是 disclosed。

### Story 2：品牌方查看证明报告

作为品牌方，
我想快速查看创作者是否满足合作条件，
但不需要看到创作者完整收入明细。

验收标准：

- 品牌方能看到公开证明卡片。
- 品牌方能看到 AI 生成的摘要报告。
- 品牌方能看到报告周期、门槛、证明结果。
- 品牌方看不到每笔赞助明细。

### Story 3：赞助人选择隐私赞助

作为赞助人，
我想支持创作者，
但不希望我的身份和具体金额被公开展示。

验收标准：

- 赞助入口提供 public / private sponsorship 的概念选择。
- private 模式下，UI 不在公开明细中展示赞助人地址和确切金额。
- 报告只展示聚合数据或证明结果。

### Story 4：AI 生成隐私友好报告

作为创作者，
我想让 AI 根据公开证明结果生成一份适合分享的收入报告，
不泄露私密明细。

验收标准：

- AI 报告包含收入门槛、支持者规模、增长趋势等摘要。
- AI 报告不包含单笔收入细节。
- AI 报告可以用于品牌合作/社区更新/DAO grant 申请。

## 4. MVP 功能需求

### 4.1 首页 Dashboard

必须包含：

- 项目标题
- 一句话价值主张
- 创作者收入证明卡片
- public data / private data 对比
- AI report 入口

第一屏文案建议：

```text
Prove creator income without exposing private sponsor data.
```

副文案：

```text
CreatorVault AI helps creators generate verifiable income reports while keeping sponsor identities, exact payments, and private revenue ledgers protected.
```

### 4.2 Creator Profile

展示：

- 创作者名称
- 创作者类别
- 报告周期
- 公开证明状态
- 收入阈值
- 支持者阈值

示例：

```text
Creator: Alice
Period: April 2026
Proof: Monthly income >= $1,000
Status: Verified
```

### 4.3 Proof Card

证明卡片必须展示：

- Claim
- Threshold
- Period
- Result
- Proof status
- Timestamp

示例：

```text
Claim: Monthly creator revenue is above $1,000
Result: Passed
Disclosed: threshold, period, result
Hidden: sponsor list, exact amounts, full ledger
```

### 4.4 Private / Public Data Panel

必须清楚分区：

Private Data：

- Sponsor identities
- Individual payment amounts
- Full revenue ledger
- Private brand relationships

Disclosed Data：

- Revenue threshold result
- Supporter count range
- Report period
- Verification status

### 4.5 Sponsor Flow

MVP 可以先做模拟流程。

包含：

- 输入赞助金额
- 选择 public / private
- 生成一条赞助记录
- 更新聚合收入
- 不在 private 模式下展示完整明细

如果接 EVM 原型：

- 使用钱包连接
- 使用测试 ERC20 / ETH
- 记录 event / receipt

### 4.6 AI Summary

生成三类文本：

1. Creator income report
2. Brand partnership summary
3. DAO grant summary

MVP 可以先用 mock 数据生成 deterministic 文本。

示例输出：

```text
Alice has verified that her creator revenue exceeded the selected threshold during April 2026. The report confirms consistent supporter activity while preserving individual sponsor privacy.
```

### 4.7 Architecture Page

必须解释：

- 为什么普通公开链不够
- Midnight / ZK 的价值
- private inputs 是什么
- disclosed outputs 是什么
- 当前 demo 哪些是 mock
- 后续如何迁移到 Compact

## 5. Midnight / ZK 需求

### 5.1 概念映射

Private inputs：

```text
收入明细
赞助人身份
每笔金额
完整流水
```

Proof：

```text
sum(income_records) >= threshold
supporter_count >= target
```

Public outputs：

```text
threshold
period
passed / failed
proof timestamp
```

### 5.2 Compact 方向伪代码

实际语法后续根据 Midnight docs 修正。

```text
circuit proveIncomeAboveThreshold(privateLedger, threshold) {
  total = sum(privateLedger)
  assert(total >= threshold)
  disclose(threshold)
  disclose(true)
}
```

### 5.3 验收标准

至少满足其一：

1. 跑通 Midnight / Compact 最小样例。
2. 提供清晰的 Compact 伪代码和架构映射。
3. 前端完整展示 private input -> proof -> disclosed result 的流程。

## 6. 非功能需求

### 6.1 可演示性

- 评委 3 分钟内能看懂。
- 首页 5 秒内能知道项目解决什么问题。
- Demo 不依赖复杂账号配置。
- 提供 mock/demo mode。

### 6.2 可部署性

- 可部署到自有服务器。
- 推荐域名：`creatorvault.ohmycode.cc`
- 不影响 `ohmycode.cc` 上现有项目。
- 前端优先静态部署。

### 6.3 安全性

- 不提交私钥。
- 不提交服务器密码。
- 不提交 API key。
- `.env` 不进 GitHub。
- 钱包交互只用测试网或本地链。

### 6.4 文档性

README 必须包括：

- 项目简介
- 问题背景
- 解决方案
- 隐私设计
- 技术栈
- 本地运行
- Demo 链接
- 截图
- 黑客松期间完成内容
- 未来计划

## 7. 页面清单

MVP 页面：

1. `/`
   - Dashboard
   - Proof card
   - AI summary preview

2. `/sponsor`
   - Sponsorship flow
   - public/private mode

3. `/report`
   - AI-generated report
   - privacy-preserving public summary

4. `/architecture`
   - public/private/proof explanation
   - Midnight integration plan

可选页面：

5. `/demo`
   - 一键演示流程

6. `/creator/alice`
   - 创作者公开页面

## 8. 数据模型

### Creator

```ts
type Creator = {
  id: string
  name: string
  category: string
  walletAddress?: string
  reportPeriod: string
}
```

### PrivateSponsorshipRecord

```ts
type PrivateSponsorshipRecord = {
  id: string
  sponsorAlias: string
  amount: number
  isPrivate: boolean
  timestamp: string
}
```

注意：

MVP 中这类数据可以只存在前端 demo state，不公开展示完整明细。

### ProofClaim

```ts
type ProofClaim = {
  claim: string
  threshold: number
  period: string
  result: "passed" | "failed"
  disclosedFields: string[]
  hiddenFields: string[]
}
```

### AIReport

```ts
type AIReport = {
  title: string
  summary: string
  audience: "brand" | "dao" | "community"
  generatedAt: string
}
```

## 9. 开发优先级

P0：

- 首页
- Proof Card
- Private/Public Data Panel
- AI Summary Mock
- Architecture Page
- README

P1：

- Sponsor Flow
- Demo mode
- EVM prototype integration
- Receipt/event display

P2：

- Midnight / Compact minimal example
- Wallet integration
- Server deployment
- Demo video

P3：

- Real AI API
- Real ZK proof generation
- Multi-creator support
- DAO grant flow

## 10. 验收清单

项目提交前必须检查：

- 页面可打开。
- 移动端布局不崩。
- 首页第一屏能说明价值。
- Demo 流程 3 分钟内可演示。
- README 完整。
- GitHub repo 有清晰 commit。
- Demo URL 可访问。
- 没有提交敏感信息。
- 项目明确贴合 Midnight privacy / ZK / data control 主题。

## 11. 不做事项

本次黑客松不做：

- 完整创作者平台
- 真实支付系统
- 主网上线
- 复杂 DAO 治理
- 复杂 ZK 数学解释
- 多链部署
- 生产级安全审计

原因：

```text
黑客松最重要是小而完整、主题明确、Demo 能跑。
```

