# CreatorVault AI Privacy Edition - 项目计划方案

更新时间：2026-05-07

## 1. 项目定位

项目名：

```text
CreatorVault AI Privacy Edition
```

一句话：

```text
一个面向创作者的隐私友好型链上收入金库：公开可验证的收入汇总，保护赞助人和收入明细，AI 自动生成创作者收入报告和社区治理摘要。
```

这次 Midnight Hackathon 的主题偏向：

- 隐私
- 数据保护
- 零知识证明
- 用户数据控制
- Midnight / Compact 生态

所以项目不再只是“链上打赏金库”，而是升级成：

```text
可信收入规则 + 可控隐私披露 + AI 报告
```

## 2. 业务问题

传统创作者平台的问题：

- 收入规则由平台控制，创作者和粉丝很难验证。
- 平台可以冻结、延迟、修改提现规则。
- 创作者收入明细完全由平台后台掌握。
- 如果直接搬到普通公链，所有赞助人和金额又会过度公开。

CreatorVault AI 要表达的答案：

- 用链上规则保证收入和提现逻辑可信。
- 用隐私设计避免敏感明细全部公开。
- 用 AI 把链上数据转成创作者/社区能读懂的报告。

## 3. MVP 范围

黑客松最低可交付版本：

1. 首页 / Dashboard
2. 钱包连接
3. 创作者金库展示
4. 赞助入口
5. 收入汇总展示
6. 隐私报告模块
7. AI 生成收入摘要
8. 技术说明页：公开数据 vs 私密数据
9. GitHub README
10. 可访问的线上 Demo

优先保证：

- 评委能打开页面。
- 能 2 分钟内理解项目解决什么问题。
- 能看到完整用户流程。
- 能看到 Midnight 隐私主题的明确适配。

## 4. 技术路线

### 4.1 前端

推荐：

- Next.js
- React
- TypeScript
- Tailwind CSS
- viem
- lucide-react

原因：

- Next.js 更适合快速做黑客松展示项目。
- React/TypeScript 是 Web3 前端主流。
- viem 已经在当前 BeanVault Demo 中跑通过。
- Tailwind 适合快速做专业 UI。

### 4.2 智能合约 / 链上逻辑

赛前原型：

- Solidity
- Hardhat 或 Foundry
- Anvil 本地链
- BeanUSD ERC20
- CreatorVault / LocalFundMe 演化版

正式参赛要根据 Midnight 文档决定：

路线 A：Midnight 原生最小合约

- Compact / Minokawa
- Midnight SDK
- Midnight 测试网络
- 实现一个最小隐私收入记录或选择性披露 demo

路线 B：EVM 原型 + Midnight 隐私设计演示

- EVM 合约跑通真实 DApp 流程
- 前端清楚标注哪些数据应该进入 Midnight 隐私层
- 用 AI 报告和隐私开关演示选择性披露
- README 说明下一步迁移到 Midnight Compact

优先策略：

```text
先做能交付的 EVM/前端完整产品，再尽快补 Midnight 原生最小模块。
```

### 4.3 AI 模块

赛前 / MVP：

- 先做前端 mock AI 报告。
- 输入收入汇总、赞助人数、增长趋势。
- 输出创作者月报、社区公告、治理提案草稿。

可选增强：

- 自己服务器加一个 Node.js API。
- 后续接 OpenAI / 本地模型 / 其他 LLM API。

黑客松阶段建议：

```text
AI 模块先做成可演示，不把核心交付卡在 API 额度或后端稳定性上。
```

### 4.4 部署

使用自有服务器，不使用 Vercel / Netlify。

服务器：

```text
216.36.112.134
```

域名：

```text
ohmycode.cc
```

推荐 Demo 域名：

```text
creatorvault.ohmycode.cc
```

备选：

```text
midnight.ohmycode.cc
hackathon.ohmycode.cc
```

不建议直接部署到主域名：

```text
ohmycode.cc
```

原因：

- 避免影响服务器上已有项目。
- 子域名可以独立 Nginx 配置。
- 比赛结束后也容易下线或迁移。

## 5. 服务器部署原则

目标：

```text
新增一个独立站点，不影响任何现有项目。
```

部署策略：

- 使用独立目录：`/var/www/creatorvault-ai`
- 使用独立 Nginx server block
- 使用独立子域名：`creatorvault.ohmycode.cc`
- 如需 Node 后端，使用独立端口：`4310` / `4311`
- 如需 Docker，使用独立 compose project name：`creatorvault-ai`
- 不修改已有站点配置
- 修改 Nginx 前先备份配置
- 每次变更后执行 `nginx -t`
- 只在测试通过后 reload Nginx

建议目录：

```text
/opt/creatorvault-ai
/var/www/creatorvault-ai
/etc/nginx/sites-available/creatorvault-ai.conf
/etc/nginx/sites-enabled/creatorvault-ai.conf
```

HTTPS：

- 推荐用 certbot 给 `creatorvault.ohmycode.cc` 单独签证书。
- 不改动已有域名证书。

DNS：

```text
creatorvault.ohmycode.cc A 216.36.112.134
```

或：

```text
hackathon.ohmycode.cc A 216.36.112.134
```

## 6. 安全注意

SSH 登录信息不要写进 GitHub、README、项目文档或提交模板。

建议：

- 当前密码只用于临时部署。
- 开赛前改成 SSH key 登录。
- 至少比赛结束后轮换 SSH 密码。
- 服务器上不要保存钱包私钥。
- 不要把 `.env` 上传 GitHub。
- AI API Key 只放服务器环境变量。
- 前端公开环境变量只能放非敏感配置。

## 7. 代码仓库策略

赛前仓库：

```text
/Users/mac/web3.0_lession
```

用途：

- 方案设计
- 原型开发
- 踩坑
- 准备 README
- 准备提交材料

正式参赛仓库：

```text
creatorvault-ai-midnight
```

开赛后新建 GitHub repo。

原因：

- 保留真实黑客松开发 commit 历史。
- 避免把赛前杂乱资料和学习代码提交给评委。
- README 更聚焦。

## 8. 开赛后 Commit 计划

建议 commit 顺序：

```text
01 init CreatorVault AI project
02 add project layout and design system
03 add creator vault domain model
04 add wallet connection shell
05 add sponsorship dashboard
06 add EVM prototype contract and deployment notes
07 add ERC20 sponsorship flow
08 add privacy report UI
09 add AI creator summary module
10 add Midnight research notes and privacy architecture
11 add demo data and walkthrough flow
12 add deployment config for own server
13 write hackathon README
14 polish mobile layout and copy
15 add demo video script and submission notes
```

如果 Midnight 原生合约能跑通，插入：

```text
add Compact private income proof prototype
add Midnight contract interaction notes
```

## 9. 时间计划

### 2026-05-07 到 2026-05-10：赛前方案和原型

- 完成项目计划。
- 学习 Midnight Docs 最小开发路径。
- 明确 EVM 原型与 Midnight 隐私层边界。
- 做第一版 UI 信息架构。
- 把当前 BeanVault 业务模型升级成 CreatorVault。

### 2026-05-11 到 2026-05-14：赛前排练

- 跑通本地完整流程。
- 准备服务器部署脚本。
- 准备 README 英文版。
- 准备 Demo 视频脚本。
- 检查 DNS / Nginx / HTTPS。

### 2026-05-15：开赛第一天

- 新建正式 GitHub repo。
- 初始化项目。
- 按 commit plan 逐步提交。
- 完成基础页面、钱包连接、金库展示。

### 2026-05-16：开赛第二天

- 完成赞助流程。
- 完成隐私报告 UI。
- 完成 AI 摘要模块。
- 完成 Midnight 适配说明或最小 Compact demo。
- 部署到自有服务器。

### 2026-05-17：提交日

- 修 bug。
- 录制 Demo 视频。
- 更新 README。
- 检查线上 Demo。
- 在 MLH 页面提交项目。

## 10. 页面结构

建议页面：

1. Dashboard
   - 项目名
   - 创作者收入金库
   - 公开收入汇总
   - 隐私状态说明

2. Sponsor
   - 钱包连接
   - 赞助金额
   - 匿名 / 公开赞助选项
   - 交易状态

3. Privacy Report
   - 总收入
   - 赞助人数
   - 收入区间
   - 不展示单个赞助人明细

4. AI Summary
   - 创作者月报
   - 社区公告
   - 治理提案草稿

5. Architecture
   - Public data
   - Private data
   - ZK / selective disclosure concept
   - Midnight future integration

## 11. 提交材料

需要准备：

- GitHub repo
- Demo URL：`https://creatorvault.ohmycode.cc`
- Demo video
- Project name
- Short tagline
- Long description
- Tech stack
- What was built during hackathon
- How it uses Midnight / privacy
- Future work

## 12. 风险和备选方案

风险：Midnight 原生开发环境时间不够。

备选：

- 先交付完整 EVM + 隐私设计原型。
- README 明确解释 Midnight 适配路线。
- Demo 强调选择性披露和数据控制。

风险：自有服务器已有项目，怕影响。

备选：

- 只新增子域名。
- 只新增 Nginx server block。
- 不改默认站点。
- 不使用常见端口以外的已有服务端口。

风险：AI API 不稳定。

备选：

- AI 报告用 deterministic mock。
- README 写明可接 LLM API。

风险：合约部署不稳定。

备选：

- 前端保留 demo mode。
- 同时提供本地运行说明。

