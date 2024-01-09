import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import { createEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: transfer ERC721 to destination chain', function () {
  it('should transfer ERC721 on send batch from', async function () {
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

    await environment.ERC721Mock.mint(sender.address, tokenId, '')
    await environment.ERC721Mock.mint(sender.address, tokenId2, '')

    // estimate required gas to send
    const [estimate] = await environment.proxyONFT721.estimateSendBatchFee(
      environment.destinationChainId,
      sender.address,
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
      [tokenId, tokenId2],
      sender.address,
      environment.zroPaymentAddress,
      adapterParams,
      {
        value: estimate
      }
    )

    const ownerOfOnDestination =
      await environment.destinationONFT721.ownerOf(tokenId)
    expect(ownerOfOnDestination).to.equal(sender.address)

    const ownerOfOnDestination2 =
      await environment.destinationONFT721.ownerOf(tokenId2)
    expect(ownerOfOnDestination2).to.equal(sender.address)
  })

  describe('checks', () => {
    it('should revert  if destination chain is not set yet', async function () {
      const environment = await createEnvironment()

      const [sender] = await getSigners()

      const fakeChainId = 5542
      const fakeAdapterParamsDstGas = 1n

      const adapterParams = ethers.solidityPacked(
        ['uint16', 'uint256'],
        [environment.version, fakeAdapterParamsDstGas]
      )

      const tokenId = 4
      await environment.ERC721Mock.mint(sender.address, tokenId, '')

      // estimate required gas to send
      const [estimate] = await environment.proxyONFT721.estimateSendFee(
        fakeChainId,
        sender.address,
        tokenId,
        environment.useZRO,
        adapterParams
      )

      // approve ERC721 mock to proxy contract
      await environment.ERC721Mock.approve(
        environment.proxyONFT721Address,
        tokenId
      )

      // execute send from using proxy contract
      await expect(
        environment.proxyONFT721.sendFrom(
          sender.address,
          fakeChainId,
          sender.address,
          tokenId,
          sender.address,
          environment.zroPaymentAddress,
          adapterParams,
          {
            value: estimate
          }
        )
      ).to.be.revertedWith('LzApp: minGasLimit not set')
    })

    it('should revert if destination chain trusted remote is not set yet', async function () {
      const environment = await createEnvironment()

      await environment.proxyONFT721.setMinDstGas(
        environment.destinationChainId,
        environment.packetType,
        environment.minGasToTransferAndStoreRemote
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

      const tokenId = 1
      await environment.ERC721Mock.mint(sender.address, tokenId, '')

      // estimate required gas to send
      const [estimate] = await environment.proxyONFT721.estimateSendFee(
        environment.destinationChainId,
        sender.address,
        tokenId,
        environment.useZRO,
        adapterParams
      )

      // approve ERC721 mock to proxy contract
      await environment.ERC721Mock.approve(
        environment.proxyONFT721Address,
        tokenId
      )

      // execute send from using proxy contract
      await expect(
        environment.proxyONFT721.sendFrom(
          sender.address,
          environment.destinationChainId,
          sender.address,
          tokenId,
          sender.address,
          environment.zroPaymentAddress,
          adapterParams,
          {
            value: estimate
          }
        )
      ).to.be.revertedWith('LzApp: destination chain is not a trusted source')
    })
  })
})
