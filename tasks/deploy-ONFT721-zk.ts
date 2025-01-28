import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

import { Wallet } from 'zksync-ethers'
import { Deployer } from '@matterlabs/hardhat-zksync'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type DeployONFT721ContractTask = {
  name: string
  symbol: string
  minGasToTransfer?: number
  lzEndpoint?: string
  accountIndex?: number
}

task('deploy-ONFT721-zk', 'deploy ONFT721 contract zk')
  .addOptionalParam(
    'accountIndex',
    'Account index to use for deployment',
    0,
    types.int
  )
  .addOptionalParam(
    'minGasToTransfer',
    'Min gas to transfer',
    undefined,
    types.int
  )
  .addOptionalParam('lzEndpoint', 'Lazynft endpoint', undefined, types.string)
  /// @todo: add token- prefix (eg: token-name)
  .addParam('name', 'Token name')
  .addParam('symbol', 'Token symbol')
  .setAction(
    async (
      {
        accountIndex,
        minGasToTransfer,
        lzEndpoint,
        name,
        symbol
      }: DeployONFT721ContractTask,
      hre
    ) => {
      spinner.start()

      try {
        const chainConfig = allowedChainsConfig[+hre.network.name]
        if (!chainConfig) {
          spinner.stop()
          throw new Error('Chain config not found')
        }

        // const provider = new hre.ethers.JsonRpcProvider(
        //   chainConfig.rpcUrls.default.http[0],
        //   chainConfig.id
        // )

        const wallet = new Wallet(chainConfig.accounts[accountIndex || 0])

        // const deployer = new hre.ethers.Wallet(
        //   chainConfig.accounts[accountIndex || 0],
        //   provider
        // )

        const deployer = new Deployer(hre, wallet)

        /**
         * deploying contract
         */

        console.log(
          `ℹ️  Deploying ONFT721 contract to chain ${chainConfig.name}`
        )

        const artifact = await deployer.loadArtifact('ONFT721')

        const ONFT721 = await deployer.deploy(artifact, [
          name,
          symbol,
          minGasToTransfer || chainConfig.minGasToTransferAndStoreLocal,
          lzEndpoint || chainConfig.contracts.lzEndpoint.address
        ])

        const tx = await ONFT721.waitForDeployment()

        const receipt = await tx.deploymentTransaction()?.wait()
        const gasUsed = receipt?.gasUsed || 0n
        spinner.stop()

        console.log('ℹ️ Gas used: ', gasUsed)

        /**
         * getting address
         */

        spinner.start()
        console.log(`ℹ️  Checking deployed contract`)

        const ONFT721Address = await ONFT721.getAddress()

        spinner.stop()
        console.log(`✅ ONFT721 deployed at ${ONFT721Address}`)
      } catch (error) {
        spinner.stop()
        console.log(`❌ ONFT721 deploy has been failed`)
        console.log(error)
      }
    }
  )
