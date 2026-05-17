import type { ContractAddress, SigningKey } from "@midnight-ntwrk/compact-runtime"
import type {
  ExportPrivateStatesOptions,
  ExportSigningKeysOptions,
  ImportPrivateStatesOptions,
  ImportPrivateStatesResult,
  ImportSigningKeysOptions,
  ImportSigningKeysResult,
  PrivateStateExport,
  PrivateStateId,
  PrivateStateProvider,
  SigningKeyExport,
} from "@midnight-ntwrk/midnight-js-types"

// Midnight.js 部署合约时需要一个 privateStateProvider。
// 我们当前的 CreatorVault 合约还没有私密 witness 状态，所以这个实现主要负责：
// - 保存合约维护签名 key
// - 给未来真正的 private witness 留接口
// 现在先用内存版，刷新页面会丢；真实生产项目后面要换成加密本地存储或后端托管策略。
export function createInMemoryPrivateStateProvider<
  PSI extends PrivateStateId,
  PS = unknown,
>(): PrivateStateProvider<PSI, PS> {
  const privateStates = new Map<ContractAddress, Map<PSI, PS>>()
  const signingKeys = new Map<ContractAddress, SigningKey>()
  let currentContractAddress: ContractAddress | null = null

  function requireContractAddress(): ContractAddress {
    if (!currentContractAddress) {
      throw new Error("Contract address is not set yet.")
    }

    return currentContractAddress
  }

  function getScopedStates(address: ContractAddress): Map<PSI, PS> {
    const existingStates = privateStates.get(address)

    if (existingStates) {
      return existingStates
    }

    const nextStates = new Map<PSI, PS>()
    privateStates.set(address, nextStates)
    return nextStates
  }

  function encode(value: unknown): string {
    return JSON.stringify(value)
  }

  function decode<T>(value: string): T {
    return JSON.parse(value) as T
  }

  return {
    setContractAddress(address) {
      currentContractAddress = address
    },

    async set(key, state) {
      getScopedStates(requireContractAddress()).set(key, state)
    },

    async get(key) {
      return getScopedStates(requireContractAddress()).get(key) ?? null
    },

    async remove(key) {
      getScopedStates(requireContractAddress()).delete(key)
    },

    async clear() {
      privateStates.delete(requireContractAddress())
    },

    async setSigningKey(contractAddress, signingKey) {
      signingKeys.set(contractAddress, signingKey)
    },

    async getSigningKey(contractAddress) {
      return signingKeys.get(contractAddress) ?? null
    },

    async removeSigningKey(contractAddress) {
      signingKeys.delete(contractAddress)
    },

    async clearSigningKeys() {
      signingKeys.clear()
    },

    async exportPrivateStates(
      _options?: ExportPrivateStatesOptions,
    ): Promise<PrivateStateExport> {
      const address = requireContractAddress()
      const states = Object.fromEntries(
        Array.from(getScopedStates(address).entries()).map(([key, value]) => [
          key,
          encode(value),
        ]),
      )

      return {
        format: "midnight-private-state-export",
        encryptedPayload: encode({ address, states }),
        salt: "creatorvault-memory-private-state",
      }
    },

    async importPrivateStates(
      exportData: PrivateStateExport,
      options?: ImportPrivateStatesOptions,
    ): Promise<ImportPrivateStatesResult> {
      const address = requireContractAddress()
      const conflictStrategy = options?.conflictStrategy ?? "error"
      const payload = decode<{ states?: Record<string, string> }>(
        exportData.encryptedPayload,
      )
      const states = payload.states ?? {}
      const scopedStates = getScopedStates(address)
      let imported = 0
      let skipped = 0
      let overwritten = 0

      for (const [rawKey, rawValue] of Object.entries(states)) {
        const key = rawKey as PSI
        const exists = scopedStates.has(key)

        if (exists && conflictStrategy === "skip") {
          skipped += 1
          continue
        }

        if (exists && conflictStrategy === "error") {
          throw new Error(`Private state conflict for ${rawKey}.`)
        }

        if (exists) {
          overwritten += 1
        } else {
          imported += 1
        }

        scopedStates.set(key, decode<PS>(rawValue))
      }

      return { imported, skipped, overwritten }
    },

    async exportSigningKeys(
      _options?: ExportSigningKeysOptions,
    ): Promise<SigningKeyExport> {
      return {
        format: "midnight-signing-key-export",
        encryptedPayload: encode({ keys: Object.fromEntries(signingKeys) }),
        salt: "creatorvault-memory-signing-key",
      }
    },

    async importSigningKeys(
      exportData: SigningKeyExport,
      options?: ImportSigningKeysOptions,
    ): Promise<ImportSigningKeysResult> {
      const conflictStrategy = options?.conflictStrategy ?? "error"
      const payload = decode<{ keys?: Record<ContractAddress, SigningKey> }>(
        exportData.encryptedPayload,
      )
      const keys = payload.keys ?? {}
      let imported = 0
      let skipped = 0
      let overwritten = 0

      for (const [address, signingKey] of Object.entries(keys)) {
        const exists = signingKeys.has(address as ContractAddress)

        if (exists && conflictStrategy === "skip") {
          skipped += 1
          continue
        }

        if (exists && conflictStrategy === "error") {
          throw new Error(`Signing key conflict for ${address}.`)
        }

        if (exists) {
          overwritten += 1
        } else {
          imported += 1
        }

        signingKeys.set(address as ContractAddress, signingKey)
      }

      return { imported, skipped, overwritten }
    },
  }
}
