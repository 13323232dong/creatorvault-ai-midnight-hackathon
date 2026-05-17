"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage, type CopyKey } from "@/components/LanguageProvider"

// 顶部导航配置。
// 后续新增页面时，通常只需要在这里加一项。
const navItems: Array<{ href: string; labelKey: CopyKey }> = [
  { href: "/", labelKey: "navDashboard" },
  { href: "/sponsor", labelKey: "navSponsor" },
  { href: "/report", labelKey: "navReport" },
  { href: "/architecture", labelKey: "navArchitecture" },
  { href: "/deploy", labelKey: "navDeploy" },
]

// MainNav 需要读取浏览器当前路径，所以必须是 client component。
// 这就是文件顶部 "use client" 的原因：
// usePathname 是浏览器侧 hook，不能在纯 server component 里使用。
export function MainNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="flex flex-wrap items-center justify-end gap-1">
      {navItems.map((item) => {
        // 首页必须精确匹配 "/"，其他页面允许 startsWith，
        // 这样未来 /report/detail 也能高亮 Report。
        const isActive =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={[
              "px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-[#e9ede4] text-[var(--forest)]"
                : "text-[var(--muted)] hover:bg-[#e9ede4] hover:text-[var(--forest)]",
            ].join(" ")}
            href={item.href}
            key={item.href}
          >
            {t(item.labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
