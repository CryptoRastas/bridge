import dotenv from 'dotenv'

dotenv.config()

import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-verify'
import '@nomicfoundation/hardhat-toolbox'

import '@nomiclabs/hardhat-solhint'
import '@matterlabs/hardhat-zksync'

import 'hardhat-gas-reporter'
import 'tsconfig-paths/register'
import './tasks'

import { allowedChainsConfig } from '@/config/config'
import { reduce } from 'lodash'
import { Chain } from './config/types'
import { NetworksUserConfig } from 'hardhat/types'

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  zksolc: {
    version: '1.5.7', // Ensure version is 1.5.7!
    settings: {
      // Note: This must be true to call NonceHolder & ContractDeployer system contracts
      enableEraVMExtensions: false
    }
  },
  networks:
    process.env.NODE_ENV !== 'development'
      ? reduce(
          Object.values(allowedChainsConfig),
          (acc, chain: Chain) => {
            acc[chain.id] = {
              url: chain.rpcUrls.default.http[0],
              accounts: chain.accounts,
              /// @todo: check why its necessary
              // gasPrice: chain.gasPrice,
              gasMultiplier: 1.2,
              zksync: chain.zksync,
              ethNetwork: chain.ethNetwork
            }

            return acc
          },

          {} as NetworksUserConfig
        )
      : {
          localhost: {
            url: 'http://127.0.0.1:8545'
          },
          hardhat: {}
        },
  solidity: {
    version: '0.8.21',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v6'
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 1,
    enabled: process.env.RUN_GAS_REPORTER === 'true'
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY!,
      sepolia: process.env.SEPOLIA_API_KEY!,
      polygon: process.env.POLYGON_API_KEY!,
      polygonAmoy: process.env.POLYGON_AMOY_API_KEY!,
      base: process.env.BASE_API_KEY!,
      baseSepolia: process.env.BASE_SEPOLIA_API_KEY!,
      abstractMainnet: process.env.ABSTRACT_API_KEY!,
      abstractTestnet: process.env.ABSTRACT_TESTNET_API_KEY!
    },
    customChains: [
      {
        network: 'abstractTestnet',
        chainId: 11124,
        urls: {
          apiURL: 'https://api-sepolia.abscan.org/api',
          browserURL: 'https://sepolia.abscan.org/'
        }
      },
      {
        network: 'abstractMainnet',
        chainId: 2741,
        urls: {
          apiURL: 'https://api.abscan.org/api',
          browserURL: 'https://abscan.org/'
        }
      }
    ]
  }
}

export default config
