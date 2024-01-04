import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'
import { ONFT721, ProxyONFT721, ERC721Mock, LZEndpointMock } from '@/typechain'
import { ethers } from 'hardhat'
import { deployLZEndpointMockFixture } from '@/test/fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '@/test/fixtures/mocks/ERC721Mock'
import { deployONFT721Fixture } from '@/test/fixtures/ONFT721'

export type Environment = {
  chainId: number
  name: string
  symbol: string
  minGasToTransferAndStoreLocal: bigint
  packetType: number
  version: bigint
  proxyONFT721: ProxyONFT721
  proxyONFT721Address: string
  ERC721Mock: ERC721Mock
  ERC721MockAddress: string
  LZEndpointMock: LZEndpointMock
  LZEndpointMockAddress: string
  destinationChainId: number
  minGasToTransferAndStoreRemote: bigint
  destinationONFT721: ONFT721
  destinationONFT721Address: string
  useZRO: boolean
  zroPaymentAddress: string
  destionationLZEndpointMock: LZEndpointMock
  destinationLZEndpointMockAddress: string
}

export const createEnvironment = async (): Promise<Environment> => {
  // Metadata
  const chainId = 1
  const name = 'CryptoRastas'
  const symbol = 'RASTA'

  // Config
  const minGasToTransferAndStoreLocal = 100_000n
  const packetType = 1 // sendAndCall
  const version = 1n // lzapp version

  const destinationChainId = 137
  const useZRO = false // use ZRO (ERC20 token)
  const zroPaymentAddress = ethers.ZeroAddress // pay as native
  const minGasToTransferAndStoreRemote = 260_000n

  // Mocked ERC721 to handle transfer using proxy
  const ERC721MockFixture = await loadFixture(
    deployERC721MockFixture.bind(this, name, symbol)
  )

  // Mocked LZEndpoint to handle bridge (source)
  const lzEndpointFixture = await loadFixture(
    deployLZEndpointMockFixture.bind(this, chainId)
  )

  const proxyONFT721Fixture = await loadFixture(
    deployProxyONFT721Fixture.bind(
      this,
      minGasToTransferAndStoreLocal,
      lzEndpointFixture.LZEndpointMockAddress,
      ERC721MockFixture.ERC721MockAddress
    )
  )

  // Mocked LZEndpoint to handle bridge (destination)
  const { LZEndpointMock, LZEndpointMockAddress } = await loadFixture(
    deployLZEndpointMockFixture.bind(this, destinationChainId)
  )

  const destionationLZEndpointMock = LZEndpointMock
  const destinationLZEndpointMockAddress = LZEndpointMockAddress

  // Mocked ONFT721 to handle transfer
  const { ONFT721, ONFT721Address } = await loadFixture(
    deployONFT721Fixture.bind(
      this,
      name,
      symbol,
      minGasToTransferAndStoreLocal,
      LZEndpointMockAddress
    )
  )

  const destinationONFT721 = ONFT721
  const destinationONFT721Address = ONFT721Address

  return {
    ...ERC721MockFixture,
    ...lzEndpointFixture,
    ...proxyONFT721Fixture,
    chainId,
    name,
    symbol,
    minGasToTransferAndStoreLocal,
    packetType,
    version,
    destionationLZEndpointMock,
    destinationLZEndpointMockAddress,
    minGasToTransferAndStoreRemote,
    destinationChainId,
    destinationONFT721,
    destinationONFT721Address,
    useZRO,
    zroPaymentAddress
  }
}

export async function setTrustedRemoteAddress(enviorment: Environment) {
  await enviorment.proxyONFT721.setTrustedRemoteAddress(
    enviorment.destinationChainId,
    enviorment.destinationONFT721Address
  )

  await enviorment.destinationONFT721.setTrustedRemoteAddress(
    enviorment.chainId,
    enviorment.proxyONFT721Address
  )
}

export async function setMinDstGas(enviorment: Environment) {
  await enviorment.proxyONFT721.setMinDstGas(
    enviorment.destinationChainId,
    enviorment.packetType,
    enviorment.minGasToTransferAndStoreRemote
  )

  await enviorment.destinationONFT721.setMinDstGas(
    enviorment.chainId,
    enviorment.packetType,
    enviorment.minGasToTransferAndStoreRemote
  )
}

export async function setDestLzEndpoint(enviorment: Environment) {
  await enviorment.destionationLZEndpointMock.setDestLzEndpoint(
    enviorment.proxyONFT721Address,
    enviorment.LZEndpointMockAddress
  )

  await enviorment.LZEndpointMock.setDestLzEndpoint(
    enviorment.destinationONFT721Address,
    enviorment.destinationLZEndpointMockAddress
  )
}
