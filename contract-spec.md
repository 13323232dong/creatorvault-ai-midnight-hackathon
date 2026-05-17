# CreatorVault AI - Smart Contract Design

更新时间：2026-05-08

## 1. 合约要解决什么

CreatorVault AI 的智能合约不负责保存完整收入账本。

它只负责一件事：

```text
当某个 proof 被 verifier 判定有效后，
把这个“已通过证明”的公开状态记录下来。
```

也就是说：

```text
智能合约不是账本数据库
智能合约不是私密数据仓库
智能合约是公开验证结果登记处
```

## 2. 总体结构

第一版设计分成两个模块：

```text
IIncomeProofVerifier
↓
验证 proof 是否有效

CreatorVaultRegistry
↓
记录验证通过后的公开 proof 状态
```

未来可以替换 verifier：

```text
MockVerifier
↓
本地 demo / 前端 MVP

Midnight Compact Verifier
↓
真实隐私 proof 验证

EVM Verifier
↓
保底 Solidity 演示版本
```

## 3. 为什么分两层

如果把“验证 proof”和“记录 proof 状态”写死在一个合约里，后面换技术会很麻烦。

分两层后：

```text
CreatorVaultRegistry 不关心 proof 是怎么生成的
CreatorVaultRegistry 只关心 verifier 返回 true / false
```

这样后面可以从：

```text
TypeScript MockVerifier
```

平滑升级到：

```text
Midnight Compact proof verifier
```

## 4. 合约不应该做什么

合约不应该保存：

```text
sponsorLabel
sponsorAddress
单笔 amount
完整 SponsorshipRecord[]
精确总收入
精确支持者数量
私密品牌关系
```

合约也不应该让外部随便提交：

```text
未验证的 proof result
伪造的 passed 状态
重复 proof
过期 proof
不属于提交者的 creator proof
```

## 5. 核心数据模型

链上记录建议：

```ts
type ProofRecord = {
  creatorIdHash: string
  period: string
  proofSchemaVersion: number
  incomeThresholdUsdCents: bigint
  supporterThreshold: number
  proofCommitment: string
  verifierId: string
  submittedAt: string
}
```

Solidity 风格可以写成：

```solidity
struct ProofRecord {
    bytes32 creatorIdHash;
    bytes32 periodHash;
    uint16 proofSchemaVersion;
    uint256 incomeThresholdUsdCents;
    uint32 supporterThreshold;
    bytes32 proofCommitment;
    bytes32 verifierId;
    uint64 submittedAt;
}
```

Midnight/Compact 方向可以保持同样语义，只是字段类型会换成 Midnight 生态里的类型。

## 6. Proof Key

每条证明需要一个唯一 key。

建议：

```text
proofKey = hash(
  creatorIdHash,
  period,
  proofSchemaVersion,
  incomeThresholdUsdCents,
  supporterThreshold
)
```

它表示：

```text
某个创作者
某个周期
某个证明版本
某组门槛条件
```

同一个 proofKey 不允许重复提交，除非未来明确支持更新/撤销。

## 7. Verifier 接口

抽象接口：

```ts
interface IIncomeProofVerifier {
  verifyIncomeProof(params: {
    proof: ProofArtifact
    publicInputs: IncomeProofPublicInputs
    publicOutputs: IncomeProofPublicOutputs
  }): boolean
}
```

Solidity 风格：

```solidity
interface IIncomeProofVerifier {
    function verifyIncomeProof(
        bytes calldata proof,
        bytes32 proofCommitment,
        bytes32 creatorIdHash,
        bytes32 periodHash,
        uint16 proofSchemaVersion,
        uint256 incomeThresholdUsdCents,
        uint32 supporterThreshold
    ) external view returns (bool);
}
```

关键点：

```text
proof 可以是 bytes
public inputs 必须明确传入
verifier 只能返回 true / false
verifier 不应该泄露 private witness
```

## 8. Registry 合约接口

核心函数：

```ts
submitIncomeProof(publicInputs, publicOutputs, proof)
```

Solidity 风格：

```solidity
function submitIncomeProof(
    bytes calldata proof,
    bytes32 proofCommitment,
    bytes32 creatorIdHash,
    bytes32 periodHash,
    uint16 proofSchemaVersion,
    uint256 incomeThresholdUsdCents,
    uint32 supporterThreshold
) external returns (bytes32 proofKey);
```

执行流程：

```text
1. 检查 proofSchemaVersion 是否支持
2. 计算 proofKey
3. 检查 proofKey 是否已存在
4. 调用 verifier.verifyIncomeProof(...)
5. verifier 返回 true 才继续
6. 写入 ProofRecord
7. 发出 ProofSubmitted event
```

## 9. 查询接口

需要支持前端和报告页读取公开状态。

```solidity
function hasValidProof(bytes32 proofKey) external view returns (bool);

function getProofRecord(bytes32 proofKey)
    external
    view
    returns (ProofRecord memory);
```

也可以提供按创作者查询的辅助索引：

```solidity
function getCreatorProofKeys(bytes32 creatorIdHash)
    external
    view
    returns (bytes32[] memory);
```

MVP 可以先不做复杂分页。

真实链上版本如果 proof 很多，不能让数组无限增长，需要 indexer 或事件索引。

## 10. Event 设计

链上 event 是给前端、indexer、报告页监听的公开日志。

```solidity
event IncomeProofSubmitted(
    bytes32 indexed proofKey,
    bytes32 indexed creatorIdHash,
    bytes32 indexed periodHash,
    uint16 proofSchemaVersion,
    uint256 incomeThresholdUsdCents,
    uint32 supporterThreshold,
    bytes32 proofCommitment,
    bytes32 verifierId,
    uint64 submittedAt
);
```

event 不放：

```text
赞助者身份
单笔金额
完整账本
精确总收入
精确支持者数量
```

## 11. 权限设计

第一版建议：

```text
任何人都可以提交 proof
但 proof 必须通过 verifier
creatorIdHash 必须和 public input / proof 绑定
```

不建议第一版加太复杂的 owner 管理。

可以保留一个管理员能力：

```text
更新 verifier 地址
启用/禁用 proof schema version
暂停合约
```

但这些能力必须谨慎，因为它们会影响可信度。

最小管理接口：

```solidity
function setVerifier(address verifier) external onlyOwner;
function setSchemaEnabled(uint16 version, bool enabled) external onlyOwner;
function pause() external onlyOwner;
function unpause() external onlyOwner;
```

## 12. 安全不变量

必须保证：

```text
1. 没有通过 verifier 的 proof 不能被记录为 passed。
2. 同一个 proofKey 不能重复提交。
3. proofCommitment 不能是空值。
4. proofSchemaVersion 必须是启用版本。
5. public inputs 必须和 proof 绑定，不能 proof A 配 inputs B。
6. event 不能泄露 private witness。
7. 合约不能保存 sponsor 明文信息。
```

如果以后支持撤销，需要新增：

```text
revoked 状态
revocation reason hash
revokedAt
```

不要直接删除历史记录。

## 13. MockVerifier 设计

在真正接 Midnight Compact 前，可以先做 MockVerifier。

MockVerifier 的目的不是伪装成真 ZK，而是固定接口。

```ts
class MockIncomeProofVerifier {
  verifyIncomeProof(params): boolean {
    return (
      params.publicOutputs.result === "passed" &&
      params.publicOutputs.proofCommitment.length > 0 &&
      params.publicInputs.incomeThresholdUsdCents > 0n &&
      params.publicInputs.supporterThreshold > 0
    )
  }
}
```

注意：

```text
MockVerifier 只用于 MVP 演示
页面必须明确标注 current verifier = mock
不能把 MockVerifier 说成真实 ZK
```

## 14. Midnight / Compact 映射

在 Midnight 方向里，合约/电路更像：

```text
private witness:
  privateLedger

public inputs:
  creatorIdHash
  period
  threshold
  proofSchemaVersion

assert:
  sum(privateLedger.amounts) >= threshold.income
  count(privateLedger.supporters) >= threshold.supporters

disclose:
  result = true
  threshold
  period
  proofCommitment
```

CreatorVaultRegistry 只需要读取 disclosed outputs：

```text
result
period
threshold
commitment
schema version
```

## 15. 前端调用流程

未来页面流程：

```text
用户连接 Lace / Midnight wallet
↓
用户在 Sponsor 页面准备私密收入账本
↓
本地生成 private witness
↓
生成 proof artifact
↓
调用 verifier 验证
↓
调用 CreatorVaultRegistry.submitIncomeProof
↓
链上记录公开 proof 状态
↓
Report 页面读取 proof record 生成 AI 报告
```

## 16. 当前项目下一步落地

下一步建议先写 TypeScript 版本，而不是马上 Solidity：

```text
lib/proof/private-witness.ts
lib/proof/public-inputs.ts
lib/proof/commitment.ts
lib/proof/mock-verifier.ts
lib/proof/registry.ts
```

这样可以先让前端跑通：

```text
生成 proof
验证 proof
记录 proof
报告读取 proof
```

等这个流程稳定后，再把 registry / verifier 换成真实链上版本。

## 17. 一句话总结

```text
Proof 是证据。
Verifier 是验票员。
CreatorVaultRegistry 是公开登记处。
私密账本永远不应该直接上链。
```

