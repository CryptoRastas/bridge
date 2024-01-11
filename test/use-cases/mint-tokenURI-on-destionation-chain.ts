import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import { createEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: mint tokenURI on destination chain', function () {
  it('should mint with ERC721 tokenURI on destination chain', async function () {
    const environment = await createEnvironment()

    await environment.proxyONFT721.setTrustedRemoteAddress(
      environment.destinationChainId,
      environment.destinationONFT721Address
    )

    await environment.destinationONFT721.setTrustedRemoteAddress(
      environment.chainId,
      environment.proxyONFT721Address
    )

    await environment.proxyONFT721.setMinDstGas(
      environment.destinationChainId,
      environment.packetType,
      environment.minGasToTransferAndStoreRemote
    )

    await environment.destinationONFT721.setMinDstGas(
      environment.chainId,
      environment.packetType,
      environment.minGasToTransferAndStoreRemote
    )

    await environment.LZEndpointMock.setDestLzEndpoint(
      environment.destinationONFT721Address,
      environment.destinationLZEndpointMockAddress
    )

    await environment.destionationLZEndpointMock.setDestLzEndpoint(
      environment.proxyONFT721Address,
      environment.LZEndpointMockAddress
    )

    const [sender] = await getSigners()

    const minDstGas = await environment.proxyONFT721.minDstGasLookup(
      environment.destinationChainId,
      environment.packetType
    )

    const adapterParams = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [environment.version, minDstGas]
    )

    const tokenId = 2
    const tokenId2 = 3

    const tokenId1URI = 'https://example.com/1'
    const tokenId2URI = 'https://example.com/2'

    await environment.ERC721Mock.mint(sender.address, tokenId, tokenId1URI)
    await environment.ERC721Mock.mint(sender.address, tokenId2, tokenId2URI)

    // estimate required gas to send
    const [estimate] = await environment.proxyONFT721.estimateSendBatchFee(
      environment.destinationChainId,
      sender.address,
      environment.ERC721MockAddress,
      [tokenId, tokenId2],
      environment.useZRO,
      adapterParams
    )

    // approve ERC721 mock to proxy contract
    await environment.ERC721Mock.approve(
      environment.proxyONFT721Address,
      tokenId
    )
    await environment.ERC721Mock.approve(
      environment.proxyONFT721Address,
      tokenId2
    )

    // set batch limit
    await environment.proxyONFT721.setDstChainIdToBatchLimit(
      environment.destinationChainId,
      2
    )

    // execute send from using proxy contract
    await environment.proxyONFT721.sendBatchFrom(
      sender.address,
      environment.destinationChainId,
      sender.address,
      environment.ERC721MockAddress,
      [tokenId, tokenId2],
      sender.address,
      environment.zroPaymentAddress,
      adapterParams,
      {
        value: estimate
      }
    )

    const tokenURIOnDestination =
      await environment.destinationONFT721.tokenURI(tokenId)
    expect(tokenURIOnDestination).to.equal(tokenId1URI)

    const tokenURIOnDestination2 =
      await environment.destinationONFT721.tokenURI(tokenId2)
    expect(tokenURIOnDestination2).to.equal(tokenId2URI)
  })
})
