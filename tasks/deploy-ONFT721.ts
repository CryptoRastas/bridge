import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type DeployONFT721ContractTask = {
  name: string
  symbol: string
  minGasToTransfer?: number
  lzEndpoint?: string
  accountIndex?: number
}

task('deploy-ONFT721', 'deploy ONFT721 contract')
  .addOptionalParam(
    'accountIndex',
    'Account index to use for deployment',
    0,
    types.int
  )
  .addOptionalParam('minGasToTransfer', 'Min gas to transfer', 0, types.int)
  .addOptionalParam('lzEndpoint', 'Lazynft endpoint', '', types.string)
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

        const provider = new hre.ethers.JsonRpcProvider(
          chainConfig.rpcUrls.default.http[0],
          chainConfig.id
        )

        const deployer = new hre.ethers.Wallet(
          chainConfig.accounts[accountIndex || 0],
          provider
        )

        /**
         * deploying contract
         */

        console.log(
          `ℹ️  Deploying ONFT721 contract to chain ${chainConfig.name}`
        )

        const ONFT721 = await hre.ethers.deployContract(
          'ONFT721',
          [
            name,
            symbol,
            minGasToTransfer || 100_000n,
            lzEndpoint || chainConfig.contracts.lzEndpoint.address
          ],
          deployer
        )

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
