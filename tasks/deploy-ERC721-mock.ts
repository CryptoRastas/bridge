import { task, types } from 'hardhat/config'
import { Spinner } from '../scripts/spinner'
import cliSpinner from 'cli-spinners'
import { allowedChainsConfig } from '@/config/config'

const spinner: Spinner = new Spinner(cliSpinner.triangle)

export type DeployERC721MockTask = {
  accountIndex?: number
  tokenName: string
  tokenSymbol: string
}

task('deploy-ERC721-mock', 'deploy ERC721Mock contract')
  .addParam('tokenName', 'token name')
  .addParam('tokenSymbol', 'token symbol')
  .addOptionalParam(
    'accountIndex',
    'Account index to use for deployment',
    0,
    types.int
  )
  .setAction(
    async (
      { accountIndex, tokenName, tokenSymbol }: DeployERC721MockTask,
      hre
    ) => {
      spinner.start()

      try {
        /// @dev: hre.network?.name means the chain id used in hardhat config networks
        const chainConfig = allowedChainsConfig[Number(hre.network?.name)]

        if (!chainConfig) {
          spinner.stop()
          throw new Error('Chain config not found')
        }

        if (!chainConfig?.testnet) {
          console.log(
            `⚠️  ${chainConfig.name} is not a testnet, please use only for testing purposes!`
          )
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
         * deployng contract
         */

        console.log(
          `ℹ️ Deployng ERC721Mock contract as ${tokenName} and symbol ${tokenSymbol} on ${chainConfig.name}`
        )

        const ERC721 = await hre.ethers.deployContract(
          'ERC721Mock',
          [tokenName, tokenSymbol],
          deployer
        )

        const tx = await ERC721.waitForDeployment()
        const receipt = await tx.deploymentTransaction()?.wait()
        const ERC721Address = await ERC721.getAddress()
        const gasUsed = receipt?.gasUsed || 0n

        spinner.stop()
        console.log('ℹ️ Done and gas used: ', gasUsed)

        /**
         * Minting token id
         */

        const [receiver] = await hre.ethers.getSigners()
        const tokenId = 1

        spinner.start()
        console.log('ℹ️ Minting: ', tokenId)

        const tx2 = await ERC721.mint(
          receiver.address,
          tokenId,
          `https://api.cryptorastas.xyz/token/${tokenId}`
        )
        const receipt2 = await tx2.wait()
        const gasUsed2 = receipt2?.gasUsed || 0n

        spinner.stop()
        console.log('ℹ️ Done and gas used: ', gasUsed2)

        console.log(`✅ Deployed ERC721Mock ${tokenName} at ${ERC721Address}`)
      } catch (error) {
        spinner.stop()
        console.log(`❌ ERC721 ${tokenName} deploy has been failed`)
        console.log(error)
      }
    }
  )

// # SEPOLIA

// NFT (token):
// 0x9B4d191e71138e100b3e0345cF4365060e3bBD01

// ProxyONFT721
// 0x65d8EDec76C83AC87d0E852Fd170B22A76dee3cF

// # BASE SEPOLIA
// ONFT721
// 0x26711d5868f0f2e233b0e226D961E2172e3106Fc

// pnpm hardhat set-trusted-remote-address
// --network 11155111
// --core-contract-address 0x65d8EDec76C83AC87d0E852Fd170B22A76dee3cF
// --destination-chain-id 84532
// --destination-core-contract-address 0x26711d5868f0f2e233b0e226D961E2172e3106Fc

// pnpm hardhat set-trusted-remote-address
// --network 84532
// --core-contract-address 0x26711d5868f0f2e233b0e226D961E2172e3106Fc
// --destination-chain-id 11155111
// --destination-core-contract-address 0x65d8EDec76C83AC87d0E852Fd170B22A76dee3cF

// pnpm hardhat set-min-destination-gas --network 11155111 --core-contract-address 0x65d8EDec76C83AC87d0E852Fd170B22A76dee3cF --destination-chain-id 84532

// pnpm hardhat set-min-destination-gas --network 84532 --core-contract-address 0x26711d5868f0f2e233b0e226D961E2172e3106Fc --destination-chain-id 11155111

// pnpm hardhat transfer-ERC721-to-destination-chain --network 11155111 --core-contract-address 0x65d8EDec76C83AC87d0E852Fd170B22A76dee3cF --destination-chain-id 84532 --token-address 0x9B4d191e71138e100b3e0345cF4365060e3bBD01 --token-id 1

// pnpm hardhat transfer-ERC721-to-destination-chain --network 84532 --core-contract-address 0x26711d5868f0f2e233b0e226D961E2172e3106Fc --token-address 0x26711d5868f0f2e233b0e226D961E2172e3106Fc --token-id 1 --destination-chain-id 11155111
