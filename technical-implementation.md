# CreatorVault AI Privacy Edition - 技术实现文档

更新时间：2026-05-16

## 1. 技术实现目标

本项目要实现一个可演示的隐私收入证明 DApp。

核心不是“完整支付平台”，而是：

```text
private income records
↓
proof generation / proof simulation
↓
selective disclosure
↓
AI-readable public report
```

黑客松期间必须让评委看到：

- 用户数据不是全部公开。
- 创作者可以证明收入/支持者门槛。
- 页面清楚区分 private data、public data、proof result。
- AI 报告只基于公开证明结果，不泄露敏感明细。

## 2. 技术栈

### 2.1 MVP 前端

推荐栈：

```text
Next.js
React
TypeScript
Tailwind CSS
viem
lucide-react
```

原因：

- Next.js 适合快速做可部署产品。
- TypeScript 适合明确数据模型。
- Tailwind 适合快速实现专业 UI。
- viem 已在之前 BeanVault demo 跑通过。
- lucide-react 用于按钮和状态图标。

### 2.2 链上原型

赛前和保底方案：

```text
Solidity
Hardhat
Anvil
BeanUSD / Mock ERC20
CreatorVaultEVM
```

作用：

- 展示钱包连接、交易、receipt、event。
- 保留学习者已经跑通的 EVM 能力。
- 作为普通公开链对比，说明为什么 Midnight 隐私层有价值。

### 2.3 Midnight / Compact 方向

正式黑客松加分方向：

```text
Compact
private inputs / witness
disclose
threshold proof
```

当前已经完成：

```text
CreatorVault Compact 合约
生成 verifier/prover keys 和 ZK IR
Lace 钱包连接
Midnight Preprod 部署
Preprod indexer 链上确认
```

链上部署记录：

```text
network=preprod
contractAddress=799d2a5a63fd3abcb8c6b892d7e46d234db66b3570e07092a78372ea96720774
txId=005dae86d1b76d11dcbf9391cb10d41302dd6f60ad41d91744c661a48c90d5dd11
blockHeight=798723
status=SUCCESS
```

下一步：

- 从前端提交 demo proof result 到已部署的 CreatorVault 合约。
- 用链上 proof registry 状态增强 Report / Dashboard 的可信度。
- 后续再把当前 TypeScript proof simulation 替换为更完整的 Midnight proof workflow。

### 2.4 AI 模块

MVP：

```text
deterministic mock report generator
```

不直接依赖外部 AI API。

后续增强：

```text
Node.js API
LLM provider
server-side API key
```

## 3. 推荐目录结构

正式项目建议结构：

```text
CreatorVault-AI/
  app/
    page.tsx
    sponsor/page.tsx
    report/page.tsx
    architecture/page.tsx
    layout.tsx
    globals.css
  components/
    AppShell.tsx
    Hero.tsx
    CreatorProfile.tsx
    ProofCard.tsx
    PrivacyDataPanel.tsx
    SponsorSimulator.tsx
    AiReportPanel.tsx
    ArchitectureDiagram.tsx
    WalletPanel.tsx
  lib/
    demo-data.ts
    proof-engine.ts
    report-generator.ts
    privacy-model.ts
    formatting.ts
  types/
    creator.ts
    proof.ts
    sponsorship.ts
    report.ts
  contracts/
    CreatorVaultEVM.sol
    MockUSD.sol
  scripts/
    deploy-local.ts
  docs/
    compact-income-proof.md
    demo-script.md
  public/
    screenshots/
  README.md
```

赛前当前仓库已经有计划文档。正式开发时再创建 `app/`、`components/`、`lib/` 等工程目录。

## 4. 核心数据模型

### 4.1 Creator

```ts
export type Creator = {
  id: string
  name: string
  handle: string
  category: string
  walletAddress?: `0x${string}`
  reportPeriod: string
  avatarUrl?: string
}
```

### 4.2 SponsorshipRecord

MVP 中存在前端状态里，模拟 private ledger。

```ts
export type SponsorshipRecord = {
  id: string
  sponsorLabel: string
  sponsorAddress?: string
  amountUsd: number
  isPrivate: boolean
  createdAt: string
}
```

说明：

- `sponsorAddress` 在 private 模式下不展示。
- `amountUsd` 用于 proof simulation，但不在 public report 展示单笔明细。
- 真实 Midnight 版本里，这些是 private inputs / witness。

### 4.3 ProofClaim

```ts
export type ProofClaim = {
  id: string
  title: string
  thresholdUsd: number
  supporterThreshold: number
  period: string
  result: "passed" | "failed"
  totalPrivateIncomeUsd: number
  supporterCount: number
  disclosedFields: string[]
  hiddenFields: string[]
  proofHash: string
  generatedAt: string
}
```

注意：

- `totalPrivateIncomeUsd` 可以用于内部计算，但 UI 默认不直接展示精确总额。
- 公共卡片展示可以使用 `>$1,000`、`50+ supporters` 这类区间表达。

### 4.4 AIReport

```ts
export type AIReport = {
  id: string
  audience: "brand" | "dao" | "community"
  title: string
  summary: string
  bullets: string[]
  generatedAt: string
}
```

## 5. Proof Engine 设计

### 5.1 MVP Proof Simulation

MVP 不直接实现真实 ZK proof，而是实现“证明流程模拟”。

文件：

```text
lib/proof-engine.ts
```

接口：

```ts
export function generateIncomeProof(params: {
  records: SponsorshipRecord[]
  thresholdUsd: number
  supporterThreshold: number
  period: string
}): ProofClaim
```

逻辑：

```ts
const total = sum(records.amountUsd)
const uniqueSupporters = count(records)
const passed = total >= thresholdUsd && uniqueSupporters >= supporterThreshold
const proofHash = hash({
  total,
  uniqueSupporters,
  thresholdUsd,
  supporterThreshold,
  period,
  salt,
})
```

公开输出：

```text
threshold
supporter threshold
period
passed / failed
proof hash
```

隐藏数据：

```text
individual amounts
sponsor identities
full ledger
```

### 5.2 为什么需要 proofHash

`proofHash` 在 MVP 中是承诺/证明的视觉替代物。

它表达：

```text
系统对一批私密收入数据生成了一个不可随意伪造的证明标识。
```

注意：

```text
MVP proofHash 不是生产级 ZK proof。
README 必须说明它是 proof simulation。
```

## 6. Midnight / Compact 映射

### 6.1 业务映射

| 项目概念 | Midnight / ZK 概念 |
|---|---|
| 私密赞助明细 | private inputs / witness |
| 收入阈值 | public input / disclosed value |
| 支持者阈值 | public input / disclosed value |
| 是否通过 | public output |
| proofHash | proof / commitment 的演示替代物 |
| AI 报告 | 基于 disclosed outputs 的解释层 |

### 6.2 Compact 风格伪代码

实际语法以后按官方文档修正。

```text
circuit proveCreatorIncome(
  private incomeRecords: Field[],
  private sponsorIds: Field[],
  public incomeThreshold: Field,
  public supporterThreshold: Field,
  public reportPeriod: Field
) {
  let totalIncome = sum(incomeRecords)
  let supporterCount = countUnique(sponsorIds)

  assert(totalIncome >= incomeThreshold)
  assert(supporterCount >= supporterThreshold)

  disclose(incomeThreshold)
  disclose(supporterThreshold)
  disclose(reportPeriod)
  disclose(true)
}
```

### 6.3 Demo 中如何解释

一句话：

```text
In the MVP, we simulate the proof flow in TypeScript. In a Midnight-native version, the sponsorship ledger becomes private witness data and the app discloses only threshold results.
```

中文：

```text
MVP 中我们用 TypeScript 模拟证明流程。Midnight 原生版本里，赞助明细会成为 private witness，应用只披露阈值验证结果。
```

## 7. 前端页面实现

### 7.1 `/` Dashboard

组件：

- `Hero`
- `CreatorProfile`
- `ProofCard`
- `PrivacyDataPanel`
- `AiReportPanel`

核心状态：

```ts
const records = demoSponsorshipRecords
const proof = generateIncomeProof(records, 1000, 50, "April 2026")
const report = generateReport(proof, "brand")
```

展示重点：

- 创作者证明了什么
- 哪些数据公开
- 哪些数据隐藏
- AI 报告如何不泄露明细

### 7.2 `/sponsor`

组件：

- `SponsorSimulator`
- `WalletPanel`
- `PrivacyModeToggle`

MVP 行为：

- 输入金额
- 选择 public / private
- 添加一条模拟记录
- 更新 proof result

EVM 增强：

- 连接钱包
- 调用 `sponsorEth()` 或 `sponsorToken()`
- 展示 receipt / event

### 7.3 `/report`

组件：

- `AiReportPanel`
- `ProofCard`
- `ReportAudienceSelector`

报告类型：

- brand partnership
- DAO grant
- community update

### 7.4 `/architecture`

组件：

- `ArchitectureDiagram`
- `PrivacyDataPanel`
- `CompactPseudoCode`

必须解释：

- 为什么以太坊式公开账本不够
- 什么是 private inputs
- 什么是 disclosed outputs
- Midnight / Compact 如何落地
- 当前 MVP 哪些是 simulation

## 8. AI Report Generator

文件：

```text
lib/report-generator.ts
```

接口：

```ts
export function generateReport(
  proof: ProofClaim,
  audience: AIReport["audience"]
): AIReport
```

规则：

- 只使用 `ProofClaim` 的 disclosed fields。
- 不输出单笔收入金额。
- 不输出 sponsor address。
- 根据 audience 生成不同语气。

示例：

```ts
if (audience === "brand") {
  return {
    title: "Verified Creator Income Report",
    summary: "Alice passed the selected income and supporter thresholds for April 2026 while keeping individual sponsorship details private.",
    bullets: [
      "Income threshold verified without disclosing exact payments.",
      "Supporter threshold verified without revealing sponsor identities.",
      "Report is suitable for privacy-preserving brand review."
    ]
  }
}
```

## 9. EVM 原型合约设计

如果保留 EVM 原型，用它表达普通公开链的流程。

合约：

```text
contracts/CreatorVaultEVM.sol
```

功能：

- `sponsorEth(bool isPrivate)` payable
- `sponsorToken(address token, uint256 amount, bool isPrivate)`
- `withdraw()`
- `getPublicStats()`
- events:
  - `Sponsored(address indexed sponsor, uint256 amount, bool isPrivate)`
  - `Withdrawn(address indexed creator, uint256 amount)`

注意：

即使 `isPrivate=true`，EVM event 和交易本身也可能暴露金额和地址。

这正好用于解释：

```text
EVM can model the business flow, but Midnight is needed for real privacy-preserving proofs.
```

## 10. 部署实现

优先静态部署。

构建：

```bash
npm run build
```

如果使用 Next.js static export：

```js
// next.config.js
const nextConfig = {
  output: "export",
}
export default nextConfig
```

输出：

```text
out/
```

服务器目录：

```text
/var/www/creatorvault-ai
```

Demo URL：

```text
https://creatorvault.ohmycode.cc
```

不使用裸 IP 提交。

## 11. 环境变量

MVP 尽量不需要环境变量。

如需：

```text
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

禁止提交：

```text
PRIVATE_KEY
OPENAI_API_KEY
SERVER_PASSWORD
GITHUB_TOKEN
```

## 12. 测试策略

### 12.1 单元测试

优先测试：

- `generateIncomeProof`
- `generateReport`
- private/public data filtering

关键测试：

```text
收入超过阈值 -> passed
收入低于阈值 -> failed
支持者数量不足 -> failed
AI 报告不包含 sponsor address
AI 报告不包含 individual amount
```

### 12.2 手动验收

Demo 前必须检查：

- 首页打开无报错。
- private data 不在公开卡片出现。
- proof result 根据输入变化。
- AI report 不泄露明细。
- 移动端不崩。
- README 和页面一致。

## 13. Commit 实现计划

正式开发建议 commit：

```text
init Next.js project
add app shell and navigation
add creator data model
add proof engine
add dashboard proof card
add private public data panel
add sponsor simulator
add AI report generator
add architecture page
add EVM prototype contract
add deployment config
write README and demo script
polish UI for submission
```

## 14. 风险和降级方案

### 风险：Midnight 原生开发时间不足

降级：

- TypeScript proof simulation
- Compact 伪代码
- Architecture 页面解释映射

### 风险：钱包/链上流程不稳定

降级：

- Demo mode 优先可用
- EVM 作为增强项

### 风险：AI API 不可用

降级：

- deterministic mock report generator

### 风险：服务器部署出问题

降级：

- 本地录屏 Demo
- 暂时用静态文件托管
- 保留 README 本地运行说明

## 15. Definition of Done

MVP 完成定义：

- 首页能清楚表达项目价值。
- proof card 能展示 threshold proof。
- private/public data panel 能说明隐私边界。
- AI report 能生成不泄露明细的摘要。
- Architecture 页面能解释 Midnight 映射。
- 项目能部署到 `creatorvault.ohmycode.cc`。
- README 能让评委独立理解项目。
- GitHub 有清晰 commit 历史。
