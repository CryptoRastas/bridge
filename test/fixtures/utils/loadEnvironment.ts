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

  // Destination chain config
  const destinationChainId = 137

  // Destination chain config pament
  const useZRO = false // use ZRO (ERC20 token)
  const zroPaymentAddress = ethers.ZeroAddress // pay as native
  const minGasToTransferAndStoreRemote = 260_000n

  // ERC721 to handle transfer using proxy
  const ERC721MockFixture = await loadFixture(
    deployERC721MockFixture.bind(this, name, symbol)
  )

  // LZEndpoint to handle bridge on source chain
  const lzEndpointFixture = await loadFixture(
    deployLZEndpointMockFixture.bind(this, chainId)
  )

  // source chain proxy
  const proxyONFT721Fixture = await loadFixture(
    deployProxyONFT721Fixture.bind(
      this,
      minGasToTransferAndStoreLocal,
      lzEndpointFixture.LZEndpointMockAddress,
      ERC721MockFixture.ERC721MockAddress
    )
  )

  // LZEndpoint to handle bridge on destination chain
  const { LZEndpointMock, LZEndpointMockAddress } = await loadFixture(
    deployLZEndpointMockFixture.bind(this, destinationChainId)
  )

  const destionationLZEndpointMock = LZEndpointMock
  const destinationLZEndpointMockAddress = LZEndpointMockAddress

  // ONFT721 to handle transfer on destination chain
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
    ...proxyONFT721Fixture,
    ...ERC721MockFixture,
    ...lzEndpointFixture,
    chainId,
    name,
    symbol,
    minGasToTransferAndStoreLocal,
    packetType,
    version,
    destinationChainId,
    minGasToTransferAndStoreRemote,
    destinationONFT721,
    destinationONFT721Address,
    useZRO,
    zroPaymentAddress,
    destionationLZEndpointMock,
    destinationLZEndpointMockAddress
  }
}
