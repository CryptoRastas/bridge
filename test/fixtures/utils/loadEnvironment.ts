import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'
import {
  ONFT721,
  ProxyONFT721,
  ERC721Mock,
  LZEndpointMock,
  ONFT721Core
} from '@/typechain'
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

export const createEnvironment = async (
  overrides?: Partial<
    Pick<
      Environment,
      'minGasToTransferAndStoreLocal' | 'minGasToTransferAndStoreRemote'
    >
  >
): Promise<Environment> => {
  // Metadata
  const chainId = 1
  const name = 'CryptoRastas'
  const symbol = 'RASTA'

  // Config
  const minGasToTransferAndStoreLocal =
    overrides?.minGasToTransferAndStoreLocal || 100_000n
  const packetType = 1 // sendAndCall
  const version = 1n // lzapp version

  const destinationChainId = 137
  const useZRO = false // use ZRO (ERC20 token)
  const zroPaymentAddress = ethers.ZeroAddress // pay as native
  const minGasToTransferAndStoreRemote =
    overrides?.minGasToTransferAndStoreRemote || 260_000n

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
    chainId,
    name,
    symbol,
    minGasToTransferAndStoreLocal,
    packetType,
    version,
    proxyONFT721: proxyONFT721Fixture.proxyONFT721,
    proxyONFT721Address: proxyONFT721Fixture.proxyONFT721Address,
    ERC721Mock: ERC721MockFixture.ERC721Mock,
    ERC721MockAddress: ERC721MockFixture.ERC721MockAddress,
    LZEndpointMock: lzEndpointFixture.LZEndpointMock,
    LZEndpointMockAddress: lzEndpointFixture.LZEndpointMockAddress,
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

export type TrustedRemoteParams = {
  remoteChainId: number
  remoteAddress: string
}

export async function setContractTrustedRemoteAddress(
  contract: ONFT721Core,
  params: TrustedRemoteParams
) {
  return await contract.setTrustedRemoteAddress(
    params.remoteChainId,
    params.remoteAddress
  )
}

export type MinDstGasParams = {
  dstChainId: number
  packetType: number
  minGas: bigint
}

export async function setContractMinDstGas(
  contract: ONFT721Core,
  params: MinDstGasParams
) {
  return await contract.setMinDstGas(
    params.dstChainId,
    params.packetType,
    params.minGas
  )
}

export type DestLzEndpointParams = {
  destAddr: string
  lzEndpointAddr: string
}

export async function setContractDestLzEndpoint(
  contract: LZEndpointMock,
  params: DestLzEndpointParams
) {
  return await contract.setDestLzEndpoint(
    params.destAddr,
    params.lzEndpointAddr
  )
}