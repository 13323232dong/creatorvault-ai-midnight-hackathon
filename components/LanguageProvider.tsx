"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Language } from "@/lib/language"

export type { Language }

const languageStorageKey = "creatorvault-language"

const en = {
  navDashboard: "Dashboard",
  navSponsor: "Sponsor",
  navReport: "Report",
  navCertificate: "Certificate",
  navArchitecture: "Architecture",
  navDeploy: "Deploy",
  languageEnglish: "EN",
  languageChinese: "中",
  brandTagline: "Private income proofs",
  heroBadge: "Built for privacy-preserving creator verification",
  heroTitle: "Prove creator income without exposing private sponsor data.",
  heroBody:
    "CreatorVault AI helps creators generate verifiable income reports while keeping sponsor identities, exact payments, and private revenue ledgers protected.",
  heroPrimary: "Generate report",
  heroSecondary: "View architecture",
  proofCardLabel: "Private proof card",
  proofTitle: "Monthly creator income threshold",
  proofPassed: "Passed",
  proofFailed: "Failed",
  incomeThreshold: "Income threshold",
  supporterThreshold: "Supporter threshold",
  supporters: "supporters",
  disclosedResult:
    "Disclosed result: Alice meets the income and supporter criteria for {period}.",
  hiddenDetails:
    "Hidden details: sponsor identities, exact payments, and the full private revenue ledger.",
  proofCommitment: "Proof commitment",
  privateDataTitle: "Private data",
  privateDataBody:
    "These values are used to create the proof, but are not disclosed in the public report.",
  disclosedDataTitle: "Disclosed data",
  disclosedDataBody:
    "These outputs are safe to share with brands, DAOs, and communities.",
  aiReportLabel: "AI-readable report",
  creatorCategory: "Creator category",
  reportPeriod: "Report period",
  publicWallet: "Public wallet",
  walletConnected: "Midnight wallet connected",
  walletNotConnected: "Midnight wallet not connected",
  walletConnectedBody: "Creator identity can now be attached to the proof workflow.",
  walletDetectedBody:
    "Lace is detected. Connect it before generating a live proof flow.",
  walletMissingBody: "Install or enable Lace to connect the live wallet layer.",
  manageWallet: "Manage wallet",
  wallet: "Wallet",
  network: "Network",
  address: "Address",
  notConnected: "Not connected",
  notDetected: "Not detected",
  midnightBridge: "Midnight wallet bridge",
  connectWalletLayer: "Connect real wallet layer",
  bridgeBody:
    "This panel is the first real Midnight integration point. It discovers wallets injected under window.midnight, connects through the official DApp Connector API, and reads wallet service configuration.",
  refresh: "Refresh",
  midnightNetwork: "Midnight network",
  noWalletDetected: "No Midnight wallet detected",
  connecting: "Connecting",
  connectSelectedNetwork: "Connect selected network",
  matching: "Matching",
  autoMatchNetwork: "Auto-match wallet network",
  noInjectedWallet:
    "No injected Midnight wallet was detected. Install or enable a wallet that supports the Midnight DApp Connector, then refresh this panel.",
  networkMismatchHint:
    "If Network ID mismatch appears, the network requested by this DApp differs from the current Midnight network in Lace. Switch the network in Lace or use auto-match.",
  injectedDiagnostics: "Injected API diagnostics",
  detected: "detected",
  connectionSnapshot: "Connection snapshot",
  status: "Status",
  requestedNetwork: "DApp requested network",
  disconnected: "Disconnected",
  unshieldedAddress: "Unshielded address",
  shieldedAddress: "Shielded address",
  walletConfiguration: "Wallet service configuration",
  indexer: "Indexer",
  substrateNode: "Substrate node",
  dustBalance: "Dust balance",
  architectureBadge: "Midnight mapping",
  architectureTitle: "From private ledger to disclosed proof",
  architectureBody:
    "The MVP simulates the proof flow in TypeScript. A Midnight-native version would model sponsorship records as private witnesses and disclose only threshold results through Compact circuits.",
  privateInputs: "Private inputs",
  privateInputsBody:
    "Sponsor identities, exact payments, and the full creator revenue ledger.",
  proofLogic: "Proof logic",
  proofLogicBody:
    "The app checks whether income and supporter thresholds are satisfied.",
  disclosedOutputs: "Disclosed outputs",
  disclosedOutputsBody:
    "Only the threshold result, reporting period, and proof commitment are public.",
  compactDirection: "Compact direction",
  sponsorBadge: "Sponsor simulator",
  sponsorTitle: "Public or private support",
  sponsorBody:
    "This first version models how sponsorship data can be used as private proof inputs while the public report only discloses threshold results.",
  demoSponsorship: "Demo sponsorship",
  amount: "Amount",
  public: "Public",
  private: "Private",
  sponsorSkeletonBody:
    "Interactive state lands next. The current skeleton locks the flow around the privacy story before adding wallet writes.",
  privateLedgerPreview: "Private ledger preview",
  privateSponsor: "Private sponsor",
  hidden: "Hidden",
  reportBadge: "Privacy-safe reports",
  reportTitle: "AI summaries from disclosed proof outputs",
  reportBody:
    "Reports use only threshold results, reporting period, and proof status. They do not include sponsor addresses or individual payments.",
  brandReportTitle: "Verified Creator Income Report",
  daoReportTitle: "DAO Grant Eligibility Summary",
  communityReportTitle: "Privacy-Safe Community Update",
  brandTarget: "brand review",
  daoTarget: "grant committee review",
  communityTarget: "community transparency",
  brandAction: "evaluate partnership fit",
  daoAction: "assess funding eligibility",
  communityAction: "understand creator momentum",
  reportSummary:
    "Alice passed the selected income and supporter thresholds for {period}. This report helps {target} {action} without exposing sponsor identities, exact payments, or the full private revenue ledger.",
  reportBulletIncome:
    "Income threshold verified without disclosing exact individual payments.",
  reportBulletSupporters:
    "Supporter threshold verified without revealing private sponsor identities.",
  reportBulletPrivacy:
    "The disclosed result is suitable for review while preserving creator and sponsor privacy.",
}

const zh: Record<keyof typeof en, string> = {
  navDashboard: "仪表盘",
  navSponsor: "赞助",
  navReport: "报告",
  navCertificate: "证书",
  navArchitecture: "架构",
  navDeploy: "部署",
  languageEnglish: "EN",
  languageChinese: "中",
  brandTagline: "隐私收入证明",
  heroBadge: "为创作者隐私验证而构建",
  heroTitle: "证明创作者收入，但不暴露私密赞助数据。",
  heroBody:
    "CreatorVault AI 帮创作者生成可验证的收入报告，同时保护赞助者身份、精确付款金额和私密收入账本。",
  heroPrimary: "生成报告",
  heroSecondary: "查看架构",
  proofCardLabel: "隐私证明卡",
  proofTitle: "月度创作者收入门槛",
  proofPassed: "已通过",
  proofFailed: "未通过",
  incomeThreshold: "收入门槛",
  supporterThreshold: "支持者门槛",
  supporters: "位支持者",
  disclosedResult: "公开结果：Alice 在 {period} 已满足收入和支持者门槛。",
  hiddenDetails: "隐藏细节：赞助者身份、精确付款金额、完整私密收入账本。",
  proofCommitment: "证明承诺值",
  privateDataTitle: "私密数据",
  privateDataBody: "这些值会参与证明生成，但不会出现在公开报告里。",
  disclosedDataTitle: "公开数据",
  disclosedDataBody: "这些输出可以安全分享给品牌、DAO 和社区。",
  aiReportLabel: "AI 可读报告",
  creatorCategory: "创作者类别",
  reportPeriod: "报告周期",
  publicWallet: "公开钱包",
  walletConnected: "Midnight 钱包已连接",
  walletNotConnected: "Midnight 钱包未连接",
  walletConnectedBody: "现在可以把创作者身份接入证明流程。",
  walletDetectedBody: "已检测到 Lace。生成真实证明流程前请先连接钱包。",
  walletMissingBody: "请安装或启用 Lace，以连接真实钱包层。",
  manageWallet: "管理钱包",
  wallet: "钱包",
  network: "网络",
  address: "地址",
  notConnected: "未连接",
  notDetected: "未检测到",
  midnightBridge: "Midnight 钱包桥接",
  connectWalletLayer: "连接真实钱包层",
  bridgeBody:
    "这个面板是第一个真实 Midnight 集成点。它会发现注入到 window.midnight 下的钱包，通过官方 DApp Connector API 连接，并读取钱包服务配置。",
  refresh: "刷新",
  midnightNetwork: "Midnight 网络",
  noWalletDetected: "未检测到 Midnight 钱包",
  connecting: "连接中",
  connectSelectedNetwork: "按所选网络连接",
  matching: "匹配中",
  autoMatchNetwork: "自动匹配钱包网络",
  noInjectedWallet:
    "没有检测到注入的 Midnight 钱包。请安装或启用支持 Midnight DApp Connector 的钱包，然后刷新面板。",
  networkMismatchHint:
    "如果出现 Network ID mismatch，表示 DApp 请求的网络和 Lace 当前 Midnight 网络不同。可以在 Lace 里切换网络，或使用自动匹配。",
  injectedDiagnostics: "注入 API 诊断",
  detected: "已检测到",
  connectionSnapshot: "连接快照",
  status: "状态",
  requestedNetwork: "DApp 请求网络",
  disconnected: "已断开",
  unshieldedAddress: "非隐私地址",
  shieldedAddress: "隐私地址",
  walletConfiguration: "钱包服务配置",
  indexer: "索引器",
  substrateNode: "Substrate 节点",
  dustBalance: "Dust 余额",
  architectureBadge: "Midnight 映射",
  architectureTitle: "从私密账本到公开证明",
  architectureBody:
    "MVP 先用 TypeScript 模拟证明流程。Midnight 原生版本会把赞助记录建模成 private witness，并通过 Compact 电路只公开门槛结果。",
  privateInputs: "私密输入",
  privateInputsBody: "赞助者身份、精确付款金额、完整创作者收入账本。",
  proofLogic: "证明逻辑",
  proofLogicBody: "应用检查收入门槛和支持者门槛是否被满足。",
  disclosedOutputs: "公开输出",
  disclosedOutputsBody: "只有门槛结果、报告周期和证明承诺值是公开的。",
  compactDirection: "Compact 方向",
  sponsorBadge: "赞助模拟器",
  sponsorTitle: "公开或私密支持",
  sponsorBody:
    "第一版先建模赞助数据如何作为私密证明输入使用，同时公开报告只披露门槛结果。",
  demoSponsorship: "演示赞助",
  amount: "金额",
  public: "公开",
  private: "私密",
  sponsorSkeletonBody:
    "交互状态下一步接入。当前骨架先把隐私业务流程固定下来，再加入钱包写入。",
  privateLedgerPreview: "私密账本预览",
  privateSponsor: "私密赞助者",
  hidden: "隐藏",
  reportBadge: "隐私安全报告",
  reportTitle: "基于公开证明输出生成 AI 摘要",
  reportBody:
    "报告只使用门槛结果、报告周期和证明状态，不包含赞助者地址或单笔付款。",
  brandReportTitle: "已验证创作者收入报告",
  daoReportTitle: "DAO Grant 资格摘要",
  communityReportTitle: "隐私安全社区更新",
  brandTarget: "品牌审核",
  daoTarget: "Grant 委员会审核",
  communityTarget: "社区透明度沟通",
  brandAction: "评估合作匹配度",
  daoAction: "评估资助资格",
  communityAction: "理解创作者增长势能",
  reportSummary:
    "Alice 在 {period} 已通过所选收入和支持者门槛。该报告帮助{target}{action}，同时不暴露赞助者身份、精确付款金额或完整私密收入账本。",
  reportBulletIncome: "收入门槛已验证，同时不披露单笔精确付款。",
  reportBulletSupporters: "支持者门槛已验证，同时不暴露私密赞助者身份。",
  reportBulletPrivacy: "公开结果适合审核使用，并保护创作者与赞助者隐私。",
}

const translations = { en, zh }

export type CopyKey = keyof typeof en

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: CopyKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function renderTemplate(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(languageStorageKey)
    if (savedLanguage === "en" || savedLanguage === "zh") {
      setLanguageState(savedLanguage)
      document.documentElement.lang = savedLanguage === "zh" ? "zh-CN" : "en"
    }
  }, [])

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(languageStorageKey, nextLanguage)
    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en"
  }

  function toggleLanguage() {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (key, params) => renderTemplate(translations[language][key], params),
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.")
  }

  return context
}
