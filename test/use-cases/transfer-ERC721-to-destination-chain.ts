import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'
import { LoadFullEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: transfer ERC721 to destination chain', function () {
  const bridge = new LoadFullEnvironment()

  before(async function () {
    await bridge.setup()
  })

  it('should transfer ERC721 on send from', async function () {
    const [sender] = await getSigners()

    const minDstGas = await bridge.proxyONFT721.minDstGasLookup(
      bridge.destinationChainId,
      bridge.packetType
    )

    const adapterParams = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [bridge.version, minDstGas]
    )

    const tokenId = 1
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

    const ownerOfOnDestination =
      await bridge.destinationONFT721.ownerOf(tokenId)
    expect(ownerOfOnDestination).to.equal(sender.address)
  })

  it('should transfer ERC721 on send batch from', async function () {
    const [sender] = await getSigners()

    const minDstGas = await bridge.proxyONFT721.minDstGasLookup(
      bridge.destinationChainId,
      bridge.packetType
    )

    const adapterParams = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [bridge.version, minDstGas]
    )

    const tokenId = 2
    const tokenId2 = 3

    await bridge.ERC721Mock.mint(sender.address, tokenId, '')
    await bridge.ERC721Mock.mint(sender.address, tokenId2, '')

    // estimate required gas to send
    const [estimate] = await bridge.proxyONFT721.estimateSendBatchFee(
      bridge.destinationChainId,
      sender.address,
      [tokenId, tokenId2],
      bridge.useZRO,
      adapterParams
    )

    // approve ERC721 mock to proxy contract
    await bridge.ERC721Mock.approve(bridge.proxyONFT721Address, tokenId)
    await bridge.ERC721Mock.approve(bridge.proxyONFT721Address, tokenId2)

    // set batch limit
    await bridge.proxyONFT721.setDstChainIdToBatchLimit(
      bridge.destinationChainId,
      2
    )

    // execute send from using proxy contract
    await bridge.proxyONFT721.sendBatchFrom(
      sender.address,
      bridge.destinationChainId,
      sender.address,
      [tokenId, tokenId2],
      sender.address,
      bridge.zroPaymentAddress,
      adapterParams,
      {
        value: estimate
      }
    )

    const ownerOfOnDestination =
      await bridge.destinationONFT721.ownerOf(tokenId)
    expect(ownerOfOnDestination).to.equal(sender.address)

    const ownerOfOnDestination2 =
      await bridge.destinationONFT721.ownerOf(tokenId2)
    expect(ownerOfOnDestination2).to.equal(sender.address)
  })
})
