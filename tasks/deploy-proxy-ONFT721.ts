import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type DeployProxyONFT721ContractTask = {
  accountIndex?: number
  minGasToTransfer?: number
  lzEndpoint?: string
  proxyToken: string
}

task('deploy-proxy-ONFT721', 'deploy Proxy ONFT721 contract')
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
  .addParam('proxyToken', 'Proxy token')
  .setAction(
    async (
      {
        accountIndex,
        minGasToTransfer,
        lzEndpoint,
        proxyToken
      }: DeployProxyONFT721ContractTask,
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
          `ℹ️  Deploying ProxyONFT721 contract to chain ${chainConfig.name}`
        )

        const proxyONFT721 = await hre.ethers.deployContract(
          'ProxyONFT721',
          [
            minGasToTransfer || chainConfig.minGasRequiredToTransferLocal,
            lzEndpoint || chainConfig.contracts.lzEndpoint.address,
            proxyToken
          ],
          deployer
        )

        const tx = await proxyONFT721.waitForDeployment()

        const receipt = await tx.deploymentTransaction()?.wait()
        const gasUsed = receipt?.gasUsed || 0n
        spinner.stop()

        console.log('ℹ️ Gas used: ', gasUsed)

        /**
         * getting address
         */

        spinner.start()
        console.log(`ℹ️  Checking deployed contract`)

        const proxyONFT721Address = await proxyONFT721.getAddress()

        spinner.stop()
        console.log(`✅ ProxyONFT721 deployed at ${proxyONFT721Address}`)
      } catch (error) {
        spinner.stop()
        console.log(`❌ ProxyONFT721 deploy has been failed`)
        console.log(error)
      }
    }
  )
