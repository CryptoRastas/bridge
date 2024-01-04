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

import { deployLZEndpointMockFixture } from '@/test/fixtures/mocks/lZEndpointMock'
import { deployERC721MockFixture } from '@/test/fixtures/mocks/ERC721Mock'
import { deployONFT721Fixture } from '@/test/fixtures/ONFT721'
import { LoadFullEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: transfer ONFT721 to source chain', function () {
  const bridge = new LoadFullEnvironment()

  before(async function () {
    await bridge.setup()
  })

  it('should transfer ONFT721 to source from destinaion', async function () {
    const [sender] = await getSigners()

    const minDstGas = await bridge.proxyONFT721.minDstGasLookup(
      bridge.destinationChainId,
      bridge.packetType
    )

    const adapterParams = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [bridge.version, minDstGas]
    )

    const tokenId = 4
    await bridge.ERC721Mock.mint(sender.address, tokenId, '')

    // estimate required gas to send
    const [estimate] = await bridge.proxyONFT721.estimateSendFee(
      bridge.destinationChainId,
      sender.address,
      tokenId,
      bridge.useZRO,
      adapterParams
    )

    // approve ERC721 mock to proxy contract
    await bridge.ERC721Mock.approve(bridge.proxyONFT721Address, tokenId)

    // execute send from using proxy contract
    await bridge.proxyONFT721.sendFrom(
      sender.address,
      bridge.destinationChainId,
      sender.address,
      tokenId,
      sender.address,
      bridge.zroPaymentAddress,
      adapterParams,
      {
        value: estimate
      }
    )

    // bridge back to source
    const minDstGasToSource = await bridge.destinationONFT721.minDstGasLookup(
      bridge.chainId,
      bridge.packetType
    )

    const adapterParamsToSource = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [bridge.version, minDstGasToSource]
    )

    await bridge.destinationONFT721.approve(
      bridge.destinationONFT721Address,
      tokenId
    )

    // estimate required gas to send
    const [estimateToSource] = await bridge.destinationONFT721.estimateSendFee(
      bridge.chainId,
      sender.address,
      tokenId,
      bridge.useZRO,
      adapterParamsToSource
    )

    // execute send from using proxy contract
    await bridge.destinationONFT721.sendFrom(
      sender.address,
      bridge.chainId,
      sender.address,
      tokenId,
      sender.address,
      bridge.zroPaymentAddress,
      adapterParamsToSource,
      {
        value: estimateToSource
      }
    )

    const ownerOf = await bridge.ERC721Mock.ownerOf(tokenId)
    expect(ownerOf).to.equal(sender.address)
  })
})
