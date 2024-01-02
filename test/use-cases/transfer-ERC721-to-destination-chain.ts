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

describe('UseCase: transfer ERC721 to destination chain', function () {
  // source
  const chainId = 1

  // destination
  const destinationChainId = 137
  let destinationONFT721: ONFT721

  // NFT metadata
  const name = 'CryptoRastas'
  const symbol = 'RASTA'

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
    const { lZEndpointMockAddress: lzEndpointMockAddressDestination } =
      await loadFixture(
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

    console.log('ONFT721Address', ONFT721Address)

    // LZEndpointMock (Source)
    const { lZEndpointMockAddress, lZEndpointMock } = await loadFixture(
      deployLZEndpointMockFixture.bind(this, chainId)
    )

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

    const minDestinationGas = 260_000n

    // set min destination gas
    await proxyONFT721.setMinDstGas(
      destinationChainId,
      packetType,
      minDestinationGas
    )
  })

  describe('Settings', () => {
    it('should lock ERC721 on send from', async function () {
      const [sender] = await getSigners()

      const minDstGas = await proxyONFT721.minDstGasLookup(
        destinationChainId,
        packetType
      )

      const adapterParams = ethers.solidityPacked(
        ['uint16', 'uint256'],
        [version, minDstGas]
      )

      const tokenId = 1

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

      const ownerOf = await ERC721Mock.ownerOf(tokenId)
      const ownerOfOnDestination = await destinationONFT721.ownerOf(tokenId)

      expect(ownerOf).to.equal(proxyONFT721Address)
      expect(ownerOfOnDestination).to.equal(sender.address)
    })
  })

  describe('Checks', () => {})
})
