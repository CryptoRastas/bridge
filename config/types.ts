export interface NativeCurrency {
  decimals: number
  name: string
  symbol: string
}

export interface Chain {
  id: number
  abstractId: number
  gasPrice?: number
  name: string
  network: string
  accounts: string[]
  nativeCurrency: NativeCurrency
  rpcUrls: {
    [key: string]: {
      http: string[]
    }
  }
  blockExplorers: {
    [key: string]: {
      name: string
      url: string
    }
  }
  contracts: {
    [key: string]: {
      address: string
      blockCreated?: number
    }
  }
  testnet?: boolean
  /// @dev min gas limit
  minGasToTransferAndStoreRemote: bigint
  /// @dev gas amount required to transfer and store NFT
  minGasToTransferAndStoreLocal: bigint
}
