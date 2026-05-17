import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  output: "export",
  outputFileTracingRoot: __dirname,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "isomorphic-ws": path.resolve(__dirname, "lib/shims/isomorphic-ws.ts"),
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      }
    }

    return config
  },
}

export default nextConfig
