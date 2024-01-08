import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import {
  createEnvironment,
  setContractDestLzEndpoint,
  setContractMinDstGas,
  setContractTrustedRemoteAddress
} from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: transfer ERC721 to destination chain', function () {
  it('should transfer ERC721 on send from', async function () {
    const environment = await createEnvironment()

    await setContractTrustedRemoteAddress(environment.proxyONFT721, {
      remoteChainId: environment.destinationChainId,
      remoteAddress: environment.destinationONFT721Address
    })

    await setContractTrustedRemoteAddress(environment.destinationONFT721, {
      remoteChainId: environment.chainId,
      remoteAddress: environment.proxyONFT721Address
    })

    await setContractMinDstGas(environment.proxyONFT721, {
      dstChainId: environment.destinationChainId,
      packetType: environment.packetType,
      minGas: environment.minGasToTransferAndStoreRemote
    })

    await setContractMinDstGas(environment.destinationONFT721, {
      dstChainId: environment.chainId,
      packetType: environment.packetType,
      minGas: environment.minGasToTransferAndStoreRemote
    })

    await setContractDestLzEndpoint(environment.LZEndpointMock, {
      destAddr: environment.destinationONFT721Address,
      lzEndpointAddr: environment.destinationLZEndpointMockAddress
    })

    await setContractDestLzEndpoint(environment.destionationLZEndpointMock, {
      destAddr: environment.proxyONFT721Address,
      lzEndpointAddr: environment.LZEndpointMockAddress
    })

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

    const ownerOfOnDestination =
      await environment.destinationONFT721.ownerOf(tokenId)
    expect(ownerOfOnDestination).to.equal(sender.address)
  })

  it('should transfer ERC721 on send batch from', async function () {
    const environment = await createEnvironment()

    await setContractTrustedRemoteAddress(environment.proxyONFT721, {
      remoteChainId: environment.destinationChainId,
      remoteAddress: environment.destinationONFT721Address
    })

    await setContractTrustedRemoteAddress(environment.destinationONFT721, {
      remoteChainId: environment.chainId,
      remoteAddress: environment.proxyONFT721Address
    })

    await setContractMinDstGas(environment.proxyONFT721, {
      dstChainId: environment.destinationChainId,
      packetType: environment.packetType,
      minGas: environment.minGasToTransferAndStoreRemote
    })

    await setContractMinDstGas(environment.destinationONFT721, {
      dstChainId: environment.chainId,
      packetType: environment.packetType,
      minGas: environment.minGasToTransferAndStoreRemote
    })

    await setContractDestLzEndpoint(environment.LZEndpointMock, {
      destAddr: environment.destinationONFT721Address,
      lzEndpointAddr: environment.destinationLZEndpointMockAddress
    })

    await setContractDestLzEndpoint(environment.destionationLZEndpointMock, {
      destAddr: environment.proxyONFT721Address,
      lzEndpointAddr: environment.LZEndpointMockAddress
    })

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

      await setContractMinDstGas(environment.proxyONFT721, {
        dstChainId: environment.destinationChainId,
        packetType: environment.packetType,
        minGas: environment.minGasToTransferAndStoreRemote
      })

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
