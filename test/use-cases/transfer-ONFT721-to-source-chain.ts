import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import { createEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: transfer ONFT721 to source chain', function () {
  it('should transfer ONFT721 to source from destinaion', async function () {
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

    const tokenId = 4
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
    await environment.proxyONFT721.sendFrom(
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

    // bridge back to source
    const minDstGasToSource =
      await environment.destinationONFT721.minDstGasLookup(
        environment.chainId,
        environment.packetType
      )

    const adapterParamsToSource = ethers.solidityPacked(
      ['uint16', 'uint256'],
      [environment.version, minDstGasToSource]
    )

    await environment.destinationONFT721.approve(
      environment.destinationONFT721Address,
      tokenId
    )

    // estimate required gas to send
    const [estimateToSource] =
      await environment.destinationONFT721.estimateSendFee(
        environment.chainId,
        sender.address,
        tokenId,
        environment.useZRO,
        adapterParamsToSource
      )

    // execute send from using proxy contract
    await environment.destinationONFT721.sendFrom(
      sender.address,
      environment.chainId,
      sender.address,
      tokenId,
      sender.address,
      environment.zroPaymentAddress,
      adapterParamsToSource,
      {
        value: estimateToSource
      }
    )

    const ownerOf = await environment.ERC721Mock.ownerOf(tokenId)
    expect(ownerOf).to.equal(sender.address)
  })

  describe('checks', () => {
    it('should revert  if destination chain is not set yet', async function () {
      const environment = await createEnvironment()

      const fakeChainId = 5542
      const fakeAdapterParamsDstGas = 1n

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
      await environment.proxyONFT721.sendFrom(
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

      // bridge back to source
      const adapterParamsToSource = ethers.solidityPacked(
        ['uint16', 'uint256'],
        [environment.version, fakeAdapterParamsDstGas]
      )

      await environment.destinationONFT721.approve(
        environment.destinationONFT721Address,
        tokenId
      )

      // estimate required gas to send
      const [estimateToSource] =
        await environment.destinationONFT721.estimateSendFee(
          fakeChainId,
          sender.address,
          tokenId,
          environment.useZRO,
          adapterParamsToSource
        )

      // execute send from using proxy contract
      await expect(
        environment.destinationONFT721.sendFrom(
          sender.address,
          fakeChainId,
          sender.address,
          tokenId,
          sender.address,
          environment.zroPaymentAddress,
          adapterParamsToSource,
          {
            value: estimateToSource
          }
        )
      ).to.be.revertedWith('LzApp: minGasLimit not set')
    })

    it('should revert if destination chain trusted remote is not set yet', async function () {
      const environment = await createEnvironment()
      const fakeChainId = 5542

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
        fakeChainId,
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

      const tokenId = 4
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
      await environment.proxyONFT721.sendFrom(
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

      // bridge back to source
      const minDstGasToSource =
        await environment.destinationONFT721.minDstGasLookup(
          fakeChainId,
          environment.packetType
        )

      const adapterParamsToSource = ethers.solidityPacked(
        ['uint16', 'uint256'],
        [environment.version, minDstGasToSource]
      )

      await environment.destinationONFT721.approve(
        environment.destinationONFT721Address,
        tokenId
      )

      // estimate required gas to send
      const [estimateToSource] =
        await environment.destinationONFT721.estimateSendFee(
          fakeChainId,
          sender.address,
          tokenId,
          environment.useZRO,
          adapterParamsToSource
        )

      // execute send from using proxy contract
      await expect(
        environment.destinationONFT721.sendFrom(
          sender.address,
          fakeChainId,
          sender.address,
          tokenId,
          sender.address,
          environment.zroPaymentAddress,
          adapterParamsToSource,
          {
            value: estimateToSource
          }
        )
      ).to.be.revertedWith('LzApp: destination chain is not a trusted source')
    })
  })
})
