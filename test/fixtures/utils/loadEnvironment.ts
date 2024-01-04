import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'
import { ONFT721, ProxyONFT721, ERC721Mock, LZEndpointMock } from '@/typechain'
import { ethers } from 'hardhat'
import { deployLZEndpointMockFixture } from '@/test/fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '@/test/fixtures/mocks/ERC721Mock'
import { deployONFT721Fixture } from '@/test/fixtures/ONFT721'

export class LoadLightEnvironment {
  public readonly chainId = 1
  public readonly destinationChainId = 137

  public readonly name = 'CryptoRastas'
  public readonly symbol = 'RASTA'

  public readonly minGasToTransferAndStoreLocal = 100_000n
  public readonly packetType = 1 // sendAndCall
  public readonly version = 1n // lzapp version

  proxyONFT721?: ProxyONFT721
  proxyONFT721Address?: string

  ERC721Mock?: ERC721Mock
  ERC721MockAddress?: string

  lzEndpointMock?: LZEndpointMock
  lzEndpointMockAddress?: string

  async setup() {
    const ERC721MockFixture = await loadFixture(
      deployERC721MockFixture.bind(this, this.name, this.symbol)
    )

    this.ERC721Mock = ERC721MockFixture.ERC721Mock
    this.ERC721MockAddress = ERC721MockFixture.ERC721MockAddress

    const { lZEndpointMockAddress, lZEndpointMock } = await loadFixture(
      deployLZEndpointMockFixture.bind(this, this.chainId)
    )

    this.lzEndpointMock = lZEndpointMock
    this.lzEndpointMockAddress = lZEndpointMockAddress

    const proxyONFT721Fixture = await loadFixture(
      deployProxyONFT721Fixture.bind(
        this,
        this.minGasToTransferAndStoreLocal,
        this.lzEndpointMockAddress,
        this.ERC721MockAddress
      )
    )

    this.proxyONFT721 = proxyONFT721Fixture.proxyONFT721
    this.proxyONFT721Address = proxyONFT721Fixture.proxyONFT721Address

    return this
  }
}

export class LoadFullEnvironment extends LoadLightEnvironment {
  public readonly useZRO = false // use ZRO (ERC20 token)
  public readonly zroPaymentAddress = ethers.ZeroAddress // pay as native

  destinationONFT721?: ONFT721
  destinationONFT721Address?: string

  async setup() {
    await super.setup()

    const {
      lZEndpointMockAddress: lzEndpointMockAddressDestination,
      lZEndpointMock: lzEndpointMockDestination
    } = await loadFixture(
      deployLZEndpointMockFixture.bind(this, this.destinationChainId)
    )

    const { ONFT721Address, ONFT721 } = await loadFixture(
      deployONFT721Fixture.bind(
        this,
        this.name,
        this.symbol,
        this.minGasToTransferAndStoreLocal,
        lzEndpointMockAddressDestination
      )
    )

    this.destinationONFT721 = ONFT721
    this.destinationONFT721Address = ONFT721Address

    await this.proxyONFT721.setTrustedRemoteAddress(
      this.destinationChainId,
      ONFT721Address
    )

    await this.destinationONFT721.setTrustedRemoteAddress(
      this.chainId,
      this.proxyONFT721Address
    )

    const minDestinationGasLimit = 260_000n

    await this.proxyONFT721.setMinDstGas(
      this.destinationChainId,
      this.packetType,
      minDestinationGasLimit
    )

    await this.destinationONFT721.setMinDstGas(
      this.chainId,
      this.packetType,
      minDestinationGasLimit
    )

    await lzEndpointMockDestination.setDestLzEndpoint(
      this.proxyONFT721Address,
      this.lzEndpointMockAddress
    )

    await this.lzEndpointMock.setDestLzEndpoint(
      ONFT721Address,
      lzEndpointMockAddressDestination
    )

    return this
  }
}
