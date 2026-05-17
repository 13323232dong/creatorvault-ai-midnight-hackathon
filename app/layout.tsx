import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { LanguageToggle } from "@/components/LanguageToggle"
import { MainNav } from "@/components/MainNav"
import { AppProviders } from "@/app/providers"
import "./globals.css"

// Next.js 的 metadata 会被框架用于生成页面 <title> 和 description。
// 这属于 Web2 前端层的页面元信息，不是链上数据。
export const metadata: Metadata = {
  title: "CreatorVault AI",
  description: "Private income proofs for creators.",
}

const suppressExtensionRuntimeNoise = `
  (function () {
    function isMetaMaskNoise(value) {
      var text = String(value && (value.message || value.reason || value) || "");
      var stack = String(value && value.stack || "");

      return (
        text.indexOf("Failed to connect to MetaMask") >= 0 ||
        stack.indexOf("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn") >= 0
      );
    }

    window.addEventListener("error", function (event) {
      if (isMetaMaskNoise(event.error) || isMetaMaskNoise(event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    window.addEventListener("unhandledrejection", function (event) {
      if (isMetaMaskNoise(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  })();
`

// RootLayout 是整个 App 的公共外壳。
// 你可以把它理解成所有页面共享的“App 容器”：
// - 顶部品牌栏
// - 顶部导航
// - 全局布局结构
// 每个 app/**/page.tsx 页面最终都会被塞进 children 里。
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          id="suppress-extension-runtime-noise"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: suppressExtensionRuntimeNoise }}
        />
        <AppProviders>
          <div className="page-shell">
            {/* 顶部导航是传统 Web 前端部分，负责产品入口和页面切换。 */}
            <header className="border-b border-[var(--line)] bg-white/78 backdrop-blur">
              <div className="container flex min-h-16 flex-wrap items-center justify-between gap-4 py-3">
                {/* Logo 点击回首页。这里没有链上逻辑，只是前端路由跳转。 */}
                <Link className="flex items-center gap-3" href="/">
                  <span className="flex h-10 w-10 items-center justify-center border border-[var(--forest)] bg-[var(--forest)] text-sm font-semibold text-white">
                    CV
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[var(--forest)]">
                      CreatorVault AI
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      <span className="en-only">Private income proofs</span>
                      <span className="zh-only">隐私收入证明</span>
                    </span>
                  </span>
                </Link>

                {/* MainNav 是单独抽出来的客户端组件，用来判断当前路由并高亮。 */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <MainNav />
                  <LanguageToggle />
                </div>
              </div>
            </header>

            {/* children 就是当前路由页面，例如首页、赞助页、报告页、架构页。 */}
            <main>{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
