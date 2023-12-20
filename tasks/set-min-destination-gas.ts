import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type SetMinDestinationGasTask = {
  accountIndex?: number
  coreContractAddress: string
  minDestinationGas?: number
  destinationChainId: number
  packetType?: number
}

task('set-min-destination-gas', 'set min destination gas')
  .addParam('coreContractAddress', 'Core contract address')
  .addParam('destinationChainId', 'Destination chain id')
  .addOptionalParam('packetType', 'Packet type')
  .addOptionalParam('minDestinationGas', 'Min destination gas')
  .addOptionalParam(
    'accountIndex',
    'Account index to use for deployment',
    0,
    types.int
  )
  .setAction(
    async (
      {
        accountIndex,
        minDestinationGas,
        coreContractAddress,
        packetType,
        destinationChainId
      }: SetMinDestinationGasTask,
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

        const _minDestinationGas = minDestinationGas || 260_000n

        /**
         * Initial setup
         */

        console.log(
          `ℹ️ Setting min destination gas to chain ${destinationChainConfig.name} from chain ${chainConfig.name} `
        )

        const ONFT721Core = await hre.ethers.getContractAt(
          'ONFT721Core',
          coreContractAddress,
          deployer
        )

        const tx = await ONFT721Core.setMinDstGas(
          destinationChainConfig.abstractId,
          packetType || 1n,
          _minDestinationGas
        )

        const receipt = await tx?.wait(12)
        const gasUsed = receipt?.gasUsed || 0n

        spinner.stop()
        console.log('ℹ️ Gas used: ', gasUsed)

        console.log(
          `✅ Min destination gas has been set to ${_minDestinationGas}`
        )
      } catch (error) {
        spinner.stop()
        console.log(`❌ Min destination gas has not been set`)
        console.log(error)
      }
    }
  )
