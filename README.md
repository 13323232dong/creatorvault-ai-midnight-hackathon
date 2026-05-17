# CreatorVault AI

Private Income Proofs for Creators.

CreatorVault AI is a hackathon MVP for privacy-preserving creator verification.
It lets a creator prove income and supporter thresholds without exposing every
sponsor identity, payment amount, or private revenue record.

## Hackathon Context

- Event: Midnight Hackathon: May 2026
- Dates: 2026-05-15 to 2026-05-17
- Format: Online
- Registration status: registered
- Event page: https://events.mlh.io/events/14061-midnight-hackathon-may-2026

## Hackathon Work Disclosure

The product idea and planning notes existed before the event. The submitted
implementation snapshot, Midnight Compact integration, Lace deployment flow,
Midnight Preprod contract deployment, deployment diagnostics, and demo-facing
documentation were completed during the Midnight Hackathon period.

## Project Documents

- `requirements.md`: product requirements and user stories
- `technical-implementation.md`: implementation architecture and build path
- `proof-spec.md`: private witness, public inputs, public outputs, and verifier rules
- `contract-spec.md`: verifier and proof registry smart contract design
- `development-log.md`: development troubleshooting records and learning notes
- `doc1/judge-optimized-build-plan.md`: judge-focused delivery plan
- `winning-strategy.md`: positioning and demo strategy
- `doc1/community-research.md`: Midnight/community research notes
- `doc1/deployment-plan.md`: self-hosted deployment plan for `creatorvault.ohmycode.cc`
- `project-plan.md`: project schedule and execution plan
- `submission-template.md`: draft hackathon submission copy

## What This Project Demonstrates

- Private sponsorship records stay hidden in the creator-side ledger.
- Public reports disclose only threshold results and proof metadata.
- AI-readable reports help brands, DAOs, and grant committees evaluate creators
  without asking for the full private income history.
- The current MVP includes a real Midnight Preprod deployment of the Compact
  proof registry contract, plus a TypeScript proof simulation for the product
  demo flow.

## Midnight Preprod Deployment

CreatorVault's first Compact proof registry contract is deployed on Midnight
Preprod.

```text
network=preprod
contractAddress=799d2a5a63fd3abcb8c6b892d7e46d234db66b3570e07092a78372ea96720774
txId=005dae86d1b76d11dcbf9391cb10d41302dd6f60ad41d91744c661a48c90d5dd11
txHash=11888e8a79cd8a269a114a97643589c3ec944d46d322d410236fe7e0c41a6c30
blockHeight=798723
status=SUCCESS
```

The `/deploy` page shows this chain deployment and records deployment
diagnostics from Lace, proof generation, transaction balancing, and Preprod
indexer confirmation.

## MVP Scope

The first framework version includes:

- Next.js app shell
- Dashboard page
- Sponsor simulator page
- Privacy-safe report page
- Architecture mapping page
- Midnight deploy page with the confirmed Preprod contract address
- Lace wallet connection through the Midnight DApp Connector API
- TypeScript proof simulation
- Demo data model for creators, sponsors, proofs, and reports

The next implementation step is a demo proof submission flow that writes a proof
result to the already deployed Midnight Preprod contract.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run typecheck
npm run build
npm run compact:creator-vault
```

## Compact Contract Status

The first Midnight Compact contract is in place:

- `contracts/src/creator_vault.compact`: public proof registry contract.
- `contracts/managed/creator-vault`: generated Compact artifacts, verifier/prover keys, and ZK IR.

The contract currently records public proof metadata only. It does not store the
private sponsorship ledger. The private income ledger remains a front-end demo
model / witness concept, while the deployed Preprod contract acts as the public
registry for proof results.

## Midnight Integration Status

The first real Midnight integration layer is now in place:

- `lib/midnight/wallet.ts` discovers wallets from `window.midnight`.
- `components/MidnightWalletPanel.tsx` connects through the official Midnight
  DApp Connector API.
- `components/CreatorVaultDeployPanel.tsx` deploys and restores the confirmed
  Midnight Preprod contract state.
- `lib/midnight/creator-vault-contract.ts` builds the deploy transaction,
  delegates balancing/signing to Lace, and checks the Preprod indexer if Lace
  returns a submit error after the transaction is already indexed.
- The Architecture page shows wallet connection status, addresses, and wallet
  service configuration when a compatible wallet is available.

Environment note:

- Node.js 22+ is required for current Midnight tooling.
- Local proof-server based development requires Docker.
- This Mac currently has Node.js 22 and Docker Desktop available. The Docker CLI
  is linked into `/opt/homebrew/bin/docker` and `docker run --rm hello-world`
  has passed.

## Learning Notes

这个项目不是普通打赏 App。它的核心不是“转账”，而是：

1. 创作者有一份私密收入账本。
2. 系统证明“收入超过某个门槛”或“支持者数量超过某个门槛”。
3. 外部品牌/DAO 只看到验证结果，不看到完整赞助名单和每笔收入。
4. 这就是 ZK / 隐私链项目的业务价值：证明事实，而不是暴露原始数据。

当前阶段先用 TypeScript 模拟证明流程。后续如果接入 Midnight，私密收入记录会更接近
private witness，公开报告会更接近 disclosed output。

## Submission Direction

Demo story:

1. Alice is a creator.
2. She wants brand or DAO sponsorship.
3. She needs to prove credibility and income threshold.
4. She does not want to reveal every sponsor and every payment.
5. CreatorVault AI generates a privacy-safe proof card and AI-readable report.

This is optimized for the Midnight theme: privacy, selective disclosure, user data
control, and zero-knowledge-style proof thinking.
