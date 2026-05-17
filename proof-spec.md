# CreatorVault AI - Proof Specification

更新时间：2026-05-08

## 1. Proof 目标

CreatorVault AI 的第一个 proof 叫：

```text
Creator Income Threshold Proof
```

它要证明一件事：

```text
某个创作者在某个报告周期内，
私密收入总额 >= 公开收入门槛，
并且私密支持者数量 >= 公开支持者门槛。
```

用业务语言说：

```text
Alice 可以证明自己 2026 年 4 月收入超过 $1,000，
并且至少有 4 位支持者，
但不公开每个赞助者是谁，也不公开每笔付款金额。
```

## 2. 为什么先定义 Proof 规格

Proof 规格是后面所有实现的合同。

```text
前端页面
↓
proof-engine.ts
↓
MockVerifier
↓
Midnight Compact circuit
↓
链上记录 / disclosed outputs
```

这些层必须对同一件事达成一致：

```text
输入是什么
隐藏什么
公开什么
验证什么
验证通过后记录什么
```

否则后面会出现一种危险情况：

```text
前端说证明的是收入门槛
proof 代码实际证明的是另一个条件
链上记录又记录了第三种含义
```

## 3. Private Witness

Private witness 是证明者本地持有、参与证明计算、但不公开的数据。

当前 MVP 对应：

```ts
type SponsorshipRecord = {
  id: string
  sponsorLabel: string
  sponsorAddress?: string
  amountUsd: number
  isPrivate: boolean
  createdAt: string
}
```

真实 proof 版本建议收敛成：

```ts
type IncomeProofPrivateWitness = {
  records: Array<{
    sponsorIdHash: string
    sponsorAddressHash?: string
    amountUsdCents: bigint
    occurredAt: string
    isPrivate: boolean
  }>
}
```

### 必须隐藏

```text
sponsorLabel
sponsorAddress
单笔 amount
完整 records 列表
完整收入时间线
私密品牌合作关系
```

### 可以参与计算

```text
每笔 amount
记录数量
记录所属 period
记录是否有效
```

### 不允许公开泄露

proof、commitment、event、report 都不应该包含：

```text
单个赞助者身份
单笔付款金额
完整赞助列表
可反推出赞助者关系的明文数据
```

## 4. Public Inputs

Public inputs 是外部审核者可以知道，并且 verifier 需要用来验证 proof 的公开参数。

第一个版本定义：

```ts
type IncomeProofPublicInputs = {
  creatorId: string
  creatorPublicAddress?: string
  period: string
  incomeThresholdUsdCents: bigint
  supporterThreshold: number
  proofSchemaVersion: number
}
```

解释：

```text
creatorId
证明属于哪个创作者。MVP 可以是 alice，真实版本应绑定钱包或 DID。

creatorPublicAddress
创作者公开地址。可选，因为 Midnight 隐私身份可能不完全等同 EVM 地址。

period
证明周期，例如 2026-04。

incomeThresholdUsdCents
收入门槛，建议用 cents 整数，避免小数误差。

supporterThreshold
支持者数量门槛。

proofSchemaVersion
证明规则版本。以后升级 proof 规则时，旧证明仍然能解释。
```

## 5. Public Outputs

Public outputs 是 proof 通过后允许被公开展示、写入报告、或者提交链上的结果。

第一个版本定义：

```ts
type IncomeProofPublicOutputs = {
  result: "passed" | "failed"
  proofCommitment: string
  disclosedFields: string[]
  hiddenFields: string[]
  generatedAt: string
}
```

可以公开：

```text
是否通过
收入门槛
支持者门槛
报告周期
proof commitment
proof schema version
生成时间
```

不建议公开：

```text
精确总收入
精确支持者数量
单笔金额
赞助者地址
```

当前 MVP 里 `ProofClaim.totalPrivateIncomeUsd` 和 `ProofClaim.supporterCount` 还存在，是为了开发调试和页面演示。

真实隐私版本建议改成：

```text
公开：incomeThresholdPassed = true
公开：supporterThresholdPassed = true
隐藏：totalPrivateIncomeUsd
隐藏：supporterCount
```

## 6. Verification Rule

第一版 proof 的核心验证规则：

```text
sum(privateWitness.records.amountUsdCents) >= publicInputs.incomeThresholdUsdCents
AND
count(valid privateWitness.records) >= publicInputs.supporterThreshold
```

伪代码：

```ts
function verifyIncomeThresholdProof(
  privateWitness: IncomeProofPrivateWitness,
  publicInputs: IncomeProofPublicInputs,
): IncomeProofPublicOutputs {
  const totalIncome = sum(privateWitness.records.map((record) => record.amountUsdCents))
  const supporterCount = countValidSupporters(privateWitness.records)

  assert(totalIncome >= publicInputs.incomeThresholdUsdCents)
  assert(supporterCount >= publicInputs.supporterThreshold)

  return {
    result: "passed",
    proofCommitment: commit(privateWitness, publicInputs),
    disclosedFields: [
      "income threshold",
      "supporter threshold",
      "report period",
      "proof result",
      "proof commitment",
    ],
    hiddenFields: [
      "sponsor identities",
      "exact individual payments",
      "full private revenue ledger",
      "private brand relationships",
    ],
    generatedAt: now(),
  }
}
```

## 7. Commitment 规则

`proofCommitment` 的作用不是公开原始数据，而是给本次 proof 一个可追踪指纹。

MVP 当前是：

```text
simpleHash(JSON.stringify({ period, supporterCount, thresholdUsd, totalPrivateIncomeUsd }))
```

这只是演示用，不安全。

真实版本应该是：

```text
commitment = hash(
  proofSchemaVersion,
  creatorId,
  period,
  incomeThreshold,
  supporterThreshold,
  privateLedgerRoot,
  nonce
)
```

关键点：

```text
privateLedgerRoot 可以证明“我用的是某份私密账本”
nonce 防止别人通过穷举金额反推收入
commitment 不直接暴露 sponsor identity / amount
```

## 8. 链上应该记录什么

链上不要记录完整 proof witness。

第一版链上记录建议：

```ts
type OnChainProofRecord = {
  creatorIdHash: string
  period: string
  proofSchemaVersion: number
  incomeThresholdUsdCents: bigint
  supporterThreshold: number
  result: "passed"
  proofCommitment: string
  verifierId: string
  submittedAt: string
}
```

也就是说，链上记录的是：

```text
某个创作者
在某个周期
基于某个 proof 版本
通过了某个门槛证明
这个证明的 commitment 是什么
```

链上不记录：

```text
完整账本
赞助者名单
单笔金额
精确总收入
私密备注
```

## 9. Proof 放本地还是链上

本项目采用：

```text
私密数据：本地
proof 生成：本地或客户端侧 proof runtime
proof 验证：本地 MockVerifier / Midnight verifier
公开结果：可写链上
公开报告：前端读取 public outputs
```

更具体一点：

```text
Private witness
只在创作者本地或隐私执行环境存在。

Proof artifact
可以本地生成，必要时提交给 verifier。

Verifier
负责判断 proof 是否满足 public inputs。

On-chain record
只保存验证通过后的公开结果或 commitment。
```

## 10. 与当前代码的映射

当前代码：

```text
lib/proof-engine.ts
```

现在它负责：

```text
读取 SponsorshipRecord[]
计算 totalPrivateIncomeUsd
计算 supporterCount
判断是否通过 threshold
生成模拟 proofHash
返回 ProofClaim
```

下一步要升级成：

```text
lib/proof/private-witness.ts
lib/proof/public-inputs.ts
lib/proof/mock-verifier.ts
lib/proof/commitment.ts
types/proof.ts
```

目标是让代码结构更接近真实 ZK/Midnight：

```text
private witness
↓
public inputs
↓
proof generation
↓
verification
↓
public outputs
```

## 11. Compact / Midnight 映射

未来 Compact 风格可以表达成：

```text
circuit proveCreatorIncome(privateLedger, publicThreshold, publicPeriod) {
  total = sum(privateLedger.amounts)
  supporters = count(privateLedger.supporters)

  assert(total >= publicThreshold.income)
  assert(supporters >= publicThreshold.supporters)

  disclose(publicThreshold.income)
  disclose(publicThreshold.supporters)
  disclose(publicPeriod)
  disclose(true)
  disclose(commitment)
}
```

这里的核心思想：

```text
privateLedger 是私密 witness
threshold / period 是 public inputs
true / commitment 是 public outputs
```

## 12. 第一版验收标准

Proof 规格落地后，下一步实现必须满足：

```text
1. 代码里明确区分 private witness / public inputs / public outputs。
2. UI 不直接依赖完整私密 records 来生成公开报告。
3. MockVerifier 能验证收入门槛和支持者门槛。
4. Proof commitment 不包含明文 sponsorLabel / sponsorAddress。
5. Report 只读取 public outputs。
6. 架构页能解释 proof 哪部分本地、哪部分可上链。
```

## 13. 当前结论

当前项目的 proof 还没有真实 ZK 化，也还没有链上 verifier。

但从现在开始，项目的核心方向已经定了：

```text
证明事实，不公开原始数据。
```

第一个事实就是：

```text
创作者收入和支持者数量达到公开门槛。
```

