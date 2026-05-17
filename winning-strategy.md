# CreatorVault AI Privacy Edition - 获奖策略分析

更新时间：2026-05-07

## 1. 结论先行

CreatorVault AI 如果想更有机会获奖，不能只是：

```text
链上打赏 + AI 总结
```

这太像普通 Web3 Demo。

更适合 Midnight Hackathon 的获奖方向应该是：

```text
Privacy-preserving creator income verification
```

中文理解：

```text
隐私保护的创作者收入证明系统
```

核心卖点：

```text
创作者可以向品牌方、社区、DAO、平台证明自己的收入能力和支持者规模，
但不暴露具体赞助人、每笔金额、私密客户名单和完整收入流水。
```

这比“打赏金库”更贴 Midnight：

- 有真实商业场景
- 有明确隐私痛点
- 有选择性披露需求
- 能用 ZK / Midnight 叙事讲清楚
- AI 报告能变成产品亮点，而不是硬凑功能

## 2. 历史获奖规律

### 2.1 Midnight 获奖项目偏好

从 Midnight 过往获奖项目看，评委喜欢这些方向：

- 身份验证，但不暴露身份细节
- KYC / 合规，但不重复泄露个人资料
- 医疗记录 / 基因数据 / 心理健康等高敏感数据
- DAO / 投票 / 治理，但保护投票隐私
- 收入、资格、年龄等证明，但不公开原始数据

典型获奖/入围项目：

- MediChain：医疗记录隐私和合规
- Crescent：隐私 KYC
- Brick Towers：证明买家达到法定年龄，但不公开生日/证件
- TxPipe / Edda Labs / Protofire：隐私治理、私密投票、身份投票
- EclipseProof：隐私收入证明
- HelixChain：基因隐私
- NulliVote：隐私选举
- BadgeMe / Veriff Sheriff / OneKYC：隐私 KYC / attestations

规律：

```text
“证明某件事是真的，但不公开原始敏感数据”
```

这是 Midnight / ZK 类黑客松最吃香的表达方式。

### 2.2 评委明确看重什么

Midnight ZK Identity hackathon 官方提到的评审方向包括：

- 是否有效使用 Midnight 的 ZK 能力
- 智能合约和 circuit 设计是否清楚
- 隐私保护是否真的落实
- 创新性
- 完成度
- 文档清晰度
- UI 易用性

特别重要的一句话：

```text
一个小而完整、能跑通的 DApp，会胜过一个很宏大但没做完的概念。
```

### 2.3 MLH / 通用黑客松规律

MLH 评审时间通常很短，常见是几分钟内看完一个项目。

这意味着：

- 开场 15 秒必须讲清楚问题
- Demo 必须直接进入核心流程
- 不要让评委自己猜项目价值
- README 和视频要能独立解释项目
- UI 第一屏必须让人知道这是做什么的

ETHGlobal 类 Web3 黑客松还强调：

- GitHub repo
- 清晰 commit 历史
- Demo video
- 说明哪些是新做的，哪些复用了模板/AI
- 不要一个巨大 single commit

## 3. 我们项目的最佳切入点

原始方向：

```text
CreatorVault AI：创作者链上收入金库
```

获奖优化后：

```text
CreatorVault AI Privacy Edition：
隐私保护的创作者收入证明与收入报告系统
```

目标用户：

```text
独立创作者、自由职业者、开源维护者、DAO 贡献者、内容创作者
```

核心场景：

```text
创作者想向品牌方证明：
我过去 30 天有稳定收入、真实支持者和社区影响力。

但创作者不想暴露：
每个赞助人是谁、每笔赞助多少钱、大客户是谁、完整收入流水。
```

这就是典型 ZK / privacy 场景：

```text
证明资格
不暴露原始数据
```

## 4. 项目故事线

### 4.1 评委听得懂的故事

普通创作者平台有两个极端：

```text
Web2 平台：
数据在平台手里，创作者和社区不能验证。

普通公开链：
数据可验证，但收入明细和赞助关系过度公开。
```

CreatorVault AI Privacy Edition 提供第三种方式：

```text
收入规则可信
汇总数据可验证
敏感明细可保护
AI 自动生成可分享的收入证明报告
```

### 4.2 一句话 pitch

英文：

```text
CreatorVault AI lets creators prove income and community support without exposing every sponsor, payment, or private revenue detail.
```

中文：

```text
CreatorVault AI 让创作者能证明收入和社区支持力，但不暴露每个赞助人和每笔收入明细。
```

## 5. 最有竞争力的 MVP

### 必做功能

1. Creator profile
   - 创作者主页
   - 公开展示收入区间、赞助人数、验证状态

2. Sponsor flow
   - 支持者赞助
   - 可选择公开赞助或隐私赞助

3. Private income ledger
   - 前端模拟私密收入明细
   - 只公开聚合结果

4. Proof card
   - 证明创作者满足某个条件：
     - 月收入超过 X
     - 支持者超过 N
     - 连续收入超过 N 天

5. AI report
   - 生成给品牌方/DAO/社区看的报告
   - 不暴露单笔交易明细

6. Architecture page
   - 清楚写：
     - public data
     - private data
     - proof
     - what Midnight protects

### 可选加分

1. Midnight / Compact 最小 demo
2. Lace Wallet 连接说明
3. ZK proof mock visualization
4. DAO grant verification
5. Brand sponsorship verification

## 6. Demo 流程设计

评委只有几分钟，所以 Demo 必须像短剧：

### Step 1：问题

```text
Creator Alice wants to apply for a brand sponsorship.
The brand asks for proof that she has real supporters and stable monthly income.
But Alice does not want to reveal her full supporter list or private income details.
```

### Step 2：赞助发生

```text
Supporters sponsor Alice.
Some support is public.
Some is private.
```

### Step 3：生成证明

```text
Alice generates a proof:
Monthly creator revenue is above $1,000
Supporter count is above 50
```

但页面不显示：

```text
每个赞助人地址
每笔金额
完整收入流水
```

### Step 4：AI 报告

AI 生成：

```text
Alice has verified creator income above the selected threshold,
consistent sponsor growth, and a privacy-preserving proof suitable for brand review.
```

### Step 5：Midnight 价值

```text
Midnight enables the creator to prove claims about private data without revealing the data itself.
```

## 7. 我们要避免的失败路线

不要做成：

```text
一个普通打赏 DApp
```

原因：

- 和 Midnight 主题弱相关
- 隐私价值不明显
- 很容易被评委认为只是“把数据存在链上”

不要做成：

```text
一个大而全的创作者平台
```

原因：

- 黑客松时间不够
- 功能太散
- Midnight/ZK 亮点被稀释

不要过度依赖：

```text
AI 生成报告
```

AI 是辅助亮点，核心必须是：

```text
隐私证明 + 用户数据控制
```

## 8. 取胜评分模型

我们按 100 分设计：

```text
主题贴合度：25
功能完成度：25
Midnight / privacy 技术表达：20
Demo 清晰度：15
UI / 文档 / 提交质量：10
未来潜力：5
```

项目必须优先拿满：

- 主题贴合度
- 功能完成度
- Demo 清晰度

因为评委时间短，先让他们看懂和相信，再谈技术深度。

## 9. 推荐最终项目名称

备选：

```text
CreatorVault AI
PrivateProof for Creators
ProofMyIncome
CreatorProof
VaultProof AI
```

最推荐：

```text
CreatorProof AI
```

原因：

- 比 CreatorVault 更贴“证明”。
- 一眼能看出是创作者证明系统。
- 更符合 Midnight 的隐私证明主题。

但如果要保留已有项目名：

```text
CreatorVault AI: Private Income Proofs for Creators
```

## 10. 下一步行动

1. 修改项目叙事：
   - 从“创作者金库”升级为“创作者隐私收入证明”。

2. 重新设计首页第一屏：
   - 评委 5 秒内看到：
     - prove income
     - protect sponsor privacy
     - AI-generated creator report

3. 做一个最小证明场景：
   - 创作者收入超过阈值
   - 不展示明细
   - 输出证明卡片

4. 技术文档里明确：
   - 当前 demo 哪些是 mock
   - 哪些是链上
   - 哪些计划用 Midnight / Compact 实现

5. Demo 视频只讲一个故事：
   - 创作者向品牌方证明收入能力，但保护赞助人隐私。

## 11. 参考资料

- Midnight inaugural hackathon: https://midnight.network/blog/unleashing-innovation-highlights-from-midnight-inaugural-hackathon
- Midnight virtual hackathon winners: https://midnight.network/blog/virtual-hackathon-winners
- Midnight ZK Identity hackathon: https://midnight.network/blog/zk-identity-hackathon-teams-showcase-decentralized-identity
- Midnight Cardano hackathon / Crescent KYC: https://midnight.network/blog/nmkr-cardano-hackathon-solving-data-protection-challenges-with-zero-knowledge-proofs
- Midnight Cardano Tech Week winners: https://midnight.network/blog/hackathon-winners-cardano-tech-week
- Midnight Devpost gallery: https://midnight-hackathon.devpost.com/project-gallery
- MLH judging guide: https://guide.mlh.io/general-information/judging-and-submissions/judging-plan
- ETHGlobal submission guidance example: https://ethglobal.com/events/newyork2025/info/details

