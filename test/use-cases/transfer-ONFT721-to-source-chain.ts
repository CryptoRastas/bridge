import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'

import {
  Environment,
  createEnvironment,
  setContractDestLzEndpoint,
  setContractMinDstGas,
  setContractTrustedRemoteAddress
} from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: transfer ONFT721 to source chain', function () {
  let environment: Environment

  before(async function () {
    environment = await createEnvironment()

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
  })

  it('should transfer ONFT721 to source from destinaion', async function () {
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
})
