import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type SetTrustedRemoteAddress = {
  accountIndex?: number
  coreContractAddress: string
  destinationChainId: number
  destinationCoreContractAddress: string
}

task('set-trusted-remote-address', 'set trusted remote address')
  .addParam('coreContractAddress', 'Core contract address')
  .addParam('destinationChainId', 'Destination chain id')
  .addParam(
    'destinationCoreContractAddress',
    'Destination core contract address'
  )
  .addOptionalParam(
    'accountIndex',
    'Account index to use for deployment',
    0,
    types.int
  )
  .setAction(
    async (
      {
        destinationCoreContractAddress,
        accountIndex,
        coreContractAddress,
        destinationChainId
      }: SetTrustedRemoteAddress,
      hre
    ) => {
      spinner.start()

      try {
        const chainConfig = allowedChainsConfig[+hre.network.name]
        if (!chainConfig) {
          spinner.stop()
          throw new Error('Chain config not found')
        }

        const destinationChainConfig = allowedChainsConfig[destinationChainId]

        const provider = new hre.ethers.JsonRpcProvider(
          chainConfig.rpcUrls.default.http[0],
          chainConfig.id
        )

        const deployer = new hre.ethers.Wallet(
          chainConfig.accounts[accountIndex || 0],
          provider
        )

        /**
         * Initial setup
         */

        console.log(
          `ℹ️ Setting trusted remote ${destinationCoreContractAddress} on chain ${chainConfig.name} from chain ${destinationChainConfig.name}`
        )

        const ONFT721Core = await hre.ethers.getContractAt(
          'ONFT721Core',
          coreContractAddress,
          deployer
        )

        const trustedRemote = hre.ethers.solidityPacked(
          ['address', 'address'],
          [destinationCoreContractAddress, coreContractAddress]
        )

        const tx = await ONFT721Core.setTrustedRemoteAddress(
          destinationChainConfig.abstractId,
          trustedRemote
        )

        const receipt = await tx?.wait(12)
        const gasUsed = receipt?.gasUsed || 0n

        spinner.stop()
        console.log('ℹ️ Gas used: ', gasUsed)

        /**
         * getting trusted result
         */

        spinner.start()
        console.log(`ℹ️ Checking trusted remote is set`)

        const trustedRemoteId = await ONFT721Core.trustedRemoteLookup(
          destinationChainConfig.abstractId
        )

        const isTrusted = await ONFT721Core.isTrustedRemote(
          destinationChainConfig.abstractId,
          trustedRemoteId
        )

        if (!isTrusted) throw new Error('Not trusted')

        spinner.stop()
        console.log(`✅ ONFT721Core contract set trusted remote`)
      } catch (error) {
        spinner.stop()
        console.log(`❌ ONFT721Core contract set trusted remote failed`)
        console.log(error)
      }
    }
  )
