# CreatorVault AI 开发记录表

## 2026-05-08 - Lace / Midnight 钱包连接排障

| 阶段 | 现象 | 根因 | 处理方式 | 复习要点 |
| --- | --- | --- | --- | --- |
| 1 | 页面一开始找不到钱包，或者只看到 `window.ethereum detected` | 浏览器里有 MetaMask，但 Midnight DApp 不走 `window.ethereum`，而是走 `window.midnight` | 在 `lib/midnight/wallet.ts` 增加 `window.midnight` 钱包发现逻辑，在页面显示 injected API diagnostics | 以太坊钱包入口是 `window.ethereum`；Midnight DApp Connector 入口是 `window.midnight.{walletId}` |
| 2 | `Network ID mismatch` | DApp 传入的 network id 和 Lace 钱包当前 Midnight 网络不一致 | 页面增加 Midnight 网络下拉框，并支持 `undeployed / preprod / preview / mainnet` 等候选网络 | DApp 不能强行切换钱包网络；`wallet.connect("preprod")` 必须匹配钱包当前网络 |
| 3 | 自动匹配后显示 `mainnet: connected.hintUsage is not a function` | Lace 当前版本返回的 connected API 没有实现 `hintUsage`，但代码把它当成必有函数调用 | 把 `connected.hintUsage(...)` 改成 `connected.hintUsage?.(...)` 可选调用 | `hintUsage` 只是提示钱包 DApp 可能使用哪些能力，不是连接成功的必要条件 |
| 4 | Next.js 红屏：`__webpack_modules__[moduleId] is not a function` | 开发模式热更新缓存错乱，浏览器还拿着旧 webpack chunk | 停掉 3000 端口进程，删除 `.next`，重启 `npm run dev`，浏览器强刷 | 这是 dev server/HMR 缓存问题，不代表链或钱包逻辑坏了 |
| 5 | 红屏：`Failed to connect to MetaMask` | MetaMask 插件注入脚本自己报错，被 Next dev overlay 捕获 | 在 `app/layout.tsx` 增加只过滤 MetaMask 插件噪音的脚本；真实项目错误仍正常显示 | 这个项目接的是 Lace/Midnight，不需要 MetaMask |
| 6 | Lace 弹出 `Authorize DApp`，但页面最后显示 `Access to wallet api denied` | 钱包授权流程被取消或没有点最终 `Authorize` | 找到正确的主 Lace 授权窗口，确认站点是 `CreatorVault AI / http://localhost:3000` 后点 `Authorize` | 解锁钱包和授权 DApp 是两步：先 unlock，再 authorize |
| 7 | 页面显示 `Wallet is locked. Please unlock the wallet first.` | 操作到了主 Lace，但主 Lace 钱包仍处于锁定状态；之前可能解锁的是旧的 `Lace Midnight Preview` 插件 | 打开主 Lace 插件 `gafhhkghbfjjkeiendhlofajokpaflmk`，输入主 Lace 密码解锁 | 旧 `Lace Midnight Preview` 已废弃，不要和主 Lace 混用 |
| 8 | 最终页面出现 `Connection snapshot`，`Status: connected` | DApp 成功通过 `window.midnight` 连接到主 Lace 钱包 | 页面显示钱包地址、余额、Indexer、Substrate RPC 等配置 | 判断接上钱包的标准不是“插件打开了”，而是页面出现 `Status: connected` 和钱包配置 |

### 本次最终状态

当前已经跑通：

```text
DApp -> window.midnight -> Lace wallet -> Midnight service configuration
```

页面已经显示：

```text
Status: connected
DApp requested network: mainnet
Network: mainnet
Indexer: https://indexer.mainnet.midnight.network/api/v4/graphql
Substrate node: https://rpc.mainnet.midnight.network
```

### 仍需修正的学习环境方向

当前连接成功的是 `mainnet`，但学习和开发阶段应该优先使用测试网。

下一步应该做：

```text
1. 在主 Lace 钱包中切换 Midnight 网络到 Preprod 或 Preview
2. 在 CreatorVault AI 页面选择同一个网络
3. 再点“按所选网络连接”
4. 成功后应显示 Network: preprod 或 Network: preview
```

### 关键心智模型

```text
钱包插件被检测到 != 钱包已连接
钱包已解锁 != DApp 已授权
DApp 选择网络 != 钱包当前网络
旧 Preview 插件 != 主 Lace 插件
Status: connected 才是连接成功
```

## 2026-05-08 - 区块链候选区块学习笔记

### 核心概念

交易不是一发出去就直接变成最终历史。

更准确的过程是：

```text
用户发交易
↓
交易进入 mempool / 交易池
↓
区块生产者挑选交易
↓
区块生产者把交易打包成候选区块
↓
区块生产者先执行这些交易
↓
得到新的状态 root、receipt、event logs
↓
把候选区块广播给其他节点
↓
其他节点重新执行和验证
↓
验证一致，候选区块才被接受为新区块
```

### 候选区块是什么

候选区块可以理解为：

```text
区块生产者提出的一版“下一页账本草稿”
```

它还不是全网最终承认的历史。

它里面通常包含：

```text
上一块的哈希
交易列表
执行后的状态摘要
交易回执
区块生产者签名/证明
```

### 为什么要叫候选区块

因为区块生产者不能自己说了算。

它只能提出：

```text
我认为下一块应该长这样
```

其他节点会检查：

```text
1. 它接的是不是当前认可的链尾
2. 区块格式是否合法
3. 每笔交易签名是否合法
4. 每笔交易 nonce / gas / 余额是否合法
5. 智能合约 bytecode 执行结果是否一致
6. 最终状态 root 是否对得上
7. 区块奖励 / 手续费分配是否正确
8. 共识规则是否满足
```

如果验证通过：

```text
候选区块 -> 被接受的新区块
```

如果验证失败：

```text
候选区块 -> 被拒绝
```

### 和智能合约执行的关系

智能合约不是“前端说成功就成功”。

真正流程是：

```text
交易调用合约函数
↓
区块生产者在候选区块里执行合约 bytecode
↓
其他节点也重新执行同样 bytecode
↓
所有节点算出同样状态变化
↓
区块才被接受
```

所以节点验证的是：

```text
当前状态 + 交易输入 + 合约 bytecode
是否能确定性地变成候选区块声明的新状态
```

### 对黑客攻击的理解

黑客多数不是篡改候选区块。

更常见的是：

```text
发现合约规则漏洞
↓
构造一笔“链上规则允许”的交易
↓
让这笔交易进入候选区块
↓
节点诚实执行错误规则
↓
资产被转走
```

也就是说：

```text
区块链保证规则被忠实执行
但不保证规则本身写得正确
```

### 记忆句

```text
候选区块 = 下一页账本草稿。
节点验证 = 全网重新算一遍这页草稿是否合规。
智能合约漏洞 = 草稿合规，但规则本身有洞。
```

## 2026-05-08: 抽离全局 Midnight 钱包状态 Provider

### 这一步解决什么

之前 `MidnightWalletPanel` 自己管理钱包发现、网络选择、连接状态。

这适合调试，但不适合真实 DApp：

```text
首页需要知道钱包是否连接
赞助页需要知道钱包地址
报告页需要知道当前网络
架构页需要管理连接动作
```

如果每个页面各管一份状态，就会变成“多个前端页面各自猜钱包状态”，业务会乱。

所以现在抽成：

```text
MidnightWalletProvider
↓
全站共享 wallets / selectedWallet / networkId / connection / error
↓
Dashboard / Architecture / Sponsor / Report 都可以读取同一份钱包状态
```

### 改动文件

```text
components/MidnightWalletProvider.tsx
```

全局钱包状态中心，负责：

```text
发现浏览器注入的钱包
选择 Lace 钱包
选择 Midnight 网络
连接钱包
保存连接快照
暴露 useMidnightWallet() 给页面和组件调用
```

```text
app/providers.tsx
```

Next.js 的客户端 Provider 入口。

```text
app/layout.tsx
```

把整个应用包进 `AppProviders`，让所有页面都能读钱包状态。

```text
components/MidnightConnectionStatus.tsx
```

首页的钱包状态摘要。它不负责连接细节，只负责展示当前钱包层是否接上。

```text
components/MidnightWalletPanel.tsx
```

从“自己管理状态”改成“消费全局 Provider 状态”。

### 验证结果

```text
npm run typecheck 通过
npm run build 通过
首页 / 正常显示钱包状态摘要
架构页 /architecture 正常显示钱包管理面板
```

`npm run lint` 当前会进入 Next.js 15 的交互式 ESLint 初始化提示，说明项目还没有正式 ESLint 配置；这不是业务代码错误，后续需要单独补工具链配置。

### 当前状态

现在项目已经从：

```text
单页面调试钱包
```

推进到：

```text
全站共享钱包连接状态
```

下一步可以把 `Sponsor` 和 `Report` 页面接入这份状态，让赞助动作、证明生成动作都知道当前钱包、当前网络和当前连接状态。

## 2026-05-08: 增加中英切换

### 这一步解决什么

项目现在既要给英文评委看，也要方便中文学习和复盘。

所以新增一个轻量语言层：

```text
LanguageProvider
↓
全站共享 language / setLanguage / t()
↓
导航、首页、赞助页、报告页、架构页和核心卡片即时切换中英文
```

### 改动文件

```text
components/LanguageProvider.tsx
```

全局语言状态中心，保存当前语言，并写入 `localStorage`。

```text
components/LanguageToggle.tsx
```

顶部导航右侧的 EN / 中 切换按钮。

```text
lib/localized-labels.ts
```

把 demo 数据里的固定字段映射成中文，例如：

```text
income threshold -> 收入门槛
sponsor identities -> 赞助者身份
Open-source creator -> 开源创作者
April 2026 -> 2026 年 4 月
```

### 覆盖范围

```text
Dashboard 首页
Sponsor 赞助页
Report 报告页
Architecture 架构页
ProofCard 证明卡
PrivacyDataPanel 隐私/公开数据面板
AiReportPanel AI 报告面板
CreatorProfile 创作者资料卡
MidnightWalletPanel 钱包连接面板
MidnightConnectionStatus 首页钱包状态条
```

### 验证结果

```text
npm run typecheck 通过
npm run build 通过
桌面首页中英切换通过
桌面架构页中英切换通过
移动端首页中英切换通过
```

### 注意

这不是完整的国际化路由方案，例如 `/en`、`/zh` 这种 URL 级 i18n。

当前更适合 hackathon MVP：

```text
一个应用入口
一个语言切换器
快速给评委看英文
快速给自己和中文用户看中文
```

## 2026-05-09: CreatorVault 合约编译与测试链部署入口

### 这一步完成了什么

本轮把项目从“只有前端演示和钱包连接”推进到“具备测试链部署合约的入口”。

当前已经完成：

```text
Compact 智能合约源码
↓
Compact compiler 编译
↓
生成 contract / keys / zkir artifacts
↓
前端部署页读取 artifacts
↓
通过 Lace DApp Connector 发起 Preprod 部署交易
```

### 关键文件

```text
contracts/src/creator_vault.compact
```

CreatorVault 第一版 Midnight / Compact 合约。

它现在负责登记公开 proof 结果：

```text
latestProofKey
latestCreatorIdHash
latestPeriodHash
latestProofSchemaVersion
latestIncomeThresholdUsdCents
latestSupporterThreshold
latestProofCommitment
proofCount
```

注意：它还不是完整 ZK verifier，只是 proof 公开结果登记层。真实私密赞助明细仍然不应该放链上。

```text
contracts/managed/creator-vault/
```

Compact 编译产物。可以理解成 Midnight 生态里的“合约可部署 artifact”：

```text
contract/index.js
keys/*.prover
keys/*.verifier
zkir/*.bzkir
```

```text
public/creator-vault/
```

浏览器部署时不能直接读取本机文件系统，所以把 ZK artifact 复制到 public 目录，通过 HTTP 给前端 SDK 获取。

```text
lib/midnight/creator-vault-contract.ts
```

部署逻辑核心：

```text
CompiledContract.make(...)
FetchZkConfigProvider(...)
connected.getProvingProvider(...)
connected.balanceUnsealedTransaction(...)
connected.submitTransaction(...)
deployContract(...)
```

这就是 DApp 前端调用 Lace 钱包，把部署交易发到 Midnight Preprod 的桥。

```text
components/CreatorVaultDeployPanel.tsx
app/deploy/page.tsx
```

新增“部署合约”页面。页面会检查：

```text
钱包是否连接
网络是否是 preprod
DUST 是否可读
是否可以发起部署
```

### 本轮遇到的问题

| 问题 | 原因 | 处理 |
| --- | --- | --- |
| Next build 找不到 `wallet-sdk-address-format` | Midnight indexer provider 间接依赖该包 | 安装 `@midnight-ntwrk/wallet-sdk-address-format` |
| WebAssembly 编译失败 | Midnight ledger/runtime 使用 `.wasm`，Next/Webpack 默认未启用 wasm | 在 `next.config.mjs` 开启 `asyncWebAssembly` |
| 浏览器包尝试解析 `fs` | 部分 Midnight SDK 同时兼容 Node 和 Browser | 在 Webpack fallback 中禁用 `fs/net/tls` |
| `isomorphic-ws` 命名导出不匹配 | SDK 以 `ws.WebSocket` 方式读取，但浏览器包默认导出不同 | 增加 `lib/shims/isomorphic-ws.ts` 适配浏览器 WebSocket |
| Lace 弹窗要求密码 | 钱包部署交易必须由用户授权 | 停在用户输入密码/授权步骤，不代输入钱包密码 |

### 当前状态

已经通过：

```text
npm run typecheck
npm run build
```

本地服务：

```text
http://localhost:3000/deploy
```

当前部署流程停在 Lace 钱包授权：

```text
输入 Lace 钱包密码
↓
Confirm
↓
Authorize DApp
↓
回到部署页点击“部署合约”
```

### 学习要点

```text
tNIGHT 不是直接等于 tDUST。
tNIGHT 提供 DUST 生成资格和上限。
tDUST 是 Midnight 上支付交易/部署手续费的燃料。
```

```text
合约部署不是前端上传一个文件。
它是前端用 artifact 构造部署交易，钱包补手续费和签名，然后广播到测试链。
```

```text
部署成功后会得到合约地址。
后续所有 proof 提交和状态读取，都围绕这个合约地址发生。
```

## 2026-05-09：Preprod 部署失败复盘和本地优先策略

### 这次部署为什么失败

第一次失败：

```text
APIError User rejected transaction
```

含义：Lace 钱包认为交易被用户拒绝或弹窗没有完成签名。这个阶段还没有真正进入链提交。

第二次失败：

```text
SubmissionError
```

含义：Lace 已经进入 `Prove transaction`，并且用户点了 `Sign transaction`，但是交易提交到 Midnight Preprod 时没有被测试链接收。

当时 Lace 同时显示：

```text
tDUST Tank Empty
```

所以当前最可能原因是：部署交易消耗了可用 tDUST，钱包里没有足够手续费燃料继续完成部署/提交。Preprod Faucet 还有 24 小时冷却限制，不能立即无限补充。

### 现在解决了什么

已解决：

```text
主 Lace 钱包连接
preprod 网络识别
旧 Preview 插件干扰
proof-server Docker 运行
部署弹窗能打开正确的 Prove transaction
合约编译和 TypeScript 本地检查
```

未完全解决：

```text
Preprod 链上部署还没有成功
当前主要卡点是 tDUST 手续费燃料不足 / 钱包 DUST Tank 恢复慢
```

### 后续策略

先本地跑通，再上链：

```text
npm run local:check
```

这个脚本只做：

```text
Compact 合约编译
TypeScript 类型检查
```

它不会连接钱包，不会广播交易，也不会消耗 tDUST。

等本地验证稳定、tDUST Tank 恢复到足够余额后，再只做一次真实 Preprod 部署。

## 2026-05-09：启动 Midnight 本地链

### 为什么切到本地链

Preprod 部署失败也可能消耗 tDUST，调试成本太高。后续采用：

```text
本地 Undeployed 网络反复部署和调试
↓
本地流程稳定
↓
最后只部署一次 Preprod
```

### 已安装/启动的本地工具

本地工具目录：

```text
/Users/mac/web3-tools/midnight-playground
```

启动了三个服务：

```text
node:         localhost:9944
indexer:      localhost:8088
proof-server: localhost:6300
```

项目脚本：

```text
npm run localnet:up
npm run localnet:down
npm run localnet:status
```

当前状态：

```text
node healthy
indexer healthy
proof-server running
```

### 项目侧调整

`components/CreatorVaultDeployPanel.tsx` 已从“只允许 Preprod 部署”改为：

```text
允许 undeployed 本地链
允许 preprod 测试链
```

这样 Lace 切到 `Undeployed` 后，部署页也能用于本地链部署。

### 还需要用户操作

Lace 需要手动切换到：

```text
Midnight -> Undeployed
```

然后复制 `Undeployed` 网络下的 unshielded 地址，用本地 fund 脚本打测试资产。不要把钱包助记词交给任何脚本或 AI；我们优先用地址资金注入方式。

## 2026-05-12：本地链优先，开发环境默认切到 Undeployed

### 这次更新做了什么

把 CreatorVault AI 的开发路径进一步收拢到本地链流程：

- 开发环境默认网络从 `preprod` 改为 `undeployed`
- 保留生产环境默认 `preprod` 的行为
- 继续沿用 `Undeployed / Preprod` 双路径部署入口
- 维持本地 proof-server 和本地 Midnight 链的调试优先级

### 当前验证结果

已验证通过：

```text
npm run typecheck
npm run compact:creator-vault
npm run build
```

说明当前项目代码、Compact 合约生成、Next.js 构建都能正常通过。

### 当前本地链进度

现在本地优先流程是：

```text
Lace / 钱包连接
↓
默认进入 Undeployed
↓
本地 proof-server / 本地链联调
↓
先跑通部署与证明模拟
↓
再回到 Preprod 做最终一次真实部署
```

### 下一步

继续补本地赞助 / proof 的交互闭环，重点看：

- 赞助入口是否能联动本地状态
- proof 模拟是否能稳定反映记录变化
- 部署页是否能在 Undeployed 路径下完整走通

## 2026-05-16：CreatorVault 合约成功部署到 Midnight Preprod

### 最终结果

CreatorVault Compact 合约已经成功部署到 Midnight Preprod 测试链。

链上记录：

```text
network=preprod
contractAddress=799d2a5a63fd3abcb8c6b892d7e46d234db66b3570e07092a78372ea96720774
txId=005dae86d1b76d11dcbf9391cb10d41302dd6f60ad41d91744c661a48c90d5dd11
txHash=11888e8a79cd8a269a114a97643589c3ec944d46d322d410236fe7e0c41a6c30
blockHeight=798723
status=SUCCESS
paidFees=178920000001
```

这是 CreatorVault AI 第一次把“隐私收入证明结果登记规则”真正写入 Midnight Preprod，而不是只停留在本地编译或前端模拟。

### 部署过程中遇到的问题

这次部署不是一次顺滑成功，中间主要遇到了四类问题。

1. **Preprod 手续费燃料不足**

早期部署尝试中，Lace 钱包显示 tDUST Tank 为空或不足。部署交易即使失败，也可能消耗一部分可用 DUST。Preprod Faucet 又有冷却限制，导致不能靠反复领取测试币来快速试错。

经验：

```text
Preprod 真实部署前必须先确认 Lace Midnight 侧栏里的 tDUST Tank 有余额。
页面里 connector 返回的是 raw DUST 数值，只能辅助判断。
真实链上调试要减少无意义重试，因为每次 proof / balance / submit 都可能消耗手续费机会。
```

2. **尝试切到本地 Undeployed 链调试，但链路没有完全跑通**

为了避免继续消耗 Preprod tDUST，中途把策略切成：

```text
本地 Undeployed 链反复调试
↓
流程稳定后再回 Preprod 做最终部署
```

本地链组件包括：

```text
node: localhost:9944
indexer: localhost:8088
proof-server: localhost:6300
```

但是本地链部署需要钱包网络、资产注入、indexer、proof-server、DApp 配置全部对齐。实际调试时，本地 Undeployed 路径仍然存在钱包资金和网络配置同步问题，没有比 Preprod 更快形成完整闭环。

经验：

```text
本地链适合反复测试，但前提是钱包网络、DUST/测试资产、indexer、proof-server 都已经稳定。
在黑客松时间紧张时，如果 Preprod 已经有可用 tDUST，直接修 Preprod 路径可能更快。
```

3. **Proof server 与 Lace 钱包提交路径需要区分清楚**

这次确认了 proof server 的角色：

```text
proof-server 负责生成 proof
Lace 负责平衡交易、补 DUST 手续费、签名
Midnight Preprod 节点负责接收交易
Indexer 负责后续查询链上结果
```

最终前端使用 Lace 返回的 Preprod 配置：

```text
indexer=https://indexer.preprod.midnight.network/api/v4/graphql
prover=https://proof-server.preprod.midnight.network
network=preprod
```

部署诊断证明交易已经走到：

```text
生成 proof
Lace balanceUnsealedTransaction 成功
Lace 返回 balanced transaction
submitTransaction 提交
```

所以问题不在 Compact 合约编译，也不在本地 TypeScript 构建。

4. **Lace submitTransaction 返回错误，但交易实际上已经上链**

最容易误判的是最后一步。页面显示：

```text
提交交易失败
Transaction submission error
Transaction submission failed
SubmissionError
```

但根据交易 identifier 去 Preprod indexer 查询，发现这笔交易已经进入区块：

```text
blockHeight=798723
transactionResult.status=SUCCESS
contractActions[0].__typename=ContractDeploy
contractActions[0].address=799d2a5a63fd3abcb8c6b892d7e46d234db66b3570e07092a78372ea96720774
```

也就是说，钱包/connector 返回了提交错误，但链上事实是成功。

经验：

```text
Midnight DApp 不能只依赖 submitTransaction 的返回值判断最终成败。
如果钱包返回 SubmissionError，但已经拿到 txId，需要继续用 indexer 按 identifier 查询。
链上状态优先于钱包 UI / connector 的空错误。
```

### 项目侧修复

为了解决这次问题，前端部署页做了几项关键调整：

```text
1. 部署页固定走 Preprod，避免比赛提交前误连本地链。
2. 部署过程增加诊断日志：网络、proof、balance、txId、txHexLength。
3. submitTransaction 抛错后，按 txId 轮询 Preprod indexer。
4. 如果 indexer 确认交易已经上链，则忽略 Lace submit 的假失败并继续按成功处理。
5. 已部署合约地址写入页面可恢复状态，刷新后仍显示“合约已部署”。
```

验证通过：

```text
npm run typecheck
npm run build
```

### 当前项目状态变化

部署成功后，CreatorVault AI 的状态从：

```text
前端 demo + Compact 合约编译成功
```

升级为：

```text
前端 demo + Compact 合约编译成功 + Midnight Preprod 链上合约已部署
```

这对黑客松提交很关键，因为项目现在有了真实链上锚点，可以在 README、demo 视频和提交材料里直接展示：

```text
CreatorVault proof registry deployed on Midnight Preprod.
```

### 下一步

优先完成比赛演示闭环：

- 在 README / submission 里写入合约地址、txId、区块高度
- 在 demo 视频中展示 Deploy 页的“合约已部署”状态
- 继续补一个提交 demo proof 到已部署合约的前端入口
- 把 Report / Architecture 页和链上合约地址串成一个完整故事
