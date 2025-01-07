import { evmAccounts } from './accounts'
import { Chain } from './types'

import {
  polygonAmoy as polygonAmoyChain,
  polygon as polygonChain,
  sepolia as sepoliaChain,
  mainnet as mainnetChain,
  baseSepolia as baseSepoliaChain,
  base as baseChain,
  abstractTestnet as abstractTestnetChain
} from 'viem/chains'

import { merge } from 'lodash'
import { Address } from 'viem'

export const ethereum: Chain = merge(mainnetChain, {
  abstractId: 101,
  network: 'homestead',
  name: 'Ethereum',
  accounts: evmAccounts,
  contracts: merge(mainnetChain.contracts, {
    lzEndpoint: {
      address: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675' as Address
    }
  }),
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})

export const polygon: Chain = merge(polygonChain, {
  abstractId: 109,
  network: 'matic',
  accounts: evmAccounts,
  contracts: merge(polygonChain.contracts, {
    lzEndpoint: {
      address: '0x3c2269811836af69497E5F486A85D7316753cf62' as Address
    }
  }),
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})

export const base: Chain = merge(baseChain, {
  abstractId: 184,
  network: 'base',
  accounts: evmAccounts,
  contracts: merge(baseChain.contracts, {
    lzEndpoint: {
      address: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7' as Address
    }
  }),
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})

/// @dev: testnets
export const sepolia: Chain = merge(sepoliaChain, {
  abstractId: 10161,
  accounts: evmAccounts,
  network: 'sepolia',
  contracts: merge(sepoliaChain.contracts, {
    lzEndpoint: {
      address: '0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1' as Address
    }
  }),
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})

/// @dev: todo deploy
export const polygonAmoy: Chain = merge(polygonAmoyChain, {
  abstractId: 10267,
  network: 'matic-amoy',
  accounts: evmAccounts,
  contracts: {
    lzEndpoint: {
      address: '0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8' as Address
    }
  },
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})

export const baseSepolia: Chain = merge(baseSepoliaChain, {
  abstractId: 10245,
  network: 'base-sepolia',
  accounts: evmAccounts,
  contracts: merge(baseSepoliaChain.contracts, {
    lzEndpoint: {
      address: '0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8' as Address
    }
  }),
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})

//@dev: todo deploy (also mainnet)
export const abstractTestnet: Chain = merge(abstractTestnetChain, {
  abstractId: 10313,
  network: 'abstract-testnet',
  accounts: evmAccounts,
  contracts: merge(abstractTestnetChain.contracts, {
    lzEndpoint: {
      address: '0x68c1B65211c0d2d39Ed04b2b4F0B6f743A168320' as Address
    }
  }),
  minGasToTransferAndStoreRemote: 260_000n,
  minGasToTransferAndStoreLocal: 100_000n
})
