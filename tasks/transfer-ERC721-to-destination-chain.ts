import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type DeployTemplateTask = {
  accountIndex?: number
  tokenId: number
  tokenAddress: string
  coreContractAddress: string
  destinationChainId: number
  packetType?: number
  isProxy?: boolean
}

task(
  'transfer-ERC721-to-destination-chain',
  'transfer ERC721 to destination chain'
)
  .addParam('tokenAddress', 'Token address')
  .addOptionalParam('packetType', 'Packet type', undefined, types.int)
  .addOptionalParam('isProxy', 'Is proxy', true, types.boolean)
  .addParam('tokenId', 'Token id')
  .addParam('coreContractAddress', 'Core contract address')
  .addParam('destinationChainId', 'Destination chain id')
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
        tokenAddress,
        tokenId,
        coreContractAddress,
        destinationChainId,
        packetType,
        isProxy
      }: DeployTemplateTask,
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
          `ℹ️ Transfering ERC721 ${tokenAddress} id ${tokenId} to chain ${destinationChainConfig.name} from ${chainConfig.name}`
        )

        const [sender] = await hre.ethers.getSigners()

        const ONFT721Core = await hre.ethers.getContractAt(
          isProxy ? 'ProxyONFT721' : 'ONFT721Core',
          coreContractAddress,
          deployer
        )

        spinner.stop()

        /**
         * Estimating gas
         */

        spinner.start()
        console.log(
          `ℹ️ Estimating gas to transfer ERC721 to ${destinationChainConfig.name}`
        )

        const minDstGas = await ONFT721Core.minDstGasLookup(
          destinationChainConfig.abstractId,
          packetType || 1n
        )

        const adapterParams = hre.ethers.solidityPacked(
          ['uint16', 'uint256'],
          [1, minDstGas]
        )

        const [estimate] = await ONFT721Core.estimateSendFee(
          destinationChainConfig.abstractId,
          sender.address,
          tokenId,
          false,
          adapterParams
        )

        spinner.stop()
        console.log(`ℹ️ Estimated ${estimate.toString()}`)

        /**
         * Getting ERC721
         */

        spinner.start()
        console.log(`ℹ️ Getting ERC721`)
        const ERC721 = await hre.ethers.getContractAt(
          'ERC721',
          tokenAddress,
          deployer
        )

        spinner.stop()

        /**
         * Transfering ERC721
         */

        spinner.start()
        console.log(`ℹ️ Approving ERC721 to ${coreContractAddress}`)

        const tx = await ERC721.approve(coreContractAddress, tokenId)

        const receipt = await tx?.wait(2)
        const gasUsed = receipt?.gasUsed || 0n

        spinner.stop()
        console.log('ℹ️ Gas used: ', gasUsed)

        /**
         * Transfering ERC721
         */

        spinner.start()
        console.log(
          `ℹ️ Bridging ERC721 to ${destinationChainConfig.name} using ${
            isProxy ? 'Proxy' : ''
          }ONFT721${isProxy ? '' : 'Core'}`
        )

        const tx2 = await ONFT721Core.sendFrom(
          sender.address,
          destinationChainConfig.abstractId,
          sender.address,
          tokenId,
          sender.address,
          hre.ethers.ZeroAddress,
          adapterParams,
          {
            value: estimate
          }
        )

        const receipt2 = await tx2?.wait(2)
        const gasUsed2 = receipt2?.gasUsed || 0n

        spinner.stop()
        console.log('ℹ️ Gas used: ', gasUsed2)

        console.log(
          `✅ ERC721 has been transfered to chain ${destinationChainConfig.name} to ${sender.address}`
        )
      } catch (error) {
        spinner.stop()
        console.log(`❌ `)
        console.log(error)
      }
    }
  )
