import { ChainContract, Chain as IChain } from 'viem'

export type AvailableChainContracts = 'lzEndpoint'

export type Chain = IChain & {
  abstractId: number
  network: string
  ethNetwork?: string
  zksync?: boolean
  accounts: string[]
  contracts: {
    [k in AvailableChainContracts]: ChainContract
  }
  minGasToTransferAndStoreRemote: bigint
  /// @dev gas amount required to transfer and store NFT
  minGasToTransferAndStoreLocal: bigint
}

export type ChainContracts = Chain['contracts']
