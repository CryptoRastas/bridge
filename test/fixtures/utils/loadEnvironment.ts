import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'
import { ONFT721, ProxyONFT721, ERC721Mock, LZEndpointMock } from '@/typechain'
import { ethers } from 'hardhat'
import { deployLZEndpointMockFixture } from '@/test/fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '@/test/fixtures/mocks/ERC721Mock'
import { deployONFT721Fixture } from '@/test/fixtures/ONFT721'

export type LightEnvironment = {
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
}

export const createLightEnvironment = async (): Promise<LightEnvironment> => {
  const chainId = 1
  const name = 'CryptoRastas'
  const symbol = 'RASTA'
  const minGasToTransferAndStoreLocal = 100_000n
  const packetType = 1 // sendAndCall
  const version = 1n // lzapp version

  const ERC721MockFixture = await loadFixture(
    deployERC721MockFixture.bind(this, name, symbol)
  )

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

  return {
    ...ERC721MockFixture,
    ...lzEndpointFixture,
    ...proxyONFT721Fixture,
    chainId,
    name,
    symbol,
    minGasToTransferAndStoreLocal,
    packetType,
    version
  }
}

export type FullEnvironment = LightEnvironment & {
  destinationChainId: number
  minGasToTransferAndStoreRemote: bigint
  destinationONFT721: ONFT721
  destinationONFT721Address: string
  useZRO: boolean
  zroPaymentAddress: string
  destionationLZEndpointMock: LZEndpointMock
  destinationLZEndpointMockAddress: string
}

export const createFullEnvironment = async (): Promise<FullEnvironment> => {
  const destinationChainId = 137
  const useZRO = false // use ZRO (ERC20 token)
  const zroPaymentAddress = ethers.ZeroAddress // pay as native
  const minGasToTransferAndStoreRemote = 260_000n

  const lightEnvironment = await createLightEnvironment()

  const LZEndpointMockDestination = await loadFixture(
    deployLZEndpointMockFixture.bind(this, destinationChainId)
  )

  const destionationLZEndpointMock = LZEndpointMockDestination.LZEndpointMock
  const destinationLZEndpointMockAddress =
    LZEndpointMockDestination.LZEndpointMockAddress

  const { ONFT721, ONFT721Address } = await loadFixture(
    deployONFT721Fixture.bind(
      this,
      lightEnvironment.name,
      lightEnvironment.symbol,
      lightEnvironment.minGasToTransferAndStoreLocal,
      LZEndpointMockDestination.LZEndpointMockAddress
    )
  )

  const destinationONFT721 = ONFT721
  const destinationONFT721Address = ONFT721Address

  return {
    ...lightEnvironment,
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

export async function setTrustedRemoteAddress(enviorment: FullEnvironment) {
  await enviorment.proxyONFT721.setTrustedRemoteAddress(
    enviorment.destinationChainId,
    enviorment.destinationONFT721Address
  )

  await enviorment.destinationONFT721.setTrustedRemoteAddress(
    enviorment.chainId,
    enviorment.proxyONFT721Address
  )
}

export async function setMinDstGas(enviorment: FullEnvironment) {
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

export async function setDestLzEndpoint(enviorment: FullEnvironment) {
  await enviorment.destionationLZEndpointMock.setDestLzEndpoint(
    enviorment.proxyONFT721Address,
    enviorment.LZEndpointMockAddress
  )

  await enviorment.LZEndpointMock.setDestLzEndpoint(
    enviorment.destinationONFT721Address,
    enviorment.destinationLZEndpointMockAddress
  )
}
