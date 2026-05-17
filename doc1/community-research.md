# Midnight 社区讨论观察与项目启发

更新时间：2026-05-07

## 1. 社区入口

官方入口：

- Midnight Docs：https://docs.midnight.network/
- Midnight Forum：https://forum.midnight.network/
- Midnight Discord：https://discord.gg/midnightnetwork
- Midnight Developer Hub：https://midnight.network/developer-hub
- Midnight Hackathon Resources：https://midnight.network/hackathon-resources

社区型资料：

- Compact by Example：https://compact-by-example.org/
- Awesome Midnight：https://awesomemidnight.com/
- Compact Lab：https://compactlab.dev/

## 2. 当前社区讨论重点

### 2.1 Compact 是核心

社区和官方资料都围绕 Compact 展开。

Compact 的定位不是“另一个 Solidity”，而是：

```text
用于写可证明交易和隐私逻辑的 TypeScript 风格 DSL。
```

对我们项目的影响：

- 不能只说“我们用隐私链”。
- README 和 Demo 必须解释 Compact 为什么适合“私密收入证明”。
- 最好做一个最小 Compact 合约或伪代码，哪怕主产品先是 EVM 原型。

### 2.2 从 execution 到 verification

Forum 中有开发者讨论 Compact 的一个核心差异：

```text
传统链：链上执行代码，大家看到状态。
Midnight / Compact：定义逻辑，用户用 ZK 证明逻辑被正确执行，敏感数据保持私密。
```

对我们项目的影响：

我们的项目叙事应该避免：

```text
把每笔收入都写到公开链上
```

应该改成：

```text
创作者生成收入证明，证明自己满足某个收入/支持者门槛，但不公开完整流水。
```

这比普通“链上金库”更贴 Midnight。

### 2.3 witness / private inputs 很关键

社区技术讨论反复提到：

- witness
- private inputs
- circuits
- private state
- public disclosure

对我们项目的映射：

```text
private inputs:
  individual sponsorship amounts
  sponsor identities
  private creator income records

public outputs:
  income threshold passed
  supporter count threshold passed
  period covered
  proof timestamp
```

### 2.4 disclose 是一个好演示点

社区文章提到 `disclose` 是 Compact 里表达“哪些数据要公开”的关键概念。

对我们项目的影响：

前端可以设计一个非常直观的 UI：

```text
Private Data:
- sponsor list
- exact amounts
- full ledger

Disclosed Data:
- revenue above threshold: yes
- supporter count above threshold: yes
- report period: April 2026
```

这样评委一眼能看懂：

```text
不是所有数据都公开，而是选择性披露。
```

### 2.5 社区也在讨论 AI 编程 Skill

Reddit / Midnight 社区里有开发者开源了面向 Compact 的 Agent Skill，用于 Claude Code / Cursor / VS Code Copilot 等 AI coding assistant。

对我们项目的影响：

这和学习者的 AI 编程路线非常契合。

我们可以在 README 里强调：

```text
This project was developed with an AI-assisted Web3 workflow.
```

但要注意：

- 不能把 AI 当核心噱头。
- AI 是开发方式和报告层。
- 核心价值仍然是 privacy-preserving proof。

## 3. 对 CreatorVault AI 的直接改造建议

### 3.1 改名/副标题

保留主名：

```text
CreatorVault AI
```

加更强副标题：

```text
Private Income Proofs for Creators
```

### 3.2 首页第一屏

建议第一屏文案：

```text
Prove creator income without exposing private sponsor data.
```

副文案：

```text
CreatorVault AI helps creators generate verifiable income reports while keeping sponsor identities, exact payments, and private revenue ledgers protected.
```

三个功能点：

```text
Verify income thresholds
Protect sponsor privacy
Generate AI-ready reports
```

### 3.3 核心 Demo 场景

把 Demo 从“打赏”改成“证明”：

```text
1. Creator Alice has private sponsorship records.
2. Alice wants to prove monthly revenue > $1,000.
3. The app creates a proof card.
4. Public report shows threshold passed.
5. Sponsor identities and exact amounts remain hidden.
```

### 3.4 技术页面必须解释 public/private

新增 Architecture 区块：

```text
Private inputs:
- sponsor addresses
- individual sponsorship amounts
- full revenue ledger

Public disclosure:
- threshold result
- supporter count range
- report period
- proof hash / commitment
```

### 3.5 Compact 最小样例方向

哪怕黑客松期间无法完整接上 Midnight，也可以准备一个最小 Compact 方向：

```text
circuit proveIncomeAboveThreshold(privateLedger, threshold) {
  total = sum(privateLedger)
  assert(total >= threshold)
  disclose(threshold)
  disclose(true)
}
```

真实语法要以后按官方 docs 修正，但业务表达要提前定下来。

## 4. 目前社区信息对项目的价值

有用：

- 证明项目方向应该是“private proof”，不是普通 vault。
- 明确 UI 要突出 selective disclosure。
- 明确 README 要解释 Compact / witness / disclose。
- 明确 Demo 要展示“证明阈值但隐藏明细”。
- AI 编程 Skill 生态可以成为辅助亮点。

没必要现在深挖：

- 复杂 ZK 数学。
- 完整 Midnight 节点运维。
- 高级 shielded token 细节。
- Midnight 代币经济。

## 5. 下一步社区行动

建议进入 Discord 后发问题：

```text
Hi everyone, I’m preparing for the Midnight Hackathon and building CreatorVault AI: private income proofs for creators.

The goal is to let creators prove income thresholds and supporter count without revealing sponsor identities or exact payment amounts.

I’m new to Compact and would love guidance on:
1. Which starter template should I use for a small dApp?
2. Is there a recommended pattern for private inputs / witnesses?
3. How should I model selective disclosure for threshold proofs?
4. Are there example apps that prove a condition over private records?

Thanks!
```

中文意思：

```text
我正在做一个创作者隐私收入证明项目。创作者可以证明收入超过某个门槛、支持者数量超过某个门槛，但不公开赞助人身份和每笔金额。请问 Compact 应该用什么 starter、private input/witness 怎么建模、有没有类似例子？
```

## 6. 参考链接

- Compact language blog：https://midnight.network/blog/compact-the-smart-contract-language-of-midnight
- Compact bulletin board tutorial：https://midnight.network/blog/tutorial-building-a-bulletin-board-smart-contract-with-compact
- Compact under the hood forum thread：https://forum.midnight.network/t/compact-under-the-hood-how-midnight-s-smart-contract-language-encodes-privacy-by-default/1092
- Midnight Forum：https://forum.midnight.network/
- Midnight Docs：https://docs.midnight.network/
- Midnight Hackathon Resources：https://midnight.network/hackathon-resources
- Compact by Example：https://compact-by-example.org/
- Awesome Midnight：https://awesomemidnight.com/
- Compact Lab：https://compactlab.dev/

