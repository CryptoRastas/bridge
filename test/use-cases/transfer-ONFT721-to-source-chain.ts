import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { deployProxyONFT721Fixture } from '@/test/fixtures/proxyONFT721'

import { ONFT721, ProxyONFT721, ERC721Mock } from '@/typechain'

import {
  abiCoder,
  getContractAddress,
  getContractFactory
} from '@/utils/contracts'

import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import { deployLZEndpointMockFixture } from '../fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '../fixtures/mocks/ERC721Mock'
import { deployONFT721Fixture } from '../fixtures/ONFT721'

describe('UseCase: transfer ONFT721 to source chain', function () {
  // source
  const chainId = 1

  // destination
  const destinationChainId = 137

  // NFT metadata
  const name = 'CryptoRastas'
  const symbol = 'RASTA'

  let destinationONFT721: ONFT721
  let destinationONFT721Address: string

  let proxyONFT721: ProxyONFT721
  let proxyONFT721Address: string

  let ERC721Mock: ERC721Mock
  let ERC721MockAddress: string

  // bridge setup
  const minGasToTransferAndStoreLocal = 100_000n
  const packetType = 1 // sendAndCall
  const version = 1n // lzapp version
  const useZRO = false // use ZRO (ERC20 token)
  const zroPaymentAddress = ethers.ZeroAddress // pay as native

  before(async function () {
    // ERC721 Mock (source)
    const ERC721MockFixture = await loadFixture(
      deployERC721MockFixture.bind(this, name, symbol)
    )

    ERC721Mock = ERC721MockFixture.ERC721Mock
    ERC721MockAddress = ERC721MockFixture.ERC721MockAddress

    // LZEndpointMock (Destination)
    const {
      lZEndpointMockAddress: lzEndpointMockAddressDestination,
      lZEndpointMock: lZEndpointMockDestination
    } = await loadFixture(
      deployLZEndpointMockFixture.bind(this, destinationChainId)
    )

    const { ONFT721Address, ONFT721 } = await loadFixture(
      deployONFT721Fixture.bind(
        this,
        name,
        symbol,
        minGasToTransferAndStoreLocal,
        lzEndpointMockAddressDestination
      )
    )

    destinationONFT721 = ONFT721
    destinationONFT721Address = ONFT721Address

    // LZEndpointMock (Source)
    const { lZEndpointMockAddress, lZEndpointMock } = await loadFixture(
      deployLZEndpointMockFixture.bind(this, chainId)
    )

    // mock destination lz endpoint address
    await lZEndpointMock.setDestLzEndpoint(
      ONFT721Address,
      lzEndpointMockAddressDestination
    )

    // ProxyONFT721 (Source)
    const proxyONFT721Fixture = await loadFixture(
      deployProxyONFT721Fixture.bind(
        this,
        minGasToTransferAndStoreLocal,
        lZEndpointMockAddress,
        ERC721MockAddress
      )
    )

    proxyONFT721 = proxyONFT721Fixture.proxyONFT721
    proxyONFT721Address = proxyONFT721Fixture.proxyONFT721Address

    // mock source lz endpoint address
    await lZEndpointMockDestination.setDestLzEndpoint(
      proxyONFT721Address,
      lZEndpointMockAddress
    )

    // set trusted remote address (source)
    await proxyONFT721.setTrustedRemoteAddress(
      destinationChainId,
      ONFT721Address
    )

    // set trusted remote address (destination)
    await destinationONFT721.setTrustedRemoteAddress(
      chainId,
      proxyONFT721Address
    )

    const minDestinationGasLimit = 260_000n

    // set min destination gas
    await proxyONFT721.setMinDstGas(
      destinationChainId,
      packetType,
      minDestinationGasLimit
    )

    // set min destination gas to source
    await destinationONFT721.setMinDstGas(
      chainId,
      packetType,
      minDestinationGasLimit
    )
  })

  it('should transfer ONFT721 to source from destinaion', async function () {
    const [sender] = await getSigners()

    const minDstGas = await proxyONFT721.minDstGasLookup(
      destinationChainId,
      packetType
    )

    const adapterParams = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [version, minDstGas]
    )

    const tokenId = 4
    await ERC721Mock.mint(sender.address, tokenId, '')

    // estimate required gas to send
    const [estimate] = await proxyONFT721.estimateSendFee(
      destinationChainId,
      sender.address,
      tokenId,
      useZRO,
      adapterParams
    )

    // approve ERC721 mock to proxy contract
    await ERC721Mock.approve(proxyONFT721Address, tokenId)

    // execute send from using proxy contract
    await proxyONFT721.sendFrom(
      sender.address,
      destinationChainId,
      sender.address,
      tokenId,
      sender.address,
      zroPaymentAddress,
      adapterParams,
      {
        value: estimate
      }
    )

    // bridge back to source
    const minDstGasToSource = await destinationONFT721.minDstGasLookup(
      chainId,
      packetType
    )

    const adapterParamsToSource = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [version, minDstGasToSource]
    )

    await destinationONFT721.approve(destinationONFT721Address, tokenId)

    // estimate required gas to send
    const [estimateToSource] = await destinationONFT721.estimateSendFee(
      chainId,
      sender.address,
      tokenId,
      useZRO,
      adapterParamsToSource
    )

    // execute send from using proxy contract
    await destinationONFT721.sendFrom(
      sender.address,
      chainId,
      sender.address,
      tokenId,
      sender.address,
      zroPaymentAddress,
      adapterParamsToSource,
      {
        value: estimateToSource
      }
    )

    const ownerOf = await ERC721Mock.ownerOf(tokenId)
    expect(ownerOf).to.equal(sender.address)
  })
})
