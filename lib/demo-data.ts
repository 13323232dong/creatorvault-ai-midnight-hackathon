import type { Creator } from "@/types/creator"
import type { SponsorshipRecord } from "@/types/sponsorship"

// demoCreator 是演示用创作者。
// 真实产品里，这些数据可能来自用户登录资料、钱包地址、链上 profile 或后端数据库。
export const demoCreator: Creator = {
  id: "alice",
  name: "Alice Chen",
  handle: "@alicebuilds",
  category: "Open-source creator",
  walletAddress: "0xA11CE00000000000000000000000000000000000",
  reportPeriod: "April 2026",
  avatarInitials: "AC",
}

// demoSponsorshipRecords 是演示用的私密收入账本。
// 每条 sponsorship record 都会参与 proof 计算。
// isPrivate 的含义：
// - true：公开报告隐藏 sponsor 身份和具体金额
// - false：可以在公开界面展示 sponsor label 或金额
// 在 Midnight/ZK 的语境里，这类数据未来可以变成 private witness。
export const demoSponsorshipRecords: SponsorshipRecord[] = [
  {
    id: "sp-001",
    sponsorLabel: "Private sponsor 01",
    sponsorAddress: "0x8c1F000000000000000000000000000000000001",
    amountUsd: 320,
    isPrivate: true,
    createdAt: "2026-04-03",
  },
  {
    id: "sp-002",
    sponsorLabel: "Builder DAO",
    sponsorAddress: "0x8c1F000000000000000000000000000000000002",
    amountUsd: 240,
    isPrivate: false,
    createdAt: "2026-04-08",
  },
  {
    id: "sp-003",
    sponsorLabel: "Private sponsor 02",
    sponsorAddress: "0x8c1F000000000000000000000000000000000003",
    amountUsd: 510,
    isPrivate: true,
    createdAt: "2026-04-15",
  },
  {
    id: "sp-004",
    sponsorLabel: "Community grant",
    sponsorAddress: "0x8c1F000000000000000000000000000000000004",
    amountUsd: 180,
    isPrivate: false,
    createdAt: "2026-04-22",
  },
]
