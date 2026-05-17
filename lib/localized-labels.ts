import type { Language } from "@/lib/language"

const proofFieldLabels: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    "income threshold": "收入门槛",
    "supporter threshold": "支持者门槛",
    "report period": "报告周期",
    "proof result": "证明结果",
    "proof commitment": "证明承诺值",
    "sponsor identities": "赞助者身份",
    "exact individual payments": "精确单笔付款",
    "full private revenue ledger": "完整私密收入账本",
    "private brand relationships": "私密品牌关系",
  },
}

const creatorCategoryLabels: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    "Open-source creator": "开源创作者",
  },
}

const periodLabels: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    "April 2026": "2026 年 4 月",
  },
}

const sponsorLabels: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    "Builder DAO": "Builder DAO",
    "Community grant": "社区 Grant",
    "Private sponsor 01": "私密赞助者 01",
    "Private sponsor 02": "私密赞助者 02",
  },
}

function translateKnownValue(
  language: Language,
  dictionary: Record<Language, Record<string, string>>,
  value: string,
): string {
  return dictionary[language][value] ?? value
}

export function translateProofField(language: Language, field: string): string {
  return translateKnownValue(language, proofFieldLabels, field)
}

export function translateCreatorCategory(language: Language, category: string): string {
  return translateKnownValue(language, creatorCategoryLabels, category)
}

export function translatePeriod(language: Language, period: string): string {
  return translateKnownValue(language, periodLabels, period)
}

export function translateSponsorLabel(language: Language, label: string): string {
  return translateKnownValue(language, sponsorLabels, label)
}
