import { expect } from 'chai'
import { getSigners } from '@/utils/signers'
import { ethers } from 'hardhat'
import { LoadLightEnvironment } from '@/test/fixtures/utils/loadEnvironment'

describe('UseCase: set trusted remote address', function () {
  const bridge = new LoadLightEnvironment()

  before(async function () {
    await bridge.setup()
  })

  describe('Settings', () => {
    it('should set trusted remote', async function () {
      const destinationCoreContractAddress = ethers.ZeroAddress

      await bridge.proxyONFT721.setTrustedRemoteAddress(
        bridge.destinationChainId,
        destinationCoreContractAddress
      )

      const trustedRemoteId = await bridge.proxyONFT721.trustedRemoteLookup(
        bridge.destinationChainId
      )

      const isTrusted = await bridge.proxyONFT721.isTrustedRemote(
        bridge.destinationChainId,
        trustedRemoteId
      )

      expect(isTrusted).to.be.true
    })
  })

  describe('Checks', () => {
    it('should revert if caller is not deployer', async function () {
      const [, hacker] = await getSigners()

      await expect(
        bridge.proxyONFT721
          .connect(hacker)
          .setTrustedRemoteAddress(
            bridge.destinationChainId,
            ethers.ZeroAddress
          )
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
})
