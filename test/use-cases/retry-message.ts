import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import {
  Environment,
  createEnvironment,
  setContractMinDstGas,
  setContractTrustedRemoteAddress,
  setContractDestLzEndpoint
} from '@/test/fixtures/utils/loadEnvironment'
import { ethers } from 'ethers'
import coderUtils from '@/utils/coder'

describe('UseCase: retry mnessage', function () {
  it('should mint on destination failed messages', async function () {
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
      minGas: 1n
    })

    await setContractDestLzEndpoint(environment.LZEndpointMock, {
      destAddr: environment.destinationONFT721Address,
      lzEndpointAddr: environment.destinationLZEndpointMockAddress
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

    //  estimate required gas to send
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

    const path = ethers.solidityPacked(
      ['address', 'bytes'],
      [environment.proxyONFT721Address, environment.destinationONFT721Address]
    )

    const payload = coderUtils.coder.encode(
      ['bytes', 'uint[]'],
      [sender.address, [tokenId]]
    )

    // retry payload
    await environment.destionationLZEndpointMock.retryPayload(
      environment.chainId,
      path,
      payload
    )

    const ownerOfOnDestination =
      await environment.destinationONFT721.ownerOf(tokenId)
    expect(ownerOfOnDestination).to.equal(sender.address)
  })

  describe('Checks', () => {})
})
