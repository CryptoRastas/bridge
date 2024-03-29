import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import {
  Environment,
  createEnvironment
} from '@/test/fixtures/utils/loadEnvironment'
import { ethers } from 'ethers'
import coderUtils from '@/utils/coder'

describe('UseCase: retry message', function () {
  let environment: Environment
  const fakeMinGasToTransferAndStoreRemote = 1n

  before(async function () {
    environment = await createEnvironment()

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
      fakeMinGasToTransferAndStoreRemote
    )

    await environment.LZEndpointMock.setDestLzEndpoint(
      environment.destinationONFT721Address,
      environment.destinationLZEndpointMockAddress
    )
  })

  it('should mint on destination failed messages', async function () {
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
      environment.ERC721MockAddress,
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
      environment.ERC721MockAddress,
      tokenId,
      sender.address,
      environment.zroPaymentAddress,
      adapterParams,
      {
        value: estimate
      }
    )

    /// even if the message failed to mint, we can retry it manually using the payload and path
    const path = ethers.solidityPacked(
      ['address', 'bytes'],
      [environment.proxyONFT721Address, environment.destinationONFT721Address]
    )

    const payload = coderUtils.coder.encode(
      ['bytes', 'uint[]', 'string[]'],
      [sender.address, [tokenId], ['']]
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

  describe('Checks', () => {
    it('should not transfer if gas is not enough', async function () {
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

      await environment.ERC721Mock.mint(sender.address, tokenId, '')

      //  estimate required gas to send
      const [estimate] = await environment.proxyONFT721.estimateSendFee(
        environment.destinationChainId,
        sender.address,
        environment.ERC721MockAddress,
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
        environment.ERC721MockAddress,
        tokenId,
        sender.address,
        environment.zroPaymentAddress,
        adapterParams,
        {
          value: estimate
        }
      )

      /// it should fail since mint has failed
      await expect(
        environment.destinationONFT721.ownerOf(tokenId)
      ).to.be.revertedWith('ERC721: invalid token ID')
    })
  })
})
