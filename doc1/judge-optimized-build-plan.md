# CreatorVault AI - 按评委喜好倒推的执行计划

更新时间：2026-05-07

## 1. 评委最可能喜欢什么

根据 Midnight / MLH / Web3 黑客松规律，本项目要优先满足：

```text
真实隐私痛点
小而完整的 Demo
清晰的 public/private/proof 区分
能解释 Midnight 为什么适合
3 分钟内能讲明白
README 和视频能独立说明项目
```

所以项目不是做：

```text
创作者打赏平台
```

而是做：

```text
创作者隐私收入证明系统
```

## 2. 最终参赛叙事

项目主标题：

```text
CreatorVault AI
```

副标题：

```text
Private Income Proofs for Creators
```

一句话：

```text
Creators can prove income and supporter credibility without exposing every sponsor, payment, or private revenue detail.
```

评委版中文理解：

```text
创作者可以证明自己有真实收入和支持者，但不用公开每个赞助人和每笔收入明细。
```

## 3. Demo 只讲一个故事

不要讲太多功能，只讲 Alice 的故事：

```text
Alice 是创作者。
她想申请品牌合作。
品牌方想确认她有真实收入和支持者。
但 Alice 不想暴露完整收入流水、赞助人名单和具体金额。
CreatorVault AI 帮她生成一个隐私收入证明和 AI 报告。
```

Demo 最终结果：

```text
Monthly income >= $1,000: Passed
Supporter count >= 50: Passed
Private sponsor identities: Hidden
Exact payments: Hidden
AI report: Generated
```

## 4. 按评分倒推的功能优先级

### P0：必须做，直接决定能不能打动评委

1. 首页第一屏
   - 文案：`Prove creator income without exposing private sponsor data.`
   - 三个卖点：
     - Verify income thresholds
     - Protect sponsor privacy
     - Generate AI-ready reports

2. Proof Card
   - 显示 claim、threshold、period、result、proof hash。
   - 重点是让评委一眼看到“证明了什么”。

3. Private / Public Data Panel
   - 左边 Private Data：
     - sponsor identities
     - exact payments
     - full revenue ledger
   - 右边 Disclosed Data：
     - threshold result
     - supporter count range
     - report period
     - proof status

4. AI Report
   - 生成品牌方可读摘要。
   - 不泄露单笔赞助明细。

5. Architecture Page
   - 解释：
     - 为什么普通以太坊不够
     - Midnight 的 private inputs / disclose / proof 怎么映射
     - 当前 MVP 哪些是 simulation

### P1：加分功能

1. Sponsor Simulator
   - 允许添加一条 public/private sponsorship。
   - 更新 proof result。

2. Wallet / EVM Prototype
   - 如果时间够，接本地链或测试链。
   - 用来证明我们会链上交互。

3. Compact 伪代码 / 最小样例
   - 放在 Architecture 页面和 docs。
   - 强化 Midnight 贴合度。

### P2：有时间再做

1. 真实 AI API
2. 多创作者
3. DAO grant flow
4. NFT badge
5. 完整后端

## 5. 第一屏设计要求

评委打开页面 5 秒内必须看到：

```text
Prove creator income.
Protect sponsor privacy.
Generate verifiable AI reports.
```

第一屏结构：

```text
左侧：
  标题
  副标题
  CTA: Generate Proof
  CTA: View Architecture

右侧：
  Proof Card
  Monthly income >= $1,000: Passed
  Supporters >= 50: Passed
  Hidden: sponsor list, exact amounts
```

不要做营销式空泛 hero。

要让它像一个已经能用的隐私证明产品。

## 6. Demo 路线

### 0:00 - 0:20 问题

```text
Creators need to prove revenue for brand deals or DAO grants, but public blockchains expose too much transaction detail.
```

### 0:20 - 0:45 方案

```text
CreatorVault AI generates privacy-preserving income proofs: the claim is verifiable, while sponsor identities and exact payments stay private.
```

### 0:45 - 1:45 产品演示

操作顺序：

1. 打开 Dashboard。
2. 展示 Alice 的 proof card。
3. 切到 Sponsor Simulator，添加一条 private sponsorship。
4. 回到 Proof Card，看证明仍然只披露结果。
5. 打开 AI Report，展示品牌方摘要。

### 1:45 - 2:30 技术解释

展示 Architecture：

```text
Private inputs -> proof -> disclosed outputs
```

说明：

```text
MVP simulates the proof flow in TypeScript.
In a Midnight-native version, private sponsorship records become witnesses and only threshold results are disclosed.
```

### 2:30 - 3:00 未来扩展

```text
Compact implementation
DAO grant verification
brand sponsorship workflows
creator privacy reports
```

## 7. 技术实现顺序

正式开发时按这个顺序做，保证每一步都能展示：

1. 初始化 Next.js + Tailwind。
2. 建立数据模型。
3. 写 demo private ledger。
4. 写 proof engine。
5. 做 Proof Card。
6. 做 Private/Public Data Panel。
7. 做首页 Dashboard。
8. 做 AI Report Generator。
9. 做 Architecture 页面。
10. 做 Sponsor Simulator。
11. 补 README 和 Demo script。
12. 部署到 `creatorvault.ohmycode.cc`。

## 8. 最小可获奖版本

如果时间很紧，最小版本必须包含：

```text
Dashboard
Proof Card
Private/Public Data Panel
AI Report
Architecture
README
Demo Video
```

可以暂时没有：

```text
真实钱包
真实合约
真实 AI API
真实 ZK proof
```

但必须清楚说明：

```text
MVP simulates proof generation.
Midnight-native version would use Compact witnesses and selective disclosure.
```

## 9. 评委可能问的问题

### Q1：这和普通链上打赏有什么区别？

回答：

```text
普通链上打赏会暴露赞助人、金额和完整行为轨迹。CreatorVault AI 关注的是“证明收入条件成立”，而不是公开所有收入明细。
```

### Q2：你们真的用了 Midnight 吗？

保底回答：

```text
This MVP implements the product flow and proof simulation. The architecture maps directly to Midnight concepts: private sponsorship records as witnesses, threshold claims as disclosed outputs, and Compact circuits for verification.
```

如果跑通 Compact：

```text
We also included a minimal Compact proof prototype for the income threshold claim.
```

### Q3：AI 在这里有什么必要？

回答：

```text
AI turns verified proof outputs into human-readable reports for brands, DAOs, and communities without exposing private ledger details.
```

### Q4：为什么不直接公开总收入？

回答：

```text
Some creators may only want to prove eligibility or income bands, not exact revenue. Selective disclosure lets them reveal enough for trust without oversharing.
```

## 10. 不要做偏的地方

不要优先做：

- 大而全创作者平台
- 复杂钱包功能
- NFT 徽章
- DAO 投票
- 真实支付系统
- 花哨动画

这些会稀释评委最想看的：

```text
privacy-preserving proof
```

## 11. 成功标准

提交前问自己：

```text
评委能不能 5 秒看懂这是隐私收入证明？
评委能不能 1 分钟看懂 public/private/proof？
评委能不能 3 分钟看到完整 Demo？
README 能不能独立讲清楚 Midnight 适配？
```

如果答案都是 yes，就达到参赛质量。

